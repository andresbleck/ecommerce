-- =====================================================================
-- 001_admin_security.sql
-- Restringe el acceso de escritura/lectura sensible SOLO a administradores.
-- Ejecutar completo en Supabase → SQL Editor.
-- ANTES de ejecutar: reemplazar el email en el paso 8.
-- =====================================================================

begin;

-- 1. Columnas que usa el frontend y que pueden faltar en schema.sql ---------
alter table public.orders   add column if not exists paid boolean not null default false;
alter table public.products add column if not exists image_url_2 text;
alter table public.products add column if not exists image_url_3 text;

-- 2. Lista de administradores ----------------------------------------------
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;
-- Sin policies a propósito: nadie puede leer ni modificar esta tabla vía API.
revoke all on public.admins from anon, authenticated;

-- 3. is_admin(): única fuente de verdad para "¿es admin?" -------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- 4. Borrar TODAS las policies existentes de products y orders --------------
--    (no dependemos de sus nombres; la BD real puede diferir de schema.sql)
do $$
declare r record;
begin
  for r in
    select policyname, tablename from pg_policies
    where schemaname = 'public' and tablename in ('products', 'orders')
  loop
    execute format('drop policy %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

alter table public.products enable row level security;
alter table public.orders   enable row level security;

-- 5. Policies nuevas --------------------------------------------------------
-- products: lectura pública, escritura solo admin
create policy "products_public_read"  on public.products for select using (true);
create policy "products_admin_insert" on public.products for insert to authenticated with check (public.is_admin());
create policy "products_admin_update" on public.products for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "products_admin_delete" on public.products for delete to authenticated using (public.is_admin());

-- orders: cualquiera crea pedidos (checkout), pero SIEMPRE pendientes y no pagados.
create policy "orders_public_insert" on public.orders for insert to anon, authenticated
  with check (status = 'pending' and paid = false);
create policy "orders_admin_read"   on public.orders for select to authenticated using (public.is_admin());
create policy "orders_admin_update" on public.orders for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "orders_admin_delete" on public.orders for delete to authenticated using (public.is_admin());

-- 6. Storage: bucket product-images ----------------------------------------
-- Bucket público (las URLs públicas funcionan sin policy de SELECT, y así
-- nadie puede listar el contenido). Solo imágenes, máx. 5 MB.
update storage.buckets
   set public = true,
       file_size_limit = 5242880,
       allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
 where id = 'product-images';

do $$
declare r record;
begin
  for r in
    select policyname from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and (coalesce(qual, '') ilike '%product-images%' or coalesce(with_check, '') ilike '%product-images%')
  loop
    execute format('drop policy %I on storage.objects', r.policyname);
  end loop;
end $$;

create policy "product_images_admin_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());
create policy "product_images_admin_update" on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());
create policy "product_images_admin_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and public.is_admin());

-- 7. Cambio de estado + stock en una sola transacción ------------------------
create or replace function public.apply_order_status(p_order_id uuid, p_new_status text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_prev  text;
  v_items jsonb;
  v_item  jsonb;
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  if p_new_status not in ('pending', 'paid', 'shipped', 'delivered', 'cancelled') then
    raise exception 'invalid status: %', p_new_status;
  end if;

  select o.status, o.items into v_prev, v_items
    from public.orders o where o.id = p_order_id
    for update;
  if not found then
    raise exception 'order not found';
  end if;

  if v_prev is not distinct from p_new_status then
    return;
  end if;

  update public.orders set status = p_new_status where id = p_order_id;

  if p_new_status = 'delivered' then
    -- descuenta stock al entregar
    for v_item in select * from jsonb_array_elements(coalesce(v_items, '[]'::jsonb)) loop
      update public.products
         set stock = greatest(0, stock - coalesce((v_item->>'qty')::int, 0))
       where slug = v_item->>'id';
    end loop;
  elsif v_prev = 'delivered' then
    -- sale de "entregado" (cancelado o vuelto a pendiente): repone stock
    for v_item in select * from jsonb_array_elements(coalesce(v_items, '[]'::jsonb)) loop
      update public.products
         set stock = stock + coalesce((v_item->>'qty')::int, 0)
       where slug = v_item->>'id';
    end loop;
  end if;
end;
$$;
revoke all on function public.apply_order_status(uuid, text) from public, anon;
grant execute on function public.apply_order_status(uuid, text) to authenticated;

-- 8. Dar de alta al administrador -------------------------------------------
--    >>> REEMPLAZAR el email por el de la cuenta admin <<<
insert into public.admins (user_id)
select id from auth.users where email = 'REEMPLAZAR@EMAIL.COM'
on conflict do nothing;

commit;

-- Verificación (ejecutar aparte):
--   select * from public.admins;                       -- debe haber 1 fila
--   select tablename, policyname, roles, cmd from pg_policies
--    where schemaname in ('public','storage') order by 1, 2;
