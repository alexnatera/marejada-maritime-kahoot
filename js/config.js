// Configuración de conexión a Supabase
const SUPABASE_URL = "https://eypkqjtyseqxwdiqadmq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5cGtxanR5c2VxeHdkaXFhZG1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwNzc4NTcsImV4cCI6MjEwMjY1Mzg1N30.-Vdco7MOzgKf3F_-yUrAsfjwguggOZbi2iUZIkC_8Bw";

// Cliente global de Supabase (evita colisión con el objeto global `supabase` del CDN)
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
