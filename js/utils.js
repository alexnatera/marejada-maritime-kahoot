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
  const strip = document.createElement('div');
  strip.className = 'wave-strip';
  strip.innerHTML = wavesSVG();
  document.body.appendChild(strip);
}
