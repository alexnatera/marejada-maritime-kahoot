// tests/mechanics-test.js
// Suite de Pruebas Unitarias para el Motor de Mecánicas de Marejada 2.0

let Mechanics;
if (typeof require !== 'undefined') {
  try {
    Mechanics = require('../js/mechanics.js');
  } catch (e) {
    Mechanics = require('./mechanics.js');
  }
} else if (typeof window !== 'undefined' && window.Mechanics) {
  Mechanics = window.Mechanics;
}

let passed = 0;
let failed = 0;
const results = [];

function assert(condition, message) {
  if (condition) {
    passed++;
    results.push({ status: 'PASS', message });
    if (typeof console !== 'undefined') console.log(`  ✅ PASS: ${message}`);
  } else {
    failed++;
    results.push({ status: 'FAIL', message });
    if (typeof console !== 'undefined') console.error(`  ❌ FAIL: ${message}`);
  }
}

function assertEqual(actual, expected, message) {
  const isMatch = JSON.stringify(actual) === JSON.stringify(expected);
  assert(isMatch, `${message} (Esperado: ${JSON.stringify(expected)}, Obtenido: ${JSON.stringify(actual)})`);
}

function runAllTests() {
  if (typeof console !== 'undefined') {
    console.log('====================================================');
    console.log('🧪 Iniciando Pruebas: Motor de Mecánicas (Mechanics)');
    console.log('====================================================\n');
  }

  // -------------------------------------------------------------------------
  // 1. Pruebas de calculateScore
  // -------------------------------------------------------------------------
  if (typeof console !== 'undefined') console.log('🔹 1. Pruebas de Cálculo de Puntajes (calculateScore)');

  // 1.1 Puntaje base según velocidad
  // Ratio = 1.0 (instantáneo): 500 + 500 * 1 = 1000
  assertEqual(Mechanics.calculateScore(20, 20, 0, false), 1000, 'Respuesta instantánea (20s/20s) otorga 1000 puntos');
  
  // Ratio = 0.5 (mitad del tiempo): 500 + 500 * 0.5 = 750
  assertEqual(Mechanics.calculateScore(10, 20, 0, false), 750, 'Respuesta a la mitad del tiempo (10s/20s) otorga 750 puntos');
  
  // Ratio = 0.0 (último segundo / 0s restante): 500 + 500 * 0 = 500
  assertEqual(Mechanics.calculateScore(0, 20, 0, false), 500, 'Respuesta en el último segundo (0s/20s) otorga 500 puntos');

  // 1.2 Multiplicadores de Racha
  // Racha 0 o 1 -> x1.0
  assertEqual(Mechanics.calculateScore(20, 20, 1, false), 1000, 'Racha 1x otorga multiplicador x1.0 (1000 pts)');
  
  // Racha 2 -> x1.2 (1000 * 1.2 = 1200)
  assertEqual(Mechanics.calculateScore(20, 20, 2, false), 1200, 'Racha 2 (Vapor encendido) otorga multiplicador x1.2 (1200 pts)');
  assertEqual(Mechanics.calculateScore(10, 20, 2, false), 900, 'Racha 2 con 50% tiempo (750 * 1.2 = 900 pts)');

  // Racha 3 -> x1.5 (1000 * 1.5 = 1500)
  assertEqual(Mechanics.calculateScore(20, 20, 3, false), 1500, 'Racha 3 (A Toda Máquina) otorga multiplicador x1.5 (1500 pts)');

  // Racha 4+ -> x2.0 (1000 * 2.0 = 2000)
  assertEqual(Mechanics.calculateScore(20, 20, 4, false), 2000, 'Racha 4 (Rompeolas) otorga multiplicador x2.0 (2000 pts)');
  assertEqual(Mechanics.calculateScore(20, 20, 10, false), 2000, 'Racha 10 otorga multiplicador x2.0 (2000 pts)');

  // 1.3 Marea Alta (High Tide x2)
  // High Tide sin racha: 1000 * 2 = 2000
  assertEqual(Mechanics.calculateScore(20, 20, 0, true), 2000, 'Marea Alta (High Tide) duplica el puntaje base (2000 pts)');
  // High Tide + Racha 3 (1.5): 1000 * 1.5 * 2 = 3000
  assertEqual(Mechanics.calculateScore(20, 20, 3, true), 3000, 'Marea Alta + Racha 3 otorga 3000 pts (1000 * 1.5 * 2)');
  // High Tide + Racha 4 (2.0): 1000 * 2.0 * 2 = 4000
  assertEqual(Mechanics.calculateScore(20, 20, 4, true), 4000, 'Marea Alta + Racha 4 otorga 4000 pts (1000 * 2.0 * 2)');

  // 1.4 Casos límite (Clamping)
  assertEqual(Mechanics.calculateScore(-5, 20, 0, false), 500, 'Tiempo negativo se clampea a 0 (500 pts)');
  assertEqual(Mechanics.calculateScore(25, 20, 0, false), 1000, 'Tiempo excedido se clampea a 1 (1000 pts)');
  assertEqual(Mechanics.calculateScore(10, 0, 0, false), 500, 'TotalTime = 0 evita división por cero (500 pts)');

  // -------------------------------------------------------------------------
  // 2. Pruebas de getStreakInfo
  // -------------------------------------------------------------------------
  if (typeof console !== 'undefined') console.log('\n🔹 2. Pruebas de Niveles de Racha (getStreakInfo)');

  const s0 = Mechanics.getStreakInfo(0);
  assertEqual(s0.level, 1, 'Racha 0 tiene nivel 1');
  assertEqual(s0.multiplier, 1.0, 'Racha 0 tiene multiplicador 1.0');
  assertEqual(s0.name, 'Normal', 'Racha 0 tiene nombre "Normal"');

  const s2 = Mechanics.getStreakInfo(2);
  assertEqual(s2.level, 2, 'Racha 2 tiene nivel 2');
  assertEqual(s2.multiplier, 1.2, 'Racha 2 tiene multiplicador 1.2');
  assertEqual(s2.name, 'Vapor encendido', 'Racha 2 tiene nombre "Vapor encendido"');
  assertEqual(s2.icon, '🔥', 'Racha 2 tiene ícono de fuego 🔥');

  const s3 = Mechanics.getStreakInfo(3);
  assertEqual(s3.level, 3, 'Racha 3 tiene nivel 3');
  assertEqual(s3.multiplier, 1.5, 'Racha 3 tiene multiplicador 1.5');
  assertEqual(s3.name, 'A Toda Máquina', 'Racha 3 tiene nombre "A Toda Máquina"');
  assertEqual(s3.icon, '⚡', 'Racha 3 tiene ícono de rayo ⚡');

  const s5 = Mechanics.getStreakInfo(5);
  assertEqual(s5.level, 4, 'Racha 5 tiene nivel 4');
  assertEqual(s5.multiplier, 2.0, 'Racha 5 tiene multiplicador 2.0');
  assertEqual(s5.name, 'Rompeolas', 'Racha 5 tiene nombre "Rompeolas"');
  assertEqual(s5.icon, '🌟', 'Racha 5 tiene ícono de estrella 🌟');

  // -------------------------------------------------------------------------
  // 3. Pruebas de formatQuestion y getQuestionTypeLabel
  // -------------------------------------------------------------------------
  if (typeof console !== 'undefined') console.log('\n🔹 3. Pruebas de Formato y Etiquetas de Pregunta');

  const tfQuestion = Mechanics.formatQuestion({
    type: 'true_false',
    question_text: '¿Es seguro navegar sin chaleco?'
  });
  assertEqual(tfQuestion.options, ['Verdadero', 'Falso'], 'Formato true_false genera opciones por defecto');
  assertEqual(tfQuestion.is_poll, false, 'true_false no es tipo poll');

  const pollQuestion = Mechanics.formatQuestion({
    type: 'poll_rating',
    question_text: '¿Cómo evalúas la nueva carta náutica?'
  });
  assertEqual(pollQuestion.is_poll, true, 'poll_rating es marcado como is_poll: true');

  assertEqual(Mechanics.getQuestionTypeLabel('multiple_choice'), 'Opción Múltiple', 'Etiqueta correcta para multiple_choice');
  assertEqual(Mechanics.getQuestionTypeLabel('sequence'), 'Secuencia de Maniobra', 'Etiqueta correcta para sequence');
  assertEqual(Mechanics.getQuestionTypeLabel('poll_rating'), 'Valoración de Pantallas (1-10)', 'Etiqueta correcta para poll_rating');

  // -------------------------------------------------------------------------
  // 4. Pruebas de validateAnswer para todos los formatos
  // -------------------------------------------------------------------------
  if (typeof console !== 'undefined') console.log('\n🔹 4. Pruebas de Validación de Respuestas (validateAnswer)');

  // 4.1 Multiple Choice
  const qMC = {
    type: 'multiple_choice',
    question_text: '¿Qué significa bandera Alfa?',
    options: ['Buzo sumergido', 'Fuego a bordo', 'Hombre al agua', 'Peligro'],
    correct_index: 0,
    time_limit: 20
  };

  const resMC_OK = Mechanics.validateAnswer(qMC, { optionIndex: 0 }, { timeRemaining: 20, streak: 0 });
  assertEqual(resMC_OK.is_correct, true, 'Multiple Choice: Respuesta correcta validada como true');
  assertEqual(resMC_OK.points, 1000, 'Multiple Choice: Otorga 1000 pts con 20s');
  assertEqual(resMC_OK.streak, 1, 'Multiple Choice: Racha aumenta de 0 a 1');

  const resMC_ERR = Mechanics.validateAnswer(qMC, { optionIndex: 2 }, { timeRemaining: 20, streak: 3 });
  assertEqual(resMC_ERR.is_correct, false, 'Multiple Choice: Respuesta incorrecta validada como false');
  assertEqual(resMC_ERR.points, 0, 'Multiple Choice: Respuesta incorrecta otorga 0 pts');
  assertEqual(resMC_ERR.streak, 0, 'Multiple Choice: Respuesta incorrecta reinicia racha a 0');

  // 4.2 True / False
  const qTF = {
    type: 'true_false',
    question_text: 'El ancla debe levarse antes de fondear.',
    options: ['Verdadero', 'Falso'],
    correct_index: 1,
    time_limit: 20
  };

  const resTF_OK = Mechanics.validateAnswer(qTF, { optionIndex: 1 }, { timeRemaining: 20, streak: 1 });
  assertEqual(resTF_OK.is_correct, true, 'True/False: Respuesta correcta validada');
  assertEqual(resTF_OK.streak, 2, 'True/False: Racha aumenta de 1 a 2');
  assertEqual(resTF_OK.points, 1000, 'True/False: Otorga puntaje correcto');

  // 4.3 Sequence (Secuencia de maniobra)
  const qSeq = {
    type: 'sequence',
    question_text: 'Ordena los pasos de atraque de un buque tanque:',
    options: ['Reducir andar', 'Aproar al muelle', 'Lanzar cabos', 'Hacer firme encapillando'],
    correct_order: [0, 1, 2, 3],
    time_limit: 20
  };

  const resSeq_OK = Mechanics.validateAnswer(qSeq, { order: [0, 1, 2, 3] }, { timeRemaining: 10, streak: 2 });
  assertEqual(resSeq_OK.is_correct, true, 'Sequence: Secuencia correcta en orden [0, 1, 2, 3] es válida');
  assertEqual(resSeq_OK.points, 900, 'Sequence: Racha 2 (1.2) + 50% tiempo (750) = 900 pts');
  assertEqual(resSeq_OK.streak, 3, 'Sequence: Racha avanza a nivel 3');

  const resSeq_ERR = Mechanics.validateAnswer(qSeq, { order: [1, 0, 2, 3] }, { timeRemaining: 10, streak: 2 });
  assertEqual(resSeq_ERR.is_correct, false, 'Sequence: Secuencia con pasos invertidos es rechazada');
  assertEqual(resSeq_ERR.points, 0, 'Sequence: Secuencia errónea otorga 0 pts');
  assertEqual(resSeq_ERR.streak, 0, 'Sequence: Secuencia errónea reinicia racha a 0');

  // 4.4 Poll Choice (Sondeo / Votación de Funcionalidades)
  const qPollChoice = {
    type: 'poll_choice',
    question_text: '¿Qué módulo te gustaría ver primero?',
    options: ['Cartas Offline', 'Predicción de Oleaje', 'Bitácora de Guardias']
  };

  const resPollChoice = Mechanics.validateAnswer(qPollChoice, { optionIndex: 1 }, { streak: 3 });
  assertEqual(resPollChoice.is_correct, null, 'Poll Choice: is_correct es null (sin evaluación)');
  assertEqual(resPollChoice.points, 0, 'Poll Choice: points es 0');
  assertEqual(resPollChoice.streak, 3, 'Poll Choice: preserva la racha actual');

  // 4.5 Poll Rating (Escala 1-10 UX)
  const qPollRating = {
    type: 'poll_rating',
    question_text: 'Califica la facilidad de uso del mapa interactivo (1-10)'
  };

  const resPollRating = Mechanics.validateAnswer(qPollRating, { value: 9 }, { streak: 2 });
  assertEqual(resPollRating.is_correct, null, 'Poll Rating: is_correct es null');
  assertEqual(resPollRating.points, 0, 'Poll Rating: points es 0');
  assertEqual(resPollRating.streak, 2, 'Poll Rating: preserva la racha');

  // 4.6 Poll Text (Feedback libre)
  const qPollText = {
    type: 'poll_text',
    question_text: '¿Qué sugerencia tienes para mejorar la visibilidad del sonar?'
  };

  const resPollText = Mechanics.validateAnswer(qPollText, { text: 'Mayor contraste en modo nocturno' }, { streak: 0 });
  assertEqual(resPollText.is_correct, null, 'Poll Text: is_correct es null');
  assertEqual(resPollText.points, 0, 'Poll Text: points es 0');

  // 4.7 Legacy Aliases (quiz, survey, scale, text)
  const qQuiz = { type: 'quiz', options: ['A', 'B'], correct_option: 1 };
  const resQuiz = Mechanics.validateAnswer(qQuiz, { optionIndex: 1 }, { timeRemaining: 20 });
  assertEqual(resQuiz.is_correct, true, 'Legacy quiz type alias compatible');

  const qScale = { type: 'scale' };
  const resScale = Mechanics.validateAnswer(qScale, { value: 8 });
  assertEqual(resScale.is_correct, null, 'Legacy scale type alias is poll');

  // -------------------------------------------------------------------------
  // Resumen
  // -------------------------------------------------------------------------
  if (typeof console !== 'undefined') {
    console.log('\n====================================================');
    console.log(`📊 Resumen: ${passed} pasadas, ${failed} falladas (Total: ${passed + failed})`);
    console.log('====================================================\n');
  }

  return { passed, failed, total: passed + failed, results };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runAllTests };
}

if (typeof require !== 'undefined' && require.main === module) {
  const { failed } = runAllTests();
  process.exit(failed > 0 ? 1 : 0);
} else if (typeof window !== 'undefined') {
  window.runMechanicsTests = runAllTests;
}
