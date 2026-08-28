-- Ejecutar en Supabase SQL Editor.
-- Este archivo no crea usuarios ni almacena contrasenas.
-- Los usuarios deben existir previamente en Authentication > Users.

create table if not exists public.estudiantes (
  id uuid primary key default gen_random_uuid(),
  dni text not null unique,
  apellidos text not null,
  nombres text not null,
  seccion text,
  email text not null unique,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.usuarios_acceso (
  id uuid primary key default gen_random_uuid(),
  nombres text not null,
  apellidos text not null,
  email text not null unique,
  rol text not null default 'personal',
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.contenido_restringido (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  contenido text not null,
  area text,
  created_at timestamptz not null default now()
);

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

update public.usuarios_acceso
set email = lower(trim(email));

update public.estudiantes
set email = lower(trim(email))
where email is not null;

alter table public.estudiantes
drop constraint if exists email_dominio_institucional;

alter table public.estudiantes
add constraint email_dominio_institucional check (
  trim(email) ~* '^[^@[:space:]]+@mariscalcastilla[.]edu[.]pe$'
) not valid;

alter table public.solicitudes_acceso enable row level security;
alter table public.estudiantes enable row level security;
alter table public.usuarios_acceso enable row level security;
alter table public.contenido_restringido enable row level security;

-- Solicitudes de acceso

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

-- Acceso de usuarios

drop policy if exists "Usuario consulta su propio acceso" on public.usuarios_acceso;
create policy "Usuario consulta su propio acceso"
on public.usuarios_acceso
for select
to authenticated
using (
  lower(trim(email)) = lower(trim((select auth.jwt() ->> 'email')))
  and lower(trim(email)) like '%@mariscalcastilla.edu.pe'
  and activo = true
);

drop policy if exists "Estudiante consulta su propio registro" on public.estudiantes;
create policy "Estudiante consulta su propio registro"
on public.estudiantes
for select
to authenticated
using (
  lower(trim(email)) = lower(trim((select auth.jwt() ->> 'email')))
  and lower(trim(email)) like '%@mariscalcastilla.edu.pe'
  and activo = true
);

drop policy if exists "Estudiantes autenticados consultan contenido privado"
on public.contenido_restringido;
create policy "Usuarios institucionales autenticados consultan contenido privado"
on public.contenido_restringido
for select
to authenticated
using (
  exists (
    select 1
    from public.estudiantes
    where lower(trim(estudiantes.email)) = lower(trim((select auth.jwt() ->> 'email')))
      and lower(trim(estudiantes.email)) like '%@mariscalcastilla.edu.pe'
      and estudiantes.activo = true
  )
);

-- Verificacion opcional de la politica:
-- El estudiante autenticado solo deberia recibir su propia fila.
-- select id, dni, apellidos, nombres, seccion, email, activo
-- from public.estudiantes;

-- IMPORTANTE:
-- No agregues politicas para notas, horarios_individuales o
-- contenido_restringido hasta confirmar sus columnas de relacion.
-- Esas politicas deben filtrar por el estudiante autenticado.
