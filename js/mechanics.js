// js/mechanics.js
// Motor de Mecánicas, Rachas y Formatos de Pregunta — Marejada 2.0
(function (root, factory) {
  const m = factory();
  if (typeof root !== 'undefined') root.Mechanics = m;
  if (typeof window !== 'undefined') window.Mechanics = m;
  if (typeof module === 'object' && module.exports) {
    module.exports = m;
  }
})(typeof self !== 'undefined' ? self : (typeof globalThis !== 'undefined' ? globalThis : this), function () {
  'use strict';

  // Constantes de Tipos de Pregunta
  const QUESTION_TYPES = {
    MULTIPLE_CHOICE: 'multiple_choice',
    TRUE_FALSE: 'true_false',
    SEQUENCE: 'sequence',
    HAZARD_HOTSPOT: 'hazard_hotspot',
    POLL_CHOICE: 'poll_choice',
    POLL_RATING: 'poll_rating',
    POLL_TEXT: 'poll_text',
    // Aliases heredados
    HOTSPOT: 'hotspot',
    QUIZ: 'quiz',
    SURVEY: 'survey',
    SCALE: 'scale',
    TEXT: 'text'
  };

  const TYPE_LABELS = {
    multiple_choice: 'Opción Múltiple',
    quiz: 'Opción Múltiple (Quiz)',
    true_false: 'Verdadero / Falso Náutico',
    sequence: 'Secuencia de Maniobra',
    hazard_hotspot: 'Peligros en Cubierta (Hotspot)',
    hotspot: 'Peligros en Cubierta (Hotspot)',
    poll_choice: 'Votación de Funcionalidades',
    survey: 'Encuesta',
    poll_rating: 'Valoración de Pantallas (1-10)',
    scale: 'Escala de Calificación',
    poll_text: 'Sugerencias y Feedback',
    text: 'Texto Libre'
  };

  const TYPE_ICONS = {
    multiple_choice: '⚓',
    quiz: '⚓',
    true_false: '🧭',
    sequence: '🔄',
    hazard_hotspot: '⚠️',
    hotspot: '⚠️',
    poll_choice: '📊',
    survey: '📊',
    poll_rating: '⭐',
    scale: '⭐',
    poll_text: '💬',
    text: '💬'
  };

  // Niveles de Racha náutica
  const STREAK_LEVELS = [
    {
      minStreak: 0,
      maxStreak: 1,
      level: 1,
      multiplier: 1.0,
      name: 'Normal',
      badge: '⚓ Rumbo Estable',
      icon: '⚓',
      bonusPercent: 0,
      description: 'Navegación estándar sin multiplicador',
      cssClass: 'streak-level-1',
      hapticPattern: [30]
    },
    {
      minStreak: 2,
      maxStreak: 2,
      level: 2,
      multiplier: 1.2,
      name: 'Vapor encendido',
      badge: '🔥 Vapor Encendido',
      icon: '🔥',
      bonusPercent: 20,
      description: '¡Calderas a presión! +20% de bonificación',
      cssClass: 'streak-level-2',
      hapticPattern: [40, 50]
    },
    {
      minStreak: 3,
      maxStreak: 3,
      level: 3,
      multiplier: 1.5,
      name: 'A Toda Máquina',
      badge: '⚡ A Toda Máquina',
      icon: '⚡',
      bonusPercent: 50,
      description: '¡Turbo activado! +50% de bonificación',
      cssClass: 'streak-level-3',
      hapticPattern: [40, 60, 40]
    },
    {
      minStreak: 4,
      maxStreak: Infinity,
      level: 4,
      multiplier: 2.0,
      name: 'Rompeolas',
      badge: '🌟 Rompeolas Supersónico',
      icon: '🌟',
      bonusPercent: 100,
      description: '¡Velocidad máxima insuperable! Doble puntaje x2.0',
      cssClass: 'streak-level-4',
      hapticPattern: [50, 50, 50, 50, 100]
    }
  ];

  /**
   * Obtiene la información y multiplicador de racha actual
   * @param {number} streak - Cantidad de respuestas correctas consecutivas
   * @returns {Object} Datos de la racha (multiplier, level, name, icon, badge, etc.)
   */
  function getStreakInfo(streak) {
    const s = Math.max(0, parseInt(streak, 10) || 0);
    const config = STREAK_LEVELS.find(lvl => s >= lvl.minStreak && s <= lvl.maxStreak) || STREAK_LEVELS[0];

    return {
      streak: s,
      level: config.level,
      multiplier: config.multiplier,
      name: config.name,
      badge: config.badge,
      icon: config.icon,
      bonusPercent: config.bonusPercent,
      description: config.description,
      cssClass: config.cssClass,
      hapticPattern: config.hapticPattern
    };
  }

  /**
   * Calcula el puntaje de una respuesta en base al tiempo restante, racha y marea alta
   * Fórmula: base = Math.round(500 + 500 * (timeRemaining / totalTime))
   * finalScore = Math.round(base * streakMultiplier * (isHighTide ? 2 : 1))
   * 
   * @param {number} timeRemaining - Segundos restantes en el temporizador
   * @param {number} totalTime - Tiempo total asignado a la pregunta
   * @param {number} [streak=0] - Racha de aciertos consecutivos
   * @param {boolean} [isHighTide=false] - Si la ronda tiene marea alta (doble puntaje)
   * @returns {number} Puntaje final redondeado
   */
  function calculateScore(timeRemaining, totalTime, streak = 0, isHighTide = false) {
    const total = typeof totalTime === 'number' ? totalTime : 20;
    const remaining = typeof timeRemaining === 'number' ? timeRemaining : 0;

    // Proporción de tiempo de respuesta (entre 0 y 1)
    const ratio = total > 0 ? Math.max(0, Math.min(1, remaining / total)) : 0;

    // Puntaje base: entre 500 (último segundo) y 1000 (instantáneo)
    const base = Math.round(500 + 500 * ratio);

    // Multiplicador de racha
    const streakInfo = getStreakInfo(streak);
    const streakMultiplier = streakInfo.multiplier;

    // Multiplicador de Marea Alta (High Tide)
    const tideMultiplier = isHighTide ? 2 : 1;

    return Math.round(base * streakMultiplier * tideMultiplier);
  }

  /**
   * Determina si un tipo de pregunta es de naturaleza de sondeo/encuesta (sin puntaje/evaluación)
   * @param {string} type - Tipo de pregunta
   * @returns {boolean}
   */
  function isPollType(type) {
    const normalized = (type || '').toLowerCase();
    return (
      normalized === QUESTION_TYPES.POLL_CHOICE ||
      normalized === QUESTION_TYPES.POLL_RATING ||
      normalized === QUESTION_TYPES.POLL_TEXT ||
      normalized === QUESTION_TYPES.SURVEY ||
      normalized === QUESTION_TYPES.SCALE ||
      normalized === QUESTION_TYPES.TEXT
    );
  }

  /**
   * Obtiene la etiqueta legible y el ícono de un tipo de pregunta
   * @param {string} type - Código del tipo de pregunta
   * @returns {string} Etiqueta en español
   */
  function getQuestionTypeLabel(type) {
    return TYPE_LABELS[type] || type || 'Pregunta';
  }

  /**
   * Obtiene el ícono representativo del tipo de pregunta
   * @param {string} type
   * @returns {string}
   */
  function getQuestionTypeIcon(type) {
    return TYPE_ICONS[type] || '⚓';
  }

  /**
   * Normaliza y estandariza un objeto de pregunta para garantizar estructura consistente
   * @param {Object} question - Objeto de pregunta crudo
   * @returns {Object} Pregunta normalizada
   */
  function formatQuestion(question) {
    if (!question || typeof question !== 'object') {
      return {
        id: null,
        type: QUESTION_TYPES.MULTIPLE_CHOICE,
        question_text: '',
        options: [],
        correct_index: 0,
        correct_order: null,
        time_limit: 20,
        is_high_tide: false,
        is_poll: false
      };
    }

    const type = question.type || QUESTION_TYPES.MULTIPLE_CHOICE;
    const isPoll = isPollType(type);
    const isHighTide = Boolean(question.is_high_tide || question.isHighTide);
    const timeLimit = typeof question.time_limit === 'number' ? question.time_limit : (typeof question.timeLimit === 'number' ? question.timeLimit : 20);

    let options = Array.isArray(question.options) ? [...question.options] : [];

    // Opciones por defecto para verdadero/falso si no están provistas
    if (type === QUESTION_TYPES.TRUE_FALSE && options.length === 0) {
      options = ['Verdadero', 'Falso'];
    }

    // Índice correcto unificado
    let correctIndex = null;
    if (question.correct_index !== undefined && question.correct_index !== null) {
      correctIndex = parseInt(question.correct_index, 10);
    } else if (question.correct_option !== undefined && question.correct_option !== null) {
      correctIndex = parseInt(question.correct_option, 10);
    }

    // Orden correcto para secuencias
    let correctOrder = null;
    if (Array.isArray(question.correct_order)) {
      correctOrder = question.correct_order.map(Number);
    } else if (Array.isArray(question.correct_sequence)) {
      correctOrder = question.correct_sequence.map(Number);
    } else if (type === QUESTION_TYPES.SEQUENCE && options.length > 0) {
      // Si no viene orden explícito, el orden por defecto es el índice canónico [0, 1, 2, ...]
      correctOrder = options.map((_, i) => i);
    }

    // Zonas de peligro para tipo hotspot
    let hazardZones = [];
    if (Array.isArray(question.hazard_zones)) {
      hazardZones = question.hazard_zones;
    } else if (Array.isArray(question.target_zones)) {
      hazardZones = question.target_zones;
    } else if (question.target_zone && typeof question.target_zone === 'object') {
      hazardZones = [question.target_zone];
    } else if (type === QUESTION_TYPES.HAZARD_HOTSPOT || type === 'hotspot') {
      hazardZones = [{ id: 'snap_back_zone', x: 50, y: 65, radius: 22, label: 'Zona de Latigazo (Snap-Back)', is_hazard: true }];
    }

    return {
      ...question,
      id: question.id || null,
      type,
      question_text: question.question_text || question.questionText || '',
      options,
      correct_index: correctIndex,
      correct_option: correctIndex, // Compatibilidad retroactiva
      correct_order: correctOrder,
      hazard_zones: hazardZones,
      target_zones: hazardZones,
      time_limit: timeLimit,
      is_high_tide: isHighTide,
      is_poll: isPoll
    };
  }

  /**
   * Valida la respuesta enviada por un usuario según el formato de pregunta
   * @param {Object} rawQuestion - Objeto de pregunta
   * @param {any} rawAnswer - Respuesta enviada por el usuario
   * @param {Object} [options={}] - Opciones adicionales ({ timeRemaining, streak, isHighTide })
   * @returns {Object} Resultado de validación ({ is_correct, points, streak, streakInfo, ... })
   */
  function validateAnswer(rawQuestion, rawAnswer, options = {}) {
    const q = formatQuestion(rawQuestion);
    const type = q.type;

    const timeRemaining = options.timeRemaining ?? (typeof rawAnswer === 'object' && rawAnswer !== null ? rawAnswer.timeRemaining : null) ?? 0;
    const totalTime = q.time_limit || options.totalTime || 20;
    const currentStreak = options.streak ?? (typeof rawAnswer === 'object' && rawAnswer !== null ? rawAnswer.streak : null) ?? 0;
    const isHighTide = q.is_high_tide || Boolean(options.isHighTide);

    // Tipos de Sondeo / Discovery (no tienen respuesta correcta ni puntaje)
    if (isPollType(type)) {
      return {
        is_correct: null,
        isCorrect: null,
        points: 0,
        streak: currentStreak,
        streakInfo: getStreakInfo(currentStreak),
        correctAnswer: null,
        timeRemaining,
        totalTime,
        isHighTide,
        type,
        answer: rawAnswer
      };
    }

    let isCorrect = false;
    let correctAnswer = null;

    if (type === QUESTION_TYPES.MULTIPLE_CHOICE || type === QUESTION_TYPES.QUIZ) {
      const optionIndex = (typeof rawAnswer === 'object' && rawAnswer !== null && rawAnswer.optionIndex !== undefined)
        ? rawAnswer.optionIndex
        : (typeof rawAnswer === 'number' ? rawAnswer : null);

      correctAnswer = q.correct_index;
      isCorrect = (optionIndex !== null && correctAnswer !== null && Number(optionIndex) === Number(correctAnswer));
    } else if (type === QUESTION_TYPES.TRUE_FALSE) {
      const optionIndex = (typeof rawAnswer === 'object' && rawAnswer !== null && rawAnswer.optionIndex !== undefined)
        ? rawAnswer.optionIndex
        : (typeof rawAnswer === 'number' ? rawAnswer : (typeof rawAnswer === 'boolean' ? (rawAnswer ? 0 : 1) : null));

      correctAnswer = q.correct_index;
      isCorrect = (optionIndex !== null && correctAnswer !== null && Number(optionIndex) === Number(correctAnswer));
    } else if (type === QUESTION_TYPES.SEQUENCE) {
      let order = [];
      if (Array.isArray(rawAnswer)) {
        order = rawAnswer.map(Number);
      } else if (typeof rawAnswer === 'object' && rawAnswer !== null && Array.isArray(rawAnswer.order)) {
        order = rawAnswer.order.map(Number);
      }

      correctAnswer = q.correct_order || [];
      if (Array.isArray(correctAnswer) && correctAnswer.length > 0 && order.length === correctAnswer.length) {
        isCorrect = correctAnswer.every((val, idx) => Number(val) === Number(order[idx]));
      } else {
        isCorrect = false;
      }
    } else if (type === QUESTION_TYPES.HAZARD_HOTSPOT || type === 'hotspot') {
      const clickX = (typeof rawAnswer === 'object' && rawAnswer !== null && rawAnswer.x !== undefined) ? Number(rawAnswer.x) : null;
      const clickY = (typeof rawAnswer === 'object' && rawAnswer !== null && rawAnswer.y !== undefined) ? Number(rawAnswer.y) : null;

      correctAnswer = q.hazard_zones || [];
      if (clickX !== null && clickY !== null && Array.isArray(correctAnswer) && correctAnswer.length > 0) {
        isCorrect = correctAnswer.some(zone => {
          if (zone.is_hazard === false) return false;
          const zX = Number(zone.x);
          const zY = Number(zone.y);
          const radius = Number(zone.radius || 18);
          const dist = Math.hypot(clickX - zX, clickY - zY);
          return dist <= radius;
        });
      } else {
        isCorrect = false;
      }
    } else {
      // Fallback genérico para otros tipos con índice correcto
      const optionIndex = (typeof rawAnswer === 'object' && rawAnswer !== null && rawAnswer.optionIndex !== undefined)
        ? rawAnswer.optionIndex
        : (typeof rawAnswer === 'number' ? rawAnswer : null);

      correctAnswer = q.correct_index;
      isCorrect = (optionIndex !== null && correctAnswer !== null && Number(optionIndex) === Number(correctAnswer));
    }

    let points = 0;
    let newStreak = 0;

    if (isCorrect) {
      points = calculateScore(timeRemaining, totalTime, currentStreak, isHighTide);
      newStreak = currentStreak + 1;
    } else {
      points = 0;
      newStreak = 0;
    }

    const streakInfo = getStreakInfo(newStreak);

    return {
      is_correct: isCorrect,
      isCorrect: isCorrect,
      points,
      streak: newStreak,
      streakInfo,
      correctAnswer,
      timeRemaining,
      totalTime,
      isHighTide,
      type,
      answer: rawAnswer
    };
  }

  /**
   * Renderiza el componente de entrada de respuesta interactivo en un contenedor del DOM
   * @param {Object} rawQuestion - Objeto de pregunta
   * @param {HTMLElement} container - Elemento DOM donde se inyectará el formulario interactivo
   * @param {Function} onAnswer - Callback invocado al enviar la respuesta: onAnswer(answerPayload)
   * @returns {Object|null} Controladores de la vista o null si no hay DOM
   */
  function renderQuestionInput(rawQuestion, container, onAnswer) {
    if (typeof document === 'undefined' || !container) {
      return null;
    }

    const q = formatQuestion(rawQuestion);
    container.innerHTML = '';

    const shapeIcons = ['▲', '◆', '●', '■'];
    const colorClasses = ['btn-opt-0', 'btn-opt-1', 'btn-opt-2', 'btn-opt-3'];

    let hasAnswered = false;

    function submitAnswer(payload) {
      if (hasAnswered) return;
      hasAnswered = true;

      // Deshabilitar todos los botones e inputs interactivos
      const interactives = container.querySelectorAll('button, input, textarea');
      interactives.forEach(el => {
        el.disabled = true;
        el.classList.add('disabled');
      });

      if (typeof onAnswer === 'function') {
        onAnswer(payload);
      }
    }

    // 1. Opción Múltiple / Quiz / Votación de Sondeo
    if (q.type === QUESTION_TYPES.MULTIPLE_CHOICE || q.type === QUESTION_TYPES.QUIZ || q.type === QUESTION_TYPES.POLL_CHOICE || q.type === QUESTION_TYPES.SURVEY) {
      const grid = document.createElement('div');
      grid.className = 'mechanics-options-grid';
      grid.setAttribute('role', 'group');
      grid.setAttribute('aria-label', 'Opciones de respuesta');

      q.options.forEach((optText, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `btn-option ${colorClasses[idx % colorClasses.length] || 'btn-opt-0'}`;
        btn.dataset.index = String(idx);
        btn.innerHTML = `
          <span class="btn-shape" aria-hidden="true">${shapeIcons[idx % shapeIcons.length]}</span>
          <span class="btn-text">${escapeHtml(optText)}</span>
        `;

        btn.addEventListener('click', () => {
          btn.classList.add('selected');
          submitAnswer({ optionIndex: idx, optionText: optText });
        });

        grid.appendChild(btn);
      });

      container.appendChild(grid);
      return { container, type: q.type };
    }

    // 2. Verdadero / Falso Náutico
    if (q.type === QUESTION_TYPES.TRUE_FALSE) {
      const binaryContainer = document.createElement('div');
      binaryContainer.className = 'mechanics-binary-grid';

      const options = q.options.length >= 2 ? q.options : ['Verdadero', 'Falso'];
      const icons = ['🟢', '🔴'];
      const styles = ['btn-tf-true', 'btn-tf-false'];

      options.slice(0, 2).forEach((optText, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `btn-binary ${styles[idx]}`;
        btn.dataset.index = String(idx);
        btn.innerHTML = `
          <span class="binary-icon" aria-hidden="true">${icons[idx]}</span>
          <span class="binary-label">${escapeHtml(optText)}</span>
        `;

        btn.addEventListener('click', () => {
          btn.classList.add('selected');
          submitAnswer({ optionIndex: idx, optionText: optText });
        });

        binaryContainer.appendChild(btn);
      });

      container.appendChild(binaryContainer);
      return { container, type: q.type };
    }

    // 3. Secuencia / Maniobra Náutica
    if (q.type === QUESTION_TYPES.SEQUENCE) {
      const seqWrapper = document.createElement('div');
      seqWrapper.className = 'mechanics-sequence-wrapper';

      const hint = document.createElement('p');
      hint.className = 'sequence-instruction';
      hint.textContent = 'Ordena los pasos de la maniobra usando las flechas y confirma:';
      seqWrapper.appendChild(hint);

      const list = document.createElement('ul');
      list.className = 'mechanics-sequence-list';

      // Estado de orden local
      let currentOrder = q.options.map((_, i) => i);

      function renderSequenceItems() {
        list.innerHTML = '';
        currentOrder.forEach((originalIdx, position) => {
          const item = document.createElement('li');
          item.className = 'sequence-item';
          item.dataset.originalIndex = String(originalIdx);
          item.dataset.position = String(position);

          item.innerHTML = `
            <span class="sequence-rank">${position + 1}</span>
            <span class="sequence-text">${escapeHtml(q.options[originalIdx])}</span>
            <div class="sequence-controls">
              <button type="button" class="btn-seq-move up" title="Subir paso" ${position === 0 ? 'disabled' : ''}>▲</button>
              <button type="button" class="btn-seq-move down" title="Bajar paso" ${position === currentOrder.length - 1 ? 'disabled' : ''}>▼</button>
            </div>
          `;

          const btnUp = item.querySelector('.btn-seq-move.up');
          const btnDown = item.querySelector('.btn-seq-move.down');

          btnUp.addEventListener('click', (e) => {
            e.stopPropagation();
            if (position > 0) {
              const temp = currentOrder[position - 1];
              currentOrder[position - 1] = currentOrder[position];
              currentOrder[position] = temp;
              renderSequenceItems();
            }
          });

          btnDown.addEventListener('click', (e) => {
            e.stopPropagation();
            if (position < currentOrder.length - 1) {
              const temp = currentOrder[position + 1];
              currentOrder[position + 1] = currentOrder[position];
              currentOrder[position] = temp;
              renderSequenceItems();
            }
          });

          list.appendChild(item);
        });
      }

      renderSequenceItems();
      seqWrapper.appendChild(list);

      const confirmBtn = document.createElement('button');
      confirmBtn.type = 'button';
      confirmBtn.className = 'btn-confirm-sequence';
      confirmBtn.innerHTML = `<span>⚓ Confirmar Maniobra</span>`;
      confirmBtn.addEventListener('click', () => {
        confirmBtn.classList.add('confirmed');
        submitAnswer({ order: [...currentOrder] });
      });

      seqWrapper.appendChild(confirmBtn);
      container.appendChild(seqWrapper);

      return { container, type: q.type, getOrder: () => [...currentOrder] };
    }

    // 4. Valoración de Pantallas / UX Rating (1 a 10)
    if (q.type === QUESTION_TYPES.POLL_RATING || q.type === QUESTION_TYPES.SCALE) {
      const ratingWrapper = document.createElement('div');
      ratingWrapper.className = 'mechanics-rating-wrapper';

      const valueDisplay = document.createElement('div');
      valueDisplay.className = 'rating-current-value';
      valueDisplay.textContent = 'Selecciona una puntuación del 1 al 10';
      ratingWrapper.appendChild(valueDisplay);

      const scaleGrid = document.createElement('div');
      scaleGrid.className = 'mechanics-rating-grid';

      for (let val = 1; val <= 10; val++) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `btn-rating-num ${val >= 8 ? 'high' : val >= 5 ? 'mid' : 'low'}`;
        btn.dataset.value = String(val);
        btn.textContent = String(val);

        btn.addEventListener('click', () => {
          btn.classList.add('selected');
          valueDisplay.textContent = `Puntuación seleccionada: ${val} / 10`;
          submitAnswer({ value: val });
        });

        scaleGrid.appendChild(btn);
      }

      ratingWrapper.appendChild(scaleGrid);

      const scaleLabels = document.createElement('div');
      scaleLabels.className = 'rating-scale-legend';
      scaleLabels.innerHTML = `
        <span>1: Muy insatisfactorio / Riesgoso</span>
        <span>10: Excelente / Seguro</span>
      `;
      ratingWrapper.appendChild(scaleLabels);

      container.appendChild(ratingWrapper);
      return { container, type: q.type };
    }

    // 5. Sugerencias y Feedback Abierto (Texto libre)
    if (q.type === QUESTION_TYPES.POLL_TEXT || q.type === QUESTION_TYPES.TEXT) {
      const textWrapper = document.createElement('div');
      textWrapper.className = 'mechanics-text-wrapper';

      const textarea = document.createElement('textarea');
      textarea.className = 'input-feedback-text';
      textarea.rows = 4;
      textarea.maxLength = 400;
      textarea.placeholder = 'Escribe aquí tus sugerencias u observaciones náuticas...';

      const charCount = document.createElement('div');
      charCount.className = 'text-char-count';
      charCount.textContent = '0 / 400 caracteres';

      textarea.addEventListener('input', () => {
        charCount.textContent = `${textarea.value.length} / 400 caracteres`;
      });

      const submitBtn = document.createElement('button');
      submitBtn.type = 'button';
      submitBtn.className = 'btn-submit-text';
      submitBtn.innerHTML = `<span>💬 Enviar Sugerencia</span>`;

      submitBtn.addEventListener('click', () => {
        const val = textarea.value.trim();
        if (val.length === 0) {
          textarea.focus();
          return;
        }
        submitBtn.classList.add('submitted');
        submitAnswer({ text: val, value: val });
      });

      textWrapper.appendChild(textarea);
      textWrapper.appendChild(charCount);
      textWrapper.appendChild(submitBtn);
      container.appendChild(textWrapper);

      return { container, type: q.type };
    }

    // 6. Identificación Visual de Peligros en Cubierta / Hotspot
    if (q.type === QUESTION_TYPES.HAZARD_HOTSPOT || q.type === 'hotspot') {
      const hotspotWrapper = document.createElement('div');
      hotspotWrapper.className = 'mechanics-hotspot-wrapper';

      const instruction = document.createElement('p');
      instruction.className = 'hotspot-instruction';
      instruction.style.margin = '0 0 10px 0';
      instruction.style.fontSize = '0.95rem';
      instruction.style.color = '#F7B500';
      instruction.innerHTML = '⚠️ <strong>¡Toca la zona de mayor peligro mortal</strong> en el plano de cubierta:';
      hotspotWrapper.appendChild(instruction);

      const mapArea = document.createElement('div');
      mapArea.className = 'mechanics-hotspot-canvas';
      mapArea.style.position = 'relative';
      mapArea.style.width = '100%';
      mapArea.style.maxWidth = '440px';
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
          <text x="200" y="220" fill="#ff6b6b" font-size="11" font-weight="bold" text-anchor="middle">ZONA DE MANIOBRAS</text>
          <circle cx="120" cy="245" r="8" fill="#F7B500"/>
          <circle cx="280" cy="245" r="8" fill="#F7B500"/>
        </svg>
        <div class="hotspot-marker" style="display:none; position:absolute; width:24px; height:24px; margin-left:-12px; margin-top:-12px; border-radius:50%; background:rgba(228,0,26,0.85); border:2px solid #fff; box-shadow:0 0 10px #ff0000; pointer-events:none; z-index:10;"></div>
      `;

      const marker = mapArea.querySelector('.hotspot-marker');

      function handleTap(e) {
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

        submitAnswer({ x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 });
      }

      mapArea.addEventListener('click', handleTap);
      mapArea.addEventListener('touchend', (e) => {
        e.preventDefault();
        handleTap(e);
      });

      hotspotWrapper.appendChild(mapArea);
      container.appendChild(hotspotWrapper);
      return { container, type: q.type };
    }

    return null;
  }

  function escapeHtml(str) {
    return String(str ?? '').replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  const Mechanics = {
    QUESTION_TYPES,
    TYPE_LABELS,
    TYPE_ICONS,
    STREAK_LEVELS,
    getStreakInfo,
    calculateScore,
    isPollType,
    getQuestionTypeLabel,
    getQuestionTypeIcon,
    formatQuestion,
    validateAnswer,
    renderQuestionInput
  };

  return Mechanics;
});
