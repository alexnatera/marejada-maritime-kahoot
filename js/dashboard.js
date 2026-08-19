// js/dashboard.js
// Controlador de Analítica, Métricas del Summit y Discovery de Producto — Marejada 2.0

let dCharts = [];
let dAllSessions = [];
let dSession = null;
let dQuestions = [];
let dPlayers = [];
let dResponsesByQuestion = {};
let dActiveTab = 'summit'; // 'summit' | 'discovery'
let dPlayerStreaks = {}; // playerId -> { maxStreak, streakInfo }

function initDashboard() {
  if (typeof injectOceanBg === 'function') injectOceanBg();
  const brandEl = qs('#brandIcon');
  if (brandEl && typeof tugLogoSVG === 'function') brandEl.innerHTML = tugLogoSVG();

  // Inicializar audio widget si existe
  initAudioWidget();

  // Cargar lista de sesiones
  loadSessions();

  // Event Listeners
  const selectEl = qs('#sessionSelect');
  if (selectEl) {
    selectEl.addEventListener('change', (e) => {
      if (e.target.value) {
        loadSessionResults(e.target.value);
      } else {
        dSession = null;
        qs('#dashboardContent')?.classList.add('hidden');
        qs('#sessionInfoStrip')?.classList.add('hidden');
      }
    });
  }

  const searchEl = qs('#sessionSearch');
  if (searchEl) {
    searchEl.addEventListener('input', (e) => {
      filterSessionOptions(e.target.value);
    });
  }

  // Pestañas
  qs('#tabBtnSummit')?.addEventListener('click', () => switchDashboardTab('summit'));
  qs('#tabBtnDiscovery')?.addEventListener('click', () => switchDashboardTab('discovery'));

  // Exportaciones
  qs('#btnExportGeneral')?.addEventListener('click', exportGeneralCSV);
  qs('#btnExportDiscovery')?.addEventListener('click', exportDiscoveryCSV);
  qs('#btnPrint')?.addEventListener('click', printDashboard);

  // Buscador de sugerencias en vivo
  qs('#feedbackSearchInput')?.addEventListener('input', (e) => {
    filterFeedbackCards(e.target.value);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDashboard);
} else {
  initDashboard();
}

/**
 * Inicializa el botón flotante de audio
 */
function initAudioWidget() {
  const btn = qs('#audioToggleBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    if (window.AudioFX) {
      const isMuted = AudioFX.toggleMute();
      btn.classList.toggle('is-muted', isMuted);
    }
  });
}

/**
 * Carga todas las sesiones disponibles desde Supabase
 */
async function loadSessions() {
  try {
    const { data, error } = await sb
      .from('sessions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    dAllSessions = data || [];
    renderSessionSelect(dAllSessions);
  } catch (err) {
    console.error('Error al cargar sesiones:', err);
    const select = qs('#sessionSelect');
    if (select) select.innerHTML = `<option value="">Error al cargar sesiones náuticas</option>`;
  }
}

/**
 * Renderiza las opciones del selector de sesión
 * @param {Array} sessions
 */
function renderSessionSelect(sessions) {
  const select = qs('#sessionSelect');
  if (!select) return;

  if (!sessions || sessions.length === 0) {
    select.innerHTML = `<option value="">No se encontraron sesiones</option>`;
    return;
  }

  const currentVal = select.value;
  select.innerHTML = `<option value="">⚓ Selecciona una sesión para analizar (${sessions.length})...</option>` +
    sessions.map(s => {
      const dateStr = s.created_at ? formatDate(s.created_at) : '';
      const statusLabel = (STATUS_LABELS && STATUS_LABELS[s.status]) || s.status || 'Borrador';
      return `<option value="${s.id}" ${s.id === currentVal ? 'selected' : ''}>${escapeHtml(s.title)} — PIN ${s.pin} (${statusLabel}) · ${dateStr}</option>`;
    }).join('');
}

/**
 * Filtra las sesiones en tiempo real según el texto de búsqueda
 * @param {string} term
 */
function filterSessionOptions(term) {
  const q = (term || '').trim().toLowerCase();
  if (!q) {
    renderSessionSelect(dAllSessions);
    return;
  }
  const filtered = dAllSessions.filter(s =>
    (s.title && s.title.toLowerCase().includes(q)) ||
    (s.pin && s.pin.includes(q)) ||
    (s.status && s.status.toLowerCase().includes(q))
  );
  renderSessionSelect(filtered);
}

/**
 * Carga y analiza los resultados completos de la sesión seleccionada
 * @param {string} sessionId
 */
async function loadSessionResults(sessionId) {
  try {
    // 1. Obtener datos de la sesión, preguntas y jugadores
    const [sessionRes, questionsRes, playersRes] = await Promise.all([
      sb.from('sessions').select('*').eq('id', sessionId).single(),
      sb.from('questions').select('*').eq('session_id', sessionId).order('position', { ascending: true }),
      sb.from('players').select('*').eq('session_id', sessionId).order('score', { ascending: false })
    ]);

    if (sessionRes.error) throw sessionRes.error;

    dSession = sessionRes.data;
    dQuestions = questionsRes.data || [];
    dPlayers = playersRes.data || [];
    dResponsesByQuestion = {};

    // 2. Obtener respuestas por cada pregunta
    for (const q of dQuestions) {
      const { data: responses } = await sb.from('responses').select('*').eq('question_id', q.id);
      dResponsesByQuestion[q.id] = responses || [];
    }

    // 3. Procesar analítica y rachas
    processAnalytics();

    // 4. Renderizar vistas
    renderSessionInfoStrip();
    renderSummaryKPIs();
    renderFleetComposition();
    renderLeaderboard();
    renderSummitQuestions();
    renderDiscoveryPollChoices();
    renderDiscoveryPollRatings();
    renderDiscoveryFeedbackWall();

    // 5. Actualizar contadores de pestañas
    updateTabBadges();

    // 6. Mostrar panel
    qs('#sessionInfoStrip')?.classList.remove('hidden');
    qs('#dashboardContent')?.classList.remove('hidden');

    if (window.AudioFX) {
      AudioFX.play('sonar_ping');
    }
  } catch (err) {
    console.error('Error al procesar resultados de la sesión:', err);
    alert('No se pudieron cargar los datos de la sesión. Revisa la conexión.');
  }
}

/**
 * Calcula métricas avanzadas y rachas por tripulante
 */
function processAnalytics() {
  dPlayerStreaks = {};

  const triviaQuestions = dQuestions.filter(q => !isDiscoveryQuestion(q))
    .sort((a, b) => (a.position || 0) - (b.position || 0));

  dPlayers.forEach(p => {
    let currentStreak = 0;
    let maxStreak = 0;

    triviaQuestions.forEach(q => {
      const responses = dResponsesByQuestion[q.id] || [];
      const r = responses.find(resp => resp.player_id === p.id);
      if (r) {
        if (r.is_correct === true) {
          currentStreak++;
          if (currentStreak > maxStreak) maxStreak = currentStreak;
        } else if (r.is_correct === false) {
          currentStreak = 0;
        }
      }
    });

    const streakInfo = window.Mechanics ? Mechanics.getStreakInfo(maxStreak) : { multiplier: 1.0, icon: '⚓', badge: 'Rumbo Estable' };
    dPlayerStreaks[p.id] = { maxStreak, streakInfo };
  });
}

/**
 * Determina si una pregunta pertenece al ámbito de Product Discovery
 * @param {Object} q
 * @returns {boolean}
 */
function isDiscoveryQuestion(q) {
  const type = (q.type || '').toLowerCase();
  return (
    type === 'poll_choice' ||
    type === 'poll_rating' ||
    type === 'poll_text' ||
    type === 'survey' ||
    type === 'scale' ||
    type === 'text'
  );
}

/**
 * Alterna entre la pestaña Summit y la pestaña Product Discovery
 * @param {'summit'|'discovery'} tabName
 */
function switchDashboardTab(tabName) {
  dActiveTab = tabName;
  const tabSummit = qs('#tabBtnSummit');
  const tabDiscovery = qs('#tabBtnDiscovery');
  const panelSummit = qs('#tabPanelSummit');
  const panelDiscovery = qs('#tabPanelDiscovery');

  if (tabName === 'summit') {
    tabSummit?.classList.add('active');
    tabDiscovery?.classList.remove('active');
    panelSummit?.classList.remove('hidden');
    panelDiscovery?.classList.add('hidden');
  } else {
    tabSummit?.classList.remove('active');
    tabDiscovery?.classList.add('active');
    panelSummit?.classList.add('hidden');
    panelDiscovery?.classList.remove('hidden');
  }

  if (window.AudioFX) {
    AudioFX.play('bubble_tap');
  }
}

/**
 * Actualiza los badges numéricos de las pestañas
 */
function updateTabBadges() {
  const summitCount = dQuestions.filter(q => !isDiscoveryQuestion(q)).length;
  const discoveryCount = dQuestions.filter(q => isDiscoveryQuestion(q)).length;

  const badgeSummit = qs('#badgeSummitCount');
  const badgeDiscovery = qs('#badgeDiscoveryCount');

  if (badgeSummit) badgeSummit.textContent = summitCount;
  if (badgeDiscovery) badgeDiscovery.textContent = discoveryCount;
}

/**
 * Renderiza la tira superior de información de la sesión
 */
function renderSessionInfoStrip() {
  if (!dSession) return;
  const pinBadge = qs('#infoPinBadge');
  const statusBadge = qs('#infoStatusBadge');
  const dateText = qs('#infoDateText');

  if (pinBadge) pinBadge.textContent = `PIN: ${dSession.pin}`;
  if (statusBadge) {
    statusBadge.className = `badge badge-${dSession.status || 'draft'}`;
    statusBadge.textContent = (STATUS_LABELS && STATUS_LABELS[dSession.status]) || dSession.status || 'Borrador';
  }
  if (dateText) {
    dateText.textContent = dSession.created_at ? `Creada el ${formatDate(dSession.created_at)}` : '';
  }
}

/**
 * Renderiza los resúmenes ejecutivos KPI para ambas pestañas
 */
function renderSummaryKPIs() {
  // 1. KPIs Summit
  const triviaQ = dQuestions.filter(q => !isDiscoveryQuestion(q));
  const triviaResponses = triviaQ.flatMap(q => dResponsesByQuestion[q.id] || []);
  const correctCount = triviaResponses.filter(r => r.is_correct === true).length;
  const accuracyPct = triviaResponses.length ? Math.round((correctCount / triviaResponses.length) * 100) : 0;

  qs('#statSummitPlayers').textContent = dPlayers.length;
  qs('#statSummitPlayersSub').textContent = `${dPlayers.length} tripulantes registrados`;
  qs('#statSummitAccuracy').textContent = accuracyPct + '%';
  qs('#statSummitAccuracySub').textContent = `${correctCount} aciertos de ${triviaResponses.length} respuestas`;

  // Tiempo promedio
  const times = triviaResponses.map(r => r.answer && typeof r.answer.timeRemaining === 'number' ? r.answer.timeRemaining : null).filter(t => t !== null);
  if (times.length) {
    const avgTimeRemaining = times.reduce((a, b) => a + b, 0) / times.length;
    qs('#statSummitAvgTime').textContent = `${Math.round(20 - avgTimeRemaining)}s`;
  } else {
    qs('#statSummitAvgTime').textContent = 'N/A';
  }

  // Pregunta más crítica de seguridad (menor acierto)
  let lowestAccuracy = 101;
  let criticalQuestion = null;

  triviaQ.forEach(q => {
    const resp = dResponsesByQuestion[q.id] || [];
    if (resp.length > 0) {
      const qCorrect = resp.filter(r => r.is_correct === true).length;
      const qAcc = Math.round((qCorrect / resp.length) * 100);
      if (qAcc < lowestAccuracy) {
        lowestAccuracy = qAcc;
        criticalQuestion = q;
      }
    }
  });

  const criticalRateEl = qs('#statSummitCriticalRate');
  const criticalTextEl = qs('#statSummitCriticalText');

  if (criticalQuestion) {
    criticalRateEl.textContent = `${lowestAccuracy}% acierto`;
    criticalRateEl.style.color = lowestAccuracy < 50 ? 'var(--saam-red-light)' : 'var(--color-amber)';
    criticalTextEl.textContent = `Pregunta: ${criticalQuestion.question_text}`;
    criticalTextEl.title = criticalQuestion.question_text;
  } else {
    criticalRateEl.textContent = '--';
    criticalTextEl.textContent = 'Sin datos de trivia';
  }

  // 2. KPIs Discovery
  const discoveryChoiceQ = dQuestions.filter(q => q.type === 'poll_choice' || q.type === 'survey');
  const totalFeatureVotes = discoveryChoiceQ.reduce((sum, q) => sum + (dResponsesByQuestion[q.id] || []).length, 0);
  qs('#statDiscoveryVotes').textContent = totalFeatureVotes;

  // Promedio UX Rating
  const ratingQ = dQuestions.filter(q => q.type === 'poll_rating' || q.type === 'scale');
  const allRatings = ratingQ.flatMap(q => dResponsesByQuestion[q.id] || [])
    .map(r => r.answer && (typeof r.answer.value === 'number' ? r.answer.value : (typeof r.answer === 'number' ? r.answer : null)))
    .filter(v => typeof v === 'number' && v >= 1 && v <= 10);

  const avgRating = allRatings.length ? (allRatings.reduce((a, b) => a + b, 0) / allRatings.length) : 0;
  qs('#statDiscoveryUxRating').textContent = allRatings.length ? `${avgRating.toFixed(1)} / 10` : '--';
  qs('#statDiscoveryUxSub').textContent = allRatings.length
    ? `${allRatings.length} valoraciones registradas (${scaleEmoji(Math.round(avgRating))})`
    : 'Sin valoraciones 1-10';

  // Total Sugerencias
  const textQ = dQuestions.filter(q => q.type === 'poll_text' || q.type === 'text');
  const totalFeedback = textQ.reduce((sum, q) => sum + (dResponsesByQuestion[q.id] || []).length, 0);
  qs('#statDiscoveryFeedbackCount').textContent = totalFeedback;
}

/**
 * Renderiza la composición gráfica de buques de la flota
 */
function renderFleetComposition() {
  const container = qs('#fleetComposition');
  if (!container) return;

  const fleetCounts = {};
  dPlayers.forEach(p => {
    const a = p.avatar || 'tug';
    fleetCounts[a] = (fleetCounts[a] || 0) + 1;
  });

  const avatars = (typeof SHIP_AVATARS !== 'undefined') ? SHIP_AVATARS : {
    tug: { label: 'Remolcador ASD' },
    pilot: { label: 'Lancha de Prácticos' },
    ferry: { label: 'Ferry Rápido' },
    tanker: { label: 'Petrolero Aframax' },
    cargo: { label: 'Portacontenedores' },
    supply: { label: 'Buque de Suministro' }
  };

  container.innerHTML = Object.keys(avatars).map(key => `
    <div class="text-center" style="min-width:90px; padding:8px;">
      <div class="ship-avatar-wrap" style="width:58px; height:44px; margin:0 auto;">
        ${(typeof shipAvatarSVG === 'function') ? shipAvatarSVG(key) : '🚢'}
      </div>
      <div class="muted" style="font-size:0.75rem; margin-top:6px; font-weight:600;">${avatars[key].label}</div>
      <div style="font-weight:800; font-size:1.25rem; color:var(--color-gold); margin-top:2px;">
        ${fleetCounts[key] || 0}
      </div>
    </div>
  `).join('');
}

/**
 * Renderiza la tabla de clasificación final con avatares, apodos y rachas
 */
function renderLeaderboard() {
  const container = qs('#dashLeaderboard');
  if (!container) return;

  if (!dPlayers.length) {
    container.innerHTML = `<p class="muted text-center p-24">No hay tripulantes registrados en esta sesión.</p>`;
    return;
  }

  const triviaQ = dQuestions.filter(q => !isDiscoveryQuestion(q));

  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th style="width:60px; text-align:center;">Rango</th>
          <th>Tripulante & Buque</th>
          <th>Racha Máxima</th>
          <th style="text-align:center;">Aciertos</th>
          <th style="text-align:right;">Puntaje Total</th>
        </tr>
      </thead>
      <tbody>
        ${dPlayers.map((p, idx) => {
          const rankDisplay = idx === 0 ? '👑 🥇 1º' : idx === 1 ? '🥈 2º' : idx === 2 ? '🥉 3º' : `${idx + 1}º`;
          const rowClass = idx === 0 ? 'style="background:rgba(212,168,67,0.12);"' : idx === 1 ? 'style="background:rgba(200,214,229,0.08);"' : idx === 2 ? 'style="background:rgba(205,127,50,0.08);"' : '';
          
          // Contar aciertos del jugador
          let playerCorrect = 0;
          triviaQ.forEach(q => {
            const resp = dResponsesByQuestion[q.id] || [];
            const r = resp.find(res => res.player_id === p.id);
            if (r && r.is_correct === true) playerCorrect++;
          });

          const streakData = dPlayerStreaks[p.id] || { maxStreak: 0, streakInfo: { icon: '⚓', badge: 'Rumbo Estable' } };
          const streakBadge = streakData.maxStreak >= 2
            ? `<span class="badge ${streakData.maxStreak >= 4 ? 'badge-question glow-gold' : 'badge-results'}" style="font-size:0.75rem;">
                ${streakData.streakInfo.icon} ${streakData.maxStreak} seguidos (${streakData.streakInfo.name})
               </span>`
            : `<span class="muted" style="font-size:0.8rem;">Estándar</span>`;

          const nick = (typeof shipTitle === 'function') ? shipTitle(p) : (p.avatar || 'tug');

          return `
            <tr ${rowClass}>
              <td style="text-align:center; font-weight:800; font-family:var(--font-title); font-size:1.1rem; color:var(--color-gold);">
                ${rankDisplay}
              </td>
              <td>
                <div class="flex gap-12" style="align-items:center;">
                  <div style="width:38px; height:28px; flex-shrink:0;">
                    ${(typeof shipAvatarSVG === 'function') ? shipAvatarSVG(p.avatar || 'tug') : '🚢'}
                  </div>
                  <div>
                    <div style="font-weight:700; color:#ffffff; font-size:0.95rem;">${escapeHtml(p.name)}</div>
                    <div class="muted" style="font-size:0.75rem;">${escapeHtml(nick)}</div>
                  </div>
                </div>
              </td>
              <td>${streakBadge}</td>
              <td style="text-align:center; font-weight:600;">
                <span style="color:${playerCorrect === triviaQ.length && triviaQ.length > 0 ? '#2ECC71' : '#ffffff'};">
                  ${playerCorrect} / ${triviaQ.length}
                </span>
                <span class="muted" style="font-size:0.75rem;"> (${triviaQ.length ? Math.round((playerCorrect / triviaQ.length) * 100) : 0}%)</span>
              </td>
              <td style="text-align:right; font-weight:800; font-family:var(--font-title); font-size:1.15rem; color:var(--color-gold);">
                ${p.score} pts
              </td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
}

/**
 * Renderiza el desglose detallado de preguntas de Trivia & Seguridad (Pestaña 1)
 */
function renderSummitQuestions() {
  destroyAllCharts();
  const container = qs('#summitQuestionsResults');
  if (!container) return;

  const triviaQ = dQuestions.filter(q => !isDiscoveryQuestion(q));

  if (!triviaQ.length) {
    container.innerHTML = `<p class="muted p-24 text-center">Esta sesión no contiene preguntas de trivia o seguridad.</p>`;
    return;
  }

  container.innerHTML = triviaQ.map((q, idx) => {
    const responses = dResponsesByQuestion[q.id] || [];
    const correctCount = responses.filter(r => r.is_correct === true).length;
    const accuracy = responses.length ? Math.round((correctCount / responses.length) * 100) : 0;
    
    let securityBadgeHtml = '';
    if (responses.length > 0) {
      if (accuracy >= 75) securityBadgeHtml = `<span class="security-badge safe">🟢 Seguro (${accuracy}% aciertos)</span>`;
      else if (accuracy >= 50) securityBadgeHtml = `<span class="security-badge warning">🟡 Precaución (${accuracy}% aciertos)</span>`;
      else securityBadgeHtml = `<span class="security-badge critical">🔴 Riesgo Crítico (${accuracy}% aciertos)</span>`;
    }

    const tideBadge = q.is_high_tide ? `<span class="badge badge-results" style="background:rgba(228,0,26,0.25); color:#FF3B4E; border:1px solid #E4001A;">🌊 2x Marea Alta</span>` : '';
    const typeIcon = (window.Mechanics && Mechanics.getQuestionTypeIcon) ? Mechanics.getQuestionTypeIcon(q.type) : '⚓';
    const typeLabel = (window.Mechanics && Mechanics.getQuestionTypeLabel) ? Mechanics.getQuestionTypeLabel(q.type) : q.type;

    return `
      <div class="dash-q-card">
        <div class="dash-q-header">
          <div class="flex gap-8 wrap" style="align-items:center;">
            <span class="type-tag">${typeIcon} ${escapeHtml(typeLabel)}</span>
            ${tideBadge}
            ${securityBadgeHtml}
          </div>
          <div class="muted" style="font-size:0.85rem;">
            ${responses.length} respuestas registradas · Tiempo: ${q.time_limit || 20}s
          </div>
        </div>
        <h3 class="dash-q-title">${idx + 1}. ${escapeHtml(q.question_text)}</h3>
        <div id="summitQResult-${idx}" class="mt-16"></div>
      </div>
    `;
  }).join('');

  triviaQ.forEach((q, idx) => {
    renderSummitQuestionContent(q, idx);
  });
}

/**
 * Renderiza el gráfico o diagrama de una pregunta de trivia específica
 * @param {Object} q
 * @param {number} idx
 */
function renderSummitQuestionContent(q, idx) {
  const el = qs(`#summitQResult-${idx}`);
  if (!el) return;
  const responses = dResponsesByQuestion[q.id] || [];
  const normalizedType = (q.type || 'multiple_choice').toLowerCase();

  // 1. Opción Múltiple / Quiz
  if (normalizedType === 'multiple_choice' || normalizedType === 'quiz') {
    el.innerHTML = `
      <div style="max-width:680px; margin:0 auto;">
        <canvas id="summitCanvas-${idx}" height="200"></canvas>
      </div>
    `;
    const options = q.options || [];
    const counts = options.map((_, i) => responses.filter(r => r.answer && Number(r.answer.optionIndex) === i).length);
    const colors = ['#E74C3C', '#3498DB', '#2ECC71', '#F39C12'];
    const correctIdx = q.correct_index != null ? q.correct_index : q.correct_option;

    const ctx = qs(`#summitCanvas-${idx}`)?.getContext('2d');
    if (ctx) {
      const chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: options,
          datasets: [{
            data: counts,
            backgroundColor: options.map((_, i) => colors[i % colors.length]),
            borderRadius: 6
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
      dCharts.push(chart);
    }

    if (correctIdx != null && options[correctIdx] !== undefined) {
      const correctResponsesCount = responses.filter(r => r.is_correct === true).length;
      el.innerHTML += `
        <div class="mt-16 p-12" style="background:rgba(46,204,113,0.12); border:1px solid rgba(46,204,113,0.3); border-radius:var(--radius-sm); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
          <span>✓ Alternativa Correcta: <strong style="color:#2ECC71;">${OPTION_LABELS[correctIdx] || (correctIdx + 1)}. ${escapeHtml(options[correctIdx])}</strong></span>
          <span style="font-weight:700; color:var(--color-gold);">${correctResponsesCount} de ${responses.length} aciertos (${responses.length ? Math.round((correctResponsesCount/responses.length)*100) : 0}%)</span>
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

    el.innerHTML = `
      <div class="panel-grid cols-2 mt-16" style="gap:16px;">
        <div class="card ${correctIdx === 0 ? 'glow-gold' : ''}" style="background:rgba(46,204,113,0.12); border:1px solid ${correctIdx === 0 ? 'var(--color-gold)' : 'rgba(46,204,113,0.35)'}; text-align:center; padding:18px;">
          <div style="font-size:1.3rem; font-weight:700; color:#ffffff;">🟢 ${escapeHtml(opt0)}</div>
          <div class="pin-display" style="font-size:2.2rem; color:#2ECC71; margin:6px 0;">${pct0}%</div>
          <div class="muted" style="font-size:0.85rem;">${count0} tripulantes ${correctIdx === 0 ? '🌟 (Correcta)' : ''}</div>
        </div>
        <div class="card ${correctIdx === 1 ? 'glow-gold' : ''}" style="background:rgba(228,0,26,0.12); border:1px solid ${correctIdx === 1 ? 'var(--color-gold)' : 'rgba(228,0,26,0.35)'}; text-align:center; padding:18px;">
          <div style="font-size:1.3rem; font-weight:700; color:#ffffff;">🔴 ${escapeHtml(opt1)}</div>
          <div class="pin-display" style="font-size:2.2rem; color:var(--saam-red-light); margin:6px 0;">${pct1}%</div>
          <div class="muted" style="font-size:0.85rem;">${count1} tripulantes ${correctIdx === 1 ? '🌟 (Correcta)' : ''}</div>
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

    const perfectPct = responses.length ? Math.round((correctCount / responses.length) * 100) : 0;

    el.innerHTML = `
      <div class="p-16" style="background:rgba(255,255,255,0.04); border-radius:var(--radius-md); border:1px solid rgba(255,255,255,0.08);">
        <div class="flex-between wrap gap-8 mb-16">
          <span class="badge badge-ended" style="font-size:0.85rem;">
            ⚓ Secuencia Canónica de la Maniobra
          </span>
          <span style="font-weight:700; color:var(--color-gold);">
            ${correctCount} de ${responses.length} maniobras perfectas (${perfectPct}%)
          </span>
        </div>
        <div class="sequence-list">
          ${correctOrder.map((optIdx, stepNum) => `
            <div class="sequence-item" style="border-left: 4px solid var(--color-gold);">
              <span class="sequence-num">${stepNum + 1}</span>
              <span style="font-weight:600; color:#ffffff;">${escapeHtml((q.options && q.options[optIdx]) || optIdx)}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
}

/**
 * Renderiza la sección de Priorización de Funcionalidades (Pestaña 2)
 */
function renderDiscoveryPollChoices() {
  const container = qs('#discoveryPollChoiceResults');
  if (!container) return;

  const pollChoiceQ = dQuestions.filter(q => q.type === 'poll_choice' || q.type === 'survey');
  if (!pollChoiceQ.length) {
    container.innerHTML = `<p class="muted p-16 text-center">No hay preguntas de priorización de funcionalidades en esta sesión.</p>`;
    return;
  }

  container.innerHTML = pollChoiceQ.map((q, qIdx) => {
    const responses = dResponsesByQuestion[q.id] || [];
    const options = q.options || [];
    const counts = options.map((_, i) => responses.filter(r => r.answer && Number(r.answer.optionIndex) === i).length);
    const totalVotes = Math.max(1, responses.length);

    // Clasificar opciones por votos descendente
    const ranked = options.map((opt, i) => ({
      text: opt,
      votes: counts[i] || 0,
      pct: Math.round(((counts[i] || 0) / totalVotes) * 100)
    })).sort((a, b) => b.votes - a.votes);

    return `
      <div class="dash-q-card mb-24">
        <div class="flex-between wrap gap-8 mb-12">
          <h3 style="margin:0; font-size:1.1rem; color:#FFF2A1;">${qIdx + 1}. ${escapeHtml(q.question_text)}</h3>
          <span class="badge badge-lobby">${responses.length} votos totales</span>
        </div>

        <div class="panel-grid cols-2" style="align-items:center; gap:20px;">
          <div>
            <canvas id="pollChoiceCanvas-${qIdx}" height="220"></canvas>
          </div>
          <div class="feature-rank-list">
            ${ranked.map((item, rankIdx) => `
              <div class="feature-rank-item">
                <div class="feature-rank-progress" style="width:${item.pct}%;"></div>
                <div class="feature-rank-content">
                  <div class="flex gap-8" style="align-items:center;">
                    <span style="font-weight:800; color:var(--color-gold); font-family:var(--font-title); font-size:1.1rem;">
                      #${rankIdx + 1}
                    </span>
                    <span style="font-weight:600; color:#ffffff;">${escapeHtml(item.text)}</span>
                  </div>
                  <div style="font-weight:800; color:var(--color-gold); white-space:nowrap;">
                    ${item.pct}% <span class="muted" style="font-size:0.75rem; font-weight:400;">(${item.votes} votos)</span>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }).join('');

  pollChoiceQ.forEach((q, qIdx) => {
    const responses = dResponsesByQuestion[q.id] || [];
    const options = q.options || [];
    const counts = options.map((_, i) => responses.filter(r => r.answer && Number(r.answer.optionIndex) === i).length);
    const totalVotes = Math.max(1, responses.length);
    const percentages = counts.map(c => Math.round((c / totalVotes) * 100));

    const ctx = qs(`#pollChoiceCanvas-${qIdx}`)?.getContext('2d');
    if (ctx) {
      const chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: options,
          datasets: [{
            label: '% Preferencia',
            data: percentages,
            backgroundColor: '#3498DB',
            borderRadius: 6
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
            x: { ticks: { color: '#ffffff', font: { size: 11 } }, grid: { display: false } },
            y: { beginAtZero: true, max: 100, ticks: { color: '#ffffff', callback: v => v + '%' }, grid: { color: 'rgba(255,255,255,0.08)' } }
          }
        }
      });
      dCharts.push(chart);
    }
  });
}

/**
 * Renderiza la sección de Valoración de Pantallas y Ergonomía (1 a 10)
 */
function renderDiscoveryPollRatings() {
  const container = qs('#discoveryPollRatingResults');
  if (!container) return;

  const ratingQ = dQuestions.filter(q => q.type === 'poll_rating' || q.type === 'scale');
  if (!ratingQ.length) {
    container.innerHTML = `<p class="muted p-16 text-center">No hay preguntas de valoración 1-10 en esta sesión.</p>`;
    return;
  }

  container.innerHTML = ratingQ.map((q, qIdx) => {
    const responses = dResponsesByQuestion[q.id] || [];
    const values = responses.map(r => {
      if (!r.answer) return null;
      if (typeof r.answer === 'number') return r.answer;
      if (typeof r.answer.value === 'number') return r.answer.value;
      if (typeof r.answer.rating === 'number') return r.answer.rating;
      return null;
    }).filter(v => typeof v === 'number' && v >= 1 && v <= 10);

    const avg = values.length ? (values.reduce((a, b) => a + b, 0) / values.length) : 0;
    const roundedAvg = Math.round(avg);

    let qualitativeStatus = 'Sin datos';
    let statusColor = '#ffffff';
    if (values.length > 0) {
      if (avg >= 8.5) { qualitativeStatus = '🌟 Excelente Aprobación'; statusColor = '#2ECC71'; }
      else if (avg >= 7.0) { qualitativeStatus = '🙂 Buena Aceptación'; statusColor = '#3498DB'; }
      else if (avg >= 5.0) { qualitativeStatus = '😐 Aceptación Neutra'; statusColor = '#F39C12'; }
      else { qualitativeStatus = '⚠️ Requiere Rediseño'; statusColor = '#E74C3C'; }
    }

    return `
      <div class="dash-q-card mb-24">
        <div class="flex-between wrap gap-8 mb-12">
          <h3 style="margin:0; font-size:1.1rem; color:#FFF2A1;">${qIdx + 1}. ${escapeHtml(q.question_text)}</h3>
          <span class="badge badge-question">${values.length} evaluaciones</span>
        </div>

        <div class="ux-eval-grid mt-16">
          <div class="ux-gauge-box">
            <div class="ux-gauge-emoji">${scaleEmoji(roundedAvg)}</div>
            <div class="ux-gauge-num">${avg.toFixed(1)} <span style="font-size:1.4rem; color:rgba(255,255,255,0.6);">/ 10</span></div>
            <div style="font-weight:700; color:${statusColor}; margin-top:8px; font-size:0.95rem;">${qualitativeStatus}</div>
            <div class="muted" style="font-size:0.8rem; margin-top:4px;">Basado en ${values.length} calificaciones de tripulantes</div>
          </div>

          <div style="display:flex; flex-direction:column; justify-content:center;">
            <div class="eyebrow" style="margin-bottom:8px;">Distribución de Notas (1 a 10★)</div>
            <canvas id="ratingCanvas-${qIdx}" height="180"></canvas>
          </div>
        </div>
      </div>
    `;
  }).join('');

  ratingQ.forEach((q, qIdx) => {
    const responses = dResponsesByQuestion[q.id] || [];
    const values = responses.map(r => {
      if (!r.answer) return null;
      if (typeof r.answer === 'number') return r.answer;
      if (typeof r.answer.value === 'number') return r.answer.value;
      if (typeof r.answer.rating === 'number') return r.answer.rating;
      return null;
    }).filter(v => typeof v === 'number' && v >= 1 && v <= 10);

    const dist = Array.from({ length: 10 }, (_, i) => values.filter(v => v === i + 1).length);

    const ctx = qs(`#ratingCanvas-${qIdx}`)?.getContext('2d');
    if (ctx) {
      const chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: Array.from({ length: 10 }, (_, i) => `${i + 1}★`),
          datasets: [{
            data: dist,
            backgroundColor: '#D4A843',
            borderRadius: 4
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
      dCharts.push(chart);
    }
  });
}

/**
 * Renderiza el Muro de Sugerencias y Feedback Abierto con tarjetas interactivas
 */
function renderDiscoveryFeedbackWall() {
  const wall = qs('#discoveryFeedbackWall');
  if (!wall) return;

  const textQ = dQuestions.filter(q => q.type === 'poll_text' || q.type === 'text');
  if (!textQ.length) {
    wall.innerHTML = `<p class="muted p-16 text-center">No hay preguntas de sugerencias o texto libre en esta sesión.</p>`;
    return;
  }

  const allFeedbacks = [];
  const wordFreq = {};

  textQ.forEach(q => {
    const responses = dResponsesByQuestion[q.id] || [];
    responses.forEach(r => {
      let text = '';
      if (r.answer) {
        if (typeof r.answer === 'string') text = r.answer;
        else if (r.answer.text) text = r.answer.text;
        else if (r.answer.value) text = String(r.answer.value);
      }
      text = (text || '').trim();
      if (!text) return;

      const player = dPlayers.find(p => p.id === r.player_id);
      allFeedbacks.push({
        questionText: q.question_text,
        text,
        playerName: player ? player.name : (r.player_name || 'Tripulante anónimo'),
        playerAvatar: player ? (player.avatar || 'tug') : 'tug',
        playerShip: player ? ((typeof shipTitle === 'function') ? shipTitle(player) : player.avatar) : 'Remolcador',
        createdAt: r.created_at || dSession.created_at
      });

      // Extraer palabras significativas (> 3 letras)
      const words = text.toLowerCase().replace(/[^a-záéíóúñ0-9]/gi, ' ').split(/\s+/);
      words.forEach(w => {
        if (w.length > 3 && !['para', 'como', 'pero', 'este', 'esta', 'todo', 'toda', 'unos', 'unas', 'sobre', 'desde', 'hacer'].includes(w)) {
          wordFreq[w] = (wordFreq[w] || 0) + 1;
        }
      });
    });
  });

  if (allFeedbacks.length === 0) {
    wall.innerHTML = `<p class="muted p-16 text-center">Aún no se han recibido sugerencias de la tripulación en esta sesión.</p>`;
    return;
  }

  // Renderizar palabras clave si hay frecuencias
  const keywordsContainer = qs('#discoveryKeywordsContainer');
  const keywordsList = qs('#discoveryKeywordsList');
  const topWords = Object.entries(wordFreq).sort((a, b) => b[1] - a[1]).slice(0, 10);

  if (topWords.length > 0 && keywordsContainer && keywordsList) {
    keywordsContainer.classList.remove('hidden');
    keywordsList.innerHTML = topWords.map(([word, count]) => `
      <span class="badge badge-lobby" style="font-size:0.8rem; text-transform:none;">
        <strong>#${escapeHtml(word)}</strong> <span class="muted">(${count})</span>
      </span>
    `).join('');
  }

  wall.innerHTML = allFeedbacks.map(item => `
    <div class="feedback-card">
      <div class="feedback-body">
        "${escapeHtml(item.text)}"
      </div>
      <div class="feedback-author">
        <div class="feedback-avatar">
          ${(typeof shipAvatarSVG === 'function') ? shipAvatarSVG(item.playerAvatar) : '🚢'}
        </div>
        <div style="overflow:hidden;">
          <div class="feedback-author-name">${escapeHtml(item.playerName)}</div>
          <div class="feedback-author-role">${escapeHtml(item.playerShip)}</div>
        </div>
      </div>
    </div>
  `).join('');
}

/**
 * Filtra las tarjetas de feedback según el término ingresado
 * @param {string} term
 */
function filterFeedbackCards(term) {
  const q = (term || '').trim().toLowerCase();
  const cards = qsa('.feedback-card');
  cards.forEach(card => {
    const text = card.textContent.toLowerCase();
    if (!q || text.includes(q)) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
}

/**
 * Destruye todas las instancias activas de Chart.js para evitar fugas de memoria
 */
function destroyAllCharts() {
  dCharts.forEach(c => {
    try { c.destroy(); } catch (e) {}
  });
  dCharts = [];
}

/**
 * Exporta el reporte general con todas las respuestas, aciertos y puntos en CSV (UTF-8 BOM)
 */
function exportGeneralCSV() {
  if (!dSession) {
    alert('Por favor selecciona una sesión antes de exportar.');
    return;
  }

  const rows = [
    ['PIN Sesión', 'Título Sesión', 'Tripulante', 'Avatar Buque', 'Posición', 'Tipo Pregunta', 'Pregunta', 'Respuesta Seleccionada', '¿Es Correcta?', 'Puntos Obtenidos', 'Tiempo Restante (s)']
  ];

  dQuestions.forEach(q => {
    const responses = dResponsesByQuestion[q.id] || [];
    responses.forEach(r => {
      const player = dPlayers.find(p => p.id === r.player_id);
      let answerText = '';
      let timeRemaining = (r.answer && r.answer.timeRemaining != null) ? r.answer.timeRemaining : '';

      const normalizedType = (q.type || 'multiple_choice').toLowerCase();

      if (normalizedType === 'multiple_choice' || normalizedType === 'quiz' || normalizedType === 'poll_choice' || normalizedType === 'survey') {
        const optIdx = r.answer ? (r.answer.optionIndex != null ? r.answer.optionIndex : r.answer) : null;
        answerText = (q.options && optIdx != null && q.options[optIdx] != null) ? q.options[optIdx] : (r.answer && r.answer.optionText ? r.answer.optionText : '');
      } else if (normalizedType === 'true_false') {
        const optIdx = r.answer ? (r.answer.optionIndex != null ? r.answer.optionIndex : r.answer) : null;
        answerText = optIdx === 0 ? 'Verdadero / Seguro' : 'Falso / Riesgo';
      } else if (normalizedType === 'sequence') {
        const order = r.answer ? (Array.isArray(r.answer) ? r.answer : (r.answer.order || [])) : [];
        answerText = order.map((idx, step) => `${step + 1}. ${(q.options && q.options[idx]) || idx}`).join(' -> ');
      } else if (normalizedType === 'poll_rating' || normalizedType === 'scale') {
        answerText = r.answer ? (r.answer.value != null ? r.answer.value : r.answer) : '';
      } else {
        answerText = r.answer ? (r.answer.text != null ? r.answer.text : (r.answer.value != null ? r.answer.value : r.answer)) : '';
      }

      rows.push([
        dSession.pin,
        dSession.title,
        player ? player.name : (r.player_name || 'Desconocido'),
        player ? player.avatar : 'tug',
        q.position != null ? q.position : '',
        (window.Mechanics && Mechanics.getQuestionTypeLabel) ? Mechanics.getQuestionTypeLabel(q.type) : q.type,
        q.question_text,
        answerText,
        r.is_correct === null ? 'N/A (Sondeo)' : (r.is_correct ? 'Correcto' : 'Incorrecto'),
        r.points || 0,
        timeRemaining
      ]);
    });
  });

  const filename = `marejada_reporte_general_pin_${dSession.pin}.csv`;
  downloadUTF8CSV(filename, rows);
}

/**
 * Exporta el reporte especializado de Product Discovery con respuestas y feedback en CSV (UTF-8 BOM)
 */
function exportDiscoveryCSV() {
  if (!dSession) {
    alert('Por favor selecciona una sesión antes de exportar.');
    return;
  }

  const discoveryQ = dQuestions.filter(q => isDiscoveryQuestion(q));
  if (!discoveryQ.length) {
    alert('Esta sesión no contiene preguntas de Product Discovery para exportar.');
    return;
  }

  const rows = [
    ['PIN Sesión', 'Título Sesión', 'Módulo / Pregunta', 'Tipo de Sondeo', 'Tripulante', 'Avatar Buque', 'Respuesta / Voto / Valoración', 'Valor Numérico (1-10)', 'Comentario / Feedback']
  ];

  discoveryQ.forEach(q => {
    const responses = dResponsesByQuestion[q.id] || [];
    responses.forEach(r => {
      const player = dPlayers.find(p => p.id === r.player_id);
      let responseText = '';
      let numRating = '';
      let commentText = '';

      const normalizedType = (q.type || '').toLowerCase();

      if (normalizedType === 'poll_choice' || normalizedType === 'survey') {
        const optIdx = r.answer ? (r.answer.optionIndex != null ? r.answer.optionIndex : r.answer) : null;
        responseText = (q.options && optIdx != null && q.options[optIdx] != null) ? q.options[optIdx] : (r.answer && r.answer.optionText ? r.answer.optionText : '');
      } else if (normalizedType === 'poll_rating' || normalizedType === 'scale') {
        const val = r.answer ? (r.answer.value != null ? r.answer.value : (r.answer.rating != null ? r.answer.rating : r.answer)) : null;
        numRating = val != null ? String(val) : '';
        responseText = `${numRating} / 10`;
      } else if (normalizedType === 'poll_text' || normalizedType === 'text') {
        commentText = r.answer ? (r.answer.text != null ? r.answer.text : (r.answer.value != null ? r.answer.value : String(r.answer))) : '';
        responseText = commentText;
      }

      rows.push([
        dSession.pin,
        dSession.title,
        q.question_text,
        (window.Mechanics && Mechanics.getQuestionTypeLabel) ? Mechanics.getQuestionTypeLabel(q.type) : q.type,
        player ? player.name : (r.player_name || 'Anónimo'),
        player ? player.avatar : 'tug',
        responseText,
        numRating,
        commentText
      ]);
    });
  });

  const filename = `marejada_discovery_insights_pin_${dSession.pin}.csv`;
  downloadUTF8CSV(filename, rows);
}

/**
 * Función robusta para descargar archivos CSV con UTF-8 BOM (\uFEFF) para compatibilidad con Microsoft Excel
 * @param {string} filename
 * @param {Array<Array>} rows
 */
function downloadUTF8CSV(filename, rows) {
  const csv = rows.map(r => r.map(cell => {
    const s = String(cell ?? '');
    if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  }).join(',')).join('\r\n');

  // \uFEFF es el BOM de UTF-8
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Prepara e invoca la impresión del dashboard
 */
function printDashboard() {
  window.print();
}
