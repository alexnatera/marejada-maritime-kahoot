// js/canvas-fx.js
// Motor de Partículas & Efectos Canvas Náuticos 2D a 60fps
(function () {
  'use strict';

  let canvas = null;
  let ctx = null;
  let targetContainer = null;
  let particles = [];
  let animId = null;
  let canvasWidth = 0;
  let canvasHeight = 0;
  let isResizing = false;

  const COLORS = {
    gold: '#D4A843',
    red: '#E4001A',
    blue: '#3498DB',
    white: '#FFFFFF',
    green: '#2ECC71',
    navy: '#1E3E62',
    amber: '#F39C12'
  };

  /**
   * Inicializa o configura el canvas de overlay.
   * @param {HTMLElement|string} [container] - Contenedor padre opcional. Por defecto document.body.
   */
  function setupCanvas(container) {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    if (container) {
      if (typeof container === 'string') {
        targetContainer = document.querySelector(container) || document.body;
      } else if (container instanceof HTMLElement) {
        targetContainer = container;
      } else {
        targetContainer = document.body;
      }
    } else if (!targetContainer) {
      targetContainer = document.body;
    }

    if (!canvas) {
      const existing = document.getElementById('marejadaCanvasFX');
      if (existing) {
        canvas = existing;
      } else {
        canvas = document.createElement('canvas');
        canvas.id = 'marejadaCanvasFX';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '99';

        if (targetContainer === document.body) {
          canvas.style.position = 'fixed';
          canvas.style.top = '0';
          canvas.style.left = '0';
          canvas.style.width = '100vw';
          canvas.style.height = '100vh';
        } else {
          canvas.style.position = 'absolute';
          canvas.style.top = '0';
          canvas.style.left = '0';
          canvas.style.width = '100%';
          canvas.style.height = '100%';
          if (getComputedStyle(targetContainer).position === 'static') {
            targetContainer.style.position = 'relative';
          }
        }
        targetContainer.appendChild(canvas);
      }

      ctx = canvas.getContext('2d');
      resize();

      if (!isResizing) {
        window.addEventListener('resize', handleResize);
        isResizing = true;
      }
    } else if (container && canvas.parentElement !== targetContainer) {
      targetContainer.appendChild(canvas);
      resize();
    }
  }

  function handleResize() {
    resize();
  }

  function resize() {
    if (!canvas) return;
    const dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;

    let width, height;
    if (targetContainer === document.body || !targetContainer) {
      width = window.innerWidth;
      height = window.innerHeight;
    } else {
      const rect = targetContainer.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
    }

    canvasWidth = width;
    canvasHeight = height;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  /**
   * Asegura que el bucle de animación esté activo si hay partículas vivas.
   */
  function ensureLoop() {
    if (!animId && particles.length > 0) {
      animId = requestAnimationFrame(loop);
    }
  }

  /**
   * Bucle de animación optimizado a 60fps. Se detiene automáticamente cuando no hay partículas.
   */
  function loop() {
    if (!ctx || !canvas) {
      animId = null;
      return;
    }

    if (particles.length === 0) {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      animId = null;
      return;
    }

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];

      // Actualización de física según el tipo
      updateParticle(p);

      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }

      ctx.save();
      renderParticle(ctx, p);
      ctx.restore();
    }

    if (particles.length > 0) {
      animId = requestAnimationFrame(loop);
    } else {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      animId = null;
    }
  }

  function updateParticle(p) {
    p.life -= p.decay;

    switch (p.type) {
      case 'foam':
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        p.vy *= 0.96;
        if (p.size < p.maxSize) {
          p.size += (p.maxSize - p.size) * 0.1;
        }
        break;

      case 'flare_spark':
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity || 0.15;
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.flicker += 0.3;
        break;

      case 'flare_smoke':
        p.x += p.vx;
        p.y += p.vy;
        p.size += 0.25;
        p.vx *= 0.98;
        p.vy *= 0.98;
        break;

      case 'confetti':
        p.swayTimer += p.swaySpeed;
        p.x += p.vx + Math.sin(p.swayTimer) * p.swayAmp;
        p.y += p.vy;
        p.rotation += p.vRot;
        p.tiltAngle += p.tiltSpeed;
        p.vy += p.gravity || 0.05;
        if (p.vy > 4) p.vy = 4;
        break;

      case 'ring':
        p.size += p.growth;
        p.growth *= 0.985;
        break;

      default:
        p.x += p.vx;
        p.y += p.vy;
        break;
    }
  }

  function renderParticle(ctx, p) {
    const alpha = Math.max(0, Math.min(1, p.life));
    ctx.globalAlpha = alpha;

    switch (p.type) {
      case 'foam':
        renderFoam(ctx, p, alpha);
        break;

      case 'flare_spark':
        renderFlareSpark(ctx, p, alpha);
        break;

      case 'flare_smoke':
        renderFlareSmoke(ctx, p, alpha);
        break;

      case 'confetti':
        renderConfetti(ctx, p, alpha);
        break;

      case 'ring':
        renderSonarRing(ctx, p, alpha);
        break;

      default:
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size || 3, 0, Math.PI * 2);
        ctx.fillStyle = p.color || '#FFF';
        ctx.fill();
        break;
    }
  }

  function renderFoam(ctx, p, alpha) {
    // Disco de espuma marina exterior suave
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = p.color || `rgba(220, 245, 255, ${0.5 * alpha})`;
    ctx.fill();

    // Borde de burbuja
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.8 * alpha})`;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Brillo / núcleo de burbuja
    if (p.size > 2.5) {
      ctx.beginPath();
      ctx.arc(p.x - p.size * 0.3, p.y - p.size * 0.3, p.size * 0.25, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${0.9 * alpha})`;
      ctx.fill();
    }
  }

  function renderFlareSpark(ctx, p, alpha) {
    const sparkleAlpha = alpha * (0.8 + 0.2 * Math.sin(p.flicker || 0));
    ctx.globalAlpha = Math.max(0, Math.min(1, sparkleAlpha));

    ctx.save();
    ctx.shadowBlur = 8;
    ctx.shadowColor = p.color;

    // Núcleo brillante
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();

    // Centro blanco incandescente
    ctx.beginPath();
    ctx.arc(p.x, p.y, Math.max(1, p.size * 0.4), 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

    ctx.restore();
  }

  function renderFlareSmoke(ctx, p, alpha) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = p.color || `rgba(200, 215, 230, ${0.25 * alpha})`;
    ctx.fill();
  }

  function renderConfetti(ctx, p, alpha) {
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);

    switch (p.shape) {
      case 'anchor':
        drawAnchor(ctx, p.size, p.color);
        break;

      case 'lifebuoy':
        drawLifebuoy(ctx, p.size, p.color);
        break;

      case 'star':
        drawStar(ctx, p.size, p.color);
        break;

      case 'ribbon':
      default:
        drawRibbon(ctx, p.size, p.color, p.tiltAngle);
        break;
    }
  }

  function drawRibbon(ctx, size, color, tiltAngle) {
    const tiltScale = Math.cos(tiltAngle || 0);
    const height = size * 1.5 * tiltScale;
    ctx.fillStyle = color;
    ctx.fillRect(-size / 2, -height / 2, size, height);
  }

  function drawAnchor(ctx, size, color) {
    const s = size * 0.9;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = Math.max(1.5, s * 0.14);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Anillo superior
    ctx.beginPath();
    ctx.arc(0, -s * 0.45, s * 0.18, 0, Math.PI * 2);
    ctx.stroke();

    // Vástago central vertical
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.27);
    ctx.lineTo(0, s * 0.45);
    ctx.stroke();

    // Barra horizontal (cepo)
    ctx.beginPath();
    ctx.moveTo(-s * 0.35, -s * 0.15);
    ctx.lineTo(s * 0.35, -s * 0.15);
    ctx.stroke();

    // Brazos curvos inferiores
    ctx.beginPath();
    ctx.arc(0, s * 0.05, s * 0.45, 0.15 * Math.PI, 0.85 * Math.PI, false);
    ctx.stroke();

    // Picos / Uñas
    ctx.beginPath();
    ctx.moveTo(-s * 0.42, s * 0.32);
    ctx.lineTo(-s * 0.38, s * 0.18);
    ctx.lineTo(-s * 0.25, s * 0.32);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(s * 0.42, s * 0.32);
    ctx.lineTo(s * 0.38, s * 0.18);
    ctx.lineTo(s * 0.25, s * 0.32);
    ctx.fill();
  }

  function drawLifebuoy(ctx, size, color) {
    const r = size * 0.55;
    const innerR = r * 0.5;

    // Aro blanco base
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.arc(0, 0, innerR, 0, Math.PI * 2, true);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

    // 4 Franjas rojas/de color náutico
    for (let i = 0; i < 4; i++) {
      const startA = (i * Math.PI / 2) - 0.26;
      const endA = (i * Math.PI / 2) + 0.26;
      ctx.beginPath();
      ctx.arc(0, 0, r, startA, endA);
      ctx.arc(0, 0, innerR, endA, startA, true);
      ctx.closePath();
      ctx.fillStyle = color || COLORS.red;
      ctx.fill();
    }

    // Borde fino
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, innerR, 0, Math.PI * 2);
    ctx.stroke();
  }

  function drawStar(ctx, size, color) {
    const spikes = 5;
    const outerR = size * 0.55;
    const innerR = outerR * 0.45;
    let rot = (Math.PI / 2) * 3;
    let x = 0;
    let y = 0;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(0, -outerR);
    for (let i = 0; i < spikes; i++) {
      x = Math.cos(rot) * outerR;
      y = Math.sin(rot) * outerR;
      ctx.lineTo(x, y);
      rot += step;

      x = Math.cos(rot) * innerR;
      y = Math.sin(rot) * innerR;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(0, -outerR);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  function renderSonarRing(ctx, p, alpha) {
    ctx.save();
    ctx.shadowBlur = 10;
    ctx.shadowColor = p.color || COLORS.gold;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.strokeStyle = p.color || `rgba(212, 168, 67, ${alpha})`;
    ctx.lineWidth = Math.max(1, (p.lineWidth || 2.5) * alpha);
    ctx.stroke();

    // Pulso secundario concéntrico interior si la vida es alta
    if (p.size > 20 && alpha > 0.4) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2);
      ctx.strokeStyle = p.color || `rgba(212, 168, 67, ${alpha * 0.5})`;
      ctx.lineWidth = Math.max(0.75, (p.lineWidth || 2) * 0.6 * alpha);
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * API Pública del Motor CanvasFX
   */
  const CanvasFX = {
    /**
     * Inicializa el lienzo en el contenedor especificado.
     * @param {HTMLElement|string} [container] - Contenedor opcional.
     */
    init(container) {
      setupCanvas(container);
    },

    /**
     * Genera una estela de espuma marina viva detrás de un buque.
     * @param {number} x - Coordenada X.
     * @param {number} y - Coordenada Y.
     * @param {number} [vx=0] - Vector de velocidad X del buque.
     * @param {number} [vy=0] - Vector de velocidad Y del buque.
     */
    waterWake(x, y, vx = 0, vy = 0) {
      setupCanvas();
      const count = 4 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * 8;
        const initialSize = Math.random() * 3 + 2;
        particles.push({
          type: 'foam',
          x: (typeof x === 'number' ? x : canvasWidth / 2) + Math.cos(angle) * dist,
          y: (typeof y === 'number' ? y : canvasHeight / 2) + Math.sin(angle) * dist,
          vx: vx * 0.3 + (Math.random() - 0.5) * 1.8,
          vy: vy * 0.3 + (Math.random() - 0.5) * 1.8,
          size: initialSize,
          maxSize: initialSize + Math.random() * 5 + 3,
          color: Math.random() > 0.3 ? 'rgba(235, 250, 255, 0.75)' : 'rgba(180, 230, 255, 0.6)',
          life: 1.0,
          decay: 0.02 + Math.random() * 0.02
        });
      }
      ensureLoop();
    },

    /**
     * Lanza una bengala náutica pirotécnica con chispas y humo ascendente.
     * @param {number} [x] - Coordenada X del estallido.
     * @param {number} [y] - Coordenada Y del estallido.
     * @param {string} [color='#E4001A'] - Color principal de la bengala.
     */
    launchFlare(x, y, color = COLORS.red) {
      setupCanvas();
      const originX = typeof x === 'number' ? x : canvasWidth / 2;
      const originY = typeof y === 'number' ? y : canvasHeight * 0.7;

      // Chispas incandescentes
      const sparkCount = 38 + Math.floor(Math.random() * 10);
      for (let i = 0; i < sparkCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 6.5 + 2.0;
        const sparkColor = i % 3 === 0 ? COLORS.gold : (i % 5 === 0 ? COLORS.white : color);
        particles.push({
          type: 'flare_spark',
          x: originX,
          y: originY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.5,
          gravity: 0.14,
          size: Math.random() * 3.5 + 2.0,
          color: sparkColor,
          life: 1.0,
          decay: 0.018 + Math.random() * 0.016,
          flicker: Math.random() * Math.PI * 2
        });
      }

      // Nubes de humo suave
      for (let i = 0; i < 10; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 1.5;
        particles.push({
          type: 'flare_smoke',
          x: originX + (Math.random() - 0.5) * 12,
          y: originY + (Math.random() - 0.5) * 12,
          vx: Math.cos(angle) * speed,
          vy: -Math.random() * 0.8 - 0.2,
          size: Math.random() * 5 + 4,
          color: 'rgba(210, 225, 235, 0.28)',
          life: 1.0,
          decay: 0.012 + Math.random() * 0.008
        });
      }

      ensureLoop();
    },

    /**
     * Lanza una lluvia de confeti marítimo (cintas, anclas, salvavidas y estrellas).
     * @param {Object} [opts] - Opciones opcionales de lanzamiento.
     */
    launchNauticalConfetti(opts = {}) {
      setupCanvas();
      const count = typeof opts.count === 'number' ? opts.count : 85;
      const palette = [COLORS.red, COLORS.gold, COLORS.blue, COLORS.white, COLORS.green, COLORS.amber];
      const shapes = ['ribbon', 'ribbon', 'anchor', 'lifebuoy', 'star'];

      for (let i = 0; i < count; i++) {
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        const color = palette[Math.floor(Math.random() * palette.length)];

        let startX = Math.random() * (canvasWidth || window.innerWidth);
        let startY = typeof opts.originY === 'number' ? opts.originY : -25 - Math.random() * 50;
        let vx = (Math.random() - 0.5) * 3.5;
        let vy = Math.random() * 3.5 + 2.0;

        if (opts.burst && typeof opts.originX === 'number' && typeof opts.originY === 'number') {
          startX = opts.originX;
          startY = opts.originY;
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 8 + 2;
          vx = Math.cos(angle) * speed;
          vy = Math.sin(angle) * speed - 2;
        }

        particles.push({
          type: 'confetti',
          shape: shape,
          x: startX,
          y: startY,
          vx: vx,
          vy: vy,
          gravity: 0.04,
          size: shape === 'ribbon' ? Math.random() * 7 + 6 : Math.random() * 10 + 10,
          color: color,
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.12,
          tiltAngle: Math.random() * Math.PI * 2,
          tiltSpeed: Math.random() * 0.08 + 0.03,
          swayTimer: Math.random() * Math.PI * 2,
          swaySpeed: Math.random() * 0.04 + 0.02,
          swayAmp: Math.random() * 1.5 + 0.5,
          life: 1.0,
          decay: 0.006 + Math.random() * 0.005
        });
      }

      ensureLoop();
    },

    /**
     * Emite un pulso expansivo de anillo de sonar luminoso.
     * @param {number} [x] - Coordenada X del centro del sonar.
     * @param {number} [y] - Coordenada Y del centro del sonar.
     * @param {string} [color='rgba(212, 168, 67, 0.75)'] - Color del anillo.
     */
    sonarRing(x, y, color = 'rgba(212, 168, 67, 0.75)') {
      setupCanvas();
      const originX = typeof x === 'number' ? x : canvasWidth / 2;
      const originY = typeof y === 'number' ? y : canvasHeight / 2;

      particles.push({
        type: 'ring',
        x: originX,
        y: originY,
        vx: 0,
        vy: 0,
        size: 8,
        growth: 4.5,
        lineWidth: 3.5,
        color: color,
        life: 1.0,
        decay: 0.022
      });

      ensureLoop();
    },

    /**
     * Alias de conveniencia para confeti
     */
    launchConfetti(x, y, count = 80) {
      this.launchNauticalConfetti({ originX: x, originY: y, burst: (typeof x === 'number' && typeof y === 'number'), count });
    },

    /**
     * Alias de conveniencia para sonar
     */
    triggerSonarRing(x, y, color) {
      this.sonarRing(x, y, color);
    },

    /**
     * Limpia todas las partículas activas y limpia el canvas.
     */
    clear() {
      particles = [];
      if (animId) {
        cancelAnimationFrame(animId);
        animId = null;
      }
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      }
    },

    /**
     * Retorna el número de partículas activas en pantalla.
     * @returns {number}
     */
    getParticleCount() {
      return particles.length;
    },

    /**
     * Retorna si el motor está animando activamente.
     * @returns {boolean}
     */
    isActive() {
      return animId !== null && particles.length > 0;
    },

    /**
     * Destruye el canvas y limpia listeners.
     */
    destroy() {
      this.clear();
      if (canvas && canvas.parentElement) {
        canvas.parentElement.removeChild(canvas);
      }
      if (isResizing) {
        window.removeEventListener('resize', handleResize);
        isResizing = false;
      }
      canvas = null;
      ctx = null;
    }
  };

  if (typeof window !== 'undefined') {
    window.CanvasFX = CanvasFX;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = CanvasFX;
  }
})();
