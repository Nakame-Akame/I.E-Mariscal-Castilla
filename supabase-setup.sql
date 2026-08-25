-- Ejecutar en Supabase SQL Editor.
-- Este archivo no crea usuarios ni almacena contrasenas.
-- Los usuarios deben existir previamente en Authentication > Users.

update public.estudiantes
set email = lower(trim(email))
where email is not null;

alter table public.estudiantes enable row level security;

drop policy if exists "Estudiante consulta su propio registro" on public.estudiantes;

create policy "Estudiante consulta su propio registro"
on public.estudiantes
for select
to authenticated
using (
  lower(trim(email)) = lower(trim((select auth.jwt() ->> 'email')))
  and activo = true
);

alter table public.contenido_restringido enable row level security;

drop policy if exists "Estudiantes autenticados consultan contenido privado"
on public.contenido_restringido;

create policy "Estudiantes autenticados consultan contenido privado"
on public.contenido_restringido
for select
to authenticated
using (
  exists (
    select 1
    from public.estudiantes
    where lower(trim(estudiantes.email)) = lower(trim((select auth.jwt() ->> 'email')))
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
