-- Crear tabla solicitudes_acceso para el portal de estudiantes
-- Esta tabla almacena las solicitudes de acceso de usuarios

CREATE TABLE IF NOT EXISTS public.solicitudes_acceso (
  id BIGSERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  rol TEXT NOT NULL DEFAULT 'estudiante',
  estado TEXT NOT NULL DEFAULT 'pendiente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Crear índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_solicitudes_email ON public.solicitudes_acceso(email);
CREATE INDEX IF NOT EXISTS idx_solicitudes_estado ON public.solicitudes_acceso(estado);

-- Habilitar RLS
ALTER TABLE public.solicitudes_acceso ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad RLS
CREATE POLICY IF NOT EXISTS "allow_insert_solicitud" ON public.solicitudes_acceso
  FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "allow_select_own" ON public.solicitudes_acceso
  FOR SELECT USING (auth.jwt() ->> 'email' = email OR auth.jwt() ->> 'email' IS NULL);
