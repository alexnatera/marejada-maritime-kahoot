// Lógica de la pantalla del Host

let hSession = null;
let hQuestions = [];
let hQuestionIndex = 0;
let hTimerInterval = null;
let hQuestionStartedAt = 0;
let hResultsChart = null;
let hPlayersChannel = null;
let hResponsesChannel = null;
let hPlayersCache = [];
let hAnsweredCount = 0;

document.addEventListener('DOMContentLoaded', () => {
  injectOceanBg();
  qs('#brandIcon').innerHTML = tugLogoSVG();
  qs('#usersIcon').innerHTML = ICONS.users;
  qs('#usersIcon2').innerHTML = ICONS.users;
  qs('#trophyIcon').innerHTML = ICONS.trophy;

  loadHostSessions();
  qs('#btnStartGame').addEventListener('click', () => { playShipHorn(true); goToQuestion(0); });
  qs('#btnEndQuestion').addEventListener('click', endQuestion);
  qs('#btnNextQuestion').addEventListener('click', () => {
    if (hQuestionIndex + 1 < hQuestions.length) goToQuestion(hQuestionIndex + 1);
    else endGame();
  });
});

function showView(name) {
  ['Select', 'Lobby', 'Question', 'Results', 'Ended'].forEach(v => {
    qs('#view' + v).classList.toggle('hidden', v !== name);
  });
}

async function loadHostSessions() {
  const { data, error } = await sb.from('sessions').select('*').neq('status', 'ended').order('created_at', { ascending: false });
  const container = qs('#hostSessionsList');
  if (error || !data || data.length === 0) {
    container.innerHTML = `<p class="muted">No hay sesiones disponibles. Crea una en el panel de <a href="admin.html" style="color:var(--color-gold)">administración</a>.</p>`;
    return;
  }
  container.innerHTML = data.map(s => `
    <div class="session-card flex-between wrap gap-12">
      <div>
        <div class="flex gap-8" style="align-items:center;"><strong>${escapeHtml(s.title)}</strong> ${statusBadge(s.status)}</div>
        <div class="muted mt-8">PIN ${s.pin} · ${formatDate(s.created_at)}</div>
      </div>
      <button class="btn-primary" data-id="${s.id}">${s.status === 'draft' ? 'Iniciar' : 'Reanudar'}</button>
    </div>
  `).join('');
  qsa('button[data-id]', container).forEach(btn => btn.addEventListener('click', () => selectSession(btn.dataset.id)));
}

async function selectSession(id) {
  const { data: session } = await sb.from('sessions').select('*').eq('id', id).single();
  const { data: questions } = await sb.from('questions').select('*').eq('session_id', id).order('position');
  if (!questions || questions.length === 0) {
    alert('Esta sesión no tiene preguntas. Agrégalas en el panel de administración.');
    return;
  }
  hSession = session;
  hQuestions = questions;

  if (session.status === 'draft') {
    await sb.from('sessions').update({ status: 'lobby' }).eq('id', id);
    hSession.status = 'lobby';
  }

  subscribePlayers();

  if (hSession.status === 'lobby') {
    enterLobby();
  } else if (hSession.status === 'question') {
    hQuestionIndex = hSession.current_question_index;
    renderQuestionView(hQuestions[hQuestionIndex]);
    showView('Question');
  } else if (hSession.status === 'results') {
    hQuestionIndex = hSession.current_question_index;
    await renderResultsView(hQuestions[hQuestionIndex]);
    showView('Results');
  }
}

function subscribePlayers() {
  if (hPlayersChannel) sb.removeChannel(hPlayersChannel);
  hPlayersChannel = sb.channel('players-' + hSession.id)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'players', filter: `session_id=eq.${hSession.id}` }, (payload) => {
      hPlayersCache.push(payload.new);
      updateLobbyUI();
    })
    .subscribe();

  sb.from('players').select('*').eq('session_id', hSession.id).then(({ data }) => {
    hPlayersCache = data || [];
    updateLobbyUI();
  });
}

function enterLobby() {
  qs('#lobbyTitle').textContent = hSession.title;
  qs('#lobbyPin').textContent = hSession.pin;
  showView('Lobby');
  updateLobbyUI();
  renderJoinQR(hSession.pin);
}

/** Genera un código QR (SVG) que apunta a player.html con el PIN precargado. */
function renderJoinQR(pin) {
  const el = qs('#joinQR');
  if (!el) return;
  try {
    const base = location.href.replace(/index\.html.*$/, '').replace(/\/?$/, '/');
    const joinUrl = `${base}player.html?pin=${pin}`;
    const qr = qrcode(0, 'M');
    qr.addData(joinUrl);
    qr.make();
    el.innerHTML = qr.createSvgTag(4, 8);
  } catch (e) {
    el.innerHTML = '';
  }
}

function updateLobbyUI() {
  qs('#playerCount').textContent = hPlayersCache.length;
  qs('#btnStartGame').disabled = hPlayersCache.length === 0;
  qs('#dockEmptyMsg').classList.toggle('hidden', hPlayersCache.length > 0);
  qs('#dockFleet').innerHTML = hPlayersCache.map(p => `
    <div class="dock-ship" title="${escapeHtml(p.name)} · ${escapeHtml(shipTitle(p))}">
      <div class="ship-avatar-wrap">${shipAvatarSVG(p.avatar || 'tug')}</div>
      <span class="dock-ship-caption">${escapeHtml(p.name)}</span>
    </div>
  `).join('');
}

/**
 * Dibuja el leaderboard como una regata: cada jugador es un buque que
 * avanza por una pista proporcional a su puntaje.
 */
function renderRegatta(containerId, players) {
  const el = qs(containerId);
  if (!players.length) { el.innerHTML = `<p class="muted">Aún no hay puntajes.</p>`; return; }
  const maxScore = Math.max(...players.map(p => p.score), 1);
  el.innerHTML = players.map((p, i) => {
    const pct = 4 + (p.score / maxScore) * 88;
    const laneClass = i === 0 ? 'lane-1' : i === 1 ? 'lane-2' : i === 2 ? 'lane-3' : '';
    return `
      <div class="regatta-lane ${laneClass}">
        <div class="regatta-label">
          <div class="regatta-label-main"><span class="regatta-rank">${i + 1}</span> ${escapeHtml(p.name)} · ${p.score} pts</div>
          <div class="regatta-ship-tag">${escapeHtml(shipTitle(p))}</div>
        </div>
        <div class="regatta-track-wrap">
          <div class="regatta-track"></div>
          <div class="regatta-ship" style="left:${pct}%;">${shipAvatarSVG(p.avatar || 'tug')}</div>
        </div>
      </div>
    `;
  }).join('');
}

async function goToQuestion(idx) {
  hQuestionIndex = idx;
  const q = hQuestions[idx];
  await sb.from('sessions').update({ status: 'question', current_question_index: idx }).eq('id', hSession.id);
  hSession.status = 'question';
  renderQuestionView(q);
  showView('Question');
  subscribeResponses(q.id);
  startTimer(q.time_limit);
}

function renderQuestionView(q) {
  qs('#qProgress').textContent = `Pregunta ${hQuestionIndex + 1} de ${hQuestions.length} · ${TYPE_LABELS[q.type]}`;
  qs('#qText').textContent = q.question_text;
  qs('#totalPlayers').textContent = hPlayersCache.length;
  hAnsweredCount = 0;
  qs('#answeredCount').textContent = '0';

  const preview = qs('#qOptionsPreview');
  if (q.type === 'quiz' || q.type === 'survey') {
    preview.innerHTML = (q.options || []).map((opt, i) => `
      <div class="option-btn opt-${i}"><span class="shape">${OPTION_SHAPES[i]}</span> ${escapeHtml(opt)}</div>
    `).join('');
  } else if (q.type === 'scale') {
    preview.innerHTML = `<p class="muted" style="grid-column:1/-1;">Escala de 1 😡 a 10 🤩 — los jugadores deslizan en su móvil.</p>`;
  } else {
    preview.innerHTML = `<p class="muted" style="grid-column:1/-1;">Los jugadores escriben una respuesta libre en su móvil.</p>`;
  }
}

function subscribeResponses(questionId) {
  if (hResponsesChannel) sb.removeChannel(hResponsesChannel);
  hResponsesChannel = sb.channel('responses-' + questionId)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'responses', filter: `question_id=eq.${questionId}` }, () => {
      hAnsweredCount++;
      qs('#answeredCount').textContent = hAnsweredCount;
    })
    .subscribe();
}

function startTimer(limitSeconds) {
  clearInterval(hTimerInterval);
  hQuestionStartedAt = Date.now();
  qs('#timerBar').style.width = '100%';
  hTimerInterval = setInterval(() => {
    const elapsed = (Date.now() - hQuestionStartedAt) / 1000;
    const pct = Math.max(0, 1 - elapsed / limitSeconds);
    qs('#timerBar').style.width = (pct * 100) + '%';
    if (elapsed >= limitSeconds) {
      clearInterval(hTimerInterval);
      endQuestion();
    }
  }, 200);
}

async function endQuestion() {
  clearInterval(hTimerInterval);
  const q = hQuestions[hQuestionIndex];
  await sb.from('sessions').update({ status: 'results' }).eq('id', hSession.id);
  hSession.status = 'results';
  await renderResultsView(q);
  showView('Results');
}

async function renderResultsView(q) {
  qs('#resultsProgress').textContent = `Pregunta ${hQuestionIndex + 1} de ${hQuestions.length} · Resultados`;
  qs('#resultsQText').textContent = q.question_text;
  const { data: responses } = await sb.from('responses').select('*').eq('question_id', q.id);
  const content = qs('#resultsContent');

  if (hResultsChart) { hResultsChart.destroy(); hResultsChart = null; }

  if (q.type === 'quiz' || q.type === 'survey') {
    content.innerHTML = `<canvas id="resultsCanvas" height="260"></canvas>`;
    const counts = (q.options || []).map((_, i) => (responses || []).filter(r => r.answer && r.answer.optionIndex === i).length);
    const colors = ['#E74C3C', '#3498DB', '#2ECC71', '#F39C12'];
    hResultsChart = new Chart(qs('#resultsCanvas').getContext('2d'), {
      type: 'bar',
      data: {
        labels: q.options,
        datasets: [{ data: counts, backgroundColor: q.options.map((_, i) => colors[i]) }]
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#fff' }, grid: { color: 'rgba(255,255,255,0.1)' } },
          y: { beginAtZero: true, ticks: { color: '#fff', stepSize: 1 }, grid: { color: 'rgba(255,255,255,0.1)' } }
        }
      }
    });
    if (q.type === 'quiz' && q.correct_option != null) {
      content.innerHTML += `<p class="mt-16 muted">Respuesta correcta: <strong style="color:var(--color-gold)">${OPTION_LABELS[q.correct_option]}. ${escapeHtml(q.options[q.correct_option])}</strong></p>`;
    }
  } else if (q.type === 'scale') {
    const values = (responses || []).map(r => r.answer && r.answer.value).filter(v => typeof v === 'number');
    const avg = values.length ? (values.reduce((a, b) => a + b, 0) / values.length) : 0;
    const dist = Array.from({ length: 10 }, (_, i) => values.filter(v => v === i + 1).length);
    content.innerHTML = `
      <div class="text-center">
        <div style="font-size:3rem;">${scaleEmoji(Math.round(avg))}</div>
        <div class="pin-display" style="font-size:2.4rem;">${avg.toFixed(1)}</div>
        <div class="muted">Promedio de ${values.length} respuestas</div>
      </div>
      <canvas id="resultsCanvas" height="220" class="mt-16"></canvas>`;
    hResultsChart = new Chart(qs('#resultsCanvas').getContext('2d'), {
      type: 'bar',
      data: { labels: Array.from({ length: 10 }, (_, i) => i + 1), datasets: [{ data: dist, backgroundColor: '#D4A843' }] },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#fff' }, grid: { display: false } },
          y: { beginAtZero: true, ticks: { color: '#fff', stepSize: 1 }, grid: { color: 'rgba(255,255,255,0.1)' } }
        }
      }
    });
  } else {
    const texts = (responses || []).map(r => ({ name: r.player_id, text: (r.answer && r.answer.text) || '' })).filter(t => t.text);
    if (!texts.length) {
      content.innerHTML = `<p class="muted">Sin respuestas todavía.</p>`;
    } else {
      content.innerHTML = `<div style="max-height:320px; overflow-y:auto;">${texts.map(t => `
        <div class="question-row-item">${escapeHtml(t.text)}</div>
      `).join('')}</div>`;
    }
  }

  const { data: players } = await sb.from('players').select('*').eq('session_id', hSession.id).order('score', { ascending: false });
  hPlayersCache = players || hPlayersCache;
  renderRegatta('#liveRegatta', players || []);
}

async function endGame() {
  await sb.from('sessions').update({ status: 'ended' }).eq('id', hSession.id);
  const { data: players } = await sb.from('players').select('*').eq('session_id', hSession.id).order('score', { ascending: false });
  showView('Ended');
  renderRegatta('#finalLeaderboard', players || []);
  playShipHorn(true);
}
