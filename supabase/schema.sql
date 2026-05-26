create type product_category as enum ('mates', 'bombillas', 'termos');

create table products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  category product_category not null,
  price integer not null check (price >= 0),
  stock integer not null default 0,
  short_description text not null,
  long_description text,
  badge text,
  monogram text,
  accent_color text,
  image_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null default ('LG' || lpad((floor(random() * 90000 + 10000))::text, 5, '0')),
  customer_name text not null,
  customer_email text,
  customer_phone text,
  delivery_method text check (delivery_method in ('envio', 'retiro')),
  shipping_address jsonb,
  payment_method text,
  notes text,
  items jsonb not null,
  subtotal integer not null,
  shipping_cost integer not null default 0,
  total integer not null,
  status text default 'pending' check (status in ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
  created_at timestamptz default now()
);

-- RLS
alter table products enable row level security;
alter table orders enable row level security;

create policy "Public read products" on products for select using (true);
create policy "Auth insert products" on products for insert to authenticated with check (true);
create policy "Auth update products" on products for update to authenticated using (true);
create policy "Auth delete products" on products for delete to authenticated using (true);

create policy "Anyone create orders" on orders for insert with check (true);
create policy "Auth read orders" on orders for select to authenticated using (true);
create policy "Auth update orders" on orders for update to authenticated using (true);

-- Seed
insert into products (slug, name, category, price, stock, short_description, long_description, badge, monogram, accent_color) values
('mate-imperial', 'Mate Imperial', 'mates', 42000, 8, 'Calabaza forrada en cuero curado a mano, virola de alpaca cincelada.', 'Nuestro mate más logrado. Calabaza criolla seleccionada, forrada en cuero vacuno curtido al tanino y cosido a punto cruz por artesanos de Salta. La virola está cincelada en alpaca con motivos pampeanos. Cebadura amplia, pico ergonómico.', 'Edición limitada', 'Im', '#8a5a2e'),
('mate-torpedo', 'Mate Torpedo', 'mates', 38000, 14, 'Silueta alargada, ideal para mate dulce y tereré.', 'Calabaza torpedo de boca chica que conserva la temperatura por más tiempo. Forro en cuero color tabaco y virola lisa de acero. Excelente para quienes prefieren mate dulce sin perder fuerza.', null, 'Tp', '#6b3f1d'),
('mate-algarrobo', 'Mate de Algarrobo', 'mates', 28000, 6, 'Tallado en madera de algarrobo del norte, sin tratar.', 'Pieza única tallada en madera de algarrobo blanco, sin recubrimientos químicos. La veta se acentúa con el uso. Liviano, cálido, profundamente criollo.', null, 'Al', '#a87142'),
('mate-criollo', 'Mate Criollo', 'mates', 24000, 32, 'El de toda la vida. Calabaza, virola simple, sin vueltas.', 'Sin pretensiones. Calabaza criolla curada, virola de acero, base de cuero. El que todo el mundo quiere tener en la mesa.', 'Más vendido', 'Cr', '#3d5a3a'),
('mate-ranchero', 'Mate Ranchero', 'mates', 32000, 11, 'Cuero rústico costurado a mano, virola dorada.', 'Inspirado en los mates de estancia. Cuero crudo trabajado a la antigua, costura visible, virola con baño dorado. Robusto, va a durar décadas.', null, 'Rn', '#c8a25a'),
('bombilla-simple', 'Bombilla Simple', 'bombillas', 5000, 60, 'Acero inoxidable, filtro a rosca.', 'La bombilla del día a día. Acero 304, filtro a rosca desmontable para limpieza profunda. Resistente, cumple lo que promete.', null, 'Bs', '#7a8478'),
('bombilla-pico-rey', 'Bombilla Pico de Rey', 'bombillas', 18000, 15, 'Alpaca cincelada, boquilla pico de rey.', 'Boquilla aplanada estilo "pico de rey", suave en los labios. Cuerpo en alpaca cincelada a mano con motivos geométricos. Filtro de resorte fino.', null, 'Pr', '#c8a25a'),
('bombilla-pico-loro', 'Bombilla Pico de Loro', 'bombillas', 22000, 12, 'Alpaca, boquilla curva pico de loro.', 'La favorita de los mateadores serios. Boquilla curva tipo "pico de loro" que ayuda a tomar sin levantar la cabeza. Filtro de alta densidad, no chupa yerba.', null, 'Pl', '#a87142'),
('bombilla-bombillon', 'Bombillón de Alpaca', 'bombillas', 30000, 5, 'Pieza grande, alpaca maciza, para mate galleta.', 'Bombillón XL en alpaca maciza, pensado para mate galleta y rondas largas. Detalles cincelados, virola en bronce. Pieza para regalo.', 'Top', 'Bn', '#d4a857'),
('bombilla-acero', 'Bombilla Acero', 'bombillas', 8000, 40, 'Acero inoxidable pulido, filtro fino.', 'Acero pulido espejo, filtro de malla fina ideal para yerbas muy molidas. Mantenimiento mínimo.', null, 'Ac', '#6e7b6d'),
('termo-media-manija', 'Termo Media Manija', 'termos', 50000, 18, '1L, acero, conserva 24hs, pico cebador.', 'Termo de un litro con media manija lateral, acero inoxidable doble pared, conserva 24 horas en caliente. Pico cebador preciso y tapón a rosca con sello hermético. El compañero de las mateadas de verdad.', 'Nuevo', 'Tm', '#243025');
