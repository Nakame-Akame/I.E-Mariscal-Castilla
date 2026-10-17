-- Ejecutar en Supabase SQL Editor.
-- Los codigos OTP se almacenan unicamente como hashes.

create table if not exists public.otp_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  code_hash text not null,
  expires_at timestamptz not null,
  attempts int not null default 0,
  used boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists otp_codes_user_created_idx
on public.otp_codes (user_id, created_at desc);

alter table public.otp_codes enable row level security;

-- La generacion y la verificacion ocurren en Edge Functions con service role.
-- No se expone el hash al navegador.
drop policy if exists "Usuarios consultan sus propios OTP" on public.otp_codes;
revoke all on public.otp_codes from anon, authenticated;
grant all on public.otp_codes to service_role;

create table if not exists public.otp_verified_sessions (
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  primary key (user_id, session_id)
);

alter table public.otp_verified_sessions enable row level security;
revoke all on public.otp_verified_sessions from anon, authenticated;
grant all on public.otp_verified_sessions to service_role;

create or replace function public.otp_session_verified()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.otp_verified_sessions verified
    where verified.user_id = (select auth.uid())
      and verified.session_id = (select auth.jwt() ->> 'session_id')
      and verified.expires_at > pg_catalog.now()
  );
$$;

revoke all on function public.otp_session_verified() from public, anon;
grant execute on function public.otp_session_verified() to authenticated;
