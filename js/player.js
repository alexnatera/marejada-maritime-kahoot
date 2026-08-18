// Lógica de la pantalla del Jugador

let pSession = null;
let pPlayer = null;
let pCurrentQuestion = null;
let pAnsweredThisQuestion = false;
let pTimerInterval = null;
let pSessionChannel = null;
let pSelectedAvatar = 'tug';

document.addEventListener('DOMContentLoaded', () => {
  injectOceanBg();
  qs('#brandIcon').innerHTML = ICONS.wheel;
  qs('#checkIcon').innerHTML = ICONS.check;
  qs('#trophyIcon').innerHTML = ICONS.trophy;
  qs('#captainMascot').innerHTML = captainMascotSVG();
  renderAvatarPicker();

  qs('#joinPin').addEventListener('input', (e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6); });
  qs('#btnJoin').addEventListener('click', joinSession);
  qs('#scaleSlider').addEventListener('input', updateScaleDisplay);
  qs('#btnSubmitScale').addEventListener('click', submitScale);
  qs('#btnSubmitText').addEventListener('click', submitText);

  restoreSession();
});

function renderAvatarPicker() {
  const grid = qs('#avatarPicker');
  grid.innerHTML = Object.keys(SHIP_AVATARS).map(key => `
    <div class="avatar-option ${key === pSelectedAvatar ? 'selected' : ''}" data-avatar="${key}">
      <div class="ship-avatar-wrap">${shipAvatarSVG(key)}</div>
      <span class="avatar-label">${SHIP_AVATARS[key].label}</span>
    </div>
  `).join('');
  qsa('.avatar-option', grid).forEach(el => el.addEventListener('click', () => {
    pSelectedAvatar = el.dataset.avatar;
    qsa('.avatar-option', grid).forEach(o => o.classList.toggle('selected', o.dataset.avatar === pSelectedAvatar));
  }));
}

function showView(name) {
  ['Join', 'Lobby', 'Question', 'Waiting', 'Reveal', 'Ended'].forEach(v => {
    qs('#view' + v).classList.toggle('hidden', v !== name);
  });
}

function saveSession() {
  sessionStorage.setItem('marejada_player', JSON.stringify({ sessionId: pSession.id, playerId: pPlayer.id, name: pPlayer.name }));
}

async function restoreSession() {
  const raw = sessionStorage.getItem('marejada_player');
  if (!raw) return;
  try {
    const saved = JSON.parse(raw);
    const { data: session } = await sb.from('sessions').select('*').eq('id', saved.sessionId).single();
    const { data: player } = await sb.from('players').select('*').eq('id', saved.playerId).single();
    if (session && player && session.status !== 'ended') {
      pSession = session;
      pPlayer = player;
      pSelectedAvatar = player.avatar || 'tug';
      subscribeSession();
      handleSessionStatus(session);
    }
  } catch (e) { /* ignore */ }
}

async function joinSession() {
  const pin = qs('#joinPin').value.trim();
  const name = qs('#joinName').value.trim();
  const errEl = qs('#joinError');
  errEl.textContent = '';
  if (pin.length !== 6) { errEl.textContent = 'Ingresa el PIN de 6 dígitos.'; return; }
  if (!name) { errEl.textContent = 'Ingresa tu nombre.'; return; }

  const { data: session, error } = await sb.from('sessions').select('*').eq('pin', pin).maybeSingle();
  if (error || !session) { errEl.textContent = 'No se encontró ninguna sesión con ese PIN.'; return; }
  if (session.status === 'ended') { errEl.textContent = 'Esta sesión ya finalizó.'; return; }

  const { data: player, error: pErr } = await sb.from('players').insert({ session_id: session.id, name, score: 0, avatar: pSelectedAvatar }).select().single();
  if (pErr) { errEl.textContent = 'Error al unirse: ' + pErr.message; return; }

  pSession = session;
  pPlayer = player;
  saveSession();
  subscribeSession();
  handleSessionStatus(session);
}

function subscribeSession() {
  if (pSessionChannel) sb.removeChannel(pSessionChannel);
  pSessionChannel = sb.channel('session-' + pSession.id)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'sessions', filter: `id=eq.${pSession.id}` }, (payload) => {
      pSession = payload.new;
      handleSessionStatus(pSession);
    })
    .subscribe();
}

async function handleSessionStatus(session) {
  if (session.status === 'lobby') {
    qs('#lobbySessionTitle').textContent = session.title;
    qs('#myShipPreview').innerHTML = shipAvatarSVG(pPlayer.avatar || 'tug');
    qs('#myShipLabel').textContent = `Tu buque: ${(SHIP_AVATARS[pPlayer.avatar] || SHIP_AVATARS.tug).label} · ${pPlayer.name}`;
    showView('Lobby');
  } else if (session.status === 'question') {
    const { data: q } = await sb.from('questions').select('*').eq('session_id', session.id).eq('position', session.current_question_index).single();
    pCurrentQuestion = q;
    pAnsweredThisQuestion = false;
    renderQuestion(q, session);
    showView('Question');
  } else if (session.status === 'results') {
    clearInterval(pTimerInterval);
    if (pCurrentQuestion) await renderReveal(pCurrentQuestion);
    showView('Reveal');
  } else if (session.status === 'ended') {
    await renderFinal();
    showView('Ended');
    sessionStorage.removeItem('marejada_player');
  }
}

function renderQuestion(q, session) {
  qs('#pqProgress').textContent = TYPE_LABELS[q.type];
  qs('#pqText').textContent = q.question_text;

  qs('#quizBlock').classList.toggle('hidden', !(q.type === 'quiz' || q.type === 'survey'));
  qs('#scaleBlock').classList.toggle('hidden', q.type !== 'scale');
  qs('#textBlock').classList.toggle('hidden', q.type !== 'text');

  if (q.type === 'quiz' || q.type === 'survey') {
    qs('#quizOptions').innerHTML = (q.options || []).map((opt, i) => `
      <button class="option-btn opt-${i}" data-idx="${i}"><span class="shape">${OPTION_SHAPES[i]}</span> ${escapeHtml(opt)}</button>
    `).join('');
    qsa('#quizOptions .option-btn').forEach(btn => btn.addEventListener('click', () => submitQuizAnswer(parseInt(btn.dataset.idx, 10))));
  } else if (q.type === 'scale') {
    qs('#scaleSlider').value = 5;
    updateScaleDisplay();
  } else if (q.type === 'text') {
    qs('#textAnswer').value = '';
  }

  startPlayerTimer(q.time_limit);
}

function startPlayerTimer(limitSeconds) {
  clearInterval(pTimerInterval);
  const start = Date.now();
  qs('#pTimerBar').style.width = '100%';
  pTimerInterval = setInterval(() => {
    const elapsed = (Date.now() - start) / 1000;
    const pct = Math.max(0, 1 - elapsed / limitSeconds);
    qs('#pTimerBar').style.width = (pct * 100) + '%';
    if (elapsed >= limitSeconds) {
      clearInterval(pTimerInterval);
      if (!pAnsweredThisQuestion) {
        pAnsweredThisQuestion = true;
        showView('Waiting');
        qs('#scoreDisplay').innerHTML = `<p class="muted">Se acabó el tiempo</p>`;
      }
    }
  }, 200);
}

function timeLeftSeconds(limitSeconds) {
  const barWidthPct = parseFloat(qs('#pTimerBar').style.width) || 0;
  return (barWidthPct / 100) * limitSeconds;
}

async function submitQuizAnswer(optionIndex) {
  if (pAnsweredThisQuestion) return;
  pAnsweredThisQuestion = true;
  clearInterval(pTimerInterval);
  qsa('#quizOptions .option-btn').forEach(b => b.disabled = true);
  qs(`#quizOptions [data-idx="${optionIndex}"]`).classList.add('selected');

  const q = pCurrentQuestion;
  const isCorrect = q.type === 'quiz' ? (optionIndex === q.correct_option) : null;
  const timeLeft = timeLeftSeconds(q.time_limit);
  const points = q.type === 'quiz' ? computeQuizPoints(isCorrect, timeLeft, q.time_limit) : 0;

  await sb.from('responses').insert({ question_id: q.id, player_id: pPlayer.id, answer: { optionIndex }, is_correct: isCorrect, points });
  if (points > 0) await addScore(points);

  showView('Waiting');
  qs('#scoreDisplay').innerHTML = q.type === 'quiz'
    ? `<p class="muted">Tu puntaje total: <strong style="color:var(--color-gold)">${pPlayer.score}</strong></p>`
    : '';
}

function updateScaleDisplay() {
  const v = parseInt(qs('#scaleSlider').value, 10);
  qs('#scaleValue').textContent = v;
  qs('#scaleEmojiDisplay').textContent = scaleEmoji(v);
}

async function submitScale() {
  if (pAnsweredThisQuestion) return;
  pAnsweredThisQuestion = true;
  clearInterval(pTimerInterval);
  const value = parseInt(qs('#scaleSlider').value, 10);
  const q = pCurrentQuestion;
  await sb.from('responses').insert({ question_id: q.id, player_id: pPlayer.id, answer: { value }, is_correct: null, points: 0 });
  showView('Waiting');
  qs('#scoreDisplay').innerHTML = '';
}

async function submitText() {
  if (pAnsweredThisQuestion) return;
  const text = qs('#textAnswer').value.trim();
  if (!text) { alert('Escribe una respuesta antes de enviar.'); return; }
  pAnsweredThisQuestion = true;
  clearInterval(pTimerInterval);
  const q = pCurrentQuestion;
  await sb.from('responses').insert({ question_id: q.id, player_id: pPlayer.id, answer: { text }, is_correct: null, points: 0 });
  showView('Waiting');
  qs('#scoreDisplay').innerHTML = '';
}

async function addScore(points) {
  const { data } = await sb.from('players').select('score').eq('id', pPlayer.id).single();
  const newScore = (data ? data.score : pPlayer.score) + points;
  await sb.from('players').update({ score: newScore }).eq('id', pPlayer.id);
  pPlayer.score = newScore;
}

function launchBuoyBurst() {
  const wrap = document.createElement('div');
  wrap.className = 'buoy-burst';
  const emojis = ['🛟', '⚓', '🌊', '⭐'];
  for (let i = 0; i < 18; i++) {
    const span = document.createElement('span');
    span.textContent = emojis[i % emojis.length];
    span.style.left = Math.random() * 100 + 'vw';
    span.style.animationDuration = (1.6 + Math.random() * 1.2) + 's';
    span.style.animationDelay = (Math.random() * 0.3) + 's';
    wrap.appendChild(span);
  }
  document.body.appendChild(wrap);
  setTimeout(() => wrap.remove(), 3200);
}

async function renderReveal(q) {
  if (q.type === 'quiz') {
    const { data: myResponse } = await sb.from('responses').select('*').eq('question_id', q.id).eq('player_id', pPlayer.id).maybeSingle();
    const correct = myResponse && myResponse.is_correct;
    qs('#revealIcon').innerHTML = correct
      ? `<div class="confirm-check">${ICONS.check}</div>`
      : `<div class="confirm-check" style="background:rgba(231,76,60,0.2);"><span style="color:#E74C3C; font-size:2.4rem;">✕</span></div>`;
    qs('#revealText').textContent = myResponse
      ? (correct ? '¡Correcto!' : 'Incorrecto')
      : 'No respondiste a tiempo';
    qs('#revealPoints').textContent = myResponse && myResponse.points ? `+${myResponse.points} puntos` : '';
    qs('#totalScoreLine').textContent = `Puntaje total: ${pPlayer.score}`;
    if (correct) launchBuoyBurst();
  } else {
    qs('#revealIcon').innerHTML = `<div class="confirm-check">${ICONS.check}</div>`;
    qs('#revealText').textContent = 'Gracias por tu respuesta';
    qs('#revealPoints').textContent = '';
    qs('#totalScoreLine').textContent = '';
  }
}

async function renderFinal() {
  const { data: players } = await sb.from('players').select('*').eq('session_id', pSession.id).order('score', { ascending: false });
  const rank = (players || []).findIndex(p => p.id === pPlayer.id) + 1;
  qs('#finalRank').textContent = rank > 0 ? `#${rank}` : '—';
  qs('#finalScoreLine').textContent = `${pPlayer.score} puntos de ${(players || []).length} tripulantes`;
  qs('#finalShip').innerHTML = shipAvatarSVG(pPlayer.avatar || 'tug');
  if (rank === 1) launchBuoyBurst();
}
