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
create policy "Usuarios consultan sus propios OTP"
on public.otp_codes
for select
to authenticated
using ((select auth.uid()) = user_id);

revoke all on public.otp_codes from anon, authenticated;
grant select on public.otp_codes to authenticated;
