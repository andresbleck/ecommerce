-- =====================================================================
-- 002_require_mfa.sql
-- Exige que la sesión del admin haya pasado por MFA (aal2).
-- Ejecutar SOLO DESPUÉS de:
--   1) haber desplegado el frontend nuevo, y
--   2) haber ingresado al panel y escaneado el QR (enrolado el TOTP).
-- Si se ejecuta antes, el admin no podrá ver pedidos ni editar productos
-- hasta completar el enrolamiento (el frontend lo pide igual).
-- =====================================================================

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(auth.jwt() ->> 'aal', '') = 'aal2'
     and exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;
