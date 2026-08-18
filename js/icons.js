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

// ---------------------------------------------------------------------------
// Logo de marca: remolcador estilo SAAM (casco azul marino, banda negra de
// defensas, caseta amarilla, mástil con antena) — reemplaza el timón genérico
// ---------------------------------------------------------------------------
function tugLogoSVG() {
  return `<svg viewBox="0 0 40 26" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 20 Q10 17 18 20 T34 20" fill="none" stroke="#9fd3ef" stroke-width="1.6" stroke-linecap="round" opacity="0.5"/>
    <rect x="4" y="16.5" width="30" height="3" rx="1.5" fill="#12181C"/>
    <path d="M4 10 Q4 8 6 8 L30 8 Q34 8 34 12 L34 15 Q34 17 31 17 L7 17 Q4 17 4 15 Z" fill="#0B3559"/>
    <rect x="12" y="2" width="14" height="8" rx="1.5" fill="#F7B500"/>
    <rect x="14.3" y="4.2" width="3.6" height="3.6" fill="#FFFFFF"/>
    <rect x="20" y="4.2" width="3.6" height="3.6" fill="#FFFFFF"/>
    <rect x="26.5" y="0" width="2.6" height="6" fill="#E4001A"/>
  </svg>`;
}

function wavesSVG() {
  return `<svg viewBox="0 0 1600 200" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0,100 C200,150 400,50 600,100 C800,150 1000,50 1200,100 C1400,150 1500,100 1600,100 L1600,200 L0,200 Z" fill="#E4001A" opacity="0.35"/>
    <path d="M0,120 C200,80 400,160 600,120 C800,80 1000,160 1200,120 C1400,80 1500,120 1600,120 L1600,200 L0,200 Z" fill="#D4A843" opacity="0.3"/>
  </svg>`;
}

// ---------------------------------------------------------------------------
// Elementos decorativos animados: boyas flotando (las gaviotas fueron
// reemplazadas por las escenas de maniobras de remolcadores, más abajo)
// ---------------------------------------------------------------------------
function birdsSVG() {
  const bird = `<svg viewBox="0 0 24 12" xmlns="http://www.w3.org/2000/svg"><path d="M0 6 Q6 0 12 6 Q18 0 24 6" fill="none" stroke="rgba(255,255,255,0.65)" stroke-width="2" stroke-linecap="round"/></svg>`;
  return `
    <span class="bird bird-1">${bird}</span>
    <span class="bird bird-2">${bird}</span>
    <span class="bird bird-3">${bird}</span>
  `;
}

function buoyDecoSVG() {
  return `<svg viewBox="0 0 24 34" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2c4 0 6 4 6 9s-2 9-6 9-6-4-6-9 2-9 6-9z" fill="#E4001A"/>
    <path d="M6 14h12" stroke="#fff" stroke-width="3"/>
    <rect x="10" y="21" width="4" height="10" fill="#fff"/>
  </svg>`;
}

function buoysDecoSVG() {
  return `
    <span class="deco-buoy buoy-1">${buoyDecoSVG()}</span>
    <span class="deco-buoy buoy-2">${buoyDecoSVG()}</span>
  `;
}

// ---------------------------------------------------------------------------
// Remolcadores maniobrando de fondo: pequeñas escenas animadas que cruzan la
// pantalla en loop, cada una con el remolcador realizando un tipo distinto de
// maniobra (cobra/remolque, empuje, escolta) junto a un buque distinto.
// ---------------------------------------------------------------------------
function tugSilhouetteSVG() {
  return `<g>
    <rect x="0" y="16" width="34" height="4" rx="2" fill="#0a1216"/>
    <path d="M0 8 Q0 5 4 5 L26 5 Q32 5 32 10 L32 14 Q32 17 27 17 L5 17 Q0 17 0 14 Z" fill="#0B3559"/>
    <rect x="10" y="0" width="14" height="7" rx="2" fill="#F7B500"/>
    <rect x="12.3" y="1.6" width="3.6" height="3" fill="#fff"/>
    <rect x="17.5" y="1.6" width="3.6" height="3" fill="#fff"/>
    <rect x="17" y="-4" width="1.6" height="5" fill="#12181C"/>
  </g>`;
}

function targetShipSVG(kind) {
  if (kind === 'container') {
    return `<g>
      <path d="M0 22 L150 22 L142 30 L10 30 Z" fill="#0B3559"/>
      <rect x="10" y="8" width="18" height="14" fill="#E4001A"/>
      <rect x="30" y="8" width="18" height="14" fill="#D4A843"/>
      <rect x="50" y="8" width="18" height="14" fill="#3498DB"/>
      <rect x="70" y="8" width="18" height="14" fill="#2ECC71"/>
      <rect x="90" y="8" width="18" height="14" fill="#E4001A"/>
      <rect x="120" y="2" width="20" height="20" rx="2" fill="#fff"/>
    </g>`;
  }
  if (kind === 'cruise') {
    return `<g>
      <path d="M0 24 L160 24 L150 32 L12 32 Z" fill="#0B3559"/>
      <rect x="10" y="12" width="130" height="12" rx="2" fill="#fff"/>
      <rect x="24" y="2" width="90" height="11" rx="2" fill="#fff"/>
      <rect x="120" y="0" width="8" height="8" fill="#E4001A"/>
    </g>`;
  }
  // tanker / bulker (por defecto)
  return `<g>
    <path d="M0 24 Q0 18 10 18 L140 18 Q150 18 150 24 L150 26 Q150 30 142 30 L8 30 Q0 30 0 26 Z" fill="#5C6B73"/>
    <rect x="10" y="12" width="120" height="6" fill="#3A4750"/>
    <rect x="132" y="0" width="18" height="20" rx="2" fill="#fff"/>
  </g>`;
}

/** kind: 'tow' (cobra un buque con espía), 'push' (empuja de costado), 'escort' (navega junto a él). */
function tugManeuverSVG(kind) {
  const shipKind = kind === 'push' ? 'container' : kind === 'escort' ? 'cruise' : 'tanker';
  const ship = targetShipSVG(shipKind);

  if (kind === 'push') {
    return `<svg viewBox="0 0 260 40" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(46 8)">${tugSilhouetteSVG()}</g>
      <g transform="translate(76 -4)">${ship}</g>
    </svg>`;
  }
  if (kind === 'escort') {
    return `<svg viewBox="0 0 260 40" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(0 20)">${tugSilhouetteSVG()}</g>
      <g transform="translate(50 -6)">${ship}</g>
    </svg>`;
  }
  // tow: remolcador cobrando desde proa con línea de remolque punteada
  return `<svg viewBox="0 0 260 40" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(0 8)">${tugSilhouetteSVG()}</g>
    <path d="M34 20 L104 16" stroke="#33414a" stroke-width="1.2" stroke-dasharray="2 3"/>
    <g transform="translate(104 -2)">${ship}</g>
  </svg>`;
}

function tugManeuversBgSVG() {
  return `
    <div class="maneuver-scene scene-1">${tugManeuverSVG('tow')}</div>
    <div class="maneuver-scene scene-2">${tugManeuverSVG('push')}</div>
    <div class="maneuver-scene scene-3">${tugManeuverSVG('escort')}</div>
  `;
}

// ---------------------------------------------------------------------------
// Flota de avatares: cada jugador elige un tipo de buque como identidad visual
// ---------------------------------------------------------------------------
const MINI_WAVE = `<path d="M2 46 Q10 42 18 46 T34 46 T50 46 T66 46 T82 46 T98 46 T114 46 T118 46" fill="none" stroke="#9fd3ef" stroke-width="2.5" stroke-linecap="round" opacity="0.55"/>`;

function funnelSmoke(x, y) {
  return `<g transform="translate(${x} ${y})">
    <g class="funnel-smoke">
      <circle class="puff" cx="0" cy="0" r="3"/>
      <circle class="puff" cx="2.5" cy="-1.5" r="2.3"/>
      <circle class="puff" cx="-2" cy="-3" r="1.9"/>
    </g>
  </g>`;
}

function mastFlag(x, y, color) {
  return `<g transform="translate(${x} ${y})">
    <g class="mast-flag">
      <path d="M0 0 L11 2.5 L0 5 Z" fill="${color || '#E4001A'}"/>
    </g>
  </g>`;
}

const SHIP_AVATARS = {
  tug: {
    label: 'Remolcador',
    svg: `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">
      ${MINI_WAVE}
      <rect x="10" y="42" width="84" height="5" rx="2.5" fill="#12181C"/>
      <path d="M10 32 Q10 28 15 28 L88 28 Q96 28 96 34 L96 40 Q96 44 90 44 L16 44 Q10 44 10 40 Z" fill="#0B3559"/>
      <rect x="32" y="10" width="42" height="20" rx="3" fill="#F7B500"/>
      <rect x="37" y="15" width="10" height="8" rx="1.5" fill="#FFFFFF"/>
      <rect x="51" y="15" width="10" height="8" rx="1.5" fill="#FFFFFF"/>
      <rect x="65" y="15" width="7" height="10" rx="1.5" fill="#D99A00"/>
      <rect x="70" y="4" width="5" height="10" rx="1.5" fill="#E4001A"/>
      ${funnelSmoke(72, 2)}
      <rect x="46" y="2" width="2" height="10" fill="#12181C"/>
      <path d="M40 4 L54 4" stroke="#12181C" stroke-width="1.6" stroke-linecap="round"/>
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
      ${funnelSmoke(99, 8)}
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
      ${funnelSmoke(73, 2)}
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
      ${mastFlag(58, 4, '#D4A843')}
    </svg>`
  },
  cruise: {
    label: 'Crucero',
    svg: `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">
      ${MINI_WAVE}
      <path d="M4 42 Q4 32 16 32 L104 32 Q116 32 116 40 L116 42 Q116 48 108 48 L12 48 Q4 48 4 42 Z" fill="#0B3559"/>
      <rect x="16" y="22" width="88" height="12" rx="2" fill="#FFFFFF"/>
      <rect x="26" y="12" width="68" height="12" rx="2" fill="#FFFFFF"/>
      <rect x="40" y="4" width="40" height="10" rx="2" fill="#FFFFFF"/>
      <rect x="22" y="25" width="5" height="5" fill="#3498DB"/>
      <rect x="34" y="25" width="5" height="5" fill="#3498DB"/>
      <rect x="46" y="25" width="5" height="5" fill="#3498DB"/>
      <rect x="58" y="25" width="5" height="5" fill="#3498DB"/>
      <rect x="70" y="25" width="5" height="5" fill="#3498DB"/>
      <rect x="82" y="25" width="5" height="5" fill="#3498DB"/>
      <rect x="86" y="2" width="6" height="8" rx="1.5" fill="#E4001A"/>
      ${funnelSmoke(89, 3)}
      ${mastFlag(70, 3, '#D4A843')}
    </svg>`
  },
  fishing: {
    label: 'Pesquero',
    svg: `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">
      ${MINI_WAVE}
      <path d="M18 44 Q18 36 26 36 L82 36 Q90 36 90 42 L90 44 Q90 48 86 48 L22 48 Q18 48 18 44 Z" fill="#8A5A2B"/>
      <rect x="34" y="18" width="22" height="18" rx="2" fill="#FFFFFF"/>
      <rect x="39" y="23" width="6" height="6" fill="#124A7D"/>
      <path d="M56 20 L88 8" stroke="#5C6B73" stroke-width="3" stroke-linecap="round"/>
      <path d="M86 8 L96 18 L80 20 Z" fill="none" stroke="#D4A843" stroke-width="2"/>
      <rect x="60" y="10" width="4" height="10" fill="#E4001A"/>
      ${funnelSmoke(62, 8)}
    </svg>`
  },
  submarine: {
    label: 'Submarino',
    svg: `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">
      ${MINI_WAVE}
      <ellipse cx="58" cy="36" rx="46" ry="12" fill="#5C6B73"/>
      <rect x="50" y="16" width="16" height="18" rx="3" fill="#3A4750"/>
      <rect x="55" y="4" width="3" height="14" fill="#D4A843"/>
      <circle cx="30" cy="36" r="4" fill="#9fd3ef"/>
      <circle cx="44" cy="36" r="4" fill="#9fd3ef"/>
      <circle cx="72" cy="36" r="4" fill="#9fd3ef"/>
      <circle cx="86" cy="36" r="4" fill="#9fd3ef"/>
      <path d="M100 34 L112 30 L112 42 Z" fill="#3A4750"/>
    </svg>`
  },
  jetski: {
    label: 'Moto de agua',
    svg: `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">
      ${MINI_WAVE}
      <path d="M20 44 Q54 52 96 40 Q100 38 96 36 L34 32 Q20 32 18 40 Z" fill="#E4001A"/>
      <path d="M34 32 Q46 20 66 20 Q78 20 80 30 L80 34 Q64 30 50 32 Z" fill="#FFFFFF"/>
      <circle cx="62" cy="24" r="3.6" fill="#0B3559"/>
      <path d="M10 44 Q18 40 26 44" fill="none" stroke="#9fd3ef" stroke-width="3" stroke-linecap="round" opacity="0.7"/>
    </svg>`
  },
  kayak: {
    label: 'Kayak',
    svg: `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">
      ${MINI_WAVE}
      <path d="M14 42 Q60 34 106 42 Q60 48 14 42 Z" fill="#D4A843"/>
      <circle cx="58" cy="32" r="7" fill="#0B3559"/>
      <rect x="52" y="38" width="12" height="8" fill="#124A7D"/>
      <path d="M34 22 L82 34" stroke="#5C6B73" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M32 18 L40 24 L28 26 Z" fill="#E4001A"/>
      <path d="M84 30 L92 36 L80 38 Z" fill="#E4001A"/>
    </svg>`
  },
  icebreaker: {
    label: 'Rompehielos',
    svg: `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">
      ${MINI_WAVE}
      <path d="M10 44 L26 30 Q30 26 38 26 L96 26 Q106 26 106 36 L106 44 Q106 48 100 48 L16 48 Q10 48 10 44 Z" fill="#E4001A"/>
      <rect x="46" y="12" width="28" height="16" rx="2" fill="#FFFFFF"/>
      <rect x="51" y="16" width="6" height="6" fill="#124A7D"/>
      <rect x="63" y="16" width="6" height="6" fill="#124A7D"/>
      <rect x="86" y="4" width="7" height="14" rx="2" fill="#D4A843"/>
      ${funnelSmoke(89, 2)}
      <path d="M14 44 L20 38 L26 44 L32 38 L38 44" fill="none" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  },
  yacht: {
    label: 'Yate',
    svg: `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">
      ${MINI_WAVE}
      <path d="M16 42 Q16 34 26 34 L96 34 Q104 34 100 40 L96 44 Q60 50 24 44 Z" fill="#FFFFFF"/>
      <rect x="16" y="36" width="84" height="4" fill="#124A7D"/>
      <rect x="40" y="20" width="34" height="15" rx="3" fill="#0B3559"/>
      <rect x="46" y="24" width="8" height="7" rx="1" fill="#9fd3ef"/>
      <rect x="60" y="24" width="8" height="7" rx="1" fill="#9fd3ef"/>
      <rect x="76" y="10" width="2.4" height="24" fill="#5C6B73"/>
      ${mastFlag(78, 8, '#E4001A')}
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
