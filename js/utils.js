// Utilidades compartidas

function generatePin() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function generateUniquePin() {
  for (let i = 0; i < 8; i++) {
    const pin = generatePin();
    const { data } = await sb.from('sessions').select('id').eq('pin', pin).maybeSingle();
    if (!data) return pin;
  }
  return generatePin();
}

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString('es-CL', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const TYPE_LABELS = { quiz: 'Quiz', survey: 'Encuesta', scale: 'Escala', text: 'Texto libre' };
const STATUS_LABELS = { draft: 'Borrador', lobby: 'Lobby', question: 'Pregunta activa', results: 'Resultados', ended: 'Finalizada' };

function statusBadge(status) {
  return `<span class="badge badge-${status}">${STATUS_LABELS[status] || status}</span>`;
}

function typeTag(type) {
  return `<span class="type-tag">${TYPE_LABELS[type] || type}</span>`;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D'];
const OPTION_SHAPES = ['▲', '◆', '●', '■'];

// ---------------------------------------------------------------------------
// Apodos cómicos de buque: "Remolcador Intrépido", "Petrolero Salvaje", etc.
// Se derivan de forma determinística del id del jugador + su tipo de buque,
// para que dos tripulantes con el mismo avatar queden bien diferenciados sin
// necesidad de guardar nada nuevo en la base de datos.
// ---------------------------------------------------------------------------
const SHIP_ADJECTIVES = [
  'Intrépido', 'Salvaje', 'Legendario', 'Atrevido', 'Veloz', 'Temerario', 'Majestuoso', 'Pícaro',
  'Feroz', 'Glorioso', 'Aventurero', 'Indomable', 'Audaz', 'Trueno', 'Relámpago', 'Fantasma',
  'Invencible', 'Bribón', 'Zarpado', 'Chiflado', 'Bandido', 'Rebelde', 'Descarado', 'Colosal',
  'Misterioso', 'Imparable', 'Turbulento', 'Huracanado', 'Épico', 'Insolente', 'Vagabundo', 'Bullicioso'
];

function hashString(str) {
  let h = 0;
  const s = String(str || '');
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

/** Devuelve el nombre cómico del buque de un jugador, ej. "Ferry Descarado". */
function shipTitle(player) {
  if (!player) return '';
  const avatarKey = player.avatar || 'tug';
  const base = (SHIP_AVATARS[avatarKey] || SHIP_AVATARS.tug).label;
  const idx = hashString(String(player.id || '') + avatarKey) % SHIP_ADJECTIVES.length;
  return `${base} "${SHIP_ADJECTIVES[idx]}"`;
}

function scaleEmoji(v) {
  if (v <= 2) return '😡';
  if (v <= 4) return '🙁';
  if (v <= 6) return '😐';
  if (v <= 8) return '🙂';
  return '🤩';
}

function computeQuizPoints(isCorrect, timeLeft, timeLimit) {
  if (!isCorrect) return 0;
  const ratio = Math.max(0, Math.min(1, timeLeft / timeLimit));
  return Math.round(500 + ratio * 500); // 500 - 1000 pts
}

function downloadCSV(filename, rows) {
  const csv = rows.map(r => r.map(cell => {
    const s = String(cell ?? '');
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  }).join(',')).join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function qs(sel, root = document) { return root.querySelector(sel); }
function qsa(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

// ---------------------------------------------------------------------------
// Sonidos marítimos sintetizados con Web Audio (sin archivos externos, así
// funcionan sin conexión y no dependen de ningún CDN).
// ---------------------------------------------------------------------------
let _audioCtx = null;
function getAudioCtx() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!_audioCtx) _audioCtx = new AC();
    if (_audioCtx.state === 'suspended') _audioCtx.resume();
    return _audioCtx;
  } catch (e) { return null; }
}

/** Bocina de remolcador: grave y prolongada. Úsala al iniciar/terminar el juego. */
function playShipHorn(long) {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  const dur = long ? 1.7 : 0.6;
  [98, 130.81].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.value = freq;
    const peak = i === 0 ? 0.22 : 0.13;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(peak, now + 0.09);
    gain.gain.setValueAtTime(peak, now + Math.max(0.1, dur - 0.3));
    gain.gain.linearRampToValueAtTime(0, now + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + dur + 0.05);
  });
}

/** Campana corta: para confirmaciones (unirse, respuesta correcta). */
function playShipBell() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(1100, now);
  osc.frequency.exponentialRampToValueAtTime(660, now + 0.4);
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(0.25, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.6);
}

function injectOceanBg() {
  const bg = document.createElement('div');
  bg.className = 'ocean-bg';
  document.body.prepend(bg);

  const birds = document.createElement('div');
  birds.className = 'sky-birds';
  birds.innerHTML = birdsSVG();
  document.body.prepend(birds);

  const buoys = document.createElement('div');
  buoys.className = 'deco-buoys';
  buoys.innerHTML = buoysDecoSVG();
  document.body.prepend(buoys);

  const strip = document.createElement('div');
  strip.className = 'wave-strip';
  strip.innerHTML = wavesSVG();
  document.body.appendChild(strip);
}
