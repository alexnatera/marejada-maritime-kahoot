// Iconos SVG inline con temática marítima
const ICONS = {
  anchor: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="2"/><path d="M12 7v13"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/><path d="M5 12a7 7 0 0 0 14 0"/></svg>`,
  wheel: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2"/><path d="M12 4v4M12 16v4M4 12h4M16 12h4M6.3 6.3l2.8 2.8M14.9 14.9l2.8 2.8M17.7 6.3l-2.8 2.8M9.1 14.9l-2.8 2.8"/></svg>`,
  compass: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`,
  lighthouse: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21h6"/><path d="M10 21V10l-1-5h6l-1 5v11"/><path d="M8 5h8"/><path d="M2 12l4-1"/><path d="M22 12l-4-1"/><path d="M9 14h6"/></svg>`,
  sailboat: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18h18l-2 3H5z"/><path d="M12 18V3l6 9z"/><path d="M8 18l2-13-2 4z"/></svg>`,
  users: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  trophy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h8M12 17v4"/><path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 5H4a3 3 0 0 0 3 5"/><path d="M17 5h3a3 3 0 0 1-3 5"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>`,
  trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>`,
  copy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
  arrowUp: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>`,
  arrowDown: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>`,
  arrowRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`,
  download: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><path d="M12 15V3"/></svg>`,
  chart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><rect x="7" y="12" width="3" height="6"/><rect x="12" y="8" width="3" height="10"/><rect x="17" y="5" width="3" height="13"/></svg>`,
  settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  play: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="6 3 20 12 6 21 6 3"/></svg>`
};

function wavesSVG() {
  return `<svg viewBox="0 0 1600 200" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0,100 C200,150 400,50 600,100 C800,150 1000,50 1200,100 C1400,150 1500,100 1600,100 L1600,200 L0,200 Z" fill="#E4001A" opacity="0.35"/>
    <path d="M0,120 C200,80 400,160 600,120 C800,80 1000,160 1200,120 C1400,80 1500,120 1600,120 L1600,200 L0,200 Z" fill="#D4A843" opacity="0.3"/>
  </svg>`;
}

// ---------------------------------------------------------------------------
// Flota de avatares: cada jugador elige un tipo de buque como identidad visual
// ---------------------------------------------------------------------------
const MINI_WAVE = `<path d="M2 46 Q10 42 18 46 T34 46 T50 46 T66 46 T82 46 T98 46 T114 46 T118 46" fill="none" stroke="#9fd3ef" stroke-width="2.5" stroke-linecap="round" opacity="0.55"/>`;

const SHIP_AVATARS = {
  tug: {
    label: 'Remolcador',
    svg: `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">
      ${MINI_WAVE}
      <path d="M14 44 Q14 32 26 32 L82 32 Q92 32 92 40 L92 44 Q92 48 88 48 L18 48 Q14 48 14 44 Z" fill="#E4001A"/>
      <rect x="36" y="14" width="34" height="20" rx="3" fill="#FFFFFF"/>
      <rect x="41" y="19" width="8" height="8" rx="1.5" fill="#124A7D"/>
      <rect x="54" y="19" width="8" height="8" rx="1.5" fill="#124A7D"/>
      <rect x="72" y="6" width="8" height="14" rx="2" fill="#D4A843"/>
      <rect x="14" y="42" width="78" height="4" fill="#0B3559"/>
    </svg>`
  },
  container: {
    label: 'Portacontenedores',
    svg: `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">
      ${MINI_WAVE}
      <path d="M6 40 L112 40 L104 48 L14 48 Z" fill="#0B3559"/>
      <rect x="14" y="22" width="16" height="14" fill="#E4001A"/>
      <rect x="32" y="22" width="16" height="14" fill="#D4A843"/>
      <rect x="50" y="22" width="16" height="14" fill="#3498DB"/>
      <rect x="68" y="22" width="16" height="14" fill="#2ECC71"/>
      <rect x="14" y="10" width="16" height="10" fill="#D4A843"/>
      <rect x="32" y="10" width="16" height="10" fill="#E4001A"/>
      <rect x="50" y="10" width="16" height="10" fill="#2ECC71"/>
      <rect x="90" y="16" width="16" height="24" rx="2" fill="#FFFFFF"/>
      <rect x="94" y="20" width="4" height="4" fill="#124A7D"/>
      <rect x="100" y="20" width="4" height="4" fill="#124A7D"/>
    </svg>`
  },
  tanker: {
    label: 'Petrolero',
    svg: `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">
      ${MINI_WAVE}
      <path d="M8 40 Q8 30 20 30 L98 30 Q108 30 108 38 L108 40 Q108 46 100 46 L16 46 Q8 46 8 40 Z" fill="#3A4750"/>
      <rect x="20" y="24" width="72" height="8" fill="#5C6B73"/>
      <circle cx="36" cy="22" r="5" fill="#D4A843"/>
      <circle cx="52" cy="22" r="5" fill="#D4A843"/>
      <circle cx="68" cy="22" r="5" fill="#D4A843"/>
      <rect x="90" y="10" width="18" height="20" rx="2" fill="#FFFFFF"/>
      <rect x="94" y="14" width="5" height="5" fill="#124A7D"/>
      <rect x="102" y="14" width="5" height="5" fill="#124A7D"/>
    </svg>`
  },
  ferry: {
    label: 'Ferry',
    svg: `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">
      ${MINI_WAVE}
      <path d="M10 44 Q10 34 22 34 L98 34 Q110 34 110 42 L110 44 Q110 48 104 48 L16 48 Q10 48 10 44 Z" fill="#E4001A"/>
      <rect x="18" y="20" width="84" height="16" rx="2" fill="#FFFFFF"/>
      <rect x="24" y="24" width="6" height="6" fill="#124A7D"/>
      <rect x="36" y="24" width="6" height="6" fill="#124A7D"/>
      <rect x="48" y="24" width="6" height="6" fill="#124A7D"/>
      <rect x="60" y="24" width="6" height="6" fill="#124A7D"/>
      <rect x="72" y="24" width="6" height="6" fill="#124A7D"/>
      <rect x="84" y="24" width="6" height="6" fill="#124A7D"/>
      <rect x="40" y="8" width="24" height="12" rx="2" fill="#0B3559"/>
      <rect x="70" y="4" width="6" height="16" fill="#D4A843"/>
    </svg>`
  },
  sailboat: {
    label: 'Velero',
    svg: `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">
      ${MINI_WAVE}
      <path d="M22 44 Q60 54 98 44 L92 48 Q60 56 28 48 Z" fill="#0B3559"/>
      <rect x="58" y="6" width="3" height="40" fill="#5C6B73"/>
      <path d="M61 8 L61 40 L88 40 Z" fill="#FFFFFF"/>
      <path d="M58 14 L58 40 L36 40 Z" fill="#E4001A"/>
    </svg>`
  }
};

function shipAvatarSVG(key) {
  const entry = SHIP_AVATARS[key] || SHIP_AVATARS.tug;
  return entry.svg;
}

function captainMascotSVG() {
  return `<svg viewBox="0 0 140 90" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 66 Q14 60 22 66 T38 66 T54 66 T70 66 T86 66 T102 66 T118 66 T134 66" fill="none" stroke="#9fd3ef" stroke-width="3" stroke-linecap="round" opacity="0.55"/>
    <path d="M16 58 Q16 42 32 42 L104 42 Q118 42 118 52 L118 58 Q118 64 112 64 L22 64 Q16 64 16 58 Z" fill="#E4001A"/>
    <rect x="46" y="16" width="44" height="28" rx="4" fill="#FFFFFF"/>
    <circle cx="60" cy="30" r="5" fill="#0B3559"/>
    <circle cx="76" cy="30" r="5" fill="#0B3559"/>
    <circle cx="61.5" cy="28.5" r="1.6" fill="#fff"/>
    <circle cx="77.5" cy="28.5" r="1.6" fill="#fff"/>
    <path d="M58 38 Q68 44 78 38" fill="none" stroke="#0B3559" stroke-width="2.4" stroke-linecap="round"/>
    <rect x="94" y="6" width="10" height="18" rx="2" fill="#D4A843"/>
    <rect x="16" y="56" width="102" height="6" fill="#0B3559"/>
  </svg>`;
}
