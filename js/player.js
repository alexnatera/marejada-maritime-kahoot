// js/player.js
// ==========================================================================
// Marejada 2.0 — Controlador de la Pantalla del Jugador Móvil (Mobile-First)
// Soporte para Háptica, Sonido Procedural, Rachas "A Toda Máquina",
// los 6 Formatos de Preguntas y Sondeos, y Generación de Diploma Náutico
// ==========================================================================

let pSession = null;
let pPlayer = null;
let pCurrentQuestion = null;
let pAnsweredThisQuestion = false;
let pTimerInterval = null;
let pSessionChannel = null;
let pSelectedAvatar = 'tug';
let pCurrentStreak = 0;
let pMaxStreak = 0;
let pCorrectAnswersCount = 0;
let pTotalQuestionsAnswered = 0;
let pQuestionTimeLimit = 20;
let pQuestionStartTime = 0;
let pCurrentSequenceOrder = [];

function initPlayer() {
  // Fondo de océano con olas y maniobras náuticas
  try {
    injectOceanBg();
  } catch (e) {
    console.warn('injectOceanBg error:', e);
  }

  // Inyección de logos e iconos SVG
  try {
    const brandEl = qs('#brandIcon');
    if (brandEl && typeof tugLogoSVG === 'function') brandEl.innerHTML = tugLogoSVG();
    const checkEl = qs('#checkIcon');
    if (checkEl && typeof ICONS !== 'undefined' && ICONS.check) checkEl.innerHTML = ICONS.check;
    const trophyEl = qs('#trophyIcon');
    if (trophyEl && typeof ICONS !== 'undefined' && ICONS.trophy) trophyEl.innerHTML = ICONS.trophy;
    const mascotEl = qs('#captainMascot');
    if (mascotEl && typeof captainMascotSVG === 'function') mascotEl.innerHTML = captainMascotSVG();
  } catch (e) {
    console.warn('Icons injection error:', e);
  }

  // Inicializar motores audiovisuales y de partículas
  try {
    if (window.AudioFX) AudioFX.init();
    if (window.CanvasFX) CanvasFX.init();
  } catch (e) {
    console.warn('FX init error:', e);
  }

  // Configurar botón flotante de silencio / volumen
  try {
    setupAudioToggleButton();
  } catch (e) {
    console.warn('Audio toggle setup error:', e);
  }

  // Renderizar selector de buques
  renderAvatarPicker();

  // Precargar PIN si viene en URL (?pin=123456)
  prefillPinFromUrl();

  // Entrada de PIN numérica estricta
  const pinInput = qs('#joinPin');
  if (pinInput) {
    pinInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6);
    });
  }

  // Eventos de botones principales
  const btnJoin = qs('#btnJoin');
  if (btnJoin) btnJoin.addEventListener('click', joinSession);

  const btnDownloadDiploma = qs('#btnDownloadDiploma');
  if (btnDownloadDiploma) {
    btnDownloadDiploma.addEventListener('click', () => {
      if (pPlayer && pSession) {
        const rankTitle = qs('#finalRankTitle') ? qs('#finalRankTitle').textContent : 'Capitán de Alta Mar';
        downloadCaptainDiploma(pPlayer, pSession, rankTitle);
      }
    });
  }

  // Intentar restaurar sesión activa de sessionStorage
  restoreSession();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPlayer);
} else {
  initPlayer();
}

/**
 * Dispara feedback háptico en dispositivos móviles compatibles
 * @param {number|number[]} pattern - Patrón de vibración en milisegundos
 */
function triggerHaptic(pattern = [40]) {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  } catch (e) {
    // Ignorar si el dispositivo no soporta o bloquea vibración
  }
}

/**
 * Reproduce un efecto de sonido náutico procedural
 * @param {string} soundName - Nombre del sonido ('bubble_tap', 'bell', 'error_foghorn', 'ship_horn', 'podium_fanfare')
 * @param {any} [param] - Parámetro opcional
 */
function playAudio(soundName, param) {
  if (window.AudioFX) {
    AudioFX.play(soundName, param);
  }
}

/**
 * Configura y sincroniza el botón flotante de audio
 */
function setupAudioToggleButton() {
  const audioBtn = qs('#audioToggleBtn');
  if (!audioBtn) return;

  function updateBtnUI(isMuted) {
    audioBtn.classList.toggle('is-muted', isMuted);
    audioBtn.title = isMuted ? 'Activar Sonido' : 'Silenciar Sonido';
    audioBtn.setAttribute('aria-label', isMuted ? 'Activar Sonido' : 'Silenciar Sonido');
  }

  if (window.AudioFX) {
    updateBtnUI(AudioFX.isMuted());
  }

  audioBtn.addEventListener('click', () => {
    if (window.AudioFX) {
      const isMuted = AudioFX.toggleMute();
      updateBtnUI(isMuted);
      if (!isMuted) {
        AudioFX.play('bubble_tap');
      }
    }
  });
}

/**
 * Actualiza la barra superior HUD del jugador (Avatar, Nombre, Racha y Puntaje)
 */
function updatePlayerHUD() {
  const hud = qs('#playerHud');
  if (!hud) return;

  if (!pPlayer || !pSession || pSession.status === 'select') {
    hud.classList.add('hidden');
    return;
  }

  hud.classList.remove('hidden');

  const avatarEl = qs('#hudAvatar');
  if (avatarEl) avatarEl.innerHTML = shipAvatarSVG(pPlayer.avatar || 'tug');

  const nameEl = qs('#hudName');
  if (nameEl) nameEl.textContent = pPlayer.name || 'Tripulante';

  const titleEl = qs('#hudTitle');
  if (titleEl) titleEl.textContent = shipTitle(pPlayer);

  const scoreEl = qs('#hudScore');
  if (scoreEl) scoreEl.textContent = String(pPlayer.score || 0);

  const streakBadge = qs('#hudStreak');
  if (streakBadge) {
    const streakInfo = window.Mechanics ? Mechanics.getStreakInfo(pCurrentStreak) : { multiplier: 1.0, icon: '⚓', level: 1 };
    streakBadge.className = `streak-badge streak-level-${streakInfo.level}`;
    streakBadge.innerHTML = `${streakInfo.icon} x${streakInfo.multiplier.toFixed(1)}`;
  }
}

/**
 * Si se llegó desde el QR (player.html?pin=123456), precarga el PIN.
 */
function prefillPinFromUrl() {
  try {
    const params = new URLSearchParams(location.search);
    const pin = (params.get('pin') || '').replace(/\D/g, '').slice(0, 6);
    if (pin) {
      const pinEl = qs('#joinPin');
      if (pinEl) {
        pinEl.value = pin;
        if (pin.length === 6) {
          const nameEl = qs('#joinName');
          if (nameEl) nameEl.focus();
        }
      }
    }
  } catch (e) { /* ignore */ }
}

/**
 * Renderiza el selector de avatares de buques
 */
function renderAvatarPicker() {
  const grid = qs('#avatarPicker');
  if (!grid) return;

  grid.innerHTML = Object.keys(SHIP_AVATARS).map(key => `
    <div class="avatar-option ${key === pSelectedAvatar ? 'selected' : ''}" data-avatar="${key}">
      <div class="ship-avatar-wrap">${shipAvatarSVG(key)}</div>
      <span class="avatar-label">${SHIP_AVATARS[key].label}</span>
    </div>
  `).join('');

  qsa('.avatar-option', grid).forEach(el => el.addEventListener('click', () => {
    pSelectedAvatar = el.dataset.avatar;
    playAudio('bubble_tap');
    triggerHaptic(20);
    qsa('.avatar-option', grid).forEach(o => o.classList.toggle('selected', o.dataset.avatar === pSelectedAvatar));
  }));
}

/**
 * Muestra la vista especificada y oculta las demás
 * @param {string} name - 'Join' | 'Lobby' | 'Question' | 'Waiting' | 'Reveal' | 'Ended'
 */
function showView(name) {
  ['Join', 'Lobby', 'Question', 'Waiting', 'Reveal', 'Ended'].forEach(v => {
    const el = qs('#view' + v);
    if (el) el.classList.toggle('hidden', v !== name);
  });
  updatePlayerHUD();
}

/**
 * Guarda los datos de sesión en sessionStorage para recuperarse tras recargas
 */
function saveSession() {
  if (!pSession || !pPlayer) return;
  try {
    sessionStorage.setItem('marejada_player', JSON.stringify({
      sessionId: pSession.id,
      playerId: pPlayer.id,
      name: pPlayer.name,
      avatar: pPlayer.avatar || pSelectedAvatar,
      streak: pCurrentStreak,
      maxStreak: pMaxStreak,
      correctCount: pCorrectAnswersCount
    }));
  } catch (e) { /* ignore */ }
}

/**
 * Restaura la sesión guardada en sessionStorage si sigue activa en Supabase
 */
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
      pCurrentStreak = saved.streak || 0;
      pMaxStreak = saved.maxStreak || 0;
      pCorrectAnswersCount = saved.correctCount || 0;
      subscribeSession();
      handleSessionStatus(session);
    }
  } catch (e) {
    sessionStorage.removeItem('marejada_player');
  }
}

/**
 * Une al jugador a la sesión con el PIN y nombre ingresados
 */
async function joinSession() {
  const pinEl = qs('#joinPin');
  const nameEl = qs('#joinName');
  const errEl = qs('#joinError');
  if (errEl) errEl.textContent = '';

  const pin = pinEl ? pinEl.value.trim() : '';
  const name = nameEl ? nameEl.value.trim() : '';

  if (pin.length !== 6) {
    if (errEl) errEl.textContent = 'Ingresa el PIN náutico de 6 dígitos.';
    triggerHaptic([80, 40, 80]);
    return;
  }
  if (!name) {
    if (errEl) errEl.textContent = 'Ingresa tu nombre de tripulante para abordar.';
    triggerHaptic([80, 40, 80]);
    return;
  }

  playAudio('bubble_tap');
  triggerHaptic(40);

  const { data: session, error } = await sb.from('sessions').select('*').eq('pin', pin).maybeSingle();
  if (error || !session) {
    if (errEl) errEl.textContent = 'No se encontró ninguna travesía con ese PIN.';
    triggerHaptic([100, 50, 100]);
    return;
  }
  if (session.status === 'ended') {
    if (errEl) errEl.textContent = 'Esta travesía ya ha llegado a puerto final.';
    return;
  }

  const { data: player, error: pErr } = await sb.from('players').insert({
    session_id: session.id,
    name,
    score: 0,
    avatar: pSelectedAvatar
  }).select().single();

  if (pErr) {
    if (errEl) errEl.textContent = 'Error al abordar: ' + pErr.message;
    return;
  }

  pSession = session;
  pPlayer = player;
  pCurrentStreak = 0;
  pMaxStreak = 0;
  pCorrectAnswersCount = 0;

  saveSession();
  subscribeSession();
  handleSessionStatus(session);
  playAudio('bell');
}

/**
 * Se suscribe a los cambios en tiempo real del estado de la sesión en Supabase
 */
function subscribeSession() {
  if (pSessionChannel) sb.removeChannel(pSessionChannel);
  pSessionChannel = sb.channel('player-session-' + pSession.id)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'sessions', filter: `id=eq.${pSession.id}` }, (payload) => {
      pSession = payload.new;
      handleSessionStatus(pSession);
    })
    .subscribe();
}

/**
 * Renderiza el código QR de invitación en la vista Lobby
 * @param {string} pin - PIN de la sesión
 */
function renderInviteQR(pin) {
  const el = qs('#inviteQR');
  if (!el) return;
  try {
    const base = location.href.replace(/player\.html.*$/, '').replace(/\/?$/, '/');
    const joinUrl = `${base}player.html?pin=${pin}`;
    const qr = qrcode(0, 'M');
    qr.addData(joinUrl);
    qr.make();
    el.innerHTML = qr.createSvgTag(4, 6);
  } catch (e) {
    el.innerHTML = '';
  }
}

/**
 * Gestiona el cambio de estado de la sesión
 * @param {Object} session - Objeto de sesión
 */
async function handleSessionStatus(session) {
  if (session.status === 'lobby') {
    const titleEl = qs('#lobbySessionTitle');
    if (titleEl) titleEl.textContent = session.title;

    const previewEl = qs('#myShipPreview');
    if (previewEl) previewEl.innerHTML = shipAvatarSVG(pPlayer.avatar || 'tug');

    const labelEl = qs('#myShipLabel');
    if (labelEl) labelEl.textContent = `Tu buque: ${shipTitle(pPlayer)} · Capitán/a ${pPlayer.name}`;

    renderInviteQR(session.pin);
    showView('Lobby');
  } else if (session.status === 'question') {
    const { data: q } = await sb.from('questions')
      .select('*')
      .eq('session_id', session.id)
      .eq('position', session.current_question_index)
      .single();

    pCurrentQuestion = q ? (window.Mechanics ? Mechanics.formatQuestion(q) : q) : null;
    pAnsweredThisQuestion = false;

    if (pCurrentQuestion) {
      renderQuestion(pCurrentQuestion, session);
      showView('Question');
    }
  } else if (session.status === 'results') {
    clearInterval(pTimerInterval);
    if (pCurrentQuestion) {
      await renderReveal(pCurrentQuestion);
    }
    showView('Reveal');
  } else if (session.status === 'ended') {
    clearInterval(pTimerInterval);
    await renderFinal();
    showView('Ended');
    sessionStorage.removeItem('marejada_player');
  }
}

/**
 * Renderiza la interfaz de pregunta activa según su formato
 * @param {Object} rawQ - Objeto de pregunta
 * @param {Object} session - Objeto de sesión
 */
function renderQuestion(rawQ, session) {
  const q = window.Mechanics ? Mechanics.formatQuestion(rawQ) : rawQ;
  pCurrentQuestion = q;
  pQuestionTimeLimit = q.time_limit || 20;
  pQuestionStartTime = Date.now();

  const typeLabel = window.Mechanics ? Mechanics.getQuestionTypeLabel(q.type) : (TYPE_LABELS[q.type] || q.type);
  const typeIcon = window.Mechanics ? Mechanics.getQuestionTypeIcon(q.type) : '⚓';

  const progEl = qs('#pqProgress');
  if (progEl) progEl.textContent = `Pregunta ${session.current_question_index + 1}`;

  const typeBadgeEl = qs('#pqTypeBadge');
  if (typeBadgeEl) typeBadgeEl.innerHTML = `${typeIcon} ${escapeHtml(typeLabel)}`;

  const highTideEl = qs('#pHighTideBanner');
  if (highTideEl) highTideEl.classList.toggle('hidden', !q.is_high_tide);

  const qStreakEl = qs('#qStreakIndicator');
  if (qStreakEl) {
    const streakInfo = window.Mechanics ? Mechanics.getStreakInfo(pCurrentStreak) : { multiplier: 1.0, icon: '⚓', level: 1 };
    qStreakEl.className = `streak-badge streak-level-${streakInfo.level}`;
    qStreakEl.innerHTML = `${streakInfo.icon} x${streakInfo.multiplier.toFixed(1)} Racha`;
  }

  const textEl = qs('#pqText');
  if (textEl) textEl.textContent = q.question_text;

  const container = qs('#dynamicQuestionContainer');
  if (!container) return;
  container.innerHTML = '';

  const normalizedType = (q.type || 'multiple_choice').toLowerCase();

  // 1. Opción Múltiple / Quiz / Votación de Sondeo Simple
  if (normalizedType === 'multiple_choice' || normalizedType === 'quiz' || normalizedType === 'poll_choice' || normalizedType === 'survey') {
    const grid = document.createElement('div');
    grid.className = 'mechanics-options-grid';
    const shapeIcons = ['▲', '◆', '●', '■'];
    const colorClasses = ['btn-opt-0', 'btn-opt-1', 'btn-opt-2', 'btn-opt-3'];

    (q.options || []).forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `btn-option ${colorClasses[idx % colorClasses.length]}`;
      btn.dataset.idx = String(idx);
      btn.innerHTML = `
        <span class="btn-shape">${shapeIcons[idx % shapeIcons.length]}</span>
        <span class="btn-text">${escapeHtml(opt)}</span>
      `;

      btn.addEventListener('click', () => {
        btn.classList.add('selected');
        handleAnswerSubmit({ optionIndex: idx, optionText: opt });
      });

      grid.appendChild(btn);
    });

    container.appendChild(grid);
  }
  // 2. Verdadero / Falso Náutico (Seguro vs Riesgo)
  else if (normalizedType === 'true_false') {
    const binaryGrid = document.createElement('div');
    binaryGrid.className = 'mechanics-binary-grid';

    const opts = (q.options && q.options.length >= 2) ? q.options : ['Verdadero / Seguro', 'Falso / Riesgo'];
    const icons = ['🟢', '🔴'];
    const styles = ['btn-tf-true', 'btn-tf-false'];

    opts.slice(0, 2).forEach((optText, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `btn-binary ${styles[idx]}`;
      btn.dataset.idx = String(idx);
      btn.innerHTML = `
        <span style="font-size:1.8rem;">${icons[idx]}</span>
        <span>${escapeHtml(optText)}</span>
      `;

      btn.addEventListener('click', () => {
        btn.classList.add('selected');
        handleAnswerSubmit({ optionIndex: idx, optionText: optText });
      });

      binaryGrid.appendChild(btn);
    });

    container.appendChild(binaryGrid);
  }
  // 3. Secuencia / Maniobra Náutica Táctil
  else if (normalizedType === 'sequence') {
    const seqWrapper = document.createElement('div');
    seqWrapper.className = 'mechanics-sequence-wrapper';

    const hint = document.createElement('p');
    hint.className = 'sequence-instruction';
    hint.textContent = 'Ordena los pasos de la maniobra con las flechas y confirma:';
    seqWrapper.appendChild(hint);

    const list = document.createElement('ul');
    list.className = 'mechanics-sequence-list';

    pCurrentSequenceOrder = (q.options || []).map((_, i) => i);

    function renderSequenceList() {
      list.innerHTML = '';
      pCurrentSequenceOrder.forEach((optIdx, pos) => {
        const item = document.createElement('li');
        item.className = 'sequence-item';
        item.innerHTML = `
          <span class="sequence-rank">${pos + 1}</span>
          <span class="sequence-text">${escapeHtml(q.options[optIdx])}</span>
          <div class="sequence-controls">
            <button type="button" class="btn-seq-move up" title="Subir" ${pos === 0 ? 'disabled' : ''}>▲</button>
            <button type="button" class="btn-seq-move down" title="Bajar" ${pos === pCurrentSequenceOrder.length - 1 ? 'disabled' : ''}>▼</button>
          </div>
        `;

        const btnUp = item.querySelector('.btn-seq-move.up');
        const btnDown = item.querySelector('.btn-seq-move.down');

        if (btnUp) {
          btnUp.addEventListener('click', (e) => {
            e.stopPropagation();
            if (pos > 0) {
              playAudio('bubble_tap');
              triggerHaptic(20);
              const tmp = pCurrentSequenceOrder[pos - 1];
              pCurrentSequenceOrder[pos - 1] = pCurrentSequenceOrder[pos];
              pCurrentSequenceOrder[pos] = tmp;
              renderSequenceList();
            }
          });
        }

        if (btnDown) {
          btnDown.addEventListener('click', (e) => {
            e.stopPropagation();
            if (pos < pCurrentSequenceOrder.length - 1) {
              playAudio('bubble_tap');
              triggerHaptic(20);
              const tmp = pCurrentSequenceOrder[pos + 1];
              pCurrentSequenceOrder[pos + 1] = pCurrentSequenceOrder[pos];
              pCurrentSequenceOrder[pos] = tmp;
              renderSequenceList();
            }
          });
        }

        list.appendChild(item);
      });
    }

    renderSequenceList();
    seqWrapper.appendChild(list);

    const confirmBtn = document.createElement('button');
    confirmBtn.type = 'button';
    confirmBtn.className = 'btn-confirm-sequence';
    confirmBtn.innerHTML = `<span>⚓ Confirmar Maniobra</span>`;
    confirmBtn.addEventListener('click', () => {
      confirmBtn.disabled = true;
      handleAnswerSubmit({ order: [...pCurrentSequenceOrder] });
    });

    seqWrapper.appendChild(confirmBtn);
    container.appendChild(seqWrapper);
  }
  // 4. Valoración de Pantallas / UX Rating (1 al 10)
  else if (normalizedType === 'poll_rating' || normalizedType === 'scale') {
    const ratingWrapper = document.createElement('div');
    ratingWrapper.className = 'mechanics-rating-wrapper';

    const valDisplay = document.createElement('div');
    valDisplay.className = 'rating-current-value';
    valDisplay.innerHTML = `<span>Selecciona tu valoración: <strong id="ratingActiveNum">5</strong> / 10 😐</span>`;
    ratingWrapper.appendChild(valDisplay);

    const ratingGrid = document.createElement('div');
    ratingGrid.className = 'mechanics-rating-grid';

    for (let v = 1; v <= 10; v++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-rating-num';
      btn.dataset.val = String(v);
      btn.textContent = String(v);

      btn.addEventListener('click', () => {
        btn.classList.add('selected');
        const numEl = valDisplay.querySelector('#ratingActiveNum');
        if (numEl) numEl.textContent = String(v);
        handleAnswerSubmit({ value: v, rating: v });
      });

      ratingGrid.appendChild(btn);
    }

    ratingWrapper.appendChild(ratingGrid);

    const legend = document.createElement('div');
    legend.className = 'rating-scale-legend';
    legend.innerHTML = `
      <span>1: Muy insatisfactorio / Riesgoso</span>
      <span>10: Excelente / Seguro</span>
    `;
    ratingWrapper.appendChild(legend);

    container.appendChild(ratingWrapper);
  }
  // 5. Sugerencias y Feedback Abierto (Texto libre)
  else if (normalizedType === 'poll_text' || normalizedType === 'text') {
    const textWrapper = document.createElement('div');
    textWrapper.className = 'mechanics-text-wrapper';

    const textarea = document.createElement('textarea');
    textarea.className = 'input-feedback-text';
    textarea.rows = 4;
    textarea.maxLength = 400;
    textarea.placeholder = 'Escribe aquí tu opinión, idea u observación náutica...';

    const charCounter = document.createElement('div');
    charCounter.className = 'text-char-count';
    charCounter.textContent = '0 / 400 caracteres';

    textarea.addEventListener('input', () => {
      charCounter.textContent = `${textarea.value.length} / 400 caracteres`;
    });

    const submitBtn = document.createElement('button');
    submitBtn.type = 'button';
    submitBtn.className = 'btn-submit-text';
    submitBtn.innerHTML = `<span>💬 Enviar Sugerencia</span>`;

    submitBtn.addEventListener('click', () => {
      const txt = textarea.value.trim();
      if (txt.length === 0) {
        textarea.focus();
        triggerHaptic([60, 40]);
        return;
      }
      submitBtn.disabled = true;
      handleAnswerSubmit({ text: txt, value: txt });
    });

    textWrapper.appendChild(textarea);
    textWrapper.appendChild(charCounter);
    textWrapper.appendChild(submitBtn);
    container.appendChild(textWrapper);
  }
  // 6. Identificación Visual de Peligros en Cubierta / Hotspot
  else if (normalizedType === 'hazard_hotspot' || normalizedType === 'hotspot') {
    const hotspotWrapper = document.createElement('div');
    hotspotWrapper.className = 'mechanics-hotspot-wrapper';

    const hint = document.createElement('p');
    hint.className = 'hotspot-instruction';
    hint.style.margin = '0 0 10px 0';
    hint.style.fontSize = '0.95rem';
    hint.style.color = '#F7B500';
    hint.innerHTML = '⚠️ <strong>¡Toca la zona de peligro mortal</strong> en el plano del remolcador:';
    hotspotWrapper.appendChild(hint);

    const mapArea = document.createElement('div');
    mapArea.className = 'mechanics-hotspot-canvas';
    mapArea.style.position = 'relative';
    mapArea.style.width = '100%';
    mapArea.style.maxWidth = '400px';
    mapArea.style.margin = '0 auto';
    mapArea.style.cursor = 'crosshair';
    mapArea.style.borderRadius = '12px';
    mapArea.style.overflow = 'hidden';
    mapArea.style.background = '#0B3559';
    mapArea.style.border = '2px solid rgba(212, 168, 67, 0.4)';

    mapArea.innerHTML = `
      <svg viewBox="0 0 400 300" style="width:100%; height:auto; display:block;" xmlns="http://www.w3.org/2000/svg">
        <path d="M60 270 Q40 180 80 50 Q120 10 200 10 Q280 10 320 50 Q360 180 340 270 Q200 290 60 270 Z" fill="#1b2836" stroke="#4A6572" stroke-width="4"/>
        <rect x="130" y="50" width="140" height="70" rx="10" fill="#2d3e50" stroke="#9fd3ef" stroke-width="2"/>
        <text x="200" y="90" fill="#ffffff" font-size="12" font-weight="bold" text-anchor="middle">PUENTE DE MANDO</text>
        <rect x="160" y="140" width="80" height="30" rx="4" fill="#5C6B73" stroke="#D4A843" stroke-width="2"/>
        <text x="200" y="160" fill="#F7B500" font-size="11" font-weight="bold" text-anchor="middle">WINCHE DE TIRO</text>
        <path d="M100 180 L300 180 L290 260 Q200 275 110 260 Z" fill="rgba(228, 0, 26, 0.15)" stroke="#E4001A" stroke-dasharray="4,4" stroke-width="2"/>
        <path d="M200 165 Q240 210 200 280" fill="none" stroke="#E4001A" stroke-width="3"/>
        <text x="200" y="220" fill="#ff6b6b" font-size="11" font-weight="bold" text-anchor="middle">ZONA DE MANIOBRAS (POPA)</text>
        <circle cx="120" cy="245" r="8" fill="#F7B500"/>
        <circle cx="280" cy="245" r="8" fill="#F7B500"/>
      </svg>
      <div class="hotspot-marker" style="display:none; position:absolute; width:24px; height:24px; margin-left:-12px; margin-top:-12px; border-radius:50%; background:rgba(228,0,26,0.85); border:2px solid #fff; box-shadow:0 0 10px #ff0000; pointer-events:none; z-index:10;"></div>
    `;

    const marker = mapArea.querySelector('.hotspot-marker');

    function handleHotspotTap(e) {
      const rect = mapArea.getBoundingClientRect();
      const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : null);
      const clientY = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : null);
      if (clientX === null || clientY === null) return;

      const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));

      if (marker) {
        marker.style.left = `${x}%`;
        marker.style.top = `${y}%`;
        marker.style.display = 'block';
      }

      playAudio('bubble_tap');
      triggerHaptic([40]);
      handleAnswerSubmit({ x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 });
    }

    mapArea.addEventListener('click', handleHotspotTap);
    mapArea.addEventListener('touchend', (e) => {
      e.preventDefault();
      handleHotspotTap(e);
    });

    hotspotWrapper.appendChild(mapArea);
    container.appendChild(hotspotWrapper);
  }

  // Iniciar temporizador del jugador
  startPlayerTimer(pQuestionTimeLimit);
}

/**
 * Inicia el temporizador de cuenta regresiva para la vista del jugador
 * @param {number} limitSeconds - Tiempo total de la pregunta
 */
function startPlayerTimer(limitSeconds) {
  clearInterval(pTimerInterval);
  const start = Date.now();
  const bar = qs('#pTimerBar');
  if (bar) bar.style.width = '100%';

  pTimerInterval = setInterval(() => {
    const elapsed = (Date.now() - start) / 1000;
    const remaining = Math.max(0, limitSeconds - elapsed);
    const pct = Math.max(0, 1 - elapsed / limitSeconds);

    if (bar) bar.style.width = (pct * 100) + '%';

    if (remaining <= 0) {
      clearInterval(pTimerInterval);
      if (!pAnsweredThisQuestion) {
        handleTimeout();
      }
    }
  }, 100);
}

/**
 * Gestiona el agotamiento del tiempo sin respuesta
 */
async function handleTimeout() {
  if (pAnsweredThisQuestion) return;
  pAnsweredThisQuestion = true;

  playAudio('error_foghorn');
  triggerHaptic([100, 50, 100]);

  // Si era pregunta evaluable, se reinicia la racha
  if (pCurrentQuestion && !window.Mechanics?.isPollType(pCurrentQuestion.type)) {
    pCurrentStreak = 0;
  }

  showView('Waiting');
  updateWaitingSummary('Se agotó el tiempo de maniobra ⏱️');
  saveSession();
}

/**
 * Procesa el envío de una respuesta por el jugador
 * @param {Object} answerPayload - Datos de la respuesta enviada
 */
async function handleAnswerSubmit(answerPayload) {
  if (pAnsweredThisQuestion) return;
  pAnsweredThisQuestion = true;
  clearInterval(pTimerInterval);

  playAudio('bubble_tap');
  triggerHaptic(40);

  // Deshabilitar botones interactivos
  const container = qs('#dynamicQuestionContainer');
  if (container) {
    qsa('button, input, textarea', container).forEach(el => { el.disabled = true; });
  }

  const q = pCurrentQuestion;
  const elapsed = (Date.now() - pQuestionStartTime) / 1000;
  const timeRemaining = Math.max(0, pQuestionTimeLimit - elapsed);

  // Validar respuesta y calcular puntaje con el motor de mecánicas
  const validation = window.Mechanics
    ? Mechanics.validateAnswer(q, answerPayload, {
        timeRemaining,
        totalTime: pQuestionTimeLimit,
        streak: pCurrentStreak,
        isHighTide: q.is_high_tide
      })
    : { is_correct: null, points: 0, streak: 0 };

  const isCorrect = validation.is_correct;
  const points = validation.points || 0;

  // Actualizar estado de racha local
  if (isCorrect === true) {
    pCurrentStreak = validation.streak;
    pMaxStreak = Math.max(pMaxStreak, pCurrentStreak);
    pCorrectAnswersCount++;
  } else if (isCorrect === false) {
    pCurrentStreak = 0;
  }
  // En tipos de encuesta (is_correct === null), pCurrentStreak no cambia

  pTotalQuestionsAnswered++;

  // Registrar respuesta en Supabase
  try {
    await sb.from('responses').insert({
      question_id: q.id,
      player_id: pPlayer.id,
      answer: answerPayload,
      is_correct: isCorrect,
      points
    });

    if (points > 0) {
      await addScore(points);
    }
  } catch (err) {
    console.error('Error al guardar respuesta:', err);
  }

  saveSession();
  showView('Waiting');
  updateWaitingSummary('¡Respuesta enviada a la bitácora!');
}

/**
 * Actualiza el resumen mostrado en la pantalla de espera
 * @param {string} msg
 */
function updateWaitingSummary(msg) {
  const streakInfo = window.Mechanics ? Mechanics.getStreakInfo(pCurrentStreak) : { multiplier: 1.0, icon: '⚓', badge: 'Rumbo Estable' };

  const flameEl = qs('#waitingFlame');
  if (flameEl) flameEl.textContent = streakInfo.icon;

  const multEl = qs('#waitingMultiplierText');
  if (multEl) multEl.textContent = `Racha x${streakInfo.multiplier.toFixed(1)} · ${streakInfo.name || ''}`;

  const scoreText = qs('#waitingScoreText');
  if (scoreText && pPlayer) {
    scoreText.innerHTML = `Puntaje total: <strong style="color:var(--color-gold); font-size:1.15rem;">${pPlayer.score}</strong> pts`;
  }
}

/**
 * Incrementa el puntaje del jugador en Supabase y localmente
 * @param {number} points
 */
async function addScore(points) {
  if (!pPlayer || points <= 0) return;
  try {
    const { data } = await sb.from('players').select('score').eq('id', pPlayer.id).single();
    const currentScore = data ? (data.score || 0) : (pPlayer.score || 0);
    const newScore = currentScore + points;
    await sb.from('players').update({ score: newScore }).eq('id', pPlayer.id);
    pPlayer.score = newScore;
    updatePlayerHUD();
  } catch (e) {
    pPlayer.score = (pPlayer.score || 0) + points;
    updatePlayerHUD();
  }
}

/**
 * Renderiza la pantalla de revelación tras finalizar la pregunta
 * @param {Object} q - Objeto de pregunta
 */
async function renderReveal(q) {
  const isPoll = window.Mechanics ? Mechanics.isPollType(q.type) : false;

  let myResponse = null;
  try {
    const { data } = await sb.from('responses')
      .select('*')
      .eq('question_id', q.id)
      .eq('player_id', pPlayer.id)
      .maybeSingle();
    myResponse = data;
  } catch (e) { /* ignore */ }

  const iconEl = qs('#revealIcon');
  const textEl = qs('#revealText');
  const pointsBanner = qs('#revealPointsBanner');
  const streakMsgEl = qs('#revealStreakMsg');
  const totalScoreEl = qs('#totalScoreLine');

  if (!isPoll) {
    const isCorrect = myResponse ? Boolean(myResponse.is_correct) : false;
    const points = myResponse ? (myResponse.points || 0) : 0;
    const streakInfo = window.Mechanics ? Mechanics.getStreakInfo(pCurrentStreak) : { multiplier: 1.0, icon: '⚓', badge: 'Rumbo Estable' };

    if (isCorrect) {
      if (iconEl) iconEl.innerHTML = `<div class="confirm-check" style="background:rgba(46,204,113,0.22); border:2px solid #2ECC71;"><span style="color:#2ECC71; font-size:2.4rem;">✓</span></div>`;
      if (textEl) textEl.textContent = '¡Correcto! Maniobra Impecable';
      if (pointsBanner) pointsBanner.textContent = `+${points} puntos`;
      if (streakMsgEl) streakMsgEl.innerHTML = `${streakInfo.icon} <strong>${streakInfo.badge}</strong> · Multiplicador activo: <strong>x${streakInfo.multiplier.toFixed(1)}</strong>`;

      playAudio('bell');
      triggerHaptic(streakInfo.hapticPattern || [40, 60, 40]);

      if (window.CanvasFX) {
        if (pCurrentStreak >= 3) {
          CanvasFX.launchNauticalConfetti({ count: 60 });
        } else {
          CanvasFX.launchFlare(window.innerWidth / 2, window.innerHeight * 0.4, '#2ECC71');
        }
      }
    } else {
      if (iconEl) iconEl.innerHTML = `<div class="confirm-check" style="background:rgba(228,0,26,0.22); border:2px solid var(--saam-red);"><span style="color:var(--saam-red-light); font-size:2.4rem;">✕</span></div>`;
      if (textEl) textEl.textContent = myResponse ? '¡Maniobra Incorrecta!' : 'No respondiste a tiempo';
      if (pointsBanner) pointsBanner.textContent = '+0 puntos';
      if (streakMsgEl) streakMsgEl.textContent = '⚓ Racha reiniciada a x1.0 · ¡Recupera el rumbo en la siguiente!';

      playAudio('error_foghorn');
      triggerHaptic([100, 50, 100]);
    }
  } else {
    // Pregunta de Sondeo / Discovery
    if (iconEl) iconEl.innerHTML = `<div class="confirm-check" style="background:rgba(52,152,219,0.22); border:2px solid #3498DB;"><span style="color:#3498DB; font-size:2.2rem;">📊</span></div>`;
    if (textEl) textEl.textContent = '¡Aporte Registrado!';
    if (pointsBanner) pointsBanner.textContent = 'Gracias por tu feedback';
    if (streakMsgEl) streakMsgEl.textContent = 'Tus sugerencias orientan el desarrollo de la plataforma marítima.';
    playAudio('bubble_tap');
  }

  if (totalScoreEl && pPlayer) {
    totalScoreEl.innerHTML = `Puntaje total acumulado: <strong style="color:var(--color-gold); font-size:1.2rem;">${pPlayer.score || 0}</strong> pts`;
  }
}

/**
 * Determina el título honorífico naval según la posición y el puntaje
 * @param {number} rank - Posición final
 * @param {number} totalPlayers - Total de jugadores en la sesión
 * @returns {string} Título honorífico
 */
function getCaptainRankTitle(rank, totalPlayers) {
  if (rank === 1) return '👑 Almirante de Flota & Gran Capitán';
  if (rank === 2) return '🥈 Primer Oficial de Navegación & Práctico Mayor';
  if (rank === 3) return '🥉 Piloto Superior de Maniobras';
  if (rank <= 10) return '⚓ Oficial de Guardia & Navegante Distinguido';
  return '🧭 Navegante de Alta Mar de Primera Clase';
}

/**
 * Renderiza la pantalla final de puerto con ranking y preparación de diploma
 */
async function renderFinal() {
  let players = [];
  try {
    const { data } = await sb.from('players')
      .select('*')
      .eq('session_id', pSession.id)
      .order('score', { ascending: false });
    players = data || [];
  } catch (e) { /* ignore */ }

  const rank = Math.max(1, players.findIndex(p => p.id === pPlayer.id) + 1);
  const totalCount = Math.max(1, players.length);
  const rankTitle = getCaptainRankTitle(rank, totalCount);

  const rankEl = qs('#finalRank');
  if (rankEl) rankEl.textContent = `#${rank}`;

  const titleEl = qs('#finalRankTitle');
  if (titleEl) titleEl.textContent = rankTitle;

  const scoreLineEl = qs('#finalScoreLine');
  if (scoreLineEl && pPlayer) {
    scoreLineEl.textContent = `${pPlayer.score} puntos entre ${totalCount} tripulantes`;
  }

  const shipEl = qs('#finalShip');
  if (shipEl) shipEl.innerHTML = shipAvatarSVG(pPlayer.avatar || 'tug');

  const shipLabel = qs('#finalShipLabel');
  if (shipLabel) shipLabel.textContent = shipTitle(pPlayer);

  const correctBadge = qs('#finalCorrectBadge');
  if (correctBadge) correctBadge.textContent = `✓ ${pCorrectAnswersCount} aciertos`;

  const maxStreakInfo = window.Mechanics ? Mechanics.getStreakInfo(pMaxStreak) : { multiplier: 1.0 };
  const maxStreakBadge = qs('#finalMaxStreakBadge');
  if (maxStreakBadge) maxStreakBadge.textContent = `🔥 Racha máx: x${maxStreakInfo.multiplier.toFixed(1)}`;

  playAudio('podium_fanfare');

  if (rank <= 3 && window.CanvasFX) {
    CanvasFX.launchNauticalConfetti({ count: 100 });
  }
}

/**
 * Genera el Diploma Digital Oficial en un elemento Canvas de alta resolución
 * @param {Object} player - Objeto del jugador
 * @param {Object} session - Objeto de la sesión
 * @param {string} rankTitle - Título honorífico naval obtenido
 * @returns {HTMLCanvasElement} Lienzo Canvas con el diploma generado
 */
function generateDiplomaCanvas(player, session, rankTitle) {
  const canvas = qs('#diplomaCanvas') || document.createElement('canvas');
  canvas.width = 1400;
  canvas.height = 950;
  const ctx = canvas.getContext('2d');

  const w = canvas.width;
  const h = canvas.height;

  // 1. Fondo Náutico Gradiente
  const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 100, w / 2, h / 2, w * 0.7);
  bgGrad.addColorStop(0, '#0B3559');
  bgGrad.addColorStop(0.7, '#04182E');
  bgGrad.addColorStop(1, '#020C17');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // 2. Líneas de Olas y Marcas de Agua Náuticas
  ctx.save();
  ctx.strokeStyle = 'rgba(212, 168, 67, 0.07)';
  ctx.lineWidth = 2;
  for (let y = 80; y < h; y += 70) {
    ctx.beginPath();
    ctx.moveTo(40, y);
    ctx.bezierCurveTo(w * 0.3, y - 20, w * 0.7, y + 20, w - 40, y);
    ctx.stroke();
  }

  // Rosa de los Vientos de fondo en el centro
  ctx.translate(w / 2, h / 2);
  ctx.strokeStyle = 'rgba(212, 168, 67, 0.05)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, 240, 0, Math.PI * 2);
  ctx.arc(0, 0, 180, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i < 8; i++) {
    ctx.rotate(Math.PI / 4);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -220);
    ctx.stroke();
  }
  ctx.restore();

  // 3. Marcos y Bordes Dorados Náuticos
  // Borde Exterior Doble
  ctx.strokeStyle = '#D4A843';
  ctx.lineWidth = 6;
  ctx.strokeRect(36, 36, w - 72, h - 72);

  ctx.strokeStyle = 'rgba(245, 215, 127, 0.6)';
  ctx.lineWidth = 2;
  ctx.strokeRect(48, 48, w - 96, h - 96);

  ctx.strokeStyle = '#E4001A';
  ctx.lineWidth = 2;
  ctx.strokeRect(56, 56, w - 112, h - 112);

  // Nudos y Flores Náuticas en las 4 esquinas
  const corners = [
    [56, 56],
    [w - 56, 56],
    [56, h - 56],
    [w - 56, h - 56]
  ];
  corners.forEach(([cx, cy]) => {
    ctx.save();
    ctx.fillStyle = '#D4A843';
    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  });

  // Franja Decorativa SAAM (Rojo y Oro) en la cabecera
  const stripeGrad = ctx.createLinearGradient(100, 0, w - 100, 0);
  stripeGrad.addColorStop(0, '#E4001A');
  stripeGrad.addColorStop(0.5, '#D4A843');
  stripeGrad.addColorStop(1, '#E4001A');
  ctx.fillStyle = stripeGrad;
  ctx.fillRect(w * 0.2, 74, w * 0.6, 5);

  // 4. Textos y Tipografías Oficiales
  ctx.textAlign = 'center';

  // Eyebrow
  ctx.fillStyle = '#FF7675';
  ctx.font = 'bold 18px "Inter", sans-serif';
  ctx.letterSpacing = '3px';
  ctx.fillText('REPÚBLICA MARÍTIMA DE MAREJADA · SUMMIT DE SEGURIDAD & OPERACIONES', w / 2, 115);

  // Título Principal
  ctx.fillStyle = '#FFF2A1';
  ctx.font = 'bold 44px "Playfair Display", Georgia, serif';
  ctx.shadowColor = 'rgba(212, 168, 67, 0.6)';
  ctx.shadowBlur = 16;
  ctx.fillText('DIPLOMA DE CAPITÁN DE ALTA MAR', w / 2, 175);
  ctx.shadowBlur = 0;

  // Subtítulo
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.font = 'italic 20px "Inter", sans-serif';
  ctx.fillText('En reconocimiento a su destacada pericia náutica, rapidez de maniobra y navegación segura', w / 2, 215);

  // Concesión
  ctx.fillStyle = 'rgba(212, 168, 67, 0.9)';
  ctx.font = 'bold 17px "Inter", sans-serif';
  ctx.fillText('SE CONFIERE CON HONOR EL PRESENTE TÍTULO A:', w / 2, 280);

  // Nombre del Jugador
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 54px "Playfair Display", Georgia, serif';
  ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
  ctx.shadowBlur = 12;
  ctx.fillText((player.name || 'Tripulante Audaz').toUpperCase(), w / 2, 350);
  ctx.shadowBlur = 0;

  // Línea dorada bajo el nombre
  ctx.strokeStyle = '#D4A843';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(w * 0.25, 375);
  ctx.lineTo(w * 0.75, 375);
  ctx.stroke();

  // Título de Buque y Rango
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.font = '22px "Inter", sans-serif';
  ctx.fillText(`Al mando del Buque: ${shipTitle(player)}`, w / 2, 420);

  ctx.fillStyle = '#FFF2A1';
  ctx.font = 'bold 26px "Playfair Display", Georgia, serif';
  ctx.fillText(rankTitle || 'Capitán de Alta Mar', w / 2, 465);

  // Sesión y Travesía
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.font = '19px "Inter", sans-serif';
  ctx.fillText(`Travesía oficial: "${session.title || 'Travesía Marejada 2.0'}"`, w / 2, 515);

  // 5. Caja de Estadísticas Náuticas
  const boxW = 860;
  const boxH = 110;
  const boxX = (w - boxW) / 2;
  const boxY = 555;

  ctx.fillStyle = 'rgba(4, 18, 37, 0.75)';
  ctx.strokeStyle = 'rgba(212, 168, 67, 0.5)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(boxX, boxY, boxW, boxH, 14);
  ctx.fill();
  ctx.stroke();

  // Columnas de Estadísticas
  const colW = boxW / 3;

  // Columna 1: Puntaje
  ctx.fillStyle = '#FFF2A1';
  ctx.font = 'bold 32px "Playfair Display", serif';
  ctx.fillText(`${player.score || 0}`, boxX + colW * 0.5, boxY + 52);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
  ctx.font = '14px "Inter", sans-serif';
  ctx.fillText('PUNTOS NÁUTICOS', boxX + colW * 0.5, boxY + 84);

  // Columna 2: Aciertos
  ctx.fillStyle = '#2ECC71';
  ctx.font = 'bold 32px "Playfair Display", serif';
  ctx.fillText(`✓ ${pCorrectAnswersCount}`, boxX + colW * 1.5, boxY + 52);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
  ctx.font = '14px "Inter", sans-serif';
  ctx.fillText('MANIOBRAS ACERTADAS', boxX + colW * 1.5, boxY + 84);

  // Columna 3: Racha Máxima
  const maxMultiplier = (window.Mechanics ? Mechanics.getStreakInfo(pMaxStreak).multiplier : 1.0).toFixed(1);
  ctx.fillStyle = '#FF7675';
  ctx.font = 'bold 32px "Playfair Display", serif';
  ctx.fillText(`x${maxMultiplier}`, boxX + colW * 2.5, boxY + 52);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
  ctx.font = '14px "Inter", sans-serif';
  ctx.fillText('RACHA A TODA MÁQUINA', boxX + colW * 2.5, boxY + 84);

  // 6. Sellos Oficiales y Firmas Náuticas
  // Sello Dorado en Esquina Inferior Izquierda
  const sealX = 220;
  const sealY = 790;
  const sealR = 54;

  ctx.save();
  ctx.fillStyle = '#D4A843';
  ctx.beginPath();
  ctx.arc(sealX, sealY, sealR, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#041225';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(sealX, sealY, sealR - 8, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#041225';
  ctx.font = 'bold 12px "Inter", sans-serif';
  ctx.fillText('MAREJADA 2.0', sealX, sealY - 14);
  ctx.font = 'bold 22px "Inter", sans-serif';
  ctx.fillText('⚓', sealX, sealY + 10);
  ctx.font = 'bold 10px "Inter", sans-serif';
  ctx.fillText('SELLO OFICIAL', sealX, sealY + 28);
  ctx.restore();

  // Fecha en el Centro
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.font = '15px "Inter", sans-serif';
  ctx.fillText(`Zarpado en fecha: ${formatDate(new Date().toISOString())}`, w / 2, 790);

  // Firma y Autoridad en Esquina Inferior Derecha
  const sigX = w - 240;
  const sigY = 760;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(sigX - 120, sigY + 20);
  ctx.lineTo(sigX + 120, sigY + 20);
  ctx.stroke();

  ctx.fillStyle = '#FFF2A1';
  ctx.font = 'italic 18px "Playfair Display", Georgia, serif';
  ctx.fillText('Comandancia de Operaciones', sigX, sigY + 12);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.font = '13px "Inter", sans-serif';
  ctx.fillText('Capitanía de Puerto Marejada', sigX, sigY + 42);

  // Lema de Seguridad Marítima al fondo
  ctx.fillStyle = 'rgba(212, 168, 67, 0.85)';
  ctx.font = 'bold 13px "Inter", sans-serif';
  ctx.letterSpacing = '2px';
  ctx.fillText('NAVEGACIÓN SEGURA · MANIOBRAS IMPECABLES · CERO INCIDENTES', w / 2, 885);

  return canvas;
}

/**
 * Genera y descarga el Diploma Oficial de Capitán en formato PNG
 * @param {Object} player - Objeto del jugador
 * @param {Object} session - Objeto de la sesión
 * @param {string} rankTitle - Título honorífico naval
 */
function downloadCaptainDiploma(player, session, rankTitle) {
  if (!player || !session) return;

  playAudio('ship_horn');
  triggerHaptic([60, 40, 80]);

  if (window.CanvasFX) {
    CanvasFX.launchNauticalConfetti({ count: 80 });
  }

  const canvas = generateDiplomaCanvas(player, session, rankTitle);

  try {
    const dataUrl = canvas.toDataURL('image/png');
    const sanitizedName = (player.name || 'Tripulante').replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `Diploma_Capitan_${sanitizedName}_Marejada.png`;

    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (err) {
    console.error('Error al exportar diploma canvas:', err);
  }
}

// Exportar globalmente para consumo por otros módulos o tests
if (typeof window !== 'undefined') {
  window.downloadCaptainDiploma = downloadCaptainDiploma;
  window.generateDiplomaCanvas = generateDiplomaCanvas;
}
