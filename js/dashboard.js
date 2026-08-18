// Lógica del Dashboard de Resultados

let dCharts = [];
let dSession = null;
let dQuestions = [];
let dPlayers = [];
let dResponsesByQuestion = {};

document.addEventListener('DOMContentLoaded', () => {
  injectOceanBg();
  qs('#brandIcon').innerHTML = ICONS.wheel;
  loadSessions();
  qs('#sessionSelect').addEventListener('change', (e) => {
    if (e.target.value) loadSessionResults(e.target.value);
    else qs('#dashboardContent').classList.add('hidden');
  });
  qs('#btnExportCsv').addEventListener('click', exportCsv);
});

async function loadSessions() {
  const { data } = await sb.from('sessions').select('*').order('created_at', { ascending: false });
  const select = qs('#sessionSelect');
  if (!data || data.length === 0) {
    select.innerHTML = `<option value="">No hay sesiones creadas todavía</option>`;
    return;
  }
  select.innerHTML = `<option value="">Selecciona una sesión...</option>` + data.map(s =>
    `<option value="${s.id}">${escapeHtml(s.title)} — PIN ${s.pin} (${STATUS_LABELS[s.status]})</option>`
  ).join('');
}

async function loadSessionResults(sessionId) {
  const { data: session } = await sb.from('sessions').select('*').eq('id', sessionId).single();
  const { data: questions } = await sb.from('questions').select('*').eq('session_id', sessionId).order('position');
  const { data: players } = await sb.from('players').select('*').eq('session_id', sessionId).order('score', { ascending: false });

  dSession = session;
  dQuestions = questions || [];
  dPlayers = players || [];
  dResponsesByQuestion = {};

  for (const q of dQuestions) {
    const { data: responses } = await sb.from('responses').select('*').eq('question_id', q.id);
    dResponsesByQuestion[q.id] = responses || [];
  }

  renderSummary();
  renderLeaderboard();
  renderQuestions();
  qs('#dashboardContent').classList.remove('hidden');
}

function renderSummary() {
  qs('#statQuestions').textContent = dQuestions.length;
  qs('#statPlayers').textContent = dPlayers.length;

  const quizResponses = dQuestions.filter(q => q.type === 'quiz')
    .flatMap(q => dResponsesByQuestion[q.id] || []);
  const correctCount = quizResponses.filter(r => r.is_correct).length;
  const accuracy = quizResponses.length ? Math.round((correctCount / quizResponses.length) * 100) : 0;
  qs('#statAccuracy').textContent = accuracy + '%';
}

function renderLeaderboard() {
  const el = qs('#dashLeaderboard');
  if (!dPlayers.length) { el.innerHTML = `<p class="muted">Sin jugadores.</p>`; return; }
  const maxScore = Math.max(...dPlayers.map(p => p.score), 1);
  el.innerHTML = dPlayers.map((p, i) => {
    const pct = 4 + (p.score / maxScore) * 88;
    const laneClass = i === 0 ? 'lane-1' : i === 1 ? 'lane-2' : i === 2 ? 'lane-3' : '';
    return `
      <div class="regatta-lane ${laneClass}">
        <div class="regatta-label"><span class="regatta-rank">${i + 1}</span> ${escapeHtml(p.name)} · ${p.score} pts</div>
        <div class="regatta-track-wrap">
          <div class="regatta-track"></div>
          <div class="regatta-ship" style="left:${pct}%;">${shipAvatarSVG(p.avatar || 'tug')}</div>
        </div>
      </div>
    `;
  }).join('');

  const fleetCounts = {};
  dPlayers.forEach(p => { const a = p.avatar || 'tug'; fleetCounts[a] = (fleetCounts[a] || 0) + 1; });
  qs('#fleetComposition').innerHTML = Object.keys(SHIP_AVATARS).map(key => `
    <div class="text-center" style="min-width:80px;">
      <div class="ship-avatar-wrap" style="width:56px; margin:0 auto;">${shipAvatarSVG(key)}</div>
      <div class="muted" style="font-size:0.75rem; margin-top:4px;">${SHIP_AVATARS[key].label}</div>
      <div style="font-weight:700; color:var(--color-gold);">${fleetCounts[key] || 0}</div>
    </div>
  `).join('');
}

function renderQuestions() {
  dCharts.forEach(c => c.destroy());
  dCharts = [];
  const container = qs('#questionsResults');

  if (!dQuestions.length) { container.innerHTML = `<p class="muted">Esta sesión no tiene preguntas.</p>`; return; }

  container.innerHTML = dQuestions.map((q, idx) => `
    <div class="card mt-16">
      <div class="flex gap-8" style="align-items:center;">${typeTag(q.type)}<h3 style="margin:0;">${idx + 1}. ${escapeHtml(q.question_text)}</h3></div>
      <div id="qResult-${idx}" class="mt-16"></div>
    </div>
  `).join('');

  dQuestions.forEach((q, idx) => renderQuestionResult(q, idx));
}

function renderQuestionResult(q, idx) {
  const el = qs(`#qResult-${idx}`);
  const responses = dResponsesByQuestion[q.id] || [];

  if (q.type === 'quiz' || q.type === 'survey') {
    el.innerHTML = `<canvas id="canvas-${idx}" height="220"></canvas>`;
    const counts = (q.options || []).map((_, i) => responses.filter(r => r.answer && r.answer.optionIndex === i).length);
    const colors = ['#E74C3C', '#3498DB', '#2ECC71', '#F39C12'];
    const chart = new Chart(qs(`#canvas-${idx}`).getContext('2d'), {
      type: 'bar',
      data: { labels: q.options, datasets: [{ data: counts, backgroundColor: q.options.map((_, i) => colors[i]) }] },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#fff' }, grid: { color: 'rgba(255,255,255,0.1)' } },
          y: { beginAtZero: true, ticks: { color: '#fff', stepSize: 1 }, grid: { color: 'rgba(255,255,255,0.1)' } }
        }
      }
    });
    dCharts.push(chart);
    if (q.type === 'quiz' && q.correct_option != null && q.options[q.correct_option] != null) {
      el.innerHTML += `<p class="mt-16 muted">Correcta: <strong style="color:var(--color-gold)">${OPTION_LABELS[q.correct_option]}. ${escapeHtml(q.options[q.correct_option])}</strong> · ${responses.filter(r=>r.is_correct).length}/${responses.length} aciertos</p>`;
    }
  } else if (q.type === 'scale') {
    const values = responses.map(r => r.answer && r.answer.value).filter(v => typeof v === 'number');
    const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    const dist = Array.from({ length: 10 }, (_, i) => values.filter(v => v === i + 1).length);
    el.innerHTML = `
      <div class="text-center mb-16">
        <span style="font-size:2.2rem;">${scaleEmoji(Math.round(avg))}</span>
        <span class="pin-display" style="font-size:1.8rem;"> ${avg.toFixed(1)}</span>
        <div class="muted">Promedio de ${values.length} respuestas</div>
      </div>
      <canvas id="canvas-${idx}" height="200"></canvas>`;
    const chart = new Chart(qs(`#canvas-${idx}`).getContext('2d'), {
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
    dCharts.push(chart);
  } else {
    const texts = responses.map(r => (r.answer && r.answer.text) || '').filter(Boolean);
    if (!texts.length) { el.innerHTML = `<p class="muted">Sin respuestas.</p>`; return; }
    const freq = {};
    texts.forEach(t => { const key = t.trim(); freq[key] = (freq[key] || 0) + 1; });
    const listHtml = Object.entries(freq).sort((a, b) => b[1] - a[1]).map(([text, count]) => `
      <div class="question-row-item flex-between">
        <span>${escapeHtml(text)}</span>
        <span class="type-tag">${count}×</span>
      </div>
    `).join('');
    el.innerHTML = `
      <div class="panel-grid cols-2">
        <div>${listHtml}</div>
        <div><canvas id="wc-${idx}" width="400" height="260" style="max-width:100%;"></canvas></div>
      </div>`;
    try {
      const list = Object.entries(freq).map(([text, count]) => [text, 10 + count * 8]);
      WordCloud(qs(`#wc-${idx}`), { list, gridSize: 8, weightFactor: 1, color: () => ['#D4A843', '#3498DB', '#2ECC71', '#F39C12', '#E74C3C'][Math.floor(Math.random() * 5)], backgroundColor: 'transparent', rotateRatio: 0.2 });
    } catch (e) { /* wordcloud opcional */ }
  }
}

function exportCsv() {
  if (!dSession) return;
  const rows = [['Sesión', 'Jugador', 'Pregunta', 'Tipo', 'Respuesta', 'Correcta', 'Puntos']];
  dQuestions.forEach(q => {
    const responses = dResponsesByQuestion[q.id] || [];
    responses.forEach(r => {
      const player = dPlayers.find(p => p.id === r.player_id);
      let answerText = '';
      if (q.type === 'quiz' || q.type === 'survey') answerText = q.options[r.answer.optionIndex] ?? '';
      else if (q.type === 'scale') answerText = r.answer.value;
      else answerText = r.answer.text;
      rows.push([
        dSession.title, player ? player.name : r.player_id, q.question_text, TYPE_LABELS[q.type],
        answerText, r.is_correct === null ? '' : (r.is_correct ? 'Sí' : 'No'), r.points
      ]);
    });
  });
  downloadCSV(`resultados_${dSession.pin}.csv`, rows);
}
