-- Ejecutar en Supabase SQL Editor.
-- Este archivo no crea usuarios ni almacena contrasenas.
-- Los usuarios deben existir previamente en Authentication > Users.

create table if not exists public.solicitudes_acceso (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  email text not null,
  rol text not null check (rol in ('estudiante', 'profesor', 'otro')),
  estado text not null default 'pendiente' check (estado in ('pendiente', 'aprobado', 'rechazado')),
  created_at timestamptz not null default now()
);

create unique index if not exists solicitudes_acceso_email_lower_idx
on public.solicitudes_acceso (lower(email));

alter table public.solicitudes_acceso enable row level security;

drop policy if exists "Visitantes pueden solicitar acceso" on public.solicitudes_acceso;
create policy "Visitantes pueden solicitar acceso"
on public.solicitudes_acceso
for insert
to anon, authenticated
with check (
  lower(email) like '%@mariscalcastilla.edu.pe'
  and estado = 'pendiente'
);

drop policy if exists "Usuarios consultan su solicitud" on public.solicitudes_acceso;
create policy "Usuarios consultan su solicitud"
on public.solicitudes_acceso
for select
to authenticated
using (lower(email) = lower((select auth.jwt() ->> 'email')));

alter table public.estudiantes enable row level security;

drop policy if exists "Estudiante consulta su propio registro" on public.estudiantes;

create policy "Estudiante consulta su propio registro"
on public.estudiantes
for select
to authenticated
using (
  lower(email) = lower((select auth.jwt() ->> 'email'))
  and activo = true
);

alter table public.contenido_restringido enable row level security;

drop policy if exists "Estudiantes autenticados consultan contenido privado"
on public.contenido_restringido;

create policy "Usuarios institucionales autenticados consultan contenido privado"
on public.contenido_restringido
for select
to authenticated
using (lower((select auth.jwt() ->> 'email')) like '%@mariscalcastilla.edu.pe');

-- Verificacion opcional de la politica:
-- El estudiante autenticado solo deberia recibir su propia fila.
-- select id, dni, apellidos, nombres, seccion, email, activo
-- from public.estudiantes;

-- IMPORTANTE:
-- No agregues politicas para notas, horarios_individuales o
-- contenido_restringido hasta confirmar sus columnas de relacion.
-- Esas politicas deben filtrar por el estudiante autenticado.
