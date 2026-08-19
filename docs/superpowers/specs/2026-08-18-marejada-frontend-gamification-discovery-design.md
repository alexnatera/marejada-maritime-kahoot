# Especificación Técnica: Marejada 2.0 — Rediseño Frontend, Gamificación y Motor de Discovery Marítimo

## 1. Resumen Ejecutivo
**Marejada** es una plataforma interactiva de gamificación y sondeo náutico para el rubro marítimo y portuario, diseñada para operar en tiempo real sobre **GitHub Pages** y **Supabase**.

Este documento especifica la transformación integral de la plataforma para:
1. **Lanzamiento Estelar en el Summit de Seguridad Marítima y Operaciones**: Máximo impacto visual para proyectores, dinámicas de juego competitivas con rachas "A Toda Máquina", regata náutica en vivo 2.0, efectos de sonido procedurales y podio naval con diplomas digitales.
2. **Plataforma Continua de Sondeo de Producto (Discovery)**: Motor de encuestas interactivas en vivo para consultar a tripulantes, capitanes y operadores sobre preferencias de nuevas funciones de software, valoración de pantallas (UX), votaciones de prioridad y feedback abierto, con analítica y exportación estructurada.

---

## 2. Arquitectura de Archivos y Componentes

La solución mantiene una arquitectura **Zero-Build** (Vanilla HTML5, CSS3 moderno, ES6+ Modules) 100% compatible con GitHub Pages:

```
marejada-maritime-kahoot/
├── index.html                  # Pantalla Principal / Host (Proyector / Big Screen)
├── player.html                 # Pantalla Tripulante / Jugador (Mobile-First, Táctil, Háptico)
├── admin.html                  # Panel de Creación / Gestión de Sesiones y Preguntas
├── dashboard.html              # Panel de Analítica, Reporte de Seguridad y Discovery de Producto
├── css/
│   ├── style.css               # Variables de diseño, reset, glassmorphism naval y layout
│   ├── animations.css          # Animaciones CSS3 (balanceo de barcos, pulso, turbos, mareas)
│   └── regatta.css             # Estilos de la pista de carreras marítima de la Regata 2.0
├── js/
│   ├── config.js               # Conexión global a Supabase y constantes
│   ├── icons.js                # Biblioteca de SVGs náuticos optimizados (buques, remolcadores, boyas)
│   ├── audio.js                # [NUEVO] Motor de Audio Náutico Procedural (Web Audio API)
│   ├── canvas-fx.js            # [NUEVO] Motor de Partículas 2D (estelas, olas, confeti náutico, bengalas)
│   ├── regatta.js              # [NUEVO] Motor de Carrera Naval en Vivo 2.0
│   ├── mechanics.js            # [NUEVO] Lógica de Rachas "A Toda Máquina", Multiplicadores y Formatos
│   ├── utils.js                # Helpers DOM, timers y generadores
│   ├── host.js                 # Controlador del Host
│   ├── player.js               # Controlador del Jugador móvil
│   ├── admin.js                # Controlador del Admin / Creación de Quizzes y Sondeos
│   └── dashboard.js            # Controlador de Analítica, Gráficos y Exportación CSV
└── docs/superpowers/specs/     # Especificaciones y documentación técnica
```

---

## 3. Especificación del Motor Audiovisual

### 3.1. Audio Náutico Procedural (`js/audio.js`)
Sintetiza audio en tiempo real mediante la **Web Audio API** nativa (sin archivos `.mp3` externos, 0 KB de carga de red, latencia cero):

* `AudioFX.play('ship_horn')`: Bocina grave de remolcador con subarmónicos y reverberación para inicio de juego y uniones al lobby.
* `AudioFX.play('bell')`: Campana de guardia naval de dos tonos para respuestas correctas y cambio de fases.
* `AudioFX.play('sonar_ping', pitch)`: Pulso senoidal con decaimiento exponencial que acelera en los últimos 5 segundos del temporizador.
* `AudioFX.play('error_foghorn')`: Tono grave sordo de niebla para respuestas erróneas o tiempo agotado.
* `AudioFX.play('podium_fanfare')`: Arpegio triunfal armónico en Do Mayor para la ceremonia de premiación.
* `AudioFX.play('bubble_tap')`: Sonido acuático suave para interacción táctil en botones.
* **Control de Volumen y Mute**: Toggle flotante en la esquina superior con memoria persistente en `localStorage`. Desbloqueo automático en el primer gesto del usuario.

### 3.2. Motor de Partículas & Efectos Canvas (`js/canvas-fx.js`)
Lienzo `canvas` acelerado por GPU que se superpone a las vistas:
* **Estelas de Navegación (`waterWake`)**: Burbujas y líneas de espuma marina dinámicas detrás de los buques en movimiento.
* **Bengalas de Señales Náuticas (`launchFlare`)**: Cohetes de iluminación marina con chispas de color y humo que estallan al iniciar o culminar preguntas clave.
* **Confeti Marítimo (`launchNauticalConfetti`)**: Anclas doradas, boyas salvavidas, estrellas y cintas náuticas cayendo en el podio.
* **Ondas de Sonar (`sonarRing`)**: Ondas circulares expansivas luminosas en el centro de la pantalla del temporizador.

---

## 4. Mecánicas de Juego y Gamificación

### 4.1. Rachas "A Toda Máquina" (Streak Engine)
* **Nivel 1 (1 acierto)**: Puntos estándar basados en tiempo restante (hasta 1,000 pts).
* **Nivel 2 (2 aciertos consecutivos)**: Multiplicador **x1.2** + ícono de vapor encendido.
* **Nivel 3 (3 aciertos consecutivos)**: Multiplicador **x1.5** + efecto de turbo naval.
* **Nivel 4+ (4+ aciertos consecutivos)**: Multiplicador **x2.0** + estela dorada "Rompeolas".
* **Feedback Táctil**: En dispositivos móviles, `navigator.vibrate([40, 60, 40])` y marco luminoso de energía en la pantalla.

### 4.2. Regata Naval en Tiempo Real 2.0 (`js/regatta.js`)
* Pista marina animada con carriles náuticos, boyas y línea de meta.
* Los buques se desplazan en tiempo real con animación de adelantamiento fluido al revelarse los puntajes.
* Detección y distinción visual automática de:
  * **Líder de Flota**: Banderín de oro en proa.
  * **Mayor Remolque (Remontada)**: Mención especial al jugador que escaló más posiciones en la ronda.

### 4.3. Podio Final y Diploma de Capitán
* Podio 3D para los 3 primeros lugares con banderas y reflectores marítimos.
* Generador de diploma digital en HTML5 Canvas con descarga directa en PNG:
  * Nombre del tripulante, avatar del buque, puntaje final, nombre de la sesión y rango (ej: *Capitán de Alta Mar*, *Piloto de Maniobras*).

---

## 5. Motor de Sondeo de Producto & Discovery

Para habilitar la recopilación de insights de producto después del Summit:

### 5.1. Formatos de Pregunta / Sondeo Soportados

| Tipo de Pregunta | Código `type` | Comportamiento en Jugador (Móvil) | Visualización en Host (Pantalla Grande) |
| :--- | :--- | :--- | :--- |
| **Opción Múltiple (Trivia)** | `multiple_choice` | 2-4 botones táctiles con colores distintivos | Gráfico de barras animado + respuesta correcta |
| **Verdadero / Falso Náutico** | `true_false` | 2 botones gigantes (*Seguro vs Riesgo* o *V vs F*) | Porcentaje de la flota en cada opción |
| **Secuencia / Maniobra** | `sequence` | Lista interactiva para ordenar pasos arrastrando o tocando | Flujograma de la secuencia correcta |
| **Votación de Funcionalidades** | `poll_choice` | Selección simple o múltiple de características | Gráfico de barras porcentual en tiempo real |
| **Valoración de Pantallas / UX**| `poll_rating` | Escala interactiva náutica del 1 al 10 | Indicador tipo manómetro/aguja con promedio e histograma |
| **Sugerencias y Feedback** | `poll_text` | Caja de texto para ingresar ideas libres | Muro dinámico de tarjetas de opinión moderables |

### 5.2. Configuración de Sesiones en Admin (`admin.html`)
* Selector de Modo de Sesión:
  * **Modo Summit / Competencia**: Tiempo límite, puntajes, rachas y podio activo.
  * **Modo Sondeo de Producto**: Sin límite de tiempo estricto, sin puntos/podio, foco en visualización de datos en vivo.
  * **Modo Híbrido**: Trivia inicial de seguridad + Bloque de sondeo/discovery al final.
* Plantillas náuticas precargadas listas para usar (Trivia de Seguridad Marítima y Sondeo de Funcionalidades de App).

### 5.3. Dashboard y Exportación de Insights (`dashboard.html`)
* **Pestaña Summit**: Ranking de jugadores, tasa de aciertos por pregunta y análisis de riesgos de seguridad.
* **Pestaña Product Discovery**:
  * Priorización de funcionalidades ordenadas por votos.
  * Promedio de satisfacción de pantallas/módulos.
  * Listado filtrable de sugerencias abiertas.
* **Exportación CSV Estructurada**: Exporta dos archivos limpios:
  1. `reporte_general.csv`: Resumen por pregunta, opciones y porcentajes.
  2. `feedback_discovery.csv`: Respuestas detalladas por usuario para análisis del equipo de producto.

---

## 6. Integración con Supabase y Compatibilidad

* **Estructura de Tablas**: 100% compatible con el esquema actual (`sessions`, `questions`, `players`, `responses`).
* **Realtime**: Suscripción a cambios de estado de sesión (`sessions`), registro de jugadores (`players`) y conteo de respuestas (`responses`).
* **Seguridad (RLS)**: Las consultas del Host y Jugador utilizan la clave pública `anon` y funciones seguras existentes.

---

## 7. Manejo de Errores y Rendimiento

1. **Rendimiento a 60 FPS**: Todo renderizado de Canvas corre en `requestAnimationFrame` desacoplado del DOM principal.
2. **Compatibilidad Móvil**: En pantallas con batería baja o menor rendimiento, el motor de partículas reduce el número de partículas automáticamente.
3. **Resiliencia de Conexión**: Reconexión automática de Supabase Realtime si el usuario sufre un microcorte de red.

---

## 8. Plan de Pruebas y Criterios de Aceptación
1. **Flujo de Trivia (Summit)**: Creación de sesión -> Lobby con muelle vivo -> Pregunta con reloj brújula y sonar -> Resultados con regata animada -> Podio con fanfarria y diploma.
2. **Flujo de Sondeo (Discovery)**: Votación de features y calificación de pantallas reflejadas en tiempo real en la pantalla del Host.
3. **Prueba de Audio y Efectos**: Verificación de síntesis de audio limpia en Chrome, Safari (iOS) y Firefox.
4. **Verificación de Exportación**: Descarga exitosa de reportes CSV y diplomas en PNG.
