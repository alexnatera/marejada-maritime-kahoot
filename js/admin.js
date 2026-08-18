// Lógica del panel de administración

let currentSessionId = null;
let currentQuestions = [];

document.addEventListener('DOMContentLoaded', () => {
  injectOceanBg();
  qs('#brandIcon').innerHTML = tugLogoSVG();
  renderOptionInputs('quiz');
  loadSessions();

  qs('#btnCreateSession').addEventListener('click', createSession);
  qs('#btnCloseEditor').addEventListener('click', closeEditor);
  qs('#btnAddQuestion').addEventListener('click', addQuestion);
  qs('#qType').addEventListener('change', (e) => renderOptionInputs(e.target.value));
});

async function loadSessions() {
  const { data, error } = await sb.from('sessions').select('*').order('created_at', { ascending: false });
  const container = qs('#sessionsList');
  if (error) { container.innerHTML = `<p class="muted">Error cargando sesiones.</p>`; return; }
  if (!data || data.length === 0) { container.innerHTML = `<p class="muted">No hay sesiones todavía. Crea la primera.</p>`; return; }

  container.innerHTML = data.map(s => `
    <div class="session-card">
      <div class="flex-between wrap gap-12">
        <div>
          <div class="flex gap-8" style="align-items:center;">
            <strong>${escapeHtml(s.title)}</strong> ${statusBadge(s.status)}
          </div>
          <div class="muted mt-8">PIN: <strong style="color:var(--color-gold)">${s.pin}</strong> · ${formatDate(s.created_at)}</div>
        </div>
        <div class="flex gap-8 wrap">
          <button class="btn-secondary" data-action="edit" data-id="${s.id}">Editar preguntas</button>
          <button class="btn-secondary btn-icon" data-action="duplicate" data-id="${s.id}" title="Duplicar">${ICONS.copy}</button>
          <button class="btn-danger btn-icon" data-action="delete" data-id="${s.id}" title="Eliminar">${ICONS.trash}</button>
        </div>
      </div>
    </div>
  `).join('');

  qsa('[data-action="edit"]', container).forEach(btn => btn.addEventListener('click', () => openEditor(btn.dataset.id)));
  qsa('[data-action="duplicate"]', container).forEach(btn => btn.addEventListener('click', () => duplicateSession(btn.dataset.id)));
  qsa('[data-action="delete"]', container).forEach(btn => btn.addEventListener('click', () => deleteSession(btn.dataset.id)));
}

async function createSession() {
  const title = qs('#newSessionTitle').value.trim();
  if (!title) { alert('Escribe un título para la sesión.'); return; }
  const pin = await generateUniquePin();
  const { data, error } = await sb.from('sessions').insert({ title, pin, status: 'draft' }).select().single();
  if (error) { alert('Error creando la sesión: ' + error.message); return; }
  qs('#newSessionTitle').value = '';
  await loadSessions();
  openEditor(data.id);
}

async function duplicateSession(id) {
  const { data: original } = await sb.from('sessions').select('*').eq('id', id).single();
  const { data: questions } = await sb.from('questions').select('*').eq('session_id', id).order('position');
  const pin = await generateUniquePin();
  const { data: newSession, error } = await sb.from('sessions').insert({
    title: original.title + ' (copia)', pin, status: 'draft'
  }).select().single();
  if (error) { alert('Error duplicando: ' + error.message); return; }
  if (questions && questions.length) {
    const inserts = questions.map(q => ({
      session_id: newSession.id, type: q.type, question_text: q.question_text,
      options: q.options, time_limit: q.time_limit, correct_option: q.correct_option, position: q.position
    }));
    await sb.from('questions').insert(inserts);
  }
  await loadSessions();
}

async function deleteSession(id) {
  if (!confirm('¿Eliminar esta sesión y todas sus preguntas/respuestas? Esta acción no se puede deshacer.')) return;
  const { error } = await sb.from('sessions').delete().eq('id', id);
  if (error) { alert('Error eliminando: ' + error.message); return; }
  if (currentSessionId === id) closeEditor();
  await loadSessions();
}

async function openEditor(id) {
  const { data: session } = await sb.from('sessions').select('*').eq('id', id).single();
  if (!session) return;
  currentSessionId = id;
  qs('#editorPanel').classList.remove('hidden');
  qs('#editorPin').textContent = `PIN ${session.pin} · ${STATUS_LABELS[session.status]}`;
  qs('#editorTitle').textContent = session.title;
  qs('#editorPanel').scrollIntoView({ behavior: 'smooth' });
  await loadQuestions();
}

function closeEditor() {
  currentSessionId = null;
  qs('#editorPanel').classList.add('hidden');
}

async function loadQuestions() {
  const { data, error } = await sb.from('questions').select('*').eq('session_id', currentSessionId).order('position');
  currentQuestions = data || [];
  renderQuestionsList();
}

function renderQuestionsList() {
  const container = qs('#questionsList');
  if (!currentQuestions.length) { container.innerHTML = `<p class="muted">Sin preguntas aún.</p>`; return; }
  container.innerHTML = currentQuestions.map((q, idx) => `
    <div class="question-row-item">
      <div style="flex:1;">
        <div class="flex gap-8" style="align-items:center;">
          ${typeTag(q.type)} <strong>${idx + 1}.</strong> ${escapeHtml(q.question_text)}
        </div>
        <div class="muted" style="font-size:0.8rem; margin-top:4px;">${q.time_limit}s ${q.options && q.options.length ? '· ' + q.options.length + ' opciones' : ''}</div>
      </div>
      <button class="btn-secondary btn-icon" data-action="up" data-id="${q.id}" ${idx === 0 ? 'disabled' : ''}>${ICONS.arrowUp}</button>
      <button class="btn-secondary btn-icon" data-action="down" data-id="${q.id}" ${idx === currentQuestions.length - 1 ? 'disabled' : ''}>${ICONS.arrowDown}</button>
      <button class="btn-danger btn-icon" data-action="del" data-id="${q.id}">${ICONS.trash}</button>
    </div>
  `).join('');

  qsa('[data-action="up"]', container).forEach(b => b.addEventListener('click', () => moveQuestion(b.dataset.id, -1)));
  qsa('[data-action="down"]', container).forEach(b => b.addEventListener('click', () => moveQuestion(b.dataset.id, 1)));
  qsa('[data-action="del"]', container).forEach(b => b.addEventListener('click', () => deleteQuestion(b.dataset.id)));
}

function renderOptionInputs(type) {
  const block = qs('#optionsBlock');
  const inputs = qs('#optionsInputs');
  if (type === 'quiz' || type === 'survey') {
    block.classList.remove('hidden');
    inputs.innerHTML = [0, 1, 2, 3].map(i => `
      <div class="flex gap-8 mt-8" style="align-items:center;">
        ${type === 'quiz' ? `<input type="radio" name="correctOpt" value="${i}" style="width:auto;" ${i === 0 ? 'checked' : ''}>` : ''}
        <input type="text" class="opt-input" data-idx="${i}" placeholder="Opción ${OPTION_LABELS[i]}${i < 2 ? ' (requerida)' : ' (opcional)'}">
      </div>
    `).join('');
  } else {
    block.classList.add('hidden');
    inputs.innerHTML = '';
  }
}

async function addQuestion() {
  if (!currentSessionId) return;
  const type = qs('#qType').value;
  const text = qs('#qText').value.trim();
  const timeLimit = parseInt(qs('#qTime').value, 10);
  if (!text) { alert('Escribe el texto de la pregunta.'); return; }

  let options = [];
  let correctOption = null;

  if (type === 'quiz' || type === 'survey') {
    const optionInputs = qsa('.opt-input');
    options = optionInputs.map(i => i.value.trim()).filter(v => v.length > 0);
    if (options.length < 2) { alert('Agrega al menos 2 opciones.'); return; }
    if (type === 'quiz') {
      const checked = qs('input[name="correctOpt"]:checked');
      correctOption = checked ? parseInt(checked.value, 10) : 0;
      if (correctOption >= options.length) correctOption = 0;
    }
  }

  const position = currentQuestions.length;
  const { error } = await sb.from('questions').insert({
    session_id: currentSessionId, type, question_text: text, options,
    time_limit: timeLimit, correct_option: correctOption, position
  });
  if (error) { alert('Error agregando pregunta: ' + error.message); return; }

  qs('#qText').value = '';
  renderOptionInputs(type);
  await loadQuestions();
}

async function deleteQuestion(id) {
  if (!confirm('¿Eliminar esta pregunta?')) return;
  await sb.from('questions').delete().eq('id', id);
  await loadQuestions();
  await renumberPositions();
}

async function moveQuestion(id, dir) {
  const idx = currentQuestions.findIndex(q => q.id === id);
  const swapIdx = idx + dir;
  if (swapIdx < 0 || swapIdx >= currentQuestions.length) return;
  const a = currentQuestions[idx];
  const b = currentQuestions[swapIdx];
  await sb.from('questions').update({ position: b.position }).eq('id', a.id);
  await sb.from('questions').update({ position: a.position }).eq('id', b.id);
  await loadQuestions();
}

async function renumberPositions() {
  const { data } = await sb.from('questions').select('*').eq('session_id', currentSessionId).order('position');
  if (!data) return;
  for (let i = 0; i < data.length; i++) {
    if (data[i].position !== i) {
      await sb.from('questions').update({ position: i }).eq('id', data[i].id);
    }
  }
  await loadQuestions();
}
