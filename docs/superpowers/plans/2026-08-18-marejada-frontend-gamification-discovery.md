# Plan de Implementación: Marejada 2.0 — Rediseño Frontend, Gamificación y Motor de Discovery Marítimo

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar Marejada en una plataforma interactiva de alto impacto visual con audio procedural, efectos de partículas, regata naval animada en tiempo real, sistema de rachas "A Toda Máquina", y un motor dual de Trivia de Seguridad (Summit) y Sondeos de Producto (Discovery).

**Architecture:** Arquitectura Modular Vanilla ES6+ y CSS3 nativo sin pasos de compilación (Zero-Build), diseñada para ejecutarse directamente en GitHub Pages con sincronización en tiempo real y persistencia en Supabase. Se encapsulan motores independientes para Audio Web API, Partículas Canvas, Mecánicas de Juego y Regata en Vivo.

**Tech Stack:** HTML5, CSS3 Glassmorphism, Vanilla JavaScript (ES6+), Web Audio API, HTML5 Canvas 2D, Supabase JS Client v2, Chart.js v4, qrcode-generator.

**Spec:** `docs/superpowers/specs/2026-08-18-marejada-frontend-gamification-discovery-design.md`

## Global Constraints
- Zero external build steps (no npm build, webpack, or vite required in production) — compatible 100% with GitHub Pages.
- Zero external MP3/audio downloads — all sound effects are synthesized via native Web Audio API.
- All canvas animations run at 60fps via `requestAnimationFrame` with graceful degradation.
- Mobile-first responsiveness on `player.html` with touch latency < 100ms and optional haptic feedback (`navigator.vibrate`).
- 100% backward compatibility with current Supabase tables (`sessions`, `questions`, `players`, `responses`).

---

### Task 1: Motor de Audio Náutico Procedural (`js/audio.js`)

**Files:**
- Create: `js/audio.js`
- Test: `tests/audio-test.html`

**Interfaces:**
- Produces: `window.AudioFX = { init(), play(soundName, param), toggleMute(), isMuted(), setVolume(vol) }`
- Supported sound names: `'ship_horn'`, `'bell'`, `'sonar_ping'`, `'error_foghorn'`, `'podium_fanfare'`, `'bubble_tap'`.

- [ ] **Step 1: Crear archivo de prueba para Web Audio API**

```html
<!-- tests/audio-test.html -->
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>Audio Test</title></head>
<body>
  <h1>Test AudioFX</h1>
  <button id="btnHorn" onclick="AudioFX.play('ship_horn')">Horn</button>
  <button id="btnBell" onclick="AudioFX.play('bell')">Bell</button>
  <button id="btnSonar" onclick="AudioFX.play('sonar_ping')">Sonar</button>
  <button id="btnError" onclick="AudioFX.play('error_foghorn')">Error</button>
  <button id="btnFanfare" onclick="AudioFX.play('podium_fanfare')">Fanfare</button>
  <button id="btnTap" onclick="AudioFX.play('bubble_tap')">Tap</button>
  <button id="btnToggle" onclick="AudioFX.toggleMute()">Toggle Mute</button>
  <script src="../js/audio.js"></script>
</body>
</html>
```

- [ ] **Step 2: Implementar `js/audio.js` con síntesis de osciladores, envolventes de ganancia y persistencia**

```javascript
// js/audio.js
(function () {
  let ctx = null;
  let muted = localStorage.getItem('marejada_sound_muted') === 'true';
  let masterGain = null;

  function getContext() {
    if (!ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        ctx = new AudioContext();
        masterGain = ctx.createGain();
        masterGain.gain.value = muted ? 0 : 0.3;
        masterGain.connect(ctx.destination);
      }
    }
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
    return ctx;
  }

  // Desbloqueo en primer gesto del usuario
  ['click', 'touchstart', 'keydown'].forEach(evt => {
    window.addEventListener(evt, () => { getContext(); }, { once: true, passive: true });
  });

  const AudioFX = {
    init() { getContext(); },
    isMuted() { return muted; },
    toggleMute() {
      muted = !muted;
      localStorage.setItem('marejada_sound_muted', muted ? 'true' : 'false');
      if (masterGain && ctx) {
        masterGain.gain.setValueAtTime(muted ? 0 : 0.3, ctx.currentTime);
      }
      return muted;
    },
    setVolume(val) {
      if (masterGain && ctx && !muted) {
        masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, val)), ctx.currentTime);
      }
    },
    play(name, param) {
      if (muted) return;
      const audioCtx = getContext();
      if (!audioCtx) return;
      const now = audioCtx.currentTime;

      switch (name) {
        case 'ship_horn': {
          const osc1 = audioCtx.createOscillator();
          const osc2 = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc1.type = 'sawtooth';
          osc2.type = 'triangle';
          osc1.frequency.setValueAtTime(110, now);
          osc2.frequency.setValueAtTime(114, now);
          gain.gain.setValueAtTime(0.01, now);
          gain.gain.linearRampToValueAtTime(0.4, now + 0.15);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(masterGain);
          osc1.start(now);
          osc2.start(now);
          osc1.stop(now + 1.25);
          osc2.stop(now + 1.25);
          break;
        }
        case 'bell': {
          [880, 1760, 2640].forEach((freq, idx) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);
            gain.gain.setValueAtTime(0.3 / (idx + 1), now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
            osc.connect(gain);
            gain.connect(masterGain);
            osc.start(now);
            osc.stop(now + 1.5);
          });
          break;
        }
        case 'sonar_ping': {
          const freq = typeof param === 'number' ? param : 1200;
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          osc.frequency.exponentialRampToValueAtTime(freq * 0.8, now + 0.5);
          gain.gain.setValueAtTime(0.35, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now);
          osc.stop(now + 0.65);
          break;
        }
        case 'error_foghorn': {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(75, now);
          osc.frequency.linearRampToValueAtTime(60, now + 0.4);
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now);
          osc.stop(now + 0.55);
          break;
        }
        case 'podium_fanfare': {
          const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C4, E4, G4, C5, E5, G5
          notes.forEach((freq, i) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + i * 0.12);
            gain.gain.setValueAtTime(0.001, now + i * 0.12);
            gain.gain.linearRampToValueAtTime(0.3, now + i * 0.12 + 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.8);
            osc.connect(gain);
            gain.connect(masterGain);
            osc.start(now + i * 0.12);
            osc.stop(now + i * 0.12 + 0.85);
          });
          break;
        }
        case 'bubble_tap': {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(400, now);
          osc.frequency.exponentialRampToValueAtTime(900, now + 0.06);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now);
          osc.stop(now + 0.09);
          break;
        }
      }
    }
  };

  window.AudioFX = AudioFX;
})();
```

- [ ] **Step 3: Verificar archivo con node o test sintético**
- [ ] **Step 4: Commit**
```bash
git add js/audio.js tests/audio-test.html
git commit -m "feat: add procedural Web Audio API sound engine for maritime audio effects"
```

---

### Task 2: Motor de Partículas & Efectos Canvas (`js/canvas-fx.js`)

**Files:**
- Create: `js/canvas-fx.js`
- Test: `tests/canvas-fx-test.html`

**Interfaces:**
- Produces: `window.CanvasFX = { init(container), waterWake(x, y, vx, vy), launchFlare(x, y, color), launchNauticalConfetti(), sonarRing(x, y), clear() }`

- [ ] **Step 1: Crear `js/canvas-fx.js` con partículas optimizadas a 60fps**

```javascript
// js/canvas-fx.js
(function () {
  let canvas = null;
  let ctx = null;
  let particles = [];
  let animId = null;

  function setupCanvas(targetEl) {
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'marejadaCanvasFX';
      canvas.style.position = 'fixed';
      canvas.style.inset = '0';
      canvas.style.pointerEvents = 'none';
      canvas.style.zIndex = '99';
      document.body.appendChild(canvas);
    }
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
    if (!animId) loop();
  }

  function resize() {
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  }

  function loop() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;

      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);

      if (p.type === 'circle' || p.type === 'foam') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (p.life), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      } else if (p.type === 'ring') {
        p.size += p.growth;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.lineWidth || 2;
        ctx.stroke();
      } else if (p.type === 'confetti') {
        p.rotation += p.vRot;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);
      }
      ctx.restore();
    }

    animId = requestAnimationFrame(loop);
  }

  const CanvasFX = {
    init() { setupCanvas(); },
    waterWake(x, y, vx = 0, vy = 0) {
      setupCanvas();
      for (let i = 0; i < 4; i++) {
        particles.push({
          type: 'foam',
          x: x + (Math.random() - 0.5) * 10,
          y: y + (Math.random() - 0.5) * 10,
          vx: vx + (Math.random() - 0.5) * 1.5,
          vy: vy + (Math.random() - 0.5) * 1.5,
          size: Math.random() * 5 + 3,
          color: 'rgba(255, 255, 255, 0.7)',
          life: 1.0,
          decay: 0.03 + Math.random() * 0.02
        });
      }
    },
    launchFlare(x = window.innerWidth / 2, y = window.innerHeight * 0.8, color = '#E4001A') {
      setupCanvas();
      for (let i = 0; i < 35; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 6 + 2;
        particles.push({
          type: 'circle',
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2,
          size: Math.random() * 4 + 2,
          color: i % 2 === 0 ? color : '#D4A843',
          life: 1.0,
          decay: 0.02 + Math.random() * 0.02
        });
      }
    },
    launchNauticalConfetti() {
      setupCanvas();
      const colors = ['#E4001A', '#D4A843', '#3498DB', '#FFFFFF', '#2ECC71'];
      for (let i = 0; i < 80; i++) {
        particles.push({
          type: 'confetti',
          x: Math.random() * canvas.width,
          y: -20,
          vx: (Math.random() - 0.5) * 3,
          vy: Math.random() * 4 + 2,
          size: Math.random() * 8 + 6,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.1,
          life: 1.0,
          decay: 0.008 + Math.random() * 0.005
        });
      }
    },
    sonarRing(x = window.innerWidth / 2, y = window.innerHeight / 2, color = 'rgba(212, 168, 67, 0.6)') {
      setupCanvas();
      particles.push({
        type: 'ring',
        x, y,
        vx: 0, vy: 0,
        size: 10,
        growth: 4,
        lineWidth: 3,
        color,
        life: 1.0,
        decay: 0.025
      });
    },
    clear() {
      particles = [];
      if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  window.CanvasFX = CanvasFX;
})();
```

- [ ] **Step 2: Commit**
```bash
git add js/canvas-fx.js
git commit -m "feat: add 60fps Canvas particle engine for water wakes, flares, confetti and sonar rings"
```

---

### Task 3: Estilos, Animaciones CSS Navales y Regata (`css/animations.css`, `css/regatta.css`, `css/style.css`)

**Files:**
- Create: `css/animations.css`
- Create: `css/regatta.css`
- Modify: `css/style.css`

**Interfaces:**
- Produces: CSS classes for `.glass-panel`, `.ship-bobbing`, `.streak-flame`, `.regatta-track`, `.regatta-lane`, `.compass-timer`, `.podium-3d`.

- [ ] **Step 1: Crear `css/animations.css` con animaciones náuticas avanzadas**
- [ ] **Step 2: Crear `css/regatta.css` con la pista de carreras marítima de la Regata 2.0**
- [ ] **Step 3: Actualizar `css/style.css` para importar y enlazar los nuevos estilos**
- [ ] **Step 4: Commit**
```bash
git add css/animations.css css/regatta.css css/style.css
git commit -m "style: add naval glassmorphism, 3D animations and live regatta track styles"
```

---

### Task 4: Motor de Mecánicas, Rachas y Formatos de Pregunta (`js/mechanics.js`)

**Files:**
- Create: `js/mechanics.js`

**Interfaces:**
- Produces: `window.Mechanics = { calculateScore(timeRemaining, totalTime, streak, isHighTide), getStreakInfo(streak), validateAnswer(question, answer), renderQuestionInput(question, container, onAnswer) }`

- [ ] **Step 1: Implementar `js/mechanics.js` con cálculo de multiplicadores, manejo de secuencias, V/F náutico y sondeos**
- [ ] **Step 2: Commit**
```bash
git add js/mechanics.js
git commit -m "feat: add game mechanics engine with streak multipliers, high-tide rounds and question handlers"
```

---

### Task 5: Motor de Regata Naval en Vivo 2.0 (`js/regatta.js`)

**Files:**
- Create: `js/regatta.js`

**Interfaces:**
- Produces: `window.RegattaEngine = { render(container, players, prevRanks, options) }`

- [ ] **Step 1: Implementar `js/regatta.js` con carriles de agua animados, estelas en tiempo real, adelantamientos y menciones especiales**
- [ ] **Step 2: Commit**
```bash
git add js/regatta.js
git commit -m "feat: add Live Regatta 2.0 engine with animated water lanes and overtakes"
```

---

### Task 6: Actualización de la Vista Host (`index.html` & `js/host.js`)

**Files:**
- Modify: `index.html`
- Modify: `js/host.js`

**Interfaces:**
- Consumes: `AudioFX`, `CanvasFX`, `RegattaEngine`, `Mechanics`.
- Updates: Muelle Vivo 2.0, Reloj Brújula Náutica con pulsos de sonar, Regata 2.0 en resultados, y Podio 3D con fanfarria y bengalas.

- [ ] **Step 1: Actualizar `index.html` para incluir los nuevos scripts (`audio.js`, `canvas-fx.js`, `mechanics.js`, `regatta.js`) y el botón flotante de audio**
- [ ] **Step 2: Actualizar `js/host.js` integrando sonidos, efectos de tensión y visualizaciones en vivo para encuestas y trivias**
- [ ] **Step 3: Commit**
```bash
git add index.html js/host.js
git commit -m "feat: upgrade host view with living dock, nautical compass timer, live regatta and audio effects"
```

---

### Task 7: Actualización de la Vista Jugador Móvil (`player.html` & `js/player.js`)

**Files:**
- Modify: `player.html`
- Modify: `js/player.js`

**Interfaces:**
- Consumes: `AudioFX`, `CanvasFX`, `Mechanics`.
- Produces: Generación de Diploma Digital en Canvas descargable (`downloadCaptainDiploma()`).

- [ ] **Step 1: Actualizar `player.html` con soporte para nuevos tipos de preguntas (V/F, Secuencia táctil, Encuesta de producto) y contenedor de diploma**
- [ ] **Step 2: Actualizar `js/player.js` con feedback háptico (`navigator.vibrate`), animaciones de racha "A Toda Máquina", y renderizado de certificado PNG**
- [ ] **Step 3: Commit**
```bash
git add player.html js/player.js
git commit -m "feat: upgrade player view with mobile touch mechanics, streaks, haptics and digital diploma export"
```

---

### Task 8: Actualización del Panel de Administración y Plantillas (`admin.html` & `js/admin.js`)

**Files:**
- Modify: `admin.html`
- Modify: `js/admin.js`

**Interfaces:**
- Features: Selector de modo (Summit Trivia, Sondeo de Producto, Híbrido), creador de preguntas de secuencia, V/F y sondeos, y plantillas precargadas para el Summit de Seguridad Marítima.

- [ ] **Step 1: Actualizar `admin.html` con los selectores de modo y nuevos formularios de pregunta**
- [ ] **Step 2: Actualizar `js/admin.js` con las plantillas predefinidas del Summit y serialización JSON**
- [ ] **Step 3: Commit**
```bash
git add admin.html js/admin.js
git commit -m "feat: update admin panel with dual-mode support, new question types and maritime templates"
```

---

### Task 9: Actualización del Dashboard de Analítica y Discovery (`dashboard.html` & `js/dashboard.js`)

**Files:**
- Modify: `dashboard.html`
- Modify: `js/dashboard.js`

**Interfaces:**
- Features: Pestaña Summit (Tasa de aciertos, riesgos), Pestaña Product Discovery (Ranking de features deseadas, valoración de pantallas, muro de opiniones), y exportador CSV enriquecido.

- [ ] **Step 1: Actualizar `dashboard.html` con pestañas de Summit y Discovery**
- [ ] **Step 2: Actualizar `js/dashboard.js` con gráficos de priorización y exportación CSV estructurada**
- [ ] **Step 3: Commit**
```bash
git add dashboard.html js/dashboard.js
git commit -m "feat: add product discovery analytics tab and enhanced CSV export in dashboard"
```

---

### Task 10: Verificación Final y Prueba E2E

**Files:**
- Test: Todas las vistas y módulos

- [ ] **Step 1: Validar sintaxis JS y ausencia de errores de consola en todas las vistas**
- [ ] **Step 2: Probar flujo completo: creación de sesión híbrida -> unión con avatar -> trivia con rachas -> sondeo de producto -> regata -> podio con diploma -> dashboard**
- [ ] **Step 3: Commit final y resumen de entrega**
```bash
git add .
git commit -m "chore: complete Marejada 2.0 frontend gamification, audio and discovery upgrade"
```
