// ==========================================================================
// Marejada 2.0 — Iconos SVG & Flota de Buques Vectoriales de Alta Fidelidad
// Estilo Híbrido: SAAM Corporativo Premium + Arcade Náutico Táctil
// ==========================================================================

// Iconografía Náutica y de Navegación UI
const ICONS = {
  anchor: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="5" r="2.5" stroke-width="2"/>
    <path d="M12 7.5v13.5M5 13H2a10 10 0 0 0 20 0h-3M6 13a6 6 0 0 0 12 0" stroke-width="2"/>
  </svg>`,
  wheel: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="2.5"/>
    <path d="M12 3.5v5M12 15.5v5M3.5 12h5M15.5 12h5M6 6l3.5 3.5M14.5 14.5L18 18M18 6l-3.5 3.5M9.5 14.5L6 18"/>
  </svg>`,
  compass: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="9.5"/>
    <polygon points="16.5 7.5 13.5 13.5 7.5 16.5 10.5 10.5 16.5 7.5" fill="currentColor" fill-opacity="0.2"/>
  </svg>`,
  lighthouse: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M9 22h6M10 22V10l-1.5-6h7L14 10v12M7.5 4h9M2 11l4.5-1M22 11l-4.5-1M9 13.5h6"/>
    <circle cx="12" cy="7" r="1.5" fill="currentColor"/>
  </svg>`,
  sailboat: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M2.5 18.5h19l-2.5 3.5H5z"/><path d="M12 18.5V3l7.5 11z"/><path d="M7.5 18.5l3.5-14-3 5z"/>
  </svg>`,
  users: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>`,
  trophy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M7 21h10M12 17v4M6 4h12v5a6 6 0 0 1-12 0z"/><path d="M6 5H3.5a2.5 2.5 0 0 0 0 5H6M18 5h2.5a2.5 2.5 0 0 1 0 5H18"/>
  </svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>`,
  trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/>
  </svg>`,
  copy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>`,
  arrowUp: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>`,
  arrowDown: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>`,
  arrowRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`,
  download: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><path d="M12 15V3"/>
  </svg>`,
  chart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 3v18h18"/><rect x="7" y="12" width="3" height="6" rx="1"/><rect x="12" y="8" width="3" height="10" rx="1"/><rect x="17" y="5" width="3" height="13" rx="1"/>
  </svg>`,
  settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>`,
  play: `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3"/></svg>`,
  volumeOn: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
  </svg>`,
  volumeMute: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>
  </svg>`,
  medal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
  </svg>`,
  crown: `<svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M2 19h20v2H2zM2 6l5 6 5-8 5 8 5-6v11H2z"/>
  </svg>`,
  bolt: `<svg viewBox="0 0 24 24" fill="currentColor">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>`
};

// ---------------------------------------------------------------------------
// Logo de marca SAAM Marejada: Remolcador Estilizado de Alta Fidelidad
// ---------------------------------------------------------------------------
function tugLogoSVG() {
  return `<svg viewBox="0 0 44 28" xmlns="http://www.w3.org/2000/svg" class="saam-logo-svg">
    <defs>
      <linearGradient id="logoHull" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#164A78"/>
        <stop offset="100%" stop-color="#08233C"/>
      </linearGradient>
      <linearGradient id="logoCab" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FFD43F"/>
        <stop offset="100%" stop-color="#E59800"/>
      </linearGradient>
      <linearGradient id="logoRed" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FF384D"/>
        <stop offset="100%" stop-color="#B80014"/>
      </linearGradient>
    </defs>
    <!-- Estela de proa -->
    <path d="M2 22 Q12 19 22 22 T42 22" fill="none" stroke="#00D2FF" stroke-width="1.8" stroke-linecap="round" opacity="0.65"/>
    <!-- Casco -->
    <path d="M4 12 Q5 9 8 9 L34 9 Q38 9 39 13 L40 16 Q40 19 36 19 L7 19 Q4 19 4 15 Z" fill="url(#logoHull)"/>
    <!-- Quilla roja SAAM -->
    <path d="M5 17.5 L37 17.5 Q38 17.5 38 19 L6 19 Q5 19 5 17.5 Z" fill="url(#logoRed)"/>
    <!-- Defensa de proa de goma negra -->
    <rect x="3" y="10" width="3.5" height="8" rx="1.5" fill="#182026"/>
    <!-- Caseta amarilla -->
    <rect x="13" y="3" width="16" height="8" rx="2" fill="url(#logoCab)"/>
    <!-- Ventanas panorámicas de cristal -->
    <rect x="15.5" y="4.8" width="4.5" height="3.8" rx="0.8" fill="#E8F7FF"/>
    <rect x="22" y="4.8" width="4.5" height="3.8" rx="0.8" fill="#E8F7FF"/>
    <!-- Chimenea SAAM -->
    <rect x="29" y="1" width="3.2" height="7" rx="1" fill="url(#logoRed)"/>
    <rect x="29" y="2.5" width="3.2" height="1.8" fill="#FFFFFF"/>
    <!-- Mástil y antena -->
    <line x1="20" y1="3" x2="20" y2="0.5" stroke="#DCE8F2" stroke-width="1" stroke-linecap="round"/>
  </svg>`;
}

// ---------------------------------------------------------------------------
// Maniobras de remolcador de fondo (diagrama sutil decorativo)
// ---------------------------------------------------------------------------
function tugManeuversBgSVG() {
  return `
    <svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg" style="opacity:0.04">
      <!-- Trayectoria de escolta a popa -->
      <path d="M100,350 C100,250 200,200 300,200 C400,200 500,250 500,150"
            stroke="#00D2FF" stroke-width="2" fill="none" stroke-dasharray="8,6"/>
      <circle cx="100" cy="350" r="6" fill="#00D2FF"/>
      <circle cx="500" cy="150" r="6" fill="#00D2FF"/>
      <!-- Maniobra de giro asistido -->
      <path d="M450,380 Q350,300 350,200 Q350,100 250,80"
            stroke="#D4A843" stroke-width="1.5" fill="none" stroke-dasharray="6,8"/>
      <circle cx="450" cy="380" r="4" fill="#D4A843"/>
      <circle cx="250" cy="80" r="4" fill="#D4A843"/>
      <!-- Línea de remolque -->
      <path d="M80,100 L520,100" stroke="rgba(255,255,255,0.3)" stroke-width="1" stroke-dasharray="4,12"/>
      <!-- Balizas -->
      <circle cx="150" cy="100" r="3" fill="#E4001A" opacity="0.6"/>
      <circle cx="450" cy="100" r="3" fill="#10B981" opacity="0.6"/>
    </svg>`;
}

function wavesSVG() {
  return `<svg viewBox="0 0 1600 160" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="waveGradA" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#00D2FF" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#041225" stop-opacity="0.8"/>
      </linearGradient>
      <linearGradient id="waveGradB" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#E4001A" stop-opacity="0.25"/>
        <stop offset="100%" stop-color="#041225" stop-opacity="0.6"/>
      </linearGradient>
    </defs>
    <path d="M0,80 C320,130 520,30 800,80 C1080,130 1280,30 1600,80 L1600,160 L0,160 Z" fill="url(#waveGradA)"/>
    <path d="M0,100 C240,60 480,140 720,100 C960,60 1200,140 1600,100 L1600,160 L0,160 Z" fill="url(#waveGradB)"/>
  </svg>`;
}

// ---------------------------------------------------------------------------
// Elementos decorativos animados de fondo (boyas inteligentes con pulsos)
// ---------------------------------------------------------------------------
function buoyDecoSVG() {
  return `<svg viewBox="0 0 28 38" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="buoyRed" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FF4757"/>
        <stop offset="100%" stop-color="#A50014"/>
      </linearGradient>
    </defs>
    <!-- Linterna con luz parpadeante -->
    <circle cx="14" cy="5" r="3" fill="#FFEAA7"/>
    <circle cx="14" cy="5" r="5" fill="#FFEAA7" opacity="0.4"/>
    <!-- Torre cónica -->
    <path d="M11 7 L17 7 L19 20 L9 20 Z" fill="#2D3436"/>
    <!-- Franjas reflectantes -->
    <rect x="10.5" y="11" width="7" height="3" fill="#FFFFFF"/>
    <!-- Flotador principal -->
    <path d="M5 20 Q5 16 14 16 Q23 16 23 20 L22 28 Q14 31 6 28 Z" fill="url(#buoyRed)"/>
    <line x1="5" y1="23" x2="23" y2="23" stroke="#FFFFFF" stroke-width="2"/>
    <!-- Contrapeso -->
    <rect x="12.5" y="29" width="3" height="8" rx="1.5" fill="#1E272E"/>
  </svg>`;
}

function buoysDecoSVG() {
  return `
    <span class="deco-buoy buoy-1">${buoyDecoSVG()}</span>
    <span class="deco-buoy buoy-2">${buoyDecoSVG()}</span>
  `;
}

// ---------------------------------------------------------------------------
// FLOTA DE BUQUES VECTORIALES PREMIUM (10 Identidades Náuticas)
// Diseñados con gradientes esféricos, iluminación realista y proporciones estilizadas
// ---------------------------------------------------------------------------

const COMMON_DEFS = `
  <defs>
    <!-- Gradientes de Casco -->
    <linearGradient id="hullNavy" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1B4D7E"/>
      <stop offset="60%" stop-color="#0E2F52"/>
      <stop offset="100%" stop-color="#06172B"/>
    </linearGradient>
    <linearGradient id="hullRed" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FF384D"/>
      <stop offset="70%" stop-color="#C70017"/>
      <stop offset="100%" stop-color="#7A000E"/>
    </linearGradient>
    <linearGradient id="hullSteel" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#718093"/>
      <stop offset="70%" stop-color="#485460"/>
      <stop offset="100%" stop-color="#1E272E"/>
    </linearGradient>
    <linearGradient id="hullGold" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FCE182"/>
      <stop offset="50%" stop-color="#D4A843"/>
      <stop offset="100%" stop-color="#8E6716"/>
    </linearGradient>
    <linearGradient id="superWhite" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="85%" stop-color="#E4EBF0"/>
      <stop offset="100%" stop-color="#C5D2DB"/>
    </linearGradient>
    <linearGradient id="cabYellow" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFE053"/>
      <stop offset="75%" stop-color="#EAA600"/>
      <stop offset="100%" stop-color="#B27400"/>
    </linearGradient>
    <linearGradient id="glassCyan" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#B8F2FF"/>
      <stop offset="60%" stop-color="#48DBFB"/>
      <stop offset="100%" stop-color="#0ABDE3"/>
    </linearGradient>
    <linearGradient id="foamWake" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#00D2FF" stop-opacity="0.8"/>
      <stop offset="50%" stop-color="#FFFFFF" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#00D2FF" stop-opacity="0"/>
    </linearGradient>
  </defs>
`;

const MINI_WAVE = `
  <!-- Estela de agua dinámica -->
  <path d="M4 50 Q16 46 28 50 T52 50 T76 50 T100 50 T124 50 T136 50" fill="none" stroke="url(#foamWake)" stroke-width="3" stroke-linecap="round"/>
  <path d="M12 53 Q24 49 36 53 T60 53 T84 53 T108 53" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.6" stroke-linecap="round"/>
`;

const SHIP_AVATARS = {
  // 1. Remolcador SAAM (El héroe de la flota)
  tug: {
    label: 'Remolcador SAAM',
    category: 'Maniobras & Salvamento',
    svg: `<svg viewBox="0 0 140 68" xmlns="http://www.w3.org/2000/svg" class="ship-vector">
      ${COMMON_DEFS}
      ${MINI_WAVE}
      <!-- Casco Principal -->
      <path d="M14 36 Q15 28 22 28 L104 28 Q118 28 122 36 L124 44 Q124 50 114 50 L20 50 Q14 50 14 44 Z" fill="url(#hullNavy)"/>
      <!-- Quilla Roja de Protección -->
      <path d="M16 45 L121 45 Q122 47 116 50 L20 50 Q16 49 16 45 Z" fill="url(#hullRed)"/>
      <line x1="16" y1="44.5" x2="120" y2="44.5" stroke="#FFD700" stroke-width="1.2" opacity="0.8"/>
      <!-- Defensa de Proa (Pusher Fender de Goma Negra) -->
      <path d="M112 28 Q126 28 126 38 Q126 48 112 48" fill="none" stroke="#1B2228" stroke-width="7" stroke-linecap="round"/>
      <rect x="18" y="47" width="92" height="4.5" rx="2.2" fill="#182026" opacity="0.9"/>
      <!-- Caseta de Mando Amarilla SAAM -->
      <rect x="42" y="10" width="52" height="20" rx="4" fill="url(#cabYellow)"/>
      <!-- Visera del Puente -->
      <path d="M40 12 L96 12 L92 9 L44 9 Z" fill="#2C3A47"/>
      <!-- Ventanas Panorámicas de Puente -->
      <rect x="48" y="14" width="12" height="8" rx="1.5" fill="url(#glassCyan)"/>
      <rect x="63" y="14" width="12" height="8" rx="1.5" fill="url(#glassCyan)"/>
      <rect x="78" y="14" width="10" height="8" rx="1.5" fill="url(#glassCyan)"/>
      <!-- Reflejos en Ventanas -->
      <line x1="50" y1="15" x2="54" y2="21" stroke="#FFFFFF" stroke-width="1.2" opacity="0.75"/>
      <line x1="65" y1="15" x2="69" y2="21" stroke="#FFFFFF" stroke-width="1.2" opacity="0.75"/>
      <!-- Chimenea SAAM con Franja Blanca -->
      <rect x="86" y="2" width="8" height="12" rx="2" fill="url(#hullRed)"/>
      <rect x="86" y="5" width="8" height="3" fill="#FFFFFF"/>
      <!-- Luces de Navegación (Babor / Estribor) -->
      <circle cx="44" cy="18" r="2" fill="#00FF88"/>
      <circle cx="94" cy="18" r="2" fill="#FF3B4E"/>
      <!-- Radar y Mástil -->
      <line x1="58" y1="10" x2="58" y2="2" stroke="#E4EBF0" stroke-width="2"/>
      <ellipse cx="58" cy="2" rx="5" ry="1.8" fill="#F5F6FA"/>
    </svg>`
  },

  // 2. Portacontenedores
  container: {
    label: 'Portacontenedores',
    category: 'Carga Comercial',
    svg: `<svg viewBox="0 0 140 68" xmlns="http://www.w3.org/2000/svg" class="ship-vector">
      ${COMMON_DEFS}
      ${MINI_WAVE}
      <!-- Casco Largo con Bulbo de Proa -->
      <path d="M8 40 L130 40 L120 50 L18 50 Z" fill="url(#hullNavy)"/>
      <path d="M12 47 L124 47 L120 50 L18 50 Z" fill="url(#hullRed)"/>
      <!-- Bloques de Contenedores Apilados en 3D -->
      <!-- Fila Inferior -->
      <rect x="18" y="26" width="18" height="14" rx="1.2" fill="#E4001A"/>
      <rect x="38" y="26" width="18" height="14" rx="1.2" fill="#D4A843"/>
      <rect x="58" y="26" width="18" height="14" rx="1.2" fill="#2E86DE"/>
      <rect x="78" y="26" width="18" height="14" rx="1.2" fill="#10AC84"/>
      <!-- Fila Media -->
      <rect x="18" y="14" width="18" height="11" rx="1.2" fill="#D4A843"/>
      <rect x="38" y="14" width="18" height="11" rx="1.2" fill="#2E86DE"/>
      <rect x="58" y="14" width="18" height="11" rx="1.2" fill="#10AC84"/>
      <rect x="78" y="14" width="18" height="11" rx="1.2" fill="#E4001A"/>
      <!-- Fila Superior -->
      <rect x="38" y="5" width="18" height="8" rx="1.2" fill="#E4001A"/>
      <rect x="58" y="5" width="18" height="8" rx="1.2" fill="#D4A843"/>
      <!-- Ranuras de Contenedores -->
      <line x1="27" y1="26" x2="27" y2="40" stroke="#000" stroke-width="0.8" opacity="0.3"/>
      <line x1="47" y1="26" x2="47" y2="40" stroke="#000" stroke-width="0.8" opacity="0.3"/>
      <line x1="67" y1="26" x2="67" y2="40" stroke="#000" stroke-width="0.8" opacity="0.3"/>
      <!-- Torre de Control y Alojamiento Popa -->
      <rect x="100" y="16" width="20" height="24" rx="2" fill="url(#superWhite)"/>
      <rect x="104" y="20" width="12" height="4" rx="1" fill="url(#glassCyan)"/>
      <rect x="104" y="26" width="12" height="4" rx="1" fill="url(#glassCyan)"/>
      <!-- Chimenea Popa -->
      <rect x="114" y="8" width="5" height="10" rx="1" fill="url(#hullRed)"/>
    </svg>`
  },

  // 3. Petrolero / Tanquero
  tanker: {
    label: 'Petrolero',
    category: 'Granel Líquido',
    svg: `<svg viewBox="0 0 140 68" xmlns="http://www.w3.org/2000/svg" class="ship-vector">
      ${COMMON_DEFS}
      ${MINI_WAVE}
      <!-- Casco Pesado y Quilla -->
      <path d="M10 40 Q10 32 24 32 L116 32 Q128 32 128 40 L128 44 Q128 50 118 50 L20 50 Q10 50 10 44 Z" fill="url(#hullSteel)"/>
      <path d="M14 46 L124 46 Q125 48 118 50 L20 50 Q14 49 14 46 Z" fill="url(#hullRed)"/>
      <!-- Tuberías y Manifolds de Cubierta -->
      <rect x="24" y="27" width="80" height="6" rx="1.5" fill="#2F3640"/>
      <line x1="24" y1="30" x2="104" y2="30" stroke="#D4A843" stroke-width="2"/>
      <!-- Domos de Tanques -->
      <ellipse cx="40" cy="27" rx="6" ry="3" fill="url(#hullGold)"/>
      <ellipse cx="60" cy="27" rx="6" ry="3" fill="url(#hullGold)"/>
      <ellipse cx="80" cy="27" rx="6" ry="3" fill="url(#hullGold)"/>
      <ellipse cx="98" cy="27" rx="6" ry="3" fill="url(#hullGold)"/>
      <!-- Superestructura Popa -->
      <rect x="106" y="14" width="20" height="20" rx="2" fill="url(#superWhite)"/>
      <rect x="110" y="17" width="12" height="4" rx="1" fill="url(#glassCyan)"/>
      <rect x="110" y="23" width="12" height="4" rx="1" fill="url(#glassCyan)"/>
      <rect x="116" y="6" width="6" height="10" rx="1" fill="url(#hullRed)"/>
    </svg>`
  },

  // 4. Crucero Oceánico de Lujo
  cruise: {
    label: 'Crucero Oceánico',
    category: 'Pasajeros de Lujo',
    svg: `<svg viewBox="0 0 140 68" xmlns="http://www.w3.org/2000/svg" class="ship-vector">
      ${COMMON_DEFS}
      ${MINI_WAVE}
      <!-- Casco Aerodinámico Azul Marino -->
      <path d="M6 42 Q8 32 20 32 L120 32 Q132 32 132 40 L132 44 Q132 50 122 50 L14 50 Q6 50 6 42 Z" fill="url(#hullNavy)"/>
      <line x1="12" y1="44" x2="128" y2="44" stroke="#00D2FF" stroke-width="1.4"/>
      <!-- Cubiertas de Pasajeros Escalonadas -->
      <path d="M18 24 L122 24 Q126 24 126 28 L126 32 L18 32 Z" fill="url(#superWhite)"/>
      <path d="M28 15 L116 15 Q120 15 120 20 L120 24 L28 24 Z" fill="url(#superWhite)"/>
      <path d="M42 8 L104 8 Q108 8 108 12 L108 15 L42 15 Z" fill="url(#superWhite)"/>
      <!-- Hileras de Camarotes con Cristales Azules -->
      <rect x="24" y="26" width="94" height="4" rx="1" fill="url(#glassCyan)"/>
      <rect x="34" y="17" width="76" height="4" rx="1" fill="url(#glassCyan)"/>
      <rect x="46" y="10" width="54" height="3.5" rx="1" fill="url(#glassCyan)"/>
      <!-- Chimeneas Gemelas Aerodinámicas -->
      <path d="M96 2 L104 2 L101 8 L94 8 Z" fill="url(#hullRed)"/>
      <path d="M106 2 L114 2 L111 8 L104 8 Z" fill="url(#hullGold)"/>
    </svg>`
  },

  // 5. Velero de Competición
  sailboat: {
    label: 'Velero de Regata',
    category: 'Vela Deportiva',
    svg: `<svg viewBox="0 0 140 68" xmlns="http://www.w3.org/2000/svg" class="ship-vector">
      ${COMMON_DEFS}
      ${MINI_WAVE}
      <!-- Casco de Carbono Aerodinámico -->
      <path d="M26 44 Q70 54 116 42 L110 49 Q70 56 32 48 Z" fill="url(#hullNavy)"/>
      <line x1="30" y1="46" x2="112" y2="44" stroke="#D4A843" stroke-width="1.8"/>
      <!-- Mástil -->
      <rect x="68" y="4" width="3" height="42" rx="1" fill="#718093"/>
      <!-- Vela Mayor (Blanca con Franja Roja SAAM) -->
      <path d="M72 6 L72 40 L108 40 Z" fill="url(#superWhite)"/>
      <path d="M72 18 L100 40 L72 40 Z" fill="url(#hullRed)" opacity="0.9"/>
      <!-- Génova / Foque de Proa -->
      <path d="M67 10 L67 40 L38 40 Z" fill="url(#superWhite)"/>
      <path d="M67 22 L48 40 L67 40 Z" fill="url(#hullGold)" opacity="0.9"/>
      <!-- Grímpola en tope de mástil -->
      <polygon points="68,2 80,4 68,6" fill="#FF384D"/>
    </svg>`
  },

  // 6. Ferry Costero
  ferry: {
    label: 'Ferry Costero',
    category: 'Transporte Interurbano',
    svg: `<svg viewBox="0 0 140 68" xmlns="http://www.w3.org/2000/svg" class="ship-vector">
      ${COMMON_DEFS}
      ${MINI_WAVE}
      <!-- Casco Bicolor Rojo & Blanco -->
      <path d="M12 42 Q14 34 26 34 L114 34 Q126 34 126 42 L126 46 Q126 50 118 50 L20 50 Q12 50 12 46 Z" fill="url(#hullRed)"/>
      <!-- Cubierta de Salón Panorámico -->
      <rect x="22" y="20" width="94" height="15" rx="3" fill="url(#superWhite)"/>
      <!-- Ventanales de Pasajeros -->
      <rect x="28" y="23" width="10" height="7" rx="1.5" fill="url(#glassCyan)"/>
      <rect x="42" y="23" width="10" height="7" rx="1.5" fill="url(#glassCyan)"/>
      <rect x="56" y="23" width="10" height="7" rx="1.5" fill="url(#glassCyan)"/>
      <rect x="70" y="23" width="10" height="7" rx="1.5" fill="url(#glassCyan)"/>
      <rect x="84" y="23" width="10" height="7" rx="1.5" fill="url(#glassCyan)"/>
      <rect x="98" y="23" width="10" height="7" rx="1.5" fill="url(#glassCyan)"/>
      <!-- Puente Superior -->
      <rect x="48" y="10" width="36" height="11" rx="2" fill="url(#hullNavy)"/>
      <rect x="54" y="13" width="24" height="4.5" rx="1" fill="url(#glassCyan)"/>
      <!-- Chimeneas -->
      <rect x="88" y="6" width="6" height="15" rx="1" fill="url(#hullGold)"/>
    </svg>`
  },

  // 7. Pesquero de Alta Mar
  fishing: {
    label: 'Pesquero de Alta Mar',
    category: 'Flota Pesquera',
    svg: `<svg viewBox="0 0 140 68" xmlns="http://www.w3.org/2000/svg" class="ship-vector">
      ${COMMON_DEFS}
      ${MINI_WAVE}
      <!-- Casco Rústico Robusto -->
      <path d="M16 42 Q18 32 28 32 L106 32 Q116 32 116 40 L116 46 Q116 50 110 50 L24 50 Q16 50 16 46 Z" fill="url(#hullSteel)"/>
      <line x1="20" y1="45" x2="112" y2="45" stroke="#FFD700" stroke-width="1.4"/>
      <!-- Caseta Proa -->
      <rect x="36" y="18" width="30" height="16" rx="2" fill="url(#superWhite)"/>
      <rect x="42" y="22" width="8" height="6" rx="1" fill="url(#glassCyan)"/>
      <rect x="54" y="22" width="8" height="6" rx="1" fill="url(#glassCyan)"/>
      <!-- Pluma y Grúas de Pesca en Popa -->
      <line x1="72" y1="32" x2="108" y2="10" stroke="#E4EBF0" stroke-width="3" stroke-linecap="round"/>
      <line x1="108" y1="10" x2="114" y2="28" stroke="#D4A843" stroke-width="1.8" stroke-dasharray="3 2"/>
      <polygon points="106,8 116,10 112,18" fill="none" stroke="#E4001A" stroke-width="2"/>
      <rect x="62" y="10" width="5" height="10" rx="1" fill="url(#hullRed)"/>
    </svg>`
  },

  // 8. Submarino de Exploración
  submarine: {
    label: 'Submarino Científico',
    category: 'Exploración Submarina',
    svg: `<svg viewBox="0 0 140 68" xmlns="http://www.w3.org/2000/svg" class="ship-vector">
      ${COMMON_DEFS}
      ${MINI_WAVE}
      <!-- Casco Hidrodinámico Cilíndrico -->
      <ellipse cx="68" cy="40" rx="54" ry="13" fill="url(#hullSteel)"/>
      <!-- Vela / Torre de Mando -->
      <rect x="58" y="18" width="20" height="18" rx="4" fill="url(#hullNavy)"/>
      <!-- Periscopio y Snorkel -->
      <line x1="65" y1="18" x2="65" y2="6" stroke="#DCE8F2" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="72" y1="18" x2="72" y2="8" stroke="#D4A843" stroke-width="2" stroke-linecap="round"/>
      <circle cx="65" cy="5" r="2" fill="#00FF88"/>
      <!-- Ojos de Buey Bioluminiscentes -->
      <circle cx="34" cy="40" r="4.5" fill="url(#glassCyan)"/>
      <circle cx="50" cy="40" r="4.5" fill="url(#glassCyan)"/>
      <circle cx="86" cy="40" r="4.5" fill="url(#glassCyan)"/>
      <circle cx="102" cy="40" r="4.5" fill="url(#glassCyan)"/>
      <!-- Hélice Propulsora -->
      <path d="M120 37 L132 32 L132 48 Z" fill="#2C3A47"/>
    </svg>`
  },

  // 9. Moto de Agua / Jet Ski Racing
  jetski: {
    label: 'Moto Acuática',
    category: 'Velocidad Ligera',
    svg: `<svg viewBox="0 0 140 68" xmlns="http://www.w3.org/2000/svg" class="ship-vector">
      ${COMMON_DEFS}
      ${MINI_WAVE}
      <!-- Casco Angular Ultrarrápido -->
      <path d="M22 46 Q64 54 114 40 Q120 38 114 35 L44 32 Q24 32 20 42 Z" fill="url(#hullRed)"/>
      <!-- Carenado y Asiento -->
      <path d="M44 32 Q58 20 80 20 Q94 20 96 30 L96 34 Q76 30 60 32 Z" fill="url(#superWhite)"/>
      <!-- Manillar y Piloto -->
      <circle cx="74" cy="22" r="4" fill="#08233C"/>
      <rect x="68" y="24" width="16" height="8" rx="2" fill="url(#hullGold)"/>
      <!-- Chorro Hidropropulsor -->
      <path d="M10 46 Q20 38 30 46" fill="none" stroke="#00D2FF" stroke-width="3.5" stroke-linecap="round"/>
    </svg>`
  },

  // 10. Lancha de Prácticos / Piloto de Puerto
  pilot: {
    label: 'Lancha de Prácticos',
    category: 'Asistencia Portuaria',
    svg: `<svg viewBox="0 0 140 68" xmlns="http://www.w3.org/2000/svg" class="ship-vector">
      ${COMMON_DEFS}
      ${MINI_WAVE}
      <!-- Casco Naranja de Alta Visibilidad -->
      <path d="M14 42 Q16 32 26 32 L112 32 Q124 32 124 40 L124 44 Q124 50 114 50 L22 50 Q14 50 14 44 Z" fill="url(#hullGold)"/>
      <path d="M16 46 L118 46 L114 50 L22 50 Z" fill="url(#hullNavy)"/>
      <!-- Cabina Central -->
      <rect x="42" y="16" width="46" height="18" rx="3" fill="url(#superWhite)"/>
      <rect x="48" y="20" width="14" height="7" rx="1.5" fill="url(#glassCyan)"/>
      <rect x="68" y="20" width="14" height="7" rx="1.5" fill="url(#glassCyan)"/>
      <!-- Luces de Trabajo y Radar -->
      <line x1="65" y1="16" x2="65" y2="6" stroke="#1E272E" stroke-width="2"/>
      <ellipse cx="65" cy="6" rx="6" ry="2" fill="#E4001A"/>
      <!-- Letrero PILOT -->
      <text x="56" y="42" fill="#041225" font-size="6.5" font-weight="900" font-family="sans-serif">PILOTO</text>
    </svg>`
  }
};

function shipAvatarSVG(key) {
  const entry = SHIP_AVATARS[key] || SHIP_AVATARS.tug;
  return entry.svg;
}

// ---------------------------------------------------------------------------
// Mascota Capitán Náutico SAAM (Para Certificados y Celebración)
// ---------------------------------------------------------------------------
function captainMascotSVG() {
  return `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" class="captain-mascot-svg">
    <defs>
      <linearGradient id="capGold" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FFE053"/>
        <stop offset="100%" stop-color="#C58900"/>
      </linearGradient>
      <linearGradient id="capNavy" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#164A78"/>
        <stop offset="100%" stop-color="#08233C"/>
      </linearGradient>
    </defs>
    <!-- Corona de Laureles Dorados -->
    <circle cx="60" cy="60" r="54" fill="none" stroke="url(#capGold)" stroke-width="3" stroke-dasharray="6 3"/>
    <!-- Círculo Interior -->
    <circle cx="60" cy="60" r="48" fill="url(#capNavy)"/>
    <!-- Timón y Ancla de Honor -->
    <circle cx="60" cy="60" r="28" fill="none" stroke="#FFFFFF" stroke-width="3"/>
    <circle cx="60" cy="60" r="8" fill="url(#capGold)"/>
    <!-- Rayos del Timón -->
    <line x1="60" y1="26" x2="60" y2="94" stroke="#FFFFFF" stroke-width="3"/>
    <line x1="26" y1="60" x2="94" y2="60" stroke="#FFFFFF" stroke-width="3"/>
    <line x1="36" y1="36" x2="84" y2="84" stroke="#FFFFFF" stroke-width="2.5"/>
    <line x1="84" y1="36" x2="36" y2="84" stroke="#FFFFFF" stroke-width="2.5"/>
    <!-- Estrella Náutica Central -->
    <polygon points="60,48 63,57 72,60 63,63 60,72 57,63 48,60 57,57" fill="#FFF2A1"/>
  </svg>`;
}

// Exportación universal para navegador y entornos de testing
if (typeof window !== 'undefined') {
  window.ICONS = ICONS;
  window.SHIP_AVATARS = SHIP_AVATARS;
  window.shipAvatarSVG = shipAvatarSVG;
  window.tugLogoSVG = tugLogoSVG;
  window.captainMascotSVG = captainMascotSVG;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ICONS, SHIP_AVATARS, shipAvatarSVG, tugLogoSVG, captainMascotSVG };
}
