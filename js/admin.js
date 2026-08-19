// js/admin.js
// Panel de Administración · Zarpa 2.0 — Gestión de Sesiones, Plantillas y Formatos Náuticos

let currentSessionId = null;
let currentSession = null;
let currentQuestions = [];
let editingQuestionId = null;

// ===========================================================================
// Plantillas Marítimas Precargadas (1-Click Launchers)
// ===========================================================================
const TEMPLATES = {
  summit: {
    title: 'SHEQ Summit 2026 · Remolcadores & Maniobras Seguras',
    description: 'Dinámica integral de seguridad operacional a bordo: EPP, Snap-Back Zone, Emergencia por Girting, Marea Alta 2x, Toolbox Talk, Espacios Confinados, Priorización y Feedback en vivo.',
    badge: 'Summit SHEQ Completo',
    questions: [
      {
        type: 'multiple_choice',
        question_text: '🦺 Antes de poner un pie en la cubierta de maniobras de un remolcador en faena, ¿cuál es el EPP primordial y no negociable?',
        options: [
          'Casco con barboquejo, chaleco inflable 275N, calzado con puntera y guantes anti-corte',
          'Solo chaleco salvavidas y lentes oscuros para el sol',
          'Botas de agua amarillas y una buena taza de café caliente',
          'Traje de buceo completo con patas de rana'
        ],
        correct_index: 0,
        correct_option: 0,
        correct_order: null,
        time_limit: 20,
        is_high_tide: false
      },
      {
        type: 'true_false',
        question_text: '⚠️ ¿Es seguro permanecer dentro del seno (\'bight\') de un cabo sintético de remolque si la maniobra parece tranquila?',
        options: [
          'Verdadero (Si mantienes un pie apoyado en la bita)',
          '¡Falso! Toda la cubierta es zona de peligro mortal por latigazo (Snap-Back)'
        ],
        correct_index: 1,
        correct_option: 1,
        correct_order: null,
        time_limit: 15,
        is_high_tide: false
      },
      {
        type: 'hazard_hotspot',
        question_text: '⚠️ [HOTSPOT TÁCTIL] Toca directamente en el plano del remolcador la zona de peligro mortal por latigazo (Snap-Back Zone) durante el tiro:',
        options: [],
        hazard_zones: [
          { id: 'snap_back_stern', x: 50, y: 70, radius: 24, label: 'Zona de Latigazo Popa / Seno del Cabo', is_hazard: true }
        ],
        correct_index: 0,
        correct_option: 0,
        correct_order: null,
        time_limit: 25,
        is_high_tide: false
      },
      {
        type: 'sequence',
        question_text: '🔄 ¡Alerta de Girondaje (Girting)! El buque asistido vira bruscamente y arrastra al remolcador de banda. Ordena la secuencia de salvamento:',
        options: [
          '1. Disparar de inmediato el Desenganche Rápido del Gancho/Freno (Quick Release)',
          '2. Cantar por radio VHF al Práctico y Buque: \'¡Línea liberada / Remolque soltado!\'',
          '3. Maniobrar propulsores azimutales para adrizar y estabilizar el buque',
          '4. Evaluar integridad de la tripulación y recoger cabos sueltos fuera de hélices'
        ],
        correct_index: 0,
        correct_option: 0,
        correct_order: [0, 1, 2, 3],
        time_limit: 35,
        is_high_tide: false
      },
      {
        type: 'multiple_choice',
        question_text: '🌊 [MAREA ALTA 2X] Durante una escolta a popa a 10 nudos, ¿por qué está terminantemente prohibido cruzar bajo la línea de remolque tensada?',
        options: [
          'Porque ante rotura el cabo acumula energía elástica y retrocede a más de 800 km/h',
          'Porque el roce del cabo ensucia los uniformes de la guardia',
          'Porque solo está prohibido cuando llueve con truenos',
          'Porque espanta a los pelícanos y gaviotas de la bahía'
        ],
        correct_index: 0,
        correct_option: 0,
        correct_order: null,
        time_limit: 20,
        is_high_tide: true
      },
      {
        type: 'sequence',
        question_text: '🔄 Ordena los 4 pasos clave de una Charla de Seguridad de 5 Minutos (Toolbox Talk) antes de zarpar a una maniobra:',
        options: [
          '1. Evaluar condiciones meteomarinas (viento, corriente y visibilidad)',
          '2. Definir roles en cubierta, puntos ciegos y línea de escape segura',
          '3. Probar comunicación radial VHF y verificar botón de parada de emergencia',
          '4. Confirmar \'Listo a Zarpar\' y asegurar chalecos inflables abrochados'
        ],
        correct_index: 0,
        correct_option: 0,
        correct_order: [0, 1, 2, 3],
        time_limit: 30,
        is_high_tide: false
      },
      {
        type: 'true_false',
        question_text: '🧭 En inspecciones de tanques de lastre o dobles fondos, ¿basta con dejar abierta la tapa 10 minutos para entrar sin medir atmósfera?',
        options: [
          'Verdadero (Con 10 minutos se ventila suficiente)',
          '¡Falso! Se exige medición obligatoria con oxímetro/explosímetro y Permiso de Trabajo Seguro'
        ],
        correct_index: 1,
        correct_option: 1,
        correct_order: null,
        time_limit: 15,
        is_high_tide: false
      },
      {
        type: 'poll_choice',
        question_text: '📊 Como tripulante marítimo de remolcadores, ¿cuál iniciativa SHEQ consideras que tendría mayor impacto inmediato en tu seguridad diaria?',
        options: [
          'Entrenamientos periódicos y simulacros de desenganche rápido (Quick Release)',
          'Cámaras y sensores en cubierta para eliminar puntos ciegos nocturnos',
          'Nuevos chalecos salvavidas autoinflables más ligeros y ergonómicos',
          'Programa de reconocimiento y premios \'Tripulante / Guardián SHEQ del Mes\''
        ],
        correct_index: null,
        correct_option: null,
        correct_order: null,
        time_limit: 25,
        is_high_tide: false
      },
      {
        type: 'poll_rating',
        question_text: '⭐ Del 1 al 10: ¿Qué tan respaldado te sientes por tu equipo y jefatura cuando ejerces la Autoridad de Detener el Trabajo (Stop Work Authority)?',
        options: [],
        correct_index: null,
        correct_option: null,
        correct_order: null,
        time_limit: 25,
        is_high_tide: false
      },
      {
        type: 'poll_text',
        question_text: '💬 En una frase o propuesta náutica: ¿Qué idea sugieres para que cada maniobra en nuestros remolcadores sea 100% segura y con Cero Incidentes?',
        options: [],
        correct_index: null,
        correct_option: null,
        correct_order: null,
        time_limit: 60,
        is_high_tide: false
      }
    ]
  },

  discovery: {
    title: 'Sondeo de Producto, Features y UX - Plataforma Zarpa',
    description: 'Votación de módulos prioritarios, valoración 1-10 de pantallas de maniobra y muro de sugerencias abiertas.',
    badge: 'Product Discovery',
    questions: [
      {
        type: 'poll_choice',
        question_text: '¿Cuál de las siguientes funcionalidades consideras más prioritaria para incorporar en las próximas versiones de Zarpa?',
        options: [
          'Telemetría y monitoreo de consumo de combustible en tiempo real',
          'Simulador 3D interactivo de maniobras y corrientes portuarias',
          'Bitácora digitalizada de mantenimiento predictivo y alertas',
          'App móvil nativa con modo sin conexión para tripulaciones'
        ],
        correct_index: null,
        correct_option: null,
        correct_order: null,
        time_limit: 30,
        is_high_tide: false
      },
      {
        type: 'poll_rating',
        question_text: '¿Cómo calificarías la claridad visual, intuición y diseño de la interfaz táctil para maniobras en Zarpa?',
        options: [],
        correct_index: null,
        correct_option: null,
        correct_order: null,
        time_limit: 30,
        is_high_tide: false
      },
      {
        type: 'poll_choice',
        question_text: '¿Con qué periodicidad te gustaría que la flota realice sesiones de entrenamiento y desafíos náuticos?',
        options: [
          'Semanalmente al inicio de cada guardia/turno',
          'Mensualmente en talleres de seguridad y operaciones',
          'Trimestralmente en jornadas integrales',
          'Solo durante inducciones de nuevos tripulantes'
        ],
        correct_index: null,
        correct_option: null,
        correct_order: null,
        time_limit: 25,
        is_high_tide: false
      },
      {
        type: 'poll_rating',
        question_text: '¿Qué tan útil consideras el sistema de regata en tiempo real y gamificación para motivar al equipo marítimo?',
        options: [],
        correct_index: null,
        correct_option: null,
        correct_order: null,
        time_limit: 30,
        is_high_tide: false
      },
      {
        type: 'poll_text',
        question_text: '¿Qué módulos específicos o sugerencias de mejora propones para enriquecer el entrenamiento y la experiencia en Zarpa?',
        options: [],
        correct_index: null,
        correct_option: null,
        correct_order: null,
        time_limit: 60,
        is_high_tide: false
      }
    ]
  },

  hybrid: {
    title: 'Sesión Híbrida: Summit Seguridad + Discovery Zarpa',
    description: 'Combinación integral: 4 preguntas de trivia competitiva con podio + 3 preguntas de sondeo y UX.',
    badge: 'Modo Integral',
    questions: [
      {
        type: 'multiple_choice',
        question_text: '¿Cuál es el elemento primordial del EPP obligatorio antes de ingresar a la cubierta de maniobras de un remolcador?',
        options: [
          'Casco de seguridad, chaleco autoinflable y calzado de seguridad con puntera',
          'Únicamente chaleco salvavidas estándar',
          'Guantes de descarne y gafas de sol',
          'Botas de agua y ropa impermeable sin chaleco'
        ],
        correct_index: 0,
        correct_option: 0,
        correct_order: null,
        time_limit: 20,
        is_high_tide: false
      },
      {
        type: 'true_false',
        question_text: '¿Es seguro permanecer dentro del seno o línea de tiro de un cabo de remolque sintético cuando está bajo tensión extrema (Snap-Back Zone)?',
        options: [
          'Verdadero (Si se mantiene distancia de 1 metro)',
          'Falso (Es zona de peligro mortal por latigazo)'
        ],
        correct_index: 1,
        correct_option: 1,
        correct_order: null,
        time_limit: 15,
        is_high_tide: false
      },
      {
        type: 'sequence',
        question_text: 'Ordena la secuencia cronológica correcta para la maniobra de aproximación y conexión de cabo de remolque a un buque:',
        options: [
          '1. Establecer comunicación radial VHF con práctico y puente',
          '2. Aproximarse en ángulo seguro manteniendo distancia de la hélice',
          '3. Recibir y cobrar la línea mensajera o guía',
          '4. Hacer firme el cabo principal en la bita y comprobar tensión'
        ],
        correct_index: 0,
        correct_option: 0,
        correct_order: [0, 1, 2, 3],
        time_limit: 30,
        is_high_tide: false
      },
      {
        type: 'multiple_choice',
        question_text: '🌊 En caso de emergencia por escora crítica del remolcador ("girting / tripped by tow"), ¿cuál es la acción inmediata y prioritaria del patrón?',
        options: [
          'Accionar el desenganche rápido del gancho de remolque (Quick Release)',
          'Aumentar máxima potencia en ambos propulsores azimutales',
          'Girar todo el timón hacia la banda de la escora',
          'Cortar el suministro eléctrico general de la nave'
        ],
        correct_index: 0,
        correct_option: 0,
        correct_order: null,
        time_limit: 20,
        is_high_tide: true
      },
      {
        type: 'poll_choice',
        question_text: '¿Cuál de las siguientes funcionalidades consideras más prioritaria para incorporar en las próximas versiones de Zarpa?',
        options: [
          'Telemetría y monitoreo de consumo de combustible en tiempo real',
          'Simulador 3D interactivo de maniobras y corrientes portuarias',
          'Bitácora digitalizada de mantenimiento predictivo y alertas',
          'App móvil nativa con modo sin conexión para tripulaciones'
        ],
        correct_index: null,
        correct_option: null,
        correct_order: null,
        time_limit: 30,
        is_high_tide: false
      },
      {
        type: 'poll_rating',
        question_text: '¿Cómo calificarías la claridad visual, intuición y diseño de la interfaz táctil para maniobras en Zarpa?',
        options: [],
        correct_index: null,
        correct_option: null,
        correct_order: null,
        time_limit: 30,
        is_high_tide: false
      },
      {
        type: 'poll_text',
        question_text: '¿Qué módulos específicos o sugerencias de mejora propones para enriquecer el entrenamiento y la experiencia en Zarpa?',
        options: [],
        correct_index: null,
        correct_option: null,
        correct_order: null,
        time_limit: 60,
        is_high_tide: false
      }
    ]
  }
};

// ===========================================================================
// Inicialización del DOM y Eventos
// ===========================================================================
async function initAdmin() {
  try {
    injectOceanBg();
  } catch (e) {
    console.warn('injectOceanBg error:', e);
  }

  try {
    if (qs('#brandIcon') && typeof tugLogoSVG === 'function') qs('#brandIcon').innerHTML = tugLogoSVG();
  } catch (e) {
    console.warn('Brand icon error:', e);
  }
  
  // Renderizar formulario inicial con tipo opción múltiple
  try {
    renderOptionInputs('multiple_choice');
  } catch (e) {
    console.warn('renderOptionInputs error:', e);
  }

  // Listeners de creación de sesiones
  if (qs('#btnCreateSession')) qs('#btnCreateSession').addEventListener('click', createSession);
  if (qs('#btnRefreshSessions')) qs('#btnRefreshSessions').addEventListener('click', loadSessions);
  
  // Listeners de Plantillas 1-click
  if (qs('#btnTplSummit')) qs('#btnTplSummit').addEventListener('click', () => createFromTemplate('summit'));
  if (qs('#btnTplDiscovery')) qs('#btnTplDiscovery').addEventListener('click', () => createFromTemplate('discovery'));
  if (qs('#btnTplHybrid')) qs('#btnTplHybrid').addEventListener('click', () => createFromTemplate('hybrid'));

  // Listeners del Editor
  if (qs('#btnCloseEditor')) qs('#btnCloseEditor').addEventListener('click', closeEditor);
  if (qs('#btnSaveQuestion')) qs('#btnSaveQuestion').addEventListener('click', saveQuestion);
  if (qs('#btnCancelEdit')) qs('#btnCancelEdit').addEventListener('click', cancelEdit);
  if (qs('#qType')) qs('#qType').addEventListener('change', (e) => onQuestionTypeChange(e.target.value));

  // Importar / Exportar JSON
  if (qs('#btnExportJson')) qs('#btnExportJson').addEventListener('click', exportCurrentSessionJson);
  if (qs('#btnImportJson')) qs('#btnImportJson').addEventListener('click', () => qs('#jsonFileInput').click());
  if (qs('#jsonFileInput')) qs('#jsonFileInput').addEventListener('change', handleJsonFileSelected);

  // Auth Gate
  if (qs('#btnLogin')) qs('#btnLogin').addEventListener('click', handleLogin);
  if (qs('#loginPassword')) qs('#loginPassword').addEventListener('keydown', (e) => { if (e.key === 'Enter') handleLogin(); });
  if (qs('#btnLogout')) qs('#btnLogout').addEventListener('click', handleLogout);

  await initAuthGate();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAdmin);
} else {
  initAdmin();
}

// ===========================================================================
// Puerta de Acceso (Auth Gate con Supabase Auth)
// ===========================================================================
async function initAuthGate() {
  try {
    const { data: { session } } = await sb.auth.getSession();
    if (session) {
      showAdminPanel();
    } else {
      showLoginScreen();
    }

    sb.auth.onAuthStateChange((_event, session) => {
      if (session) {
        showAdminPanel();
      } else {
        showLoginScreen();
      }
    });
  } catch (err) {
    console.error('Error verificando sesión auth:', err);
    showLoginScreen();
  }
}

function showAdminPanel() {
  qs('#viewLogin').classList.add('hidden');
  qs('#adminContent').classList.remove('hidden');
  qs('#btnLogout').classList.remove('hidden');
  qs('#btnHelpGuide')?.classList.remove('hidden');
  qs('#btnFloatingHelp')?.classList.remove('hidden');
  
  loadSessions();
  setupOnboardingTour();
  checkAutoOnboarding();
}

function showLoginScreen() {
  qs('#viewLogin').classList.remove('hidden');
  qs('#adminContent').classList.add('hidden');
  qs('#btnLogout').classList.add('hidden');
  qs('#btnHelpGuide')?.classList.add('hidden');
  qs('#btnFloatingHelp')?.classList.add('hidden');
  closeOnboarding();
}

// ===========================================================================
// Bitácora del Capitán: Controlador de Onboarding & Guía de Ayuda
// ===========================================================================
let currentOnboardingSlide = 1;
const TOTAL_ONBOARDING_SLIDES = 5;

const SLIDE_METADATA = [
  { icon: '🧭', title: 'Bitácora del Capitán', subtitle: 'Paso 1 de 5 · Arquitectura & Flujo General' },
  { icon: '🚢', title: 'Plantillas 1-Click', subtitle: 'Paso 2 de 5 · Listas para Lanzar al Mar' },
  { icon: '🎮', title: 'Dinámicas & Mecánicas', subtitle: 'Paso 3 de 5 · Los 6 Formatos & Marea Alta 2x' },
  { icon: '📺', title: 'El Día de la Travesía', subtitle: 'Paso 4 de 5 · Proyección & Control en Vivo' },
  { icon: '📊', title: 'Centro de Analítica', subtitle: 'Paso 5 de 5 · Métricas, CSV y Diplomas' }
];

function setupOnboardingTour() {
  // Botones para abrir guía
  qs('#btnHelpGuide')?.addEventListener('click', () => openOnboarding(1));
  qs('#btnStartTour')?.addEventListener('click', () => openOnboarding(1));
  qs('#btnFloatingHelp')?.addEventListener('click', () => openOnboarding(1));

  // Botón cerrar
  qs('#btnCloseOnboarding')?.addEventListener('click', closeOnboarding);

  // Overlay click para cerrar
  const overlay = qs('#onboardingOverlay');
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeOnboarding();
    });
  }

  // Navegación de slides
  qs('#btnNextSlide')?.addEventListener('click', () => {
    if (currentOnboardingSlide < TOTAL_ONBOARDING_SLIDES) {
      goToOnboardingSlide(currentOnboardingSlide + 1);
    }
  });

  qs('#btnPrevSlide')?.addEventListener('click', () => {
    if (currentOnboardingSlide > 1) {
      goToOnboardingSlide(currentOnboardingSlide - 1);
    }
  });

  qs('#btnFinishOnboarding')?.addEventListener('click', () => {
    try {
      localStorage.setItem('marejada_admin_onboarded', 'true');
    } catch (e) {}
    closeOnboarding();
  });

  // Clicks en los puntos (dots)
  qsa('.onboarding-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      const step = parseInt(dot.dataset.step, 10);
      if (step >= 1 && step <= TOTAL_ONBOARDING_SLIDES) {
        goToOnboardingSlide(step);
      }
    });
  });

  // Toggle de la guía rápida FAQ
  const btnQuickToggle = qs('#btnQuickGuideToggle');
  const quickContent = qs('#quickGuideContent');
  if (btnQuickToggle && quickContent) {
    btnQuickToggle.addEventListener('click', () => {
      const isHidden = quickContent.classList.toggle('hidden');
      btnQuickToggle.textContent = isHidden ? '📖 Ver Guía Rápida' : '✕ Ocultar Guía';
    });
  }

  // Teclado (Escape / Flechas)
  document.addEventListener('keydown', (e) => {
    const overlayEl = qs('#onboardingOverlay');
    if (!overlayEl || overlayEl.classList.contains('hidden')) return;

    if (e.key === 'Escape') {
      closeOnboarding();
    } else if (e.key === 'ArrowRight' && currentOnboardingSlide < TOTAL_ONBOARDING_SLIDES) {
      goToOnboardingSlide(currentOnboardingSlide + 1);
    } else if (e.key === 'ArrowLeft' && currentOnboardingSlide > 1) {
      goToOnboardingSlide(currentOnboardingSlide - 1);
    }
  });
}

function openOnboarding(startSlide = 1) {
  const overlay = qs('#onboardingOverlay');
  if (!overlay) return;
  overlay.classList.remove('hidden');
  goToOnboardingSlide(startSlide);
}

function closeOnboarding() {
  const overlay = qs('#onboardingOverlay');
  if (overlay) overlay.classList.add('hidden');
}

function goToOnboardingSlide(slideNum) {
  currentOnboardingSlide = Math.max(1, Math.min(TOTAL_ONBOARDING_SLIDES, slideNum));
  const meta = SLIDE_METADATA[currentOnboardingSlide - 1] || SLIDE_METADATA[0];

  // Actualizar Header
  const iconEl = qs('#onboardingHeaderIcon');
  const titleEl = qs('#onboardingHeaderTitle');
  const subEl = qs('#onboardingHeaderSubtitle');
  if (iconEl) iconEl.textContent = meta.icon;
  if (titleEl) titleEl.textContent = meta.title;
  if (subEl) subEl.textContent = meta.subtitle;

  // Actualizar visibilidad de slides
  qsa('.onboarding-slide').forEach(slide => {
    const sIdx = parseInt(slide.dataset.slide, 10);
    slide.classList.toggle('active', sIdx === currentOnboardingSlide);
  });

  // Actualizar dots
  qsa('.onboarding-dot').forEach(dot => {
    const dStep = parseInt(dot.dataset.step, 10);
    dot.classList.toggle('active', dStep === currentOnboardingSlide);
  });

  // Actualizar Botones de Navegación
  const btnPrev = qs('#btnPrevSlide');
  const btnNext = qs('#btnNextSlide');
  const btnFinish = qs('#btnFinishOnboarding');

  if (btnPrev) btnPrev.disabled = currentOnboardingSlide === 1;
  
  if (currentOnboardingSlide === TOTAL_ONBOARDING_SLIDES) {
    if (btnNext) btnNext.classList.add('hidden');
    if (btnFinish) btnFinish.classList.remove('hidden');
  } else {
    if (btnNext) btnNext.classList.remove('hidden');
    if (btnFinish) btnFinish.classList.add('hidden');
  }
}

function checkAutoOnboarding() {
  try {
    const hasSeen = localStorage.getItem('marejada_admin_onboarded');
    if (!hasSeen) {
      setTimeout(() => openOnboarding(1), 400);
    }
  } catch (e) {
    // Si localStorage no está disponible, no auto-abrir
  }
}

async function handleLogin() {
  const email = qs('#loginEmail').value.trim();
  const password = qs('#loginPassword').value;
  const errorEl = qs('#loginError');
  errorEl.textContent = '';

  if (!email || !password) {
    errorEl.textContent = 'Ingresa tu correo y contraseña.';
    return;
  }

  const btn = qs('#btnLogin');
  btn.disabled = true;
  btn.textContent = 'Verificando...';
  
  try {
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) {
      errorEl.textContent = 'Credenciales incorrectas. Intenta de nuevo.';
      return;
    }
    qs('#loginPassword').value = '';
  } catch (err) {
    errorEl.textContent = 'Error al conectar con el servidor.';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Ingresar al panel';
  }
}

async function handleLogout() {
  await sb.auth.signOut();
}

// ===========================================================================
// Gestión de Sesiones (Cargar, Crear, Duplicar, Eliminar)
// ===========================================================================
async function loadSessions() {
  const container = qs('#sessionsList');
  container.innerHTML = `<p class="muted">Cargando sesiones...</p>`;
  
  try {
    const { data, error } = await sb.from('sessions').select('*').order('created_at', { ascending: false });
    if (error) {
      container.innerHTML = `<p class="muted">Error cargando sesiones: ${escapeHtml(error.message)}</p>`;
      return;
    }
    if (!data || data.length === 0) {
      container.innerHTML = `<p class="muted">No hay sesiones todavía. Crea una con los botones de plantilla o el formulario.</p>`;
      return;
    }

    container.innerHTML = data.map(s => `
      <div class="session-card">
        <div class="flex-between wrap gap-12">
          <div>
            <div class="flex gap-8 wrap" style="align-items:center;">
              <strong>${escapeHtml(s.title)}</strong> ${statusBadge(s.status)}
            </div>
            <div class="muted mt-8" style="font-size:0.88rem;">
              PIN: <strong style="color:var(--color-gold); font-size:1rem;">${s.pin}</strong> · Creada: ${formatDate(s.created_at)}
            </div>
          </div>
          <div class="flex gap-8 wrap" style="align-items:center;">
            <button class="btn-secondary btn-sm" data-action="edit" data-id="${s.id}">✏️ Preguntas</button>
            <button class="btn-secondary btn-icon" data-action="duplicate" data-id="${s.id}" title="Duplicar sesión">${ICONS.copy}</button>
            <button class="btn-danger btn-icon" data-action="delete" data-id="${s.id}" title="Eliminar sesión">${ICONS.trash}</button>
          </div>
        </div>
      </div>
    `).join('');

    qsa('[data-action="edit"]', container).forEach(btn => btn.addEventListener('click', () => openEditor(btn.dataset.id)));
    qsa('[data-action="duplicate"]', container).forEach(btn => btn.addEventListener('click', () => duplicateSession(btn.dataset.id)));
    qsa('[data-action="delete"]', container).forEach(btn => btn.addEventListener('click', () => deleteSession(btn.dataset.id)));
  } catch (err) {
    console.error('Error al cargar sesiones:', err);
    container.innerHTML = `<p class="muted">Error de conexión al cargar sesiones.</p>`;
  }
}

async function createSession() {
  const title = qs('#newSessionTitle').value.trim();
  if (!title) {
    alert('Escribe un título para la sesión.');
    qs('#newSessionTitle').focus();
    return;
  }
  
  const pin = await generateUniquePin();
  const { data, error } = await sb.from('sessions').insert({ title, pin, status: 'draft' }).select().single();
  if (error) {
    alert('Error creando la sesión: ' + error.message);
    return;
  }
  
  qs('#newSessionTitle').value = '';
  await loadSessions();
  openEditor(data.id);
}

/**
 * Crea una sesión completa a partir de una plantilla marítima precargada
 * @param {'summit'|'discovery'|'hybrid'} templateKey 
 */
async function createFromTemplate(templateKey) {
  const tpl = TEMPLATES[templateKey];
  if (!tpl) return;

  const btn = qs(`#btnTpl${templateKey.charAt(0).toUpperCase() + templateKey.slice(1)}`);
  const originalText = btn ? btn.textContent : '';
  if (btn) { btn.disabled = true; btn.textContent = 'Creando sesión...'; }

  try {
    const pin = await generateUniquePin();
    const { data: newSession, error: sErr } = await sb.from('sessions').insert({
      title: tpl.title,
      pin,
      status: 'draft'
    }).select().single();

    if (sErr || !newSession) {
      alert('Error creando sesión desde plantilla: ' + (sErr ? sErr.message : 'Desconocido'));
      return;
    }

    // Insertar preguntas de la plantilla
    const questionsToInsert = tpl.questions.map((q, idx) => {
      const formatted = window.Mechanics ? Mechanics.formatQuestion(q) : q;
      return {
        session_id: newSession.id,
        type: formatted.type,
        question_text: formatted.question_text,
        options: formatted.options,
        time_limit: formatted.time_limit || 20,
        correct_option: formatted.correct_option !== undefined ? formatted.correct_option : formatted.correct_index,
        position: idx
      };
    });

    // Intentar inserción con is_high_tide si existe en el modelo
    const insertPayload = questionsToInsert.map((q, idx) => ({
      ...q,
      is_high_tide: Boolean(tpl.questions[idx].is_high_tide)
    }));

    const { error: qErr } = await sb.from('questions').insert(insertPayload);
    if (qErr) {
      // Fallback si la columna is_high_tide no existe en Postgres
      console.warn('Fallback de inserción sin is_high_tide:', qErr.message);
      await sb.from('questions').insert(questionsToInsert);
    }

    await loadSessions();
    openEditor(newSession.id);
  } catch (err) {
    console.error('Error al instanciar plantilla:', err);
    alert('Error al instanciar plantilla.');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = originalText; }
  }
}

async function duplicateSession(id) {
  try {
    const { data: original, error: oErr } = await sb.from('sessions').select('*').eq('id', id).single();
    if (oErr || !original) { alert('No se pudo encontrar la sesión original.'); return; }
    
    const { data: questions } = await sb.from('questions').select('*').eq('session_id', id).order('position');
    const pin = await generateUniquePin();
    
    const { data: newSession, error: nErr } = await sb.from('sessions').insert({
      title: `${original.title} (copia)`,
      pin,
      status: 'draft'
    }).select().single();

    if (nErr || !newSession) { alert('Error duplicando sesión: ' + (nErr ? nErr.message : '')); return; }

    if (questions && questions.length > 0) {
      const inserts = questions.map(q => ({
        session_id: newSession.id,
        type: q.type,
        question_text: q.question_text,
        options: q.options,
        time_limit: q.time_limit,
        correct_option: q.correct_option,
        position: q.position,
        is_high_tide: q.is_high_tide || false
      }));

      const { error: insErr } = await sb.from('questions').insert(inserts);
      if (insErr) {
        // Fallback sin is_high_tide
        const cleanInserts = inserts.map(({ is_high_tide, ...rest }) => rest);
        await sb.from('questions').insert(cleanInserts);
      }
    }

    await loadSessions();
  } catch (err) {
    console.error('Error duplicando sesión:', err);
    alert('Error al duplicar sesión.');
  }
}

async function deleteSession(id) {
  if (!confirm('¿Eliminar esta sesión y todas sus preguntas/respuestas asociadas? Esta acción no se puede deshacer.')) return;
  
  try {
    const { error } = await sb.from('sessions').delete().eq('id', id);
    if (error) { alert('Error eliminando: ' + error.message); return; }
    if (currentSessionId === id) closeEditor();
    await loadSessions();
  } catch (err) {
    console.error('Error al eliminar sesión:', err);
  }
}

// ===========================================================================
// Editor de Preguntas y Vistas Dinámicas
// ===========================================================================
async function openEditor(id) {
  try {
    const { data: session, error } = await sb.from('sessions').select('*').eq('id', id).single();
    if (error || !session) { alert('No se pudo abrir el editor para la sesión seleccionada.'); return; }
    
    currentSessionId = id;
    currentSession = session;
    cancelEdit(); // Reiniciar estado de edición previo si existía

    qs('#editorPanel').classList.remove('hidden');
    qs('#editorPin').textContent = `PIN ${session.pin} · ${STATUS_LABELS[session.status] || session.status}`;
    qs('#editorTitle').textContent = session.title;
    
    qs('#editorPanel').scrollIntoView({ behavior: 'smooth' });
    await loadQuestions();
  } catch (err) {
    console.error('Error abriendo editor:', err);
  }
}

function closeEditor() {
  currentSessionId = null;
  currentSession = null;
  currentQuestions = [];
  editingQuestionId = null;
  qs('#editorPanel').classList.add('hidden');
}

async function loadQuestions() {
  if (!currentSessionId) return;
  try {
    const { data, error } = await sb.from('questions').select('*').eq('session_id', currentSessionId).order('position');
    currentQuestions = (data || []).map(q => (window.Mechanics ? Mechanics.formatQuestion(q) : q));
    renderQuestionsList();
  } catch (err) {
    console.error('Error cargando preguntas:', err);
  }
}

function renderQuestionsList() {
  const container = qs('#questionsList');
  const badge = qs('#questionsCountBadge');
  if (badge) badge.textContent = `${currentQuestions.length} pregunta${currentQuestions.length === 1 ? '' : 's'}`;

  if (!currentQuestions.length) {
    container.innerHTML = `<p class="muted">Sin preguntas aún. Agrega una con el formulario a la izquierda o carga una plantilla.</p>`;
    return;
  }

  container.innerHTML = currentQuestions.map((q, idx) => {
    const isEditing = editingQuestionId === q.id;
    const typeIcon = window.Mechanics ? Mechanics.getQuestionTypeIcon(q.type) : '⚓';
    const typeLabel = window.Mechanics ? Mechanics.getQuestionTypeLabel(q.type) : q.type;
    const isHighTide = Boolean(q.is_high_tide);

    let detailsText = `${q.time_limit || 20}s`;
    if (q.type === 'sequence') {
      detailsText += ` · ${(q.options || []).length} pasos cronológicos`;
    } else if (q.type === 'poll_rating' || q.type === 'scale') {
      detailsText += ` · Escala del 1 al 10`;
    } else if (q.type === 'poll_text' || q.type === 'text') {
      detailsText += ` · Texto libre`;
    } else if (q.type === 'poll_choice' || q.type === 'survey') {
      detailsText += ` · ${(q.options || []).length} alternativas (Sondeo)`;
    } else if (q.options && q.options.length) {
      const correctIdx = q.correct_option !== null && q.correct_option !== undefined ? q.correct_option : q.correct_index;
      const correctLetter = OPTION_LABELS[correctIdx] || (correctIdx !== null ? `Opción ${correctIdx + 1}` : 'N/A');
      detailsText += ` · ${q.options.length} opciones · Correcta: <strong style="color:var(--color-gold);">${correctLetter}</strong>`;
    }

    return `
      <div class="question-row-item ${isEditing ? 'editing' : ''}" id="qItem_${q.id}">
        <div style="flex:1; min-width:0;">
          <div class="flex gap-8 wrap" style="align-items:center;">
            <span class="type-tag">${typeIcon} ${typeLabel}</span>
            ${isHighTide ? `<span class="high-tide-tag">🌊 2x Marea Alta</span>` : ''}
            <strong>${idx + 1}.</strong>
            <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:300px;" title="${escapeHtml(q.question_text)}">
              ${escapeHtml(q.question_text)}
            </span>
          </div>
          <div class="muted" style="font-size:0.8rem; margin-top:4px;">${detailsText}</div>
        </div>
        <div class="flex gap-6 wrap" style="align-items:center; flex-shrink:0;">
          <button class="btn-secondary btn-icon" data-action="up" data-id="${q.id}" title="Subir orden" ${idx === 0 ? 'disabled' : ''}>${ICONS.arrowUp}</button>
          <button class="btn-secondary btn-icon" data-action="down" data-id="${q.id}" title="Bajar orden" ${idx === currentQuestions.length - 1 ? 'disabled' : ''}>${ICONS.arrowDown}</button>
          <button class="btn-secondary btn-icon" data-action="edit-q" data-id="${q.id}" title="Editar">${ICONS.edit || '✏️'}</button>
          <button class="btn-secondary btn-icon" data-action="dup-q" data-id="${q.id}" title="Duplicar">${ICONS.copy}</button>
          <button class="btn-danger btn-icon" data-action="del-q" data-id="${q.id}" title="Eliminar">${ICONS.trash}</button>
        </div>
      </div>
    `;
  }).join('');

  qsa('[data-action="up"]', container).forEach(b => b.addEventListener('click', () => moveQuestion(b.dataset.id, -1)));
  qsa('[data-action="down"]', container).forEach(b => b.addEventListener('click', () => moveQuestion(b.dataset.id, 1)));
  qsa('[data-action="edit-q"]', container).forEach(b => b.addEventListener('click', () => startEditQuestion(b.dataset.id)));
  qsa('[data-action="dup-q"]', container).forEach(b => b.addEventListener('click', () => duplicateQuestion(b.dataset.id)));
  qsa('[data-action="del-q"]', container).forEach(b => b.addEventListener('click', () => deleteQuestion(b.dataset.id)));
}

// ===========================================================================
// Renderizador Dinámico de Opciones del Formulario
// ===========================================================================
function onQuestionTypeChange(type) {
  renderOptionInputs(type);
}

/**
 * Renderiza dinámicamente los campos de opciones según el tipo de pregunta
 * @param {string} type - Tipo de pregunta
 * @param {Object} [initialData=null] - Datos para precargar al editar
 */
function renderOptionInputs(type, initialData = null) {
  const block = qs('#optionsBlock');
  const title = qs('#optionsBlockTitle');
  const hint = qs('#optionsBlockHint');
  const inputs = qs('#optionsInputs');
  const highTideBlock = qs('#highTideBlock');
  const highTideCheck = qs('#qHighTide');

  const isPoll = window.Mechanics ? Mechanics.isPollType(type) : (type.startsWith('poll_') || type === 'survey' || type === 'scale' || type === 'text');

  // Ajuste del toggle de Marea Alta
  if (isPoll) {
    if (highTideCheck) highTideCheck.checked = false;
    if (highTideBlock) highTideBlock.style.opacity = '0.35';
    if (highTideBlock) highTideBlock.title = 'Marea Alta no aplica a preguntas de sondeo sin puntaje.';
  } else {
    if (highTideBlock) highTideBlock.style.opacity = '1';
    if (highTideBlock) highTideBlock.title = '';
  }

  // 1. OPCIÓN MÚLTIPLE (Trivia / Quiz)
  if (type === 'multiple_choice' || type === 'quiz') {
    block.classList.remove('hidden');
    title.textContent = 'Opciones de respuesta (Marca la correcta)';
    hint.textContent = 'Marca el botón circular en la opción correcta';

    const opts = initialData && Array.isArray(initialData.options) && initialData.options.length ? initialData.options : ['', '', '', ''];
    const correctIdx = initialData ? (initialData.correct_option ?? initialData.correct_index ?? 0) : 0;

    inputs.innerHTML = [0, 1, 2, 3].map(i => `
      <div class="dynamic-input-row">
        <input type="radio" name="correctOpt" value="${i}" style="width:auto; cursor:pointer;" ${Number(correctIdx) === i ? 'checked' : ''} title="Marcar como correcta">
        <span class="input-badge-prefix">${OPTION_LABELS[i]}</span>
        <input type="text" class="opt-input" data-idx="${i}" value="${escapeHtml(opts[i] || '')}" placeholder="Opción ${OPTION_LABELS[i]}${i < 2 ? ' (requerida)' : ' (opcional)'}">
      </div>
    `).join('');
  }
  // 2. VERDADERO / FALSO NÁUTICO
  else if (type === 'true_false') {
    block.classList.remove('hidden');
    title.textContent = 'Alternativas Verdadero / Falso Náutico';
    hint.textContent = 'Selecciona cuál es la condición o afirmación correcta';

    const opts = initialData && Array.isArray(initialData.options) && initialData.options.length >= 2
      ? initialData.options
      : ['Verdadero', 'Falso'];
    const correctIdx = initialData ? (initialData.correct_option ?? initialData.correct_index ?? 0) : 0;

    inputs.innerHTML = [0, 1].map(i => `
      <div class="dynamic-input-row">
        <input type="radio" name="correctOpt" value="${i}" style="width:auto; cursor:pointer;" ${Number(correctIdx) === i ? 'checked' : ''} title="Marcar como correcta">
        <span class="input-badge-prefix">${i === 0 ? '🟢' : '🔴'}</span>
        <input type="text" class="opt-input" data-idx="${i}" value="${escapeHtml(opts[i] || '')}" placeholder="${i === 0 ? 'Verdadero / Condición Segura' : 'Falso / Condición Insegura'}">
      </div>
    `).join('');
  }
  // 3. SECUENCIA DE MANIOBRA (Ordenar pasos)
  else if (type === 'sequence') {
    block.classList.remove('hidden');
    title.textContent = 'Pasos de la maniobra en orden cronológico';
    hint.textContent = 'Escribe los pasos en el orden correcto (se mezclarán para los jugadores)';

    const defaultSteps = ['Paso 1: Comunicación radial', 'Paso 2: Aproximación en ángulo seguro', 'Paso 3: Cobrar línea mensajera', 'Paso 4: Hacer firme en bita'];
    const steps = initialData && Array.isArray(initialData.options) && initialData.options.length ? initialData.options : defaultSteps;

    inputs.innerHTML = `
      <div id="sequenceStepsContainer">
        ${steps.map((step, idx) => `
          <div class="dynamic-input-row step-row" data-step-idx="${idx}">
            <span class="input-badge-prefix">${idx + 1}</span>
            <input type="text" class="step-input" value="${escapeHtml(step)}" placeholder="Paso ${idx + 1} de la maniobra...">
            <button type="button" class="btn-danger btn-icon btn-remove-step" title="Quitar paso" style="padding:6px 10px;">✕</button>
          </div>
        `).join('')}
      </div>
      <button type="button" class="btn-secondary btn-sm mt-8" id="btnAddStep">➕ Agregar otro paso</button>
    `;

    attachStepControls();
  }
  // 4. VOTACIÓN DE FUNCIONALIDADES (Sondeo / Features)
  else if (type === 'poll_choice' || type === 'survey') {
    block.classList.remove('hidden');
    title.textContent = 'Opciones para votación y priorización';
    hint.textContent = 'Define las alternativas para que la tripulación vote (sin evaluación de correcta)';

    const defaultPoll = ['Opción A', 'Opción B', 'Opción C', 'Opción D'];
    const pollOpts = initialData && Array.isArray(initialData.options) && initialData.options.length ? initialData.options : defaultPoll;

    inputs.innerHTML = `
      <div id="pollOptionsContainer">
        ${pollOpts.map((opt, idx) => `
          <div class="dynamic-input-row poll-row" data-poll-idx="${idx}">
            <span class="input-badge-prefix">${OPTION_LABELS[idx] || (idx + 1)}</span>
            <input type="text" class="poll-input" value="${escapeHtml(opt)}" placeholder="Alternativa de votación ${idx + 1}...">
            <button type="button" class="btn-danger btn-icon btn-remove-poll-opt" title="Quitar alternativa" style="padding:6px 10px;">✕</button>
          </div>
        `).join('')}
      </div>
      <button type="button" class="btn-secondary btn-sm mt-8" id="btnAddPollOpt">➕ Agregar otra alternativa</button>
    `;

    attachPollControls();
  }
  // 5. VALORACIÓN DE PANTALLAS / UX (Escala 1 al 10)
  else if (type === 'poll_rating' || type === 'scale') {
    block.classList.remove('hidden');
    title.textContent = 'Escala Náutica de Valoración (1 al 10)';
    hint.textContent = 'Métrica continua de satisfacción / UX';
    inputs.innerHTML = `
      <div class="info-box">
        ⭐ <strong>Formato de Valoración 1 al 10:</strong> Los jugadores verán una escala náutica interactiva del 1 (Muy insatisfactorio / Riesgoso) al 10 (Excelente / Seguro). No requiere configurar opciones fijas.
      </div>
    `;
  }
  // 6. SUGERENCIAS Y FEEDBACK ABIERTO (Texto libre)
  else if (type === 'poll_text' || type === 'text') {
    block.classList.remove('hidden');
    title.textContent = 'Caja de Sugerencias y Feedback Abierto';
    hint.textContent = 'Recolección de opiniones libres de la flota';
    inputs.innerHTML = `
      <div class="info-box">
        💬 <strong>Formato de Texto Libre:</strong> Cada tripulante podrá redactar sus sugerencias, opiniones o hallazgos en un campo de texto de hasta 400 caracteres. No requiere opciones fijas.
      </div>
    `;
  }
  // 7. IDENTIFICACIÓN DE PELIGROS / HOTSPOT
  else if (type === 'hazard_hotspot' || type === 'hotspot') {
    block.classList.remove('hidden');
    title.textContent = 'Configuración de Zona de Peligro en Cubierta';
    hint.textContent = 'El jugador deberá tocar la zona de mayor riesgo en el plano náutico';
    inputs.innerHTML = `
      <div class="info-box">
        ⚠️ <strong>Formato Hotspot de Seguridad:</strong> Presenta un plano de cubierta del remolcador con la zona de popa y seno de maniobra señalada como riesgo crítico de latigazo (Snap-Back). La validación calcula la proximidad al peligro en tiempo real.
      </div>
    `;
  } else {
    block.classList.add('hidden');
    inputs.innerHTML = '';
  }
}

function attachStepControls() {
  const container = qs('#sequenceStepsContainer');
  const btnAdd = qs('#btnAddStep');
  if (!container || !btnAdd) return;

  btnAdd.onclick = () => {
    const currentCount = container.querySelectorAll('.step-row').length;
    if (currentCount >= 6) {
      alert('Máximo 6 pasos por secuencia de maniobra.');
      return;
    }
    const div = document.createElement('div');
    div.className = 'dynamic-input-row step-row';
    div.dataset.stepIdx = String(currentCount);
    div.innerHTML = `
      <span class="input-badge-prefix">${currentCount + 1}</span>
      <input type="text" class="step-input" placeholder="Paso ${currentCount + 1} de la maniobra...">
      <button type="button" class="btn-danger btn-icon btn-remove-step" title="Quitar paso" style="padding:6px 10px;">✕</button>
    `;
    container.appendChild(div);
    attachStepRemoveListeners();
  };

  attachStepRemoveListeners();
}

function attachStepRemoveListeners() {
  const container = qs('#sequenceStepsContainer');
  if (!container) return;
  qsa('.btn-remove-step', container).forEach(btn => {
    btn.onclick = (e) => {
      const rows = container.querySelectorAll('.step-row');
      if (rows.length <= 2) {
        alert('Una secuencia requiere al menos 2 pasos.');
        return;
      }
      e.target.closest('.step-row').remove();
      // Renumerar prefijos
      container.querySelectorAll('.step-row').forEach((row, i) => {
        row.dataset.stepIdx = String(i);
        const prefix = row.querySelector('.input-badge-prefix');
        if (prefix) prefix.textContent = String(i + 1);
      });
    };
  });
}

function attachPollControls() {
  const container = qs('#pollOptionsContainer');
  const btnAdd = qs('#btnAddPollOpt');
  if (!container || !btnAdd) return;

  btnAdd.onclick = () => {
    const currentCount = container.querySelectorAll('.poll-row').length;
    if (currentCount >= 6) {
      alert('Máximo 6 alternativas por sondeo.');
      return;
    }
    const div = document.createElement('div');
    div.className = 'dynamic-input-row poll-row';
    div.dataset.pollIdx = String(currentCount);
    div.innerHTML = `
      <span class="input-badge-prefix">${OPTION_LABELS[currentCount] || (currentCount + 1)}</span>
      <input type="text" class="poll-input" placeholder="Alternativa de votación ${currentCount + 1}...">
      <button type="button" class="btn-danger btn-icon btn-remove-poll-opt" title="Quitar alternativa" style="padding:6px 10px;">✕</button>
    `;
    container.appendChild(div);
    attachPollRemoveListeners();
  };

  attachPollRemoveListeners();
}

function attachPollRemoveListeners() {
  const container = qs('#pollOptionsContainer');
  if (!container) return;
  qsa('.btn-remove-poll-opt', container).forEach(btn => {
    btn.onclick = (e) => {
      const rows = container.querySelectorAll('.poll-row');
      if (rows.length <= 2) {
        alert('Un sondeo requiere al menos 2 alternativas.');
        return;
      }
      e.target.closest('.poll-row').remove();
      container.querySelectorAll('.poll-row').forEach((row, i) => {
        row.dataset.pollIdx = String(i);
        const prefix = row.querySelector('.input-badge-prefix');
        if (prefix) prefix.textContent = OPTION_LABELS[i] || String(i + 1);
      });
    };
  });
}

// ===========================================================================
// Guardar / Editar Pregunta
// ===========================================================================
async function saveQuestion() {
  if (!currentSessionId) return;

  const type = qs('#qType').value;
  const text = qs('#qText').value.trim();
  const timeLimit = parseInt(qs('#qTime').value, 10) || 20;
  const isHighTide = Boolean(qs('#qHighTide').checked);

  if (!text) {
    alert('Escribe el enunciado o texto de la pregunta.');
    qs('#qText').focus();
    return;
  }

  let options = [];
  let correctOption = null;
  let correctOrder = null;

  // 1. Validaciones por Tipo
  if (type === 'multiple_choice' || type === 'quiz') {
    const inputs = qsa('.opt-input');
    options = inputs.map(i => i.value.trim()).filter(v => v.length > 0);
    if (options.length < 2) {
      alert('Agrega al menos 2 opciones de respuesta.');
      return;
    }
    const checked = qs('input[name="correctOpt"]:checked');
    correctOption = checked ? parseInt(checked.value, 10) : 0;
    if (correctOption >= options.length) correctOption = 0;
  } else if (type === 'true_false') {
    const inputs = qsa('.opt-input');
    options = inputs.map(i => i.value.trim()).filter(v => v.length > 0);
    if (options.length < 2) {
      options = ['Verdadero', 'Falso'];
    }
    const checked = qs('input[name="correctOpt"]:checked');
    correctOption = checked ? parseInt(checked.value, 10) : 0;
  } else if (type === 'sequence') {
    const stepInputs = qsa('.step-input');
    options = stepInputs.map(i => i.value.trim()).filter(v => v.length > 0);
    if (options.length < 2) {
      alert('Agrega al menos 2 pasos para la secuencia.');
      return;
    }
    correctOrder = options.map((_, i) => i);
    correctOption = 0; // Compatibilidad retroactiva
  } else if (type === 'poll_choice' || type === 'survey') {
    const pollInputs = qsa('.poll-input');
    options = pollInputs.map(i => i.value.trim()).filter(v => v.length > 0);
    if (options.length < 2) {
      alert('Agrega al menos 2 alternativas para el sondeo.');
      return;
    }
    correctOption = null;
  } else if (type === 'poll_rating' || type === 'scale' || type === 'poll_text' || type === 'text') {
    options = [];
    correctOption = null;
  } else if (type === 'hazard_hotspot' || type === 'hotspot') {
    options = [];
    correctOption = 0;
  }

  const isPoll = window.Mechanics ? Mechanics.isPollType(type) : false;
  const highTideFinal = isPoll ? false : isHighTide;

  const btnSave = qs('#btnSaveQuestion');
  btnSave.disabled = true;
  btnSave.textContent = 'Guardando...';

  try {
    if (editingQuestionId) {
      // Modo Edición
      const payload = {
        type,
        question_text: text,
        options,
        time_limit: timeLimit,
        correct_option: correctOption,
        is_high_tide: highTideFinal
      };

      const { error } = await sb.from('questions').update(payload).eq('id', editingQuestionId);
      if (error) {
        // Fallback sin is_high_tide
        console.warn('Fallback update sin is_high_tide:', error.message);
        const { is_high_tide, ...cleanPayload } = payload;
        await sb.from('questions').update(cleanPayload).eq('id', editingQuestionId);
      }
    } else {
      // Modo Creación
      const position = currentQuestions.length;
      const payload = {
        session_id: currentSessionId,
        type,
        question_text: text,
        options,
        time_limit: timeLimit,
        correct_option: correctOption,
        position,
        is_high_tide: highTideFinal
      };

      const { error } = await sb.from('questions').insert(payload);
      if (error) {
        console.warn('Fallback insert sin is_high_tide:', error.message);
        const { is_high_tide, ...cleanPayload } = payload;
        await sb.from('questions').insert(cleanPayload);
      }
    }

    cancelEdit();
    await loadQuestions();
  } catch (err) {
    console.error('Error guardando pregunta:', err);
    alert('Error al guardar la pregunta.');
  } finally {
    btnSave.disabled = false;
  }
}

function startEditQuestion(id) {
  const q = currentQuestions.find(item => item.id === id);
  if (!q) return;

  editingQuestionId = id;
  qs('#formTitle').textContent = `Editar pregunta`;
  qs('#btnSaveQuestion').textContent = `💾 Guardar cambios`;
  qs('#btnCancelEdit').classList.remove('hidden');
  qs('#editingQuestionId').value = id;

  qs('#qType').value = q.type;
  qs('#qText').value = q.question_text || '';
  qs('#qTime').value = String(q.time_limit || 20);
  qs('#qHighTide').checked = Boolean(q.is_high_tide);

  renderOptionInputs(q.type, q);
  renderQuestionsList(); // Para iluminar la fila en edición

  qs('#formTitle').scrollIntoView({ behavior: 'smooth' });
}

function cancelEdit() {
  editingQuestionId = null;
  qs('#formTitle').textContent = `Agregar pregunta`;
  qs('#btnSaveQuestion').textContent = `➕ Agregar pregunta`;
  qs('#btnCancelEdit').classList.add('hidden');
  qs('#editingQuestionId').value = '';
  qs('#qText').value = '';
  qs('#qHighTide').checked = false;

  const currentType = qs('#qType').value;
  renderOptionInputs(currentType);
  renderQuestionsList();
}

async function duplicateQuestion(id) {
  const q = currentQuestions.find(item => item.id === id);
  if (!q) return;

  const position = currentQuestions.length;
  const payload = {
    session_id: currentSessionId,
    type: q.type,
    question_text: `${q.question_text} (copia)`,
    options: q.options || [],
    time_limit: q.time_limit || 20,
    correct_option: q.correct_option,
    position,
    is_high_tide: Boolean(q.is_high_tide)
  };

  try {
    const { error } = await sb.from('questions').insert(payload);
    if (error) {
      const { is_high_tide, ...cleanPayload } = payload;
      await sb.from('questions').insert(cleanPayload);
    }
    await loadQuestions();
  } catch (err) {
    console.error('Error duplicando pregunta:', err);
  }
}

async function deleteQuestion(id) {
  if (!confirm('¿Eliminar esta pregunta?')) return;
  try {
    if (editingQuestionId === id) cancelEdit();
    await sb.from('questions').delete().eq('id', id);
    await loadQuestions();
    await renumberPositions();
  } catch (err) {
    console.error('Error eliminando pregunta:', err);
  }
}

async function moveQuestion(id, dir) {
  const idx = currentQuestions.findIndex(q => q.id === id);
  const swapIdx = idx + dir;
  if (swapIdx < 0 || swapIdx >= currentQuestions.length) return;

  const a = currentQuestions[idx];
  const b = currentQuestions[swapIdx];

  await sb.from('questions').update({ position: b.position }).eq('id', a.id);
  await sb.from('questions').update({ position: a.position }).eq('id', b.id);
  await loadQuestions();
}

async function renumberPositions() {
  try {
    const { data } = await sb.from('questions').select('*').eq('session_id', currentSessionId).order('position');
    if (!data) return;
    for (let i = 0; i < data.length; i++) {
      if (data[i].position !== i) {
        await sb.from('questions').update({ position: i }).eq('id', data[i].id);
      }
    }
    await loadQuestions();
  } catch (err) {
    console.error('Error renumerando posiciones:', err);
  }
}

// ===========================================================================
// Importación y Exportación de Quiz JSON
// ===========================================================================
async function exportCurrentSessionJson() {
  if (!currentSession || !currentQuestions) return;

  const exportData = {
    version: '2.0',
    app: 'Marejada Zarpa',
    exported_at: new Date().toISOString(),
    session: {
      title: currentSession.title,
      pin: currentSession.pin
    },
    questions: currentQuestions.map(q => ({
      type: q.type,
      question_text: q.question_text,
      options: q.options || [],
      time_limit: q.time_limit || 20,
      correct_option: q.correct_option,
      correct_index: q.correct_index,
      correct_order: q.correct_order,
      is_high_tide: Boolean(q.is_high_tide)
    }))
  };

  const jsonStr = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeTitle = (currentSession.title || 'sesion').toLowerCase().replace(/[^a-z0-9]/g, '_');
  a.download = `zarpa_${safeTitle}_pin_${currentSession.pin}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function handleJsonFileSelected(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      const rawQuestions = Array.isArray(parsed) ? parsed : (Array.isArray(parsed.questions) ? parsed.questions : null);

      if (!rawQuestions || !rawQuestions.length) {
        alert('El archivo JSON no contiene una lista válida de preguntas.');
        return;
      }

      const confirmMsg = `¿Importar ${rawQuestions.length} preguntas a la sesión actual? Se añadirán a las preguntas existentes.`;
      if (!confirm(confirmMsg)) return;

      let currentPos = currentQuestions.length;
      const inserts = rawQuestions.map((q, idx) => {
        // Normalización de tipos heredados
        let type = q.type || 'multiple_choice';
        if (type === 'quiz') type = 'multiple_choice';
        if (type === 'survey') type = 'poll_choice';
        if (type === 'scale') type = 'poll_rating';
        if (type === 'text') type = 'poll_text';

        let correctOpt = q.correct_option !== undefined ? q.correct_option : q.correct_index;
        if (type === 'true_false' && (correctOpt === undefined || correctOpt === null)) correctOpt = 0;

        return {
          session_id: currentSessionId,
          type,
          question_text: q.question_text || q.questionText || `Pregunta importada #${idx + 1}`,
          options: Array.isArray(q.options) ? q.options : [],
          time_limit: parseInt(q.time_limit || q.timeLimit, 10) || 20,
          correct_option: correctOpt,
          position: currentPos + idx,
          is_high_tide: Boolean(q.is_high_tide || q.isHighTide)
        };
      });

      const { error } = await sb.from('questions').insert(inserts);
      if (error) {
        console.warn('Fallback import sin is_high_tide:', error.message);
        const cleanInserts = inserts.map(({ is_high_tide, ...rest }) => rest);
        await sb.from('questions').insert(cleanInserts);
      }

      alert(`¡Se importaron ${inserts.length} preguntas exitosamente!`);
      await loadQuestions();
    } catch (err) {
      console.error('Error al procesar JSON:', err);
      alert('Error al leer el archivo JSON. Verifica que el formato sea válido.');
    } finally {
      // Limpiar input file para permitir seleccionar el mismo archivo de nuevo
      event.target.value = '';
    }
  };

  reader.readAsText(file);
}
