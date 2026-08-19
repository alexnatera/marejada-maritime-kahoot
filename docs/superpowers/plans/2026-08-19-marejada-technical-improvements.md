# Plan de Implementación: Mejoras Técnicas, Seguridad RLS y PWA para Marejada 2.0

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar las tres oportunidades de mejora clave para Marejada 2.0: endurecimiento de seguridad RLS en Supabase, capacidad PWA offline-first para tripulaciones en muelle/bahía, y el nuevo formato de pregunta de "Identificación de Peligros en Cubierta" (Hazard Hotspot).

**Architecture:** Mantiene la arquitectura Zero-Build sobre Vanilla JS y Supabase. Se agregan scripts de migración SQL declarativos para Supabase, Service Worker nativo para caché estático resiliente, y se extiende el motor de mecánicas (`js/mechanics.js`) con soporte de coordenadas interactivas para identificación de riesgos sobre imágenes/diagramas navales.

**Tech Stack:** Vanilla JavaScript (ES6 UMD), HTML5 Canvas, Web Audio API, Service Workers, Supabase (PostgreSQL + RLS), CSS3 Glassmorphism.

---

## Tareas de Implementación

### Tarea 1: Endurecimiento de Seguridad RLS y Script SQL para Supabase
* **Archivos:**
  * Crear: `supabase/migrations/20260819_rls_security_policies.sql`
  * Modificar: `README.md` (instrucciones de aplicación)
* **Objetivo:**
  * Proteger tablas `sessions`, `questions`, `players`, `responses` con RLS habilitado.
  * Definir permisos precisos para los roles `anon` y `authenticated` evitando manipulaciones no autorizadas de puntajes o sesiones.

### Tarea 2: Soporte PWA y Resiliencia Offline para Tripulaciones
* **Archivos:**
  * Crear: `manifest.json`
  * Crear: `sw.js` (Service Worker con estrategia Stale-While-Revalidate para estáticos y Network-Only para Supabase API)
  * Modificar: `index.html`, `player.html`, `admin.html`, `dashboard.html` (registro del SW y meta-tags PWA)
* **Objetivo:**
  * Permitir instalación como aplicación móvil nativa en teléfonos de tripulantes.
  * Carga instantánea de la interfaz gráfica aun con señal intermitente en bahía o cubierta.

### Tarea 3: Motor de Identificación Visual de Peligros en Cubierta (Hazard Hotspot)
* **Archivos:**
  * Modificar: `js/mechanics.js` (agregar `QUESTION_TYPES.HAZARD_HOTSPOT`, cálculo de acierto por coordenadas/radios de tolerancia y renderizado táctil)
  * Modificar: `tests/mechanics-test.js` (agregar suite de pruebas unitarias para hotspot)
  * Modificar: `js/player.js` (soporte de interacción táctil con marcadores de peligro)
  * Modificar: `js/host.js` (renderizado de mapa de impacto/calor en pantalla gigante)
  * Modificar: `js/admin.js` (soporte de creación y plantilla de hotspot de cubierta en Summit SHEQ)
* **Objetivo:**
  * Evaluar capacidad del tripulante para señalar puntos ciegos, zonas de retroceso de cabos (snap-back) y bitas sin seguro sobre diagramas de remolcadores.

---

## Verificación
* Ejecutar la suite de pruebas unitarias (`node tests/mechanics-test.js`) asegurando 100% de tests aprobados.
* Probar el registro del Service Worker y verificar la carga de assets y manifest.
* Validar que la plantilla Summit SHEQ en el Admin incluya el nuevo formato de hotspot.
