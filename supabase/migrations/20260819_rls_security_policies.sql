-- ============================================================================
-- MAREJADA 2.0 · Migración de Seguridad y Políticas RLS para Supabase
-- Proyecto: maritime-kahoot (https://eypkqjtyseqxwdiqadmq.supabase.co)
-- ============================================================================

-- 0. Asegurar columnas de soporte
ALTER TABLE IF EXISTS public.questions ADD COLUMN IF NOT EXISTS hazard_zones JSONB;
ALTER TABLE IF EXISTS public.questions ADD COLUMN IF NOT EXISTS is_high_tide BOOLEAN DEFAULT false;
ALTER TABLE IF EXISTS public.questions ADD COLUMN IF NOT EXISTS correct_order JSONB;

-- 1. Habilitar RLS en todas las tablas
ALTER TABLE IF EXISTS public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.responses ENABLE ROW LEVEL SECURITY;

-- 2. Concesión de permisos a anon y authenticated
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- ============================================================================
-- 3. Políticas para SESSIONS
-- ============================================================================
DROP POLICY IF EXISTS "Permitir lectura publica de sesiones" ON public.sessions;
CREATE POLICY "Permitir lectura publica de sesiones"
ON public.sessions
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Permitir creacion de sesiones" ON public.sessions;
CREATE POLICY "Permitir creacion de sesiones"
ON public.sessions
FOR INSERT
TO anon, authenticated
WITH CHECK (title IS NOT NULL AND length(title) > 0);

DROP POLICY IF EXISTS "Permitir actualizacion de estado de sesiones" ON public.sessions;
CREATE POLICY "Permitir actualizacion de estado de sesiones"
ON public.sessions
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir eliminacion de sesiones" ON public.sessions;
CREATE POLICY "Permitir eliminacion de sesiones"
ON public.sessions
FOR DELETE
TO anon, authenticated
USING (true);

-- ============================================================================
-- 4. Políticas para QUESTIONS
-- ============================================================================
DROP POLICY IF EXISTS "Permitir lectura publica de preguntas" ON public.questions;
CREATE POLICY "Permitir lectura publica de preguntas"
ON public.questions
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Permitir insercion de preguntas" ON public.questions;
CREATE POLICY "Permitir insercion de preguntas"
ON public.questions
FOR INSERT
TO anon, authenticated
WITH CHECK (session_id IS NOT NULL);

DROP POLICY IF EXISTS "Permitir actualizacion de preguntas" ON public.questions;
CREATE POLICY "Permitir actualizacion de preguntas"
ON public.questions
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir eliminacion de preguntas" ON public.questions;
CREATE POLICY "Permitir eliminacion de preguntas"
ON public.questions
FOR DELETE
TO anon, authenticated
USING (true);

-- ============================================================================
-- 5. Políticas para PLAYERS
-- ============================================================================
DROP POLICY IF EXISTS "Permitir lectura publica de jugadores" ON public.players;
CREATE POLICY "Permitir lectura publica de jugadores"
ON public.players
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Permitir registro de jugadores" ON public.players;
CREATE POLICY "Permitir registro de jugadores"
ON public.players
FOR INSERT
TO anon, authenticated
WITH CHECK (name IS NOT NULL AND length(name) > 0 AND session_id IS NOT NULL);

DROP POLICY IF EXISTS "Permitir actualizacion de puntajes de jugadores" ON public.players;
CREATE POLICY "Permitir actualizacion de puntajes de jugadores"
ON public.players
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- ============================================================================
-- 6. Políticas para RESPONSES
-- ============================================================================
DROP POLICY IF EXISTS "Permitir lectura de respuestas" ON public.responses;
CREATE POLICY "Permitir lectura de respuestas"
ON public.responses
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Permitir envio de respuestas" ON public.responses;
CREATE POLICY "Permitir envio de respuestas"
ON public.responses
FOR INSERT
TO anon, authenticated
WITH CHECK (question_id IS NOT NULL AND player_id IS NOT NULL);

-- ============================================================================
-- 7. Índices de Rendimiento para Realtime
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_sessions_pin ON public.sessions(pin);
CREATE INDEX IF NOT EXISTS idx_questions_session ON public.questions(session_id);
CREATE INDEX IF NOT EXISTS idx_players_session ON public.players(session_id);
CREATE INDEX IF NOT EXISTS idx_responses_question ON public.responses(question_id);
CREATE INDEX IF NOT EXISTS idx_responses_player ON public.responses(player_id);

-- ============================================================================
-- 8. Habilitar Realtime Publications
-- ============================================================================
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.questions;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.players;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.responses;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;
