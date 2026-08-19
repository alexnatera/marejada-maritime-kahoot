// js/regatta.js
// ==========================================================================
// Marejada 2.0 — Motor de Regata Naval en Vivo 2.0 (RegattaEngine)
// Pista de carreras marina interactiva con carriles animados, estelas de espuma,
// adelantamientos fluidos, badges de líder y remontada, nitro y modo proyector.
// ==========================================================================

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.RegattaEngine = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Configuración por defecto
  const DEFAULT_OPTIONS = {
    viewMode: 'top8',            // 'top5' | 'top8' | 'all' | 'custom'
    maxDisplay: 8,               // Límite de barcos a mostrar (null o Infinity para todos)
    showDistanceMarkers: true,   // Muestra la escala de millas náuticas (0 - 10 nm)
    maxDistanceNm: 10.0,         // Distancia total de la regata en millas náuticas
    targetScore: null,           // Puntaje objetivo (si null, se calcula con Math.max(...score))
    streakThreshold: 2,          // Racha mínima para activar nitro / fuego turbo
    highlightComeback: true,     // Destacar "Mayor Remontada / Remolque"
    highlightLeader: true,       // Destacar "Líder de Flota" (#1)
    projectorMode: false,        // Escala ampliada para pantallas gigantes / proyectores
    animate: true,               // Transiciones CSS y animaciones activadas
    transitionDuration: 1200,    // Duración de la animación de adelantamiento en ms
    title: 'Regata Naval en Vivo',
    subtitle: 'Posiciones y Maniobras en Tiempo Real',
    soundEffects: true
  };

  // SVGs autónomos de respaldo para los 12 tipos de buques
  const MINI_WAVE = `<path d="M2 46 Q10 42 18 46 T34 46 T50 46 T66 46 T82 46 T98 46 T114 46 T118 46" fill="none" stroke="#9fd3ef" stroke-width="2.5" stroke-linecap="round" opacity="0.55"/>`;
  const FALLBACK_SHIPS = {
    tug: `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">${MINI_WAVE}<rect x="10" y="42" width="84" height="5" rx="2.5" fill="#12181C"/><path d="M10 32 Q10 28 15 28 L88 28 Q96 28 96 34 L96 40 Q96 44 90 44 L16 44 Q10 44 10 40 Z" fill="#0B3559"/><rect x="32" y="10" width="42" height="20" rx="3" fill="#F7B500"/><rect x="37" y="15" width="10" height="8" rx="1.5" fill="#FFFFFF"/><rect x="51" y="15" width="10" height="8" rx="1.5" fill="#FFFFFF"/><rect x="65" y="15" width="7" height="10" rx="1.5" fill="#D99A00"/><rect x="70" y="4" width="5" height="10" rx="1.5" fill="#E4001A"/><rect x="46" y="2" width="2" height="10" fill="#12181C"/><path d="M40 4 L54 4" stroke="#12181C" stroke-width="1.6" stroke-linecap="round"/></svg>`,
    container: `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">${MINI_WAVE}<path d="M6 40 L112 40 L104 48 L14 48 Z" fill="#0B3559"/><rect x="14" y="22" width="16" height="14" fill="#E4001A"/><rect x="32" y="22" width="16" height="14" fill="#D4A843"/><rect x="50" y="22" width="16" height="14" fill="#3498DB"/><rect x="68" y="22" width="16" height="14" fill="#2ECC71"/><rect x="14" y="10" width="16" height="10" fill="#D4A843"/><rect x="32" y="10" width="16" height="10" fill="#E4001A"/><rect x="50" y="10" width="16" height="10" fill="#2ECC71"/><rect x="90" y="16" width="16" height="24" rx="2" fill="#FFFFFF"/></svg>`,
    tanker: `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">${MINI_WAVE}<path d="M8 40 Q8 30 20 30 L98 30 Q108 30 108 38 L108 40 Q108 46 100 46 L16 46 Q8 46 8 40 Z" fill="#3A4750"/><rect x="20" y="24" width="72" height="8" fill="#5C6B73"/><circle cx="36" cy="22" r="5" fill="#D4A843"/><circle cx="52" cy="22" r="5" fill="#D4A843"/><circle cx="68" cy="22" r="5" fill="#D4A843"/><rect x="90" y="10" width="18" height="20" rx="2" fill="#FFFFFF"/></svg>`,
    ferry: `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">${MINI_WAVE}<path d="M10 44 Q10 34 22 34 L98 34 Q110 34 110 42 L110 44 Q110 48 104 48 L16 48 Q10 48 10 44 Z" fill="#E4001A"/><rect x="18" y="20" width="84" height="16" rx="2" fill="#FFFFFF"/><rect x="40" y="8" width="24" height="12" rx="2" fill="#0B3559"/><rect x="70" y="4" width="6" height="16" fill="#D4A843"/></svg>`,
    sailboat: `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">${MINI_WAVE}<path d="M22 44 Q60 54 98 44 L92 48 Q60 56 28 48 Z" fill="#0B3559"/><rect x="58" y="6" width="3" height="40" fill="#5C6B73"/><path d="M61 8 L61 40 L88 40 Z" fill="#FFFFFF"/><path d="M58 14 L58 40 L36 40 Z" fill="#E4001A"/></svg>`,
    cruise: `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">${MINI_WAVE}<path d="M4 42 Q4 32 16 32 L104 32 Q116 32 116 40 L116 42 Q116 48 108 48 L12 48 Q4 48 4 42 Z" fill="#0B3559"/><rect x="16" y="22" width="88" height="12" rx="2" fill="#FFFFFF"/><rect x="26" y="12" width="68" height="12" rx="2" fill="#FFFFFF"/><rect x="40" y="4" width="40" height="10" rx="2" fill="#FFFFFF"/><rect x="86" y="2" width="6" height="8" rx="1.5" fill="#E4001A"/></svg>`,
    fishing: `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">${MINI_WAVE}<path d="M18 44 Q18 36 26 36 L82 36 Q90 36 90 42 L90 44 Q90 48 86 48 L22 48 Q18 48 18 44 Z" fill="#8A5A2B"/><rect x="34" y="18" width="22" height="18" rx="2" fill="#FFFFFF"/><path d="M56 20 L88 8" stroke="#5C6B73" stroke-width="3" stroke-linecap="round"/><rect x="60" y="10" width="4" height="10" fill="#E4001A"/></svg>`,
    submarine: `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">${MINI_WAVE}<ellipse cx="58" cy="36" rx="46" ry="12" fill="#5C6B73"/><rect x="50" y="16" width="16" height="18" rx="3" fill="#3A4750"/><rect x="55" y="4" width="3" height="14" fill="#D4A843"/><circle cx="30" cy="36" r="4" fill="#9fd3ef"/><circle cx="44" cy="36" r="4" fill="#9fd3ef"/><circle cx="72" cy="36" r="4" fill="#9fd3ef"/></svg>`,
    jetski: `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">${MINI_WAVE}<path d="M20 44 Q54 52 96 40 Q100 38 96 36 L34 32 Q20 32 18 40 Z" fill="#E4001A"/><path d="M34 32 Q46 20 66 20 Q78 20 80 30 L80 34 Q64 30 50 32 Z" fill="#FFFFFF"/><circle cx="62" cy="24" r="3.6" fill="#0B3559"/></svg>`,
    kayak: `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">${MINI_WAVE}<path d="M14 42 Q60 34 106 42 Q60 48 14 42 Z" fill="#D4A843"/><circle cx="58" cy="32" r="7" fill="#0B3559"/><path d="M34 22 L82 34" stroke="#5C6B73" stroke-width="2.6" stroke-linecap="round"/></svg>`,
    icebreaker: `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">${MINI_WAVE}<path d="M10 44 L26 30 Q30 26 38 26 L96 26 Q106 26 106 36 L106 44 Q106 48 100 48 L16 48 Q10 48 10 44 Z" fill="#E4001A"/><rect x="46" y="12" width="28" height="16" rx="2" fill="#FFFFFF"/><rect x="86" y="4" width="7" height="14" rx="2" fill="#D4A843"/></svg>`,
    yacht: `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">${MINI_WAVE}<path d="M16 42 Q16 34 26 34 L96 34 Q104 34 100 40 L96 44 Q60 50 24 44 Z" fill="#FFFFFF"/><rect x="40" y="20" width="34" height="15" rx="3" fill="#0B3559"/><rect x="76" y="10" width="2.4" height="24" fill="#5C6B73"/></svg>`
  };

  // SVGs de boya y trofeos
  function buoyFinishSVG() {
    return `<svg viewBox="0 0 24 34" xmlns="http://www.w3.org/2000/svg" class="regatta-buoy-finish">
      <path d="M12 2c4 0 6 4 6 9s-2 9-6 9-6-4-6-9 2-9 6-9z" fill="#E4001A"/>
      <path d="M6 14h12" stroke="#ffffff" stroke-width="3"/>
      <rect x="10" y="21" width="4" height="10" fill="#ffffff"/>
      <circle cx="12" cy="7" r="2.5" fill="#FFF2A1"/>
    </svg>`;
  }

  function crownLeaderSVG() {
    return `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/></svg>`;
  }

  function rocketComebackSVG() {
    return `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M13.13 2.18c-1.39-.75-3.09.05-3.52 1.57l-.37 1.34c-1.89.87-3.53 2.21-4.75 3.89L2.83 8.35a1.25 1.25 0 0 0-1.57 1.57l.63 2.23c-1.12 1.6-1.78 3.53-1.87 5.56l2.12-.6a10.02 10.02 0 0 1 1.77-3.66l2.39.67c1.35 1.52 3.09 2.67 5.06 3.32l.37 1.34c.43 1.52 2.13 2.32 3.52 1.57l6.63-3.61a2 2 0 0 0 .97-1.3l1.13-5.27a2 2 0 0 0-.46-1.7l-4.77-4.77a2 2 0 0 0-1.7-.46l-5.27 1.13a2 2 0 0 0-1.3.97l-2.22 4.07z"/></svg>`;
  }

  function turboFlameSVG() {
    return `<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M12 23c4.97 0 9-3.8 9-8.5 0-3.56-2.3-6.49-4.83-8.86-1.12-1.05-2.32-2.02-3.32-3.14-.38-.43-1.02-.43-1.4 0-.96 1.07-2.11 2-3.18 3.01C5.78 7.87 3 10.87 3 14.5 3 19.2 7.03 23 12 23zm-1-6.5c-.83 0-1.5-.67-1.5-1.5 0-1.13.91-2.14 1.83-3.12.3-.32.61-.64.91-.97.24-.26.66-.26.9 0 .86.93 1.86 1.95 1.86 3.09 0 1.38-1.12 2.5-2.5 2.5h-1.5z"/></svg>`;
  }

  function escapeHtml(str) {
    return String(str ?? '').replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  const ADJECTIVES = [
    'Intrépido', 'Salvaje', 'Legendario', 'Atrevido', 'Veloz', 'Temerario', 'Majestuoso', 'Pícaro',
    'Feroz', 'Glorioso', 'Aventurero', 'Indomable', 'Audaz', 'Trueno', 'Relámpago', 'Fantasma',
    'Invencible', 'Bribón', 'Zarpado', 'Chiflado', 'Bandido', 'Rebelde', 'Descarado', 'Colosal'
  ];

  function getShipTitle(player) {
    if (typeof root.shipTitle === 'function') {
      return root.shipTitle(player);
    }
    const avatar = (player && player.avatar) || 'tug';
    const baseNames = {
      tug: 'Remolcador', container: 'Portacontenedores', tanker: 'Petrolero',
      ferry: 'Ferry', sailboat: 'Velero', cruise: 'Crucero',
      fishing: 'Pesquero', submarine: 'Submarino', jetski: 'Moto de agua',
      kayak: 'Kayak', icebreaker: 'Rompehielos', yacht: 'Yate'
    };
    const base = baseNames[avatar] || 'Buque';
    const idStr = String((player && (player.id ?? player.name)) || '0');
    let hash = 0;
    for (let i = 0; i < idStr.length; i++) hash = (hash * 31 + idStr.charCodeAt(i)) >>> 0;
    const adj = ADJECTIVES[hash % ADJECTIVES.length];
    return `${base} "${adj}"`;
  }

  function getShipSvg(avatarKey) {
    const key = avatarKey || 'tug';
    if (typeof root.shipAvatarSVG === 'function') {
      return root.shipAvatarSVG(key);
    }
    if (root.SHIP_AVATARS && root.SHIP_AVATARS[key] && root.SHIP_AVATARS[key].svg) {
      return root.SHIP_AVATARS[key].svg;
    }
    return FALLBACK_SHIPS[key] || FALLBACK_SHIPS.tug;
  }

  // -------------------------------------------------------------------------
  // Cálculo y Clasificación de la Flota (Ranks, Deltas y Remontadas)
  // -------------------------------------------------------------------------
  function calculateRanks(players, prevRanks, options) {
    const opts = Object.assign({}, DEFAULT_OPTIONS, options);
    if (!Array.isArray(players)) return { rankedPlayers: [], leader: null, comebackPlayer: null, maxScore: 1, totalFleet: 0 };

    let prevRankMap = new Map();
    if (prevRanks instanceof Map) {
      prevRankMap = prevRanks;
    } else if (Array.isArray(prevRanks)) {
      const sortedPrev = [...prevRanks].sort((a, b) => (b.score || 0) - (a.score || 0));
      sortedPrev.forEach((p, idx) => {
        if (p && p.id != null) prevRankMap.set(String(p.id), idx + 1);
      });
    } else if (prevRanks && typeof prevRanks === 'object') {
      Object.keys(prevRanks).forEach(k => {
        prevRankMap.set(String(k), Number(prevRanks[k]));
      });
    }

    const sorted = [...players].sort((a, b) => {
      const scoreDiff = (b.score || 0) - (a.score || 0);
      if (scoreDiff !== 0) return scoreDiff;
      const streakDiff = (b.streak || 0) - (a.streak || 0);
      if (streakDiff !== 0) return streakDiff;
      return String(a.name || '').localeCompare(String(b.name || ''));
    });

    const maxScore = opts.targetScore || Math.max(...sorted.map(p => p.score || 0), 1);
    let bestDelta = 0;
    let comebackPlayerId = null;

    const rankedPlayers = sorted.map((p, index) => {
      const currentRank = index + 1;
      const idStr = String(p.id ?? index);
      const prevRank = prevRankMap.has(idStr) ? prevRankMap.get(idStr) : null;
      
      const rankDelta = prevRank !== null ? (prevRank - currentRank) : 0;
      const isOvertaking = rankDelta > 0;
      const isLeader = currentRank === 1 && (p.score || 0) > 0;
      const hasNitro = (p.streak || 0) >= opts.streakThreshold;

      if (rankDelta > bestDelta) {
        bestDelta = rankDelta;
        comebackPlayerId = idStr;
      }

      const rawPct = (p.score || 0) / maxScore;
      const progressPct = Math.min(90, Math.max(4, 4 + rawPct * 86));
      const distanceNm = (rawPct * opts.maxDistanceNm).toFixed(1);

      return {
        ...p,
        id: idStr,
        currentRank,
        prevRank,
        rankDelta,
        isOvertaking,
        isLeader,
        hasNitro,
        progressPct,
        distanceNm,
        shipTitle: getShipTitle(p)
      };
    });

    let comebackPlayer = null;
    if (opts.highlightComeback && bestDelta >= 1 && comebackPlayerId) {
      const cb = rankedPlayers.find(p => p.id === comebackPlayerId);
      if (cb) {
        cb.isComeback = true;
        comebackPlayer = cb;
      }
    }

    const leader = rankedPlayers.length > 0 ? rankedPlayers[0] : null;

    return {
      rankedPlayers,
      leader,
      comebackPlayer,
      bestDelta,
      maxScore,
      totalFleet: rankedPlayers.length
    };
  }

  function renderDistanceScale(maxDistanceNm) {
    const marks = [0, 2.5, 5.0, 7.5, 10.0];
    const scaleFactor = (maxDistanceNm || 10.0) / 10.0;
    return `
      <div class="regatta-distance-bar" aria-hidden="true" style="display:flex; align-items:center; margin:0 0 10px 0; padding:0 14px;">
        <div class="regatta-distance-spacer" style="flex:0 0 220px;"></div>
        <div class="regatta-distance-track" style="position:relative; flex:1; min-width:140px; display:flex; justify-content:space-between; padding-right:36px;">
          ${marks.map((m, idx) => {
            const val = (m * scaleFactor).toFixed(1).replace('.0', '');
            const isFinish = idx === marks.length - 1;
            return `<div class="regatta-distance-mark ${isFinish ? 'finish-mark' : ''}" style="position:relative; font-size:0.72rem; font-weight:700; color:${isFinish ? '#D4A843' : 'rgba(255,255,255,0.45)'}; display:flex; flex-direction:column; align-items:center; gap:2px;">
              <span>${val} nm</span>
            </div>`;
          }).join('')}
        </div>
      </div>
    `;
  }

  function render(container, players, prevRanks, options) {
    const targetEl = typeof container === 'string' ? document.querySelector(container) : container;
    if (!targetEl) {
      if (typeof console !== 'undefined') console.error('[RegattaEngine] Contenedor no encontrado:', container);
      return null;
    }

    const opts = Object.assign({}, DEFAULT_OPTIONS, options);
    const { rankedPlayers, leader, comebackPlayer, totalFleet } = calculateRanks(players, prevRanks, opts);

    let displayLimit = totalFleet;
    if (opts.viewMode === 'top5') displayLimit = 5;
    else if (opts.viewMode === 'top8') displayLimit = 8;
    else if (typeof opts.maxDisplay === 'number' && opts.maxDisplay > 0) displayLimit = opts.maxDisplay;

    const visiblePlayers = rankedPlayers.slice(0, displayLimit);
    const hiddenCount = Math.max(0, totalFleet - displayLimit);

    if (visiblePlayers.length === 0) {
      targetEl.innerHTML = `
        <div class="regatta-container ${opts.projectorMode ? 'regatta-projector' : ''}">
          <div class="regatta-header">
            <h3 class="regatta-title">⚓ ${escapeHtml(opts.title)}</h3>
          </div>
          <div class="p-24 text-center muted" style="padding: 32px 16px; text-align: center; color: rgba(255,255,255,0.6);">
            <div style="font-size: 2rem; margin-bottom: 8px;">🧭</div>
            <p>Aún no hay buques compitiendo en la regata.</p>
          </div>
        </div>
      `;
      return { container: targetEl, visibleCount: 0, totalFleet: 0 };
    }

    const lanesHtml = visiblePlayers.map((p) => {
      const laneClass = p.currentRank === 1 ? 'lane-1' : p.currentRank === 2 ? 'lane-2' : p.currentRank === 3 ? 'lane-3' : '';
      const overtakeClass = p.isOvertaking ? 'is-overtaking' : '';
      const nitroClass = p.hasNitro ? 'has-nitro' : '';

      let leaderBadge = '';
      if (opts.highlightLeader && p.isLeader) {
        leaderBadge = `<span class="regatta-badge-leader" title="Líder de Flota">${crownLeaderSVG()} Líder</span>`;
      }

      let comebackBadge = '';
      if (opts.highlightComeback && p.isComeback) {
        comebackBadge = `<span class="regatta-badge-comeback" title="Mayor Remontada (+${p.rankDelta} puestos)">${rocketComebackSVG()} +${p.rankDelta} puestos</span>`;
      }

      let nitroBadge = '';
      if (p.hasNitro) {
        nitroBadge = `<span class="regatta-badge-nitro" title="En Racha Turbo (x${p.streak || 2})" style="display:inline-flex; align-items:center; gap:3px; padding:2px 7px; border-radius:999px; background:linear-gradient(135deg, #FF3B4E, #D4A843); color:#041225; font-size:0.65rem; font-weight:800;">${turboFlameSVG()} Turbo x${p.streak}</span>`;
      }

      let deltaIndicator = '';
      if (p.prevRank !== null) {
        if (p.rankDelta > 0) {
          deltaIndicator = `<span class="regatta-rank-delta up" style="font-size:0.65rem; font-weight:800; padding:1px 5px; border-radius:4px; margin-left:4px; background:rgba(46,204,113,0.25); color:#2ECC71; border:1px solid rgba(46,204,113,0.5);" title="Subió ${p.rankDelta} puesto(s)">▲+${p.rankDelta}</span>`;
        } else if (p.rankDelta < 0) {
          deltaIndicator = `<span class="regatta-rank-delta down" style="font-size:0.65rem; font-weight:800; padding:1px 5px; border-radius:4px; margin-left:4px; background:rgba(231,76,60,0.25); color:#E74C3C; border:1px solid rgba(231,76,60,0.5);" title="Bajó ${Math.abs(p.rankDelta)} puesto(s)">▼${p.rankDelta}</span>`;
        } else {
          deltaIndicator = `<span class="regatta-rank-delta same" style="font-size:0.65rem; font-weight:800; padding:1px 5px; border-radius:4px; margin-left:4px; background:rgba(255,255,255,0.1); color:rgba(255,255,255,0.5);" title="Mantuvo posición">=</span>`;
        }
      }

      const shipSvg = getShipSvg(p.avatar);
      const scoreFormatted = Number(p.score || 0).toLocaleString('es-CL');

      return `
        <div class="regatta-lane ${laneClass} ${overtakeClass}" data-player-id="${p.id}" data-rank="${p.currentRank}">
          <div class="regatta-rank">${p.currentRank}</div>
          <div class="regatta-label">
            <div class="regatta-label-main">
              <span class="player-name">${escapeHtml(p.name)}</span>
              ${deltaIndicator}
              ${leaderBadge}
              ${comebackBadge}
              ${nitroBadge}
            </div>
            <div class="regatta-ship-tag">${escapeHtml(p.shipTitle)} · ${p.distanceNm} nm</div>
          </div>
          <div class="regatta-track-wrap">
            <div class="regatta-track"></div>
            <div class="regatta-finish-line"></div>
            ${buoyFinishSVG()}
            <div class="regatta-ship anim-ship-gentle ${nitroClass}" style="left:${p.progressPct}%;" data-player-ship="${p.id}" title="${escapeHtml(p.name)} (${p.distanceNm} nm)">
              <div class="regatta-wake"></div>
              ${shipSvg}
            </div>
          </div>
          <div class="regatta-score-pill" data-score="${p.score || 0}">${scoreFormatted} pts</div>
        </div>
      `;
    }).join('');

    const distanceScaleHtml = opts.showDistanceMarkers ? renderDistanceScale(opts.maxDistanceNm) : '';

    const fleetFooterHtml = hiddenCount > 0 ? `
      <div class="regatta-fleet-footer" style="margin-top:14px; padding-top:10px; border-top:1px solid rgba(255,255,255,0.08); display:flex; justify-content:space-between; align-items:center; font-size:0.8rem; color:rgba(255,255,255,0.55);">
        <span>Mostrando <strong>Top ${displayLimit}</strong> de ${totalFleet} tripulantes</span>
        <span>⚓ +${hiddenCount} buques en competencia</span>
      </div>
    ` : '';

    targetEl.innerHTML = `
      <div class="regatta-container ${opts.projectorMode ? 'regatta-projector' : ''}">
        <div class="regatta-header">
          <div class="regatta-title">
            <span>⚓</span>
            <span>${escapeHtml(opts.title)}</span>
          </div>
          <div class="muted" style="font-size:0.85rem; color:rgba(255,255,255,0.65);">
            Flota activa: <strong style="color:var(--color-gold, #D4A843);">${totalFleet} buques</strong>
          </div>
        </div>
        ${distanceScaleHtml}
        <div class="regatta-water-surface">
          ${lanesHtml}
        </div>
        ${fleetFooterHtml}
      </div>
    `;

    return {
      container: targetEl,
      rankedPlayers,
      leader,
      comebackPlayer,
      visibleCount: visiblePlayers.length,
      totalFleet
    };
  }

  function animateTransition(container, fromPlayers, toPlayers, options) {
    return new Promise((resolve) => {
      const targetEl = typeof container === 'string' ? document.querySelector(container) : container;
      if (!targetEl) {
        resolve();
        return;
      }

      const opts = Object.assign({}, DEFAULT_OPTIONS, options);
      const duration = opts.transitionDuration || 1200;

      const prevCalc = calculateRanks(fromPlayers, null, opts);
      const prevRankMap = new Map();
      prevCalc.rankedPlayers.forEach(p => prevRankMap.set(p.id, p.currentRank));

      const newCalc = calculateRanks(toPlayers, prevRankMap, opts);

      if (!targetEl.querySelector('.regatta-lane')) {
        render(targetEl, fromPlayers, null, opts);
      }

      const surface = targetEl.querySelector('.regatta-water-surface');
      if (!surface) {
        render(targetEl, toPlayers, prevRankMap, opts);
        resolve(newCalc);
        return;
      }

      const existingLanes = Array.from(surface.querySelectorAll('.regatta-lane'));
      const firstPositions = new Map();
      existingLanes.forEach(lane => {
        const pid = lane.getAttribute('data-player-id');
        if (pid && typeof lane.getBoundingClientRect === 'function') {
          firstPositions.set(pid, lane.getBoundingClientRect().top);
        }
      });

      render(targetEl, toPlayers, prevRankMap, opts);

      const newLanes = Array.from(targetEl.querySelectorAll('.regatta-lane'));
      
      newLanes.forEach(lane => {
        const pid = lane.getAttribute('data-player-id');
        const ship = lane.querySelector('.regatta-ship');
        const scorePill = lane.querySelector('.regatta-score-pill');
        const playerData = newCalc.rankedPlayers.find(p => p.id === pid);

        if (!playerData) return;

        if (ship) {
          ship.style.transition = `left ${duration}ms cubic-bezier(0.25, 1, 0.5, 1)`;
          ship.style.left = `${playerData.progressPct}%`;
          if (playerData.hasNitro) {
            ship.classList.add('has-nitro');
          }
        }

        if (scorePill && fromPlayers) {
          const oldP = fromPlayers.find(p => String(p.id) === pid);
          const startScore = oldP ? (oldP.score || 0) : 0;
          const targetScore = playerData.score || 0;
          if (startScore !== targetScore) {
            animateScoreCount(scorePill, startScore, targetScore, duration);
          }
        }

        if (firstPositions.has(pid) && typeof lane.getBoundingClientRect === 'function') {
          const oldTop = firstPositions.get(pid);
          const newTop = lane.getBoundingClientRect().top;
          const deltaY = oldTop - newTop;

          if (Math.abs(deltaY) > 2) {
            lane.style.transform = `translate3d(0, ${deltaY}px, 0)`;
            lane.style.transition = 'none';

            void lane.offsetHeight;

            lane.style.transition = `transform ${duration}ms cubic-bezier(0.2, 0.8, 0.2, 1)`;
            lane.style.transform = 'translate3d(0, 0, 0)';
          }
        }

        if (playerData.isOvertaking) {
          lane.classList.add('is-overtaking');
          setTimeout(() => {
            lane.classList.remove('is-overtaking');
          }, duration + 1400);
        }
      });

      setTimeout(() => {
        newLanes.forEach(lane => {
          lane.style.transform = '';
          lane.style.transition = '';
        });
        resolve(newCalc);
      }, duration + 100);
    });
  }

  function animateScoreCount(element, start, end, duration) {
    if (typeof requestAnimationFrame === 'undefined') {
      element.textContent = `${Number(end).toLocaleString('es-CL')} pts`;
      return;
    }
    const startTime = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * ease);
      element.textContent = `${current.toLocaleString('es-CL')} pts`;
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = `${Number(end).toLocaleString('es-CL')} pts`;
      }
    }
    requestAnimationFrame(update);
  }

  function setViewMode(container, viewMode, players, prevRanks, options) {
    const opts = Object.assign({}, options, { viewMode });
    return render(container, players, prevRanks, opts);
  }

  function setProjectorMode(container, isProjector, players, prevRanks, options) {
    const opts = Object.assign({}, options, { projectorMode: !!isProjector });
    return render(container, players, prevRanks, opts);
  }

  const RegattaEngine = {
    DEFAULT_OPTIONS,
    calculateRanks,
    render,
    animateTransition,
    setViewMode,
    setProjectorMode,
    getShipSvg,
    getShipTitle,
    renderDistanceScale
  };

  return RegattaEngine;
});
