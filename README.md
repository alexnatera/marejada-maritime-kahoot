# 🚢 Marejada 2.0 (Zarpa) — Plataforma de Engagement Náutico & Safety Discovery

Plataforma interactiva de gamificación, capacitación SHEQ y motor de sondeo de producto para remolcadores y flotas marítimas.

* **Frontend:** Vanilla HTML5, CSS3 Glassmorphism, ES6 Modules (Zero-Build, 100% compatible con **GitHub Pages**).
* **Backend & Realtime:** [Supabase](https://supabase.com) (PostgreSQL, Realtime Channels, Row Level Security).
* **Audio & Gráficos:** Síntesis Web Audio API procedural (0 KB red) + Motor de Partículas Canvas 2D + Regata Náutica en Vivo.
* **PWA:** Soporte offline-first e instalable en smartphones para tripulaciones en cubierta/muelles.

---

## 🧭 Vistas y Componentes

| Archivo | Rol | Descripción |
| :--- | :--- | :--- |
| [`index.html`](file:///root/marejada-maritime-kahoot/index.html) | **Host / Proyector** | Pantalla principal para proyector o pantalla gigante en summits y salas de capacitación. |
| [`player.html`](file:///root/marejada-maritime-kahoot/player.html) | **Tripulante / Jugador** | Pantalla móvil táctil, con feedback háptico, selección de avatares de buques y diploma naval. |
| [`admin.html`](file:///root/marejada-maritime-kahoot/admin.html) | **Administración** | Creación y edición de cuestionarios, selección de plantillas náuticas precargadas (Summit SHEQ y Discovery). |
| [`dashboard.html`](file:///root/marejada-maritime-kahoot/dashboard.html) | **Analítica & Discovery** | Métricas del Summit, análisis de riesgos de seguridad, votaciones y exportación en CSV. |

---

## ⚡ Formatos de Pregunta y Sondeo Soportados

1. **⚓ Opción Múltiple (`multiple_choice` / `quiz`)**: Trivia competitiva con cálculo de puntos por velocidad y rachas.
2. **🧭 Verdadero / Falso Náutico (`true_false`)**: Evaluación rápida de condiciones seguras vs riesgosas.
3. **🔄 Secuencia de Maniobra (`sequence`)**: Ordenamiento cronológico de protocolos (ej. emergencia por *Girting / Girondaje*).
4. **⚠️ Identificación de Peligros en Cubierta (`hazard_hotspot`)**: Hotspot táctil interactivo sobre plano de cubierta (ej. zona de latigazo *Snap-Back*).
5. **📊 Votación de Funcionalidades (`poll_choice` / `survey`)**: Priorización de requerimientos para nuevas apps.
6. **⭐ Valoración de Pantallas / UX (`poll_rating` / `scale`)**: Escala náutica continua del 1 al 10.
7. **💬 Sugerencias y Feedback (`poll_text` / `text`)**: Muro de aportes abiertos moderables.

---

## 🔒 Seguridad y Migraciones en Supabase

El esquema y las políticas de seguridad **Row Level Security (RLS)** se encuentran en:
👉 [`supabase/migrations/20260819_rls_security_policies.sql`](file:///root/marejada-maritime-kahoot/supabase/migrations/20260819_rls_security_policies.sql)

Para aplicar la migración:
```bash
npx supabase db push
# O ejecutar el script SQL directamente en el SQL Editor del Dashboard de Supabase
```

---

## 🧪 Pruebas Unitarias

Para ejecutar la suite completa de pruebas de mecánicas y validaciones:
```bash
node tests/mechanics-test.js
```
