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
