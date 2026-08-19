// js/host.js
// ==========================================================================
// Marejada 2.0 — Controlador Principal del Host (Pantalla Grande / Proyector)
// Integración con AudioFX, CanvasFX, Mechanics y RegattaEngine
// ==========================================================================

let hSession = null;
let hQuestions = [];
let hQuestionIndex = 0;
let hTimerInterval = null;
let hQuestionStartedAt = 0;
let hResultsChart = null;
let hPlayersChannel = null;
let hResponsesChannel = null;
let hPlayersCache = [];
let hPrevPlayersSnapshot = null;
let hAnsweredCount = 0;
let hLastSonarSecond = -1;
let hPodiumFxInterval = null;

function initHost() {
  try {
    injectOceanBg();
  } catch (e) {
    console.warn('injectOceanBg error:', e);
  }

  try {
    const brandEl = qs('#brandIcon');
    if (brandEl && typeof tugLogoSVG === 'function') brandEl.innerHTML = tugLogoSVG();
    const usersEl1 = qs('#usersIcon');
    if (usersEl1 && typeof ICONS !== 'undefined' && ICONS.users) usersEl1.innerHTML = ICONS.users;
    const usersEl2 = qs('#usersIcon2');
    if (usersEl2 && typeof ICONS !== 'undefined' && ICONS.users) usersEl2.innerHTML = ICONS.users;
    const trophyEl = qs('#trophyIcon');
    if (trophyEl && typeof ICONS !== 'undefined' && ICONS.trophy) trophyEl.innerHTML = ICONS.trophy;
  } catch (e) {
    console.warn('Icons injection error:', e);
  }

  // Inicializar motores audiovisuales
  try {
    if (window.AudioFX) AudioFX.init();
    if (window.CanvasFX) CanvasFX.init();
  } catch (e) {
    console.warn('FX init error:', e);
  }

  // Configurar botón flotante de mute de audio
  try {
    setupAudioToggleButton();
  } catch (e) {
    console.warn('Audio toggle setup error:', e);
  }

  // Cargar sesiones disponibles
  loadHostSessions();

  // Enlazar botones principales
  const btnStart = qs('#btnStartGame');
  if (btnStart) {
    btnStart.addEventListener('click', () => {
      if (window.AudioFX) AudioFX.play('ship_horn');
      if (window.CanvasFX) {
        CanvasFX.launchFlare(window.innerWidth / 2, window.innerHeight * 0.75, '#D4A843');
      }
      goToQuestion(0);
    });
  }

  const btnEndQ = qs('#btnEndQuestion');
  if (btnEndQ) {
    btnEndQ.addEventListener('click', endQuestion);
  }

  const btnNextQ = qs('#btnNextQuestion');
  if (btnNextQ) {
    btnNextQ.addEventListener('click', () => {
      if (hQuestionIndex + 1 < hQuestions.length) {
        goToQuestion(hQuestionIndex + 1);
      } else {
        endGame();
      }
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHost);
} else {
  initHost();
}

/**
 * Configura y sincroniza el estado del botón flotante de audio
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
 * Muestra la vista solicitada y oculta las demás
 * @param {string} name - 'Select' | 'Lobby' | 'Question' | 'Results' | 'Ended'
 */
function showView(name) {
  ['Select', 'Lobby', 'Question', 'Results', 'Ended'].forEach(v => {
    const el = qs('#view' + v);
    if (el) el.classList.toggle('hidden', v !== name);
  });

  if (name !== 'Ended' && hPodiumFxInterval) {
    clearInterval(hPodiumFxInterval);
    hPodiumFxInterval = null;
  }
}

/**
 * Carga las sesiones creadas para presentar
 */
async function loadHostSessions() {
  const container = qs('#hostSessionsList');
  if (!container) return;

  try {
    const { data, error } = await sb.from('sessions')
      .select('*')
      .neq('status', 'ended')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      container.innerHTML = `<p class="muted">No hay sesiones activas disponibles. Crea una en el panel de <a href="admin.html" style="color:var(--color-gold)">administración</a>.</p>`;
      return;
    }

    container.innerHTML = data.map(s => `
      <div class="session-card flex-between wrap gap-12">
        <div>
          <div class="flex gap-8" style="align-items:center;">
            <strong>${escapeHtml(s.title)}</strong>
            ${statusBadge(s.status)}
          </div>
          <div class="muted mt-8">PIN <strong>${s.pin}</strong> · ${formatDate(s.created_at)}</div>
        </div>
        <button class="btn-primary" data-id="${s.id}">${s.status === 'draft' ? '⚓ Iniciar' : '🧭 Reanudar'}</button>
      </div>
    `).join('');

    qsa('button[data-id]', container).forEach(btn => {
      btn.addEventListener('click', () => selectSession(btn.dataset.id));
    });
  } catch (err) {
    console.error('Error al cargar sesiones del host:', err);
    container.innerHTML = `<p class="muted">Error al conectar con el servidor.</p>`;
  }
}

/**
 * Selecciona e inicializa una sesión
 * @param {string} id - ID de la sesión
 */
async function selectSession(id) {
  try {
    const { data: session, error: sessErr } = await sb.from('sessions').select('*').eq('id', id).single();
    if (sessErr || !session) {
      alert('No se pudo cargar la sesión seleccionada.');
      return;
    }

    const { data: rawQuestions, error: qErr } = await sb.from('questions').select('*').eq('session_id', id).order('position');
    if (qErr || !rawQuestions || rawQuestions.length === 0) {
      alert('Esta sesión no tiene preguntas configuradas. Agrégalas en el panel de administración.');
      return;
    }

    hSession = session;
    hQuestions = rawQuestions.map(q => (window.Mechanics ? Mechanics.formatQuestion(q) : q));
    hPrevPlayersSnapshot = null;

    if (session.status === 'draft') {
      await sb.from('sessions').update({ status: 'lobby' }).eq('id', id);
      hSession.status = 'lobby';
    }

    subscribePlayers();

    if (hSession.status === 'lobby') {
      enterLobby();
    } else if (hSession.status === 'question') {
      hQuestionIndex = hSession.current_question_index || 0;
      renderQuestionView(hQuestions[hQuestionIndex]);
      showView('Question');
      subscribeResponses(hQuestions[hQuestionIndex].id);
      startTimer(hQuestions[hQuestionIndex].time_limit || 20);
    } else if (hSession.status === 'results') {
      hQuestionIndex = hSession.current_question_index || 0;
      await renderResultsView(hQuestions[hQuestionIndex]);
      showView('Results');
    } else if (hSession.status === 'ended') {
      await endGame();
    }
  } catch (err) {
    console.error('Error al seleccionar sesión:', err);
  }
}

/**
 * Suscripción en tiempo real a la llegada de jugadores al muelle
 */
function subscribePlayers() {
  if (hPlayersChannel) {
    sb.removeChannel(hPlayersChannel);
  }

  hPlayersChannel = sb.channel('players-' + hSession.id)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'players', filter: `session_id=eq.${hSession.id}` }, (payload) => {
      const newPlayer = payload.new;
      const exists = hPlayersCache.some(p => String(p.id) === String(newPlayer.id));
      if (!exists) {
        hPlayersCache.push(newPlayer);
        updateLobbyUI();

        // Efectos de sonido y visuales de llegada al muelle
        if (window.AudioFX) AudioFX.play('ship_horn');
        if (window.CanvasFX) {
          const spawnX = window.innerWidth * (0.2 + Math.random() * 0.6);
          CanvasFX.waterWake(spawnX, window.innerHeight * 0.78);
        }
      }
    })
    .subscribe();

  sb.from('players').select('*').eq('session_id', hSession.id).then(({ data }) => {
    hPlayersCache = data || [];
    updateLobbyUI();
  });
}

/**
 * Entra a la pantalla del lobby (Muelle Vivo 2.0)
 */
function enterLobby() {
  const titleEl = qs('#lobbyTitle');
  if (titleEl) titleEl.textContent = hSession.title;
  const pinEl = qs('#lobbyPin');
  if (pinEl) pinEl.textContent = hSession.pin;

  showView('Lobby');
  updateLobbyUI();
  renderJoinQR(hSession.pin);
}

/**
 * Genera un código QR SVG que apunta a player.html con el PIN precargado
 */
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
    console.error('Error al generar código QR:', e);
    el.innerHTML = '';
  }
}

/**
 * Actualiza la flota en el Muelle Vivo 2.0
 */
function updateLobbyUI() {
  const countEl = qs('#playerCount');
  if (countEl) countEl.textContent = hPlayersCache.length;

  const btnStart = qs('#btnStartGame');
  if (btnStart) btnStart.disabled = hPlayersCache.length === 0;

  const emptyMsg = qs('#dockEmptyMsg');
  if (emptyMsg) emptyMsg.classList.toggle('hidden', hPlayersCache.length > 0);

  const fleetEl = qs('#dockFleet');
  if (fleetEl) {
    fleetEl.innerHTML = hPlayersCache.map(p => {
      const shipSvg = (window.RegattaEngine && RegattaEngine.getShipSvg) ? RegattaEngine.getShipSvg(p.avatar) : shipAvatarSVG(p.avatar || 'tug');
      const title = (window.RegattaEngine && RegattaEngine.getShipTitle) ? RegattaEngine.getShipTitle(p) : shipTitle(p);
      return `
        <div class="dock-ship" title="${escapeHtml(p.name)} · ${escapeHtml(title)}">
          <div class="ship-avatar-wrap">${shipSvg}</div>
          <span class="dock-ship-caption">${escapeHtml(p.name)}</span>
        </div>
      `;
    }).join('');
  }
}

/**
 * Avanza a la pregunta especificada e inicializa el temporizador y sonar
 * @param {number} idx - Índice de la pregunta
 */
async function goToQuestion(idx) {
  hQuestionIndex = idx;
  const q = hQuestions[idx];

  await sb.from('sessions').update({ status: 'question', current_question_index: idx }).eq('id', hSession.id);
  hSession.status = 'question';

  if (window.AudioFX) AudioFX.play('bell');

  renderQuestionView(q);
  showView('Question');
  subscribeResponses(q.id);
  startTimer(q.time_limit || 20);
}

/**
 * Renderiza la interfaz de la pregunta activa
 * @param {Object} q - Objeto de pregunta
 */
function renderQuestionView(q) {
  const typeLabel = (window.Mechanics && Mechanics.getQuestionTypeLabel) ? Mechanics.getQuestionTypeLabel(q.type) : (TYPE_LABELS[q.type] || q.type);
  const typeIcon = (window.Mechanics && Mechanics.getQuestionTypeIcon) ? Mechanics.getQuestionTypeIcon(q.type) : '⚓';

  const progEl = qs('#qProgress');
  if (progEl) progEl.textContent = `Pregunta ${hQuestionIndex + 1} de ${hQuestions.length}`;

  const typeBadgeEl = qs('#qTypeBadge');
  if (typeBadgeEl) typeBadgeEl.innerHTML = `${typeIcon} ${escapeHtml(typeLabel)}`;

  const highTideBadge = qs('#highTideBadge');
  if (highTideBadge) highTideBadge.classList.toggle('hidden', !q.is_high_tide);

  const textEl = qs('#qText');
  if (textEl) textEl.textContent = q.question_text;

  const totalEl = qs('#totalPlayers');
  if (totalEl) totalEl.textContent = hPlayersCache.length;

  hAnsweredCount = 0;
  const answeredEl = qs('#answeredCount');
  if (answeredEl) answeredEl.textContent = '0';

  const preview = qs('#qOptionsPreview');
  if (!preview) return;

  const normalizedType = (q.type || 'multiple_choice').toLowerCase();

  if (normalizedType === 'multiple_choice' || normalizedType === 'quiz') {
    preview.innerHTML = `
      <div class="options-grid">
        ${(q.options || []).map((opt, i) => `
          <div class="option-btn opt-${i}">
            <span class="shape">${OPTION_SHAPES[i] || '●'}</span>
            <span>${escapeHtml(opt)}</span>
          </div>
        `).join('')}
      </div>
    `;
  } else if (normalizedType === 'true_false') {
    const opt0 = (q.options && q.options[0]) || 'Verdadero / Seguro';
    const opt1 = (q.options && q.options[1]) || 'Falso / Riesgo';
    preview.innerHTML = `
      <div class="tf-grid">
        <div class="option-btn opt-2" style="font-size:1.2rem; justify-content:center;">
          <span class="shape">🟢</span> <span>${escapeHtml(opt0)}</span>
        </div>
        <div class="option-btn opt-0" style="font-size:1.2rem; justify-content:center;">
          <span class="shape">🔴</span> <span>${escapeHtml(opt1)}</span>
        </div>
      </div>
    `;
  } else if (normalizedType === 'sequence') {
    preview.innerHTML = `
      <div class="sequence-list">
        <p class="muted mb-8" style="font-size:0.9rem;">Ordena los pasos de la maniobra en la secuencia correcta:</p>
        ${(q.options || []).map((opt, i) => `
          <div class="sequence-item">
            <span class="sequence-num">${i + 1}</span>
            <span>${escapeHtml(opt)}</span>
          </div>
        `).join('')}
      </div>
    `;
  } else if (normalizedType === 'poll_choice' || normalizedType === 'survey') {
    preview.innerHTML = `
      <div class="poll-options">
        <p class="muted mb-8" style="font-size:0.9rem;">Votación de Funcionalidades / Sondeo de Preferencias:</p>
        ${(q.options || []).map((opt, i) => `
          <div class="poll-btn">
            <span><span class="shape" style="color:var(--color-gold); margin-right:8px;">${OPTION_SHAPES[i] || '📊'}</span> ${escapeHtml(opt)}</span>
          </div>
        `).join('')}
      </div>
    `;
  } else if (normalizedType === 'poll_rating' || normalizedType === 'scale') {
    preview.innerHTML = `
      <div class="text-center p-16">
        <p class="muted mb-16">Escala de 1 (Muy insatisfactorio / Riesgoso) a 10 (Excelente / Seguro)</p>
        <div class="flex gap-8" style="justify-content:center; flex-wrap:wrap;">
          ${Array.from({ length: 10 }, (_, i) => `
            <span class="badge ${i + 1 >= 8 ? 'badge-ended' : i + 1 >= 5 ? 'badge-question' : 'badge-draft'}" style="font-size:1.1rem; padding:8px 14px;">${i + 1}</span>
          `).join('')}
        </div>
      </div>
    `;
  } else {
    preview.innerHTML = `
      <div class="text-center p-24">
        <div style="font-size:2.5rem; margin-bottom:8px;">💬</div>
        <p class="muted">Los tripulantes están redactando sus ideas y sugerencias abiertas desde su móvil.</p>
      </div>
    `;
  }
}

/**
 * Suscripción en tiempo real a las respuestas enviadas por los tripulantes
 * @param {string} questionId
 */
function subscribeResponses(questionId) {
  if (hResponsesChannel) {
    sb.removeChannel(hResponsesChannel);
  }

  hResponsesChannel = sb.channel('responses-' + questionId)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'responses', filter: `question_id=eq.${questionId}` }, () => {
      hAnsweredCount++;
      const ansEl = qs('#answeredCount');
      if (ansEl) ansEl.textContent = hAnsweredCount;

      if (window.AudioFX) AudioFX.play('bubble_tap');

      // Si todos los jugadores han respondido, finalizar la pregunta automáticamente
      if (hPlayersCache.length > 0 && hAnsweredCount >= hPlayersCache.length) {
        setTimeout(() => {
          endQuestion();
        }, 600);
      }
    })
    .subscribe();
}

/**
 * Inicia el temporizador con reloj brújula náutica y pulsos de sonar
 * @param {number} limitSeconds
 */
function startTimer(limitSeconds) {
  clearInterval(hTimerInterval);
  hQuestionStartedAt = Date.now();
  hLastSonarSecond = -1;

  const total = typeof limitSeconds === 'number' && limitSeconds > 0 ? limitSeconds : 20;

  const countdownEl = qs('#compassCountdown');
  if (countdownEl) countdownEl.textContent = total;

  const needleEl = qs('#compassNeedle');
  if (needleEl) needleEl.style.transform = 'rotate(0deg)';

  const timerWrap = qs('#compassTimerWrap');
  if (timerWrap) timerWrap.classList.remove('warning');

  const timerBar = qs('#timerBar');
  if (timerBar) timerBar.style.width = '100%';

  hTimerInterval = setInterval(() => {
    const elapsed = (Date.now() - hQuestionStartedAt) / 1000;
    const remaining = Math.max(0, total - elapsed);
    const remainingSec = Math.ceil(remaining);
    const pct = Math.max(0, remaining / total);

    if (countdownEl) countdownEl.textContent = remainingSec;

    if (needleEl) {
      const rotationDeg = ((total - remaining) / total) * 360;
      needleEl.style.transform = `rotate(${rotationDeg}deg)`;
    }

    if (timerBar) {
      timerBar.style.width = (pct * 100) + '%';
    }

    // Efectos de tensión en los últimos 5 segundos
    if (remaining <= 5.0 && remaining > 0) {
      if (timerWrap) timerWrap.classList.add('warning');

      if (remainingSec !== hLastSonarSecond) {
        hLastSonarSecond = remainingSec;

        // Pulso de audio acelerado/ascendente
        if (window.AudioFX) {
          AudioFX.play('sonar_ping', 1000 + (5 - remainingSec) * 200);
        }

        // Anillo de sonar canvas centrado en la brújula
        if (window.CanvasFX) {
          let cx = window.innerWidth / 2;
          let cy = window.innerHeight / 2;
          if (timerWrap) {
            const rect = timerWrap.getBoundingClientRect();
            cx = rect.left + rect.width / 2;
            cy = rect.top + rect.height / 2;
          }
          CanvasFX.sonarRing(cx, cy, 'rgba(228, 0, 26, 0.8)');
        }
      }
    }

    if (elapsed >= total) {
      clearInterval(hTimerInterval);
      endQuestion();
    }
  }, 100);
}

/**
 * Concluye la pregunta activa y transiciona a la vista de resultados
 */
async function endQuestion() {
  clearInterval(hTimerInterval);

  if (window.AudioFX) AudioFX.play('bell');

  if (hResponsesChannel) {
    sb.removeChannel(hResponsesChannel);
    hResponsesChannel = null;
  }

  const q = hQuestions[hQuestionIndex];
  await sb.from('sessions').update({ status: 'results' }).eq('id', hSession.id);
  hSession.status = 'results';

  await renderResultsView(q);
  showView('Results');
}

/**
 * Renderiza los resultados según el tipo de pregunta (Trivia vs Sondeos)
 * y actualiza la Regata Naval en Vivo 2.0 con animación de adelantamiento.
 * @param {Object} q - Objeto de pregunta
 */
async function renderResultsView(q) {
  const typeLabel = (window.Mechanics && Mechanics.getQuestionTypeLabel) ? Mechanics.getQuestionTypeLabel(q.type) : (TYPE_LABELS[q.type] || q.type);
  const typeIcon = (window.Mechanics && Mechanics.getQuestionTypeIcon) ? Mechanics.getQuestionTypeIcon(q.type) : '⚓';

  const progEl = qs('#resultsProgress');
  if (progEl) progEl.textContent = `Pregunta ${hQuestionIndex + 1} de ${hQuestions.length} · Resultados`;

  const typeBadgeEl = qs('#resultsTypeBadge');
  if (typeBadgeEl) typeBadgeEl.innerHTML = `${typeIcon} ${escapeHtml(typeLabel)}`;

  const highTideBadge = qs('#resultsHighTideBadge');
  if (highTideBadge) highTideBadge.classList.toggle('hidden', !q.is_high_tide);

  const textEl = qs('#resultsQText');
  if (textEl) textEl.textContent = q.question_text;

  // Consultar respuestas registradas para esta pregunta
  const { data: rawResponses } = await sb.from('responses').select('*').eq('question_id', q.id);
  const responses = rawResponses || [];

  const content = qs('#resultsContent');
  if (!content) return;

  if (hResultsChart) {
    hResultsChart.destroy();
    hResultsChart = null;
  }

  const normalizedType = (q.type || 'multiple_choice').toLowerCase();

  // 1. Opción Múltiple / Quiz
  if (normalizedType === 'multiple_choice' || normalizedType === 'quiz') {
    content.innerHTML = `<canvas id="resultsCanvas" height="240"></canvas>`;
    const counts = (q.options || []).map((_, i) => responses.filter(r => r.answer && Number(r.answer.optionIndex) === i).length);
    const colors = ['#E74C3C', '#3498DB', '#2ECC71', '#F39C12'];

    const ctx = qs('#resultsCanvas').getContext('2d');
    hResultsChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: q.options,
        datasets: [{
          data: counts,
          backgroundColor: q.options.map((_, i) => colors[i % colors.length]),
          borderRadius: 8
        }]
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#ffffff', font: { weight: '600' } }, grid: { color: 'rgba(255,255,255,0.08)' } },
          y: { beginAtZero: true, ticks: { color: '#ffffff', stepSize: 1 }, grid: { color: 'rgba(255,255,255,0.08)' } }
        }
      }
    });

    const correctIdx = q.correct_index != null ? q.correct_index : q.correct_option;
    if (correctIdx != null && q.options && q.options[correctIdx] !== undefined) {
      content.innerHTML += `
        <div class="mt-16 text-center">
          <span class="badge" style="background:rgba(46,204,113,0.22); color:#2ECC71; font-size:1rem; padding:8px 18px; border:1px solid #2ECC71;">
            ✓ Respuesta Correcta: <strong>${OPTION_LABELS[correctIdx] || (correctIdx + 1)}. ${escapeHtml(q.options[correctIdx])}</strong>
          </span>
        </div>
      `;
    }
  }
  // 2. Verdadero / Falso Náutico
  else if (normalizedType === 'true_false') {
    const opt0 = (q.options && q.options[0]) || 'Verdadero / Seguro';
    const opt1 = (q.options && q.options[1]) || 'Falso / Riesgo';
    const count0 = responses.filter(r => r.answer && Number(r.answer.optionIndex) === 0).length;
    const count1 = responses.filter(r => r.answer && Number(r.answer.optionIndex) === 1).length;
    const totalResp = Math.max(1, count0 + count1);
    const pct0 = Math.round((count0 / totalResp) * 100);
    const pct1 = Math.round((count1 / totalResp) * 100);
    const correctIdx = q.correct_index != null ? q.correct_index : q.correct_option;

    content.innerHTML = `
      <div class="panel-grid cols-2 mt-16" style="gap:16px;">
        <div class="card ${correctIdx === 0 ? 'glow-gold' : ''}" style="background:rgba(46,204,113,0.15); border:1px solid ${correctIdx === 0 ? 'var(--color-gold)' : 'rgba(46,204,113,0.4)'}; text-align:center; padding:20px;">
          <div style="font-size:1.6rem;">🟢 ${escapeHtml(opt0)}</div>
          <div class="pin-display" style="font-size:2.4rem; color:#2ECC71; margin:8px 0;">${pct0}%</div>
          <div class="muted">${count0} tripulantes ${correctIdx === 0 ? '🌟 (Correcto)' : ''}</div>
        </div>
        <div class="card ${correctIdx === 1 ? 'glow-gold' : ''}" style="background:rgba(228,0,26,0.15); border:1px solid ${correctIdx === 1 ? 'var(--color-gold)' : 'rgba(228,0,26,0.4)'}; text-align:center; padding:20px;">
          <div style="font-size:1.6rem;">🔴 ${escapeHtml(opt1)}</div>
          <div class="pin-display" style="font-size:2.4rem; color:var(--saam-red-light); margin:8px 0;">${pct1}%</div>
          <div class="muted">${count1} tripulantes ${correctIdx === 1 ? '🌟 (Correcto)' : ''}</div>
        </div>
      </div>
    `;
  }
  // 3. Secuencia / Maniobra Náutica
  else if (normalizedType === 'sequence') {
    const correctOrder = q.correct_order || (q.options || []).map((_, i) => i);
    const correctCount = responses.filter(r => {
      if (!r.answer) return false;
      const ansOrder = Array.isArray(r.answer) ? r.answer : (Array.isArray(r.answer.order) ? r.answer.order : null);
      if (!ansOrder || ansOrder.length !== correctOrder.length) return false;
      return ansOrder.every((v, i) => Number(v) === Number(correctOrder[i]));
    }).length;

    content.innerHTML = `
      <div class="p-16">
        <div class="flex-between wrap gap-8 mb-16">
          <span class="badge badge-ended" style="font-size:0.95rem; padding:6px 14px;">
            ⚓ Secuencia Correcta de Maniobra
          </span>
          <span class="muted">
            Aciertos perfectos: <strong style="color:var(--color-gold);">${correctCount}</strong> de ${responses.length} respuestas
          </span>
        </div>
        <div class="sequence-list">
          ${correctOrder.map((optIdx, stepNum) => `
            <div class="sequence-item" style="border-left: 4px solid var(--color-gold);">
              <span class="sequence-num">${stepNum + 1}</span>
              <span style="font-weight:600;">${escapeHtml(q.options[optIdx])}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
  // 4. Votación de Funcionalidades / Sondeo de Preferencias
  else if (normalizedType === 'poll_choice' || normalizedType === 'survey') {
    content.innerHTML = `
      <div class="mb-12"><span class="badge badge-lobby">📊 Sondeo de Producto — Preferencias de la Flota</span></div>
      <canvas id="resultsCanvas" height="240"></canvas>
    `;
    const counts = (q.options || []).map((_, i) => responses.filter(r => r.answer && Number(r.answer.optionIndex) === i).length);
    const totalVotes = Math.max(1, responses.length);
    const percentages = counts.map(c => Math.round((c / totalVotes) * 100));

    const ctx = qs('#resultsCanvas').getContext('2d');
    hResultsChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: q.options,
        datasets: [{
          label: '% de Votos',
          data: percentages,
          backgroundColor: '#3498DB',
          borderRadius: 8
        }]
      },
      options: {
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (item) => ` ${item.raw}% (${counts[item.dataIndex]} votos)`
            }
          }
        },
        scales: {
          x: { ticks: { color: '#ffffff', font: { weight: '600' } }, grid: { color: 'rgba(255,255,255,0.08)' } },
          y: { beginAtZero: true, max: 100, ticks: { color: '#ffffff', callback: v => v + '%' }, grid: { color: 'rgba(255,255,255,0.08)' } }
        }
      }
    });
  }
  // 5. Valoración de Pantallas / UX Rating (1 a 10)
  else if (normalizedType === 'poll_rating' || normalizedType === 'scale') {
    const values = responses.map(r => {
      if (!r.answer) return null;
      if (typeof r.answer === 'number') return r.answer;
      if (typeof r.answer.value === 'number') return r.answer.value;
      if (typeof r.answer.rating === 'number') return r.answer.rating;
      return null;
    }).filter(v => typeof v === 'number' && v >= 1 && v <= 10);

    const avg = values.length ? (values.reduce((a, b) => a + b, 0) / values.length) : 0;
    const dist = Array.from({ length: 10 }, (_, i) => values.filter(v => v === i + 1).length);

    content.innerHTML = `
      <div class="text-center">
        <div style="font-size:3rem;">${scaleEmoji(Math.round(avg))}</div>
        <div class="pin-display" style="font-size:2.6rem;">${avg.toFixed(1)} <span style="font-size:1.4rem; color:rgba(255,255,255,0.6);">/ 10</span></div>
        <div class="muted">Valoración promedio de ${values.length} tripulantes</div>
      </div>
      <canvas id="resultsCanvas" height="200" class="mt-16"></canvas>
    `;

    const ctx = qs('#resultsCanvas').getContext('2d');
    hResultsChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Array.from({ length: 10 }, (_, i) => `${i + 1}★`),
        datasets: [{
          data: dist,
          backgroundColor: '#D4A843',
          borderRadius: 6
        }]
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#ffffff' }, grid: { display: false } },
          y: { beginAtZero: true, ticks: { color: '#ffffff', stepSize: 1 }, grid: { color: 'rgba(255,255,255,0.08)' } }
        }
      }
    });
  }
  // 6. Sugerencias y Feedback Abierto (Texto libre)
  else {
    const texts = responses.map(r => {
      if (!r.answer) return '';
      if (typeof r.answer === 'string') return r.answer;
      return r.answer.text || r.answer.value || '';
    }).filter(t => t && t.trim().length > 0);

    if (texts.length === 0) {
      content.innerHTML = `<p class="muted text-center p-24">Sin sugerencias registradas para esta consulta.</p>`;
    } else {
      content.innerHTML = `
        <div class="mb-12"><span class="badge badge-question">💬 Muro de Opinión Náutico (${texts.length} aportes)</span></div>
        <div class="opinion-wall" style="max-height:340px; overflow-y:auto; padding-right:6px;">
          ${texts.map(t => `
            <div class="opinion-card">
              <p style="margin:0; font-size:0.95rem; color:#fff; line-height:1.4;">${escapeHtml(t)}</p>
            </div>
          `).join('')}
        </div>
      `;
    }
  }

  // Actualizar texto del botón siguiente pregunta
  const btnNext = qs('#btnNextQuestion');
  if (btnNext) {
    if (hQuestionIndex + 1 < hQuestions.length) {
      btnNext.innerHTML = '<span>Siguiente pregunta ➔</span>';
    } else {
      btnNext.innerHTML = '<span>🏆 Ver Podio Final ➔</span>';
    }
  }

  // Actualizar y animar la Regata Naval 2.0
  try {
    const { data: latestPlayers } = await sb.from('players')
      .select('*')
      .eq('session_id', hSession.id)
      .order('score', { ascending: false });

    const currentPlayers = latestPlayers || [];

    if (window.RegattaEngine) {
      if (hPrevPlayersSnapshot && hPrevPlayersSnapshot.length > 0) {
        await RegattaEngine.animateTransition('#liveRegatta', hPrevPlayersSnapshot, currentPlayers, {
          viewMode: 'top8',
          title: 'Clasificación de la Flota en Vivo'
        });
      } else {
        RegattaEngine.render('#liveRegatta', currentPlayers, null, {
          viewMode: 'top8',
          title: 'Clasificación de la Flota en Vivo'
        });
      }
    }

    hPrevPlayersSnapshot = JSON.parse(JSON.stringify(currentPlayers));
    hPlayersCache = currentPlayers;
  } catch (err) {
    console.error('Error al actualizar RegattaEngine:', err);
  }
}

/**
 * Concluye la travesía, revela el Podio 3D con fanfarria y bengalas,
 * y muestra la clasificación completa.
 */
async function endGame() {
  clearInterval(hTimerInterval);

  await sb.from('sessions').update({ status: 'ended' }).eq('id', hSession.id);
  hSession.status = 'ended';

  const { data: latestPlayers } = await sb.from('players')
    .select('*')
    .eq('session_id', hSession.id)
    .order('score', { ascending: false });

  const finalFleet = latestPlayers || [];

  showView('Ended');

  // Efectos de celebración ceremonial
  if (window.AudioFX) AudioFX.play('podium_fanfare');
  if (window.CanvasFX) {
    CanvasFX.launchNauticalConfetti({ count: 120 });
    CanvasFX.launchFlare(window.innerWidth * 0.25, window.innerHeight * 0.55, '#E4001A');
    CanvasFX.launchFlare(window.innerWidth * 0.75, window.innerHeight * 0.55, '#D4A843');
  }

  // Ráfagas periódicas de celebración en el podio
  if (hPodiumFxInterval) clearInterval(hPodiumFxInterval);
  hPodiumFxInterval = setInterval(() => {
    if (window.CanvasFX) {
      CanvasFX.launchNauticalConfetti({ count: 35 });
      if (Math.random() > 0.6) {
        CanvasFX.launchFlare(window.innerWidth * (0.2 + Math.random() * 0.6), window.innerHeight * 0.6);
      }
    }
  }, 4000);

  // Renderizar Podio 3D Top 3
  const p1 = finalFleet[0] || null;
  const p2 = finalFleet[1] || null;
  const p3 = finalFleet[2] || null;

  if (p1) {
    qs('#podiumShip1').innerHTML = (window.RegattaEngine && RegattaEngine.getShipSvg) ? RegattaEngine.getShipSvg(p1.avatar) : shipAvatarSVG(p1.avatar || 'tug');
    qs('#podiumName1').textContent = p1.name;
    qs('#podiumScore1').textContent = `${Number(p1.score || 0).toLocaleString('es-CL')} pts`;
    qs('#podiumStep1').style.visibility = 'visible';
  } else {
    qs('#podiumStep1').style.visibility = 'hidden';
  }

  if (p2) {
    qs('#podiumShip2').innerHTML = (window.RegattaEngine && RegattaEngine.getShipSvg) ? RegattaEngine.getShipSvg(p2.avatar) : shipAvatarSVG(p2.avatar || 'container');
    qs('#podiumName2').textContent = p2.name;
    qs('#podiumScore2').textContent = `${Number(p2.score || 0).toLocaleString('es-CL')} pts`;
    qs('#podiumStep2').style.visibility = 'visible';
  } else {
    qs('#podiumStep2').style.visibility = 'hidden';
  }

  if (p3) {
    qs('#podiumShip3').innerHTML = (window.RegattaEngine && RegattaEngine.getShipSvg) ? RegattaEngine.getShipSvg(p3.avatar) : shipAvatarSVG(p3.avatar || 'tanker');
    qs('#podiumName3').textContent = p3.name;
    qs('#podiumScore3').textContent = `${Number(p3.score || 0).toLocaleString('es-CL')} pts`;
    qs('#podiumStep3').style.visibility = 'visible';
  } else {
    qs('#podiumStep3').style.visibility = 'hidden';
  }

  // Renderizar Leaderboard Final Completo
  if (window.RegattaEngine) {
    RegattaEngine.render('#finalLeaderboard', finalFleet, null, {
      viewMode: 'all',
      title: 'Clasificación Final de la Flota'
    });
  }
}
