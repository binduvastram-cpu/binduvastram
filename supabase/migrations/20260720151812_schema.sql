-- Bindu Vastram — core schema, RLS, triggers, and storage bucket.
-- Applied via `supabase db push` only (no SQL editor).

create extension if not exists pgcrypto;

-- =========================================================================
-- profiles + is_admin() helper
-- =========================================================================

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  phone text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

create policy "profiles_select_own_or_admin" on public.profiles
  for select using (auth.uid() = id or public.is_admin());
create policy "profiles_update_own_or_admin" on public.profiles
  for update using (auth.uid() = id or public.is_admin());

-- Auto-create a profile row whenever someone signs up via Supabase Auth.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, phone)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================================
-- addresses
-- =========================================================================

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  line1 text not null,
  line2 text,
  city text,
  pincode text not null,
  state text,
  is_default boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.addresses enable row level security;

create policy "addresses_select_own_or_admin" on public.addresses for select using (profile_id = auth.uid() or public.is_admin());
create policy "addresses_insert_own" on public.addresses for insert with check (profile_id = auth.uid());
create policy "addresses_update_own_or_admin" on public.addresses for update using (profile_id = auth.uid() or public.is_admin());
create policy "addresses_delete_own_or_admin" on public.addresses for delete using (profile_id = auth.uid() or public.is_admin());

-- =========================================================================
-- categories
-- =========================================================================

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  value text not null unique,
  label text not null,
  image_url text,
  filter_kinds text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

create policy "categories_public_read" on public.categories for select using (true);
create policy "categories_admin_insert" on public.categories for insert with check (public.is_admin());
create policy "categories_admin_update" on public.categories for update using (public.is_admin());
create policy "categories_admin_delete" on public.categories for delete using (public.is_admin());

-- =========================================================================
-- saree collection taxonomy: family -> group (optional) -> item
-- =========================================================================

create table public.collection_families (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  created_at timestamptz not null default now()
);

create table public.collection_groups (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.collection_families(id) on delete cascade,
  slug text not null unique,
  label text not null
);

create table public.collection_items (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.collection_families(id) on delete cascade,
  group_id uuid references public.collection_groups(id) on delete cascade,
  slug text not null unique,
  label text not null
);

alter table public.collection_families enable row level security;
alter table public.collection_groups enable row level security;
alter table public.collection_items enable row level security;

create policy "collection_families_public_read" on public.collection_families for select using (true);
create policy "collection_families_admin_insert" on public.collection_families for insert with check (public.is_admin());
create policy "collection_families_admin_update" on public.collection_families for update using (public.is_admin());
create policy "collection_families_admin_delete" on public.collection_families for delete using (public.is_admin());

create policy "collection_groups_public_read" on public.collection_groups for select using (true);
create policy "collection_groups_admin_insert" on public.collection_groups for insert with check (public.is_admin());
create policy "collection_groups_admin_update" on public.collection_groups for update using (public.is_admin());
create policy "collection_groups_admin_delete" on public.collection_groups for delete using (public.is_admin());

create policy "collection_items_public_read" on public.collection_items for select using (true);
create policy "collection_items_admin_insert" on public.collection_items for insert with check (public.is_admin());
create policy "collection_items_admin_update" on public.collection_items for update using (public.is_admin());
create policy "collection_items_admin_delete" on public.collection_items for delete using (public.is_admin());

-- =========================================================================
-- attributes (fixed-value dropdowns for fabric/work/color/occasion/material/size)
-- =========================================================================

create table public.attributes (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('fabric', 'work', 'color', 'occasion', 'material', 'size')),
  value text not null,
  unique (kind, value)
);

alter table public.attributes enable row level security;

create policy "attributes_public_read" on public.attributes for select using (true);
create policy "attributes_admin_insert" on public.attributes for insert with check (public.is_admin());
create policy "attributes_admin_update" on public.attributes for update using (public.is_admin());
create policy "attributes_admin_delete" on public.attributes for delete using (public.is_admin());

-- =========================================================================
-- products (+ sizes, + images)
-- =========================================================================

create table public.products (
  id uuid primary key default gen_random_uuid(),
  code text unique,
  name text not null,
  tagline text,
  description text not null default '',
  price numeric(10, 2) not null default 0,
  mrp numeric(10, 2),
  video_url text,
  collection_item_id uuid references public.collection_items(id) on delete set null,
  category_id uuid not null references public.categories(id),
  properties jsonb not null default '{}'::jsonb,
  stock integer not null default 0,
  cod_available boolean not null default true,
  estimated_delivery_min integer not null default 4,
  estimated_delivery_max integer not null default 7,
  is_active boolean not null default true,
  bought_count integer default 0,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "products_public_read_active_or_admin" on public.products for select using (is_active or public.is_admin());
create policy "products_admin_insert" on public.products for insert with check (public.is_admin());
create policy "products_admin_update" on public.products for update using (public.is_admin());
create policy "products_admin_delete" on public.products for delete using (public.is_admin());

create table public.product_sizes (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  size text not null,
  stock integer not null default 0,
  unique (product_id, size)
);

alter table public.product_sizes enable row level security;

create policy "product_sizes_public_read" on public.product_sizes for select using (true);
create policy "product_sizes_admin_insert" on public.product_sizes for insert with check (public.is_admin());
create policy "product_sizes_admin_update" on public.product_sizes for update using (public.is_admin());
create policy "product_sizes_admin_delete" on public.product_sizes for delete using (public.is_admin());

-- Keeps products.stock as the live sum of its sizes whenever any exist —
-- mirrors the admin-form auto-calculation already built client-side.
create or replace function public.sync_product_stock()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  pid uuid;
begin
  pid := coalesce(new.product_id, old.product_id);
  update public.products
  set stock = (select coalesce(sum(stock), 0) from public.product_sizes where product_id = pid)
  where id = pid;
  return null;
end;
$$;

create trigger product_sizes_sync_stock
  after insert or update or delete on public.product_sizes
  for each row execute function public.sync_product_stock();

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  sort_order integer not null default 0
);

alter table public.product_images enable row level security;

create policy "product_images_public_read" on public.product_images for select using (true);
create policy "product_images_admin_insert" on public.product_images for insert with check (public.is_admin());
create policy "product_images_admin_update" on public.product_images for update using (public.is_admin());
create policy "product_images_admin_delete" on public.product_images for delete using (public.is_admin());

-- =========================================================================
-- offers
-- =========================================================================

create table public.offers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  scope text not null check (scope in ('product', 'category')),
  product_id uuid references public.products(id) on delete cascade,
  category_id uuid references public.categories(id) on delete cascade,
  discount_type text not null check (discount_type in ('percent', 'flat')),
  discount_value numeric(10, 2) not null,
  start_date timestamptz,
  end_date timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint offers_scope_target_check check (
    (scope = 'product' and product_id is not null and category_id is null) or
    (scope = 'category' and category_id is not null and product_id is null)
  )
);

alter table public.offers enable row level security;

create policy "offers_public_read_active_or_admin" on public.offers for select using (is_active or public.is_admin());
create policy "offers_admin_insert" on public.offers for insert with check (public.is_admin());
create policy "offers_admin_update" on public.offers for update using (public.is_admin());
create policy "offers_admin_delete" on public.offers for delete using (public.is_admin());

-- =========================================================================
-- orders (+ items, + status log)
-- =========================================================================

create sequence public.order_code_seq start 1000;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_code text not null unique default ('BV-' || nextval('public.order_code_seq')::text),
  profile_id uuid references public.profiles(id) on delete set null,
  address_id uuid references public.addresses(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  customer_address text not null,
  customer_pincode text not null,
  subtotal numeric(10, 2) not null,
  total numeric(10, 2) not null,
  payment_method text not null default 'COD' check (payment_method in ('COD')),
  payment_status text not null default 'Pending' check (payment_status in ('Pending', 'Paid on Delivery')),
  order_status text not null default 'Placed' check (
    order_status in ('Placed', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled')
  ),
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

create policy "orders_select_own_or_admin" on public.orders for select using (profile_id = auth.uid() or public.is_admin());
create policy "orders_insert_own_or_admin" on public.orders for insert with check (profile_id = auth.uid() or public.is_admin());
create policy "orders_update_admin" on public.orders for update using (public.is_admin());

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  size text,
  price_at_purchase numeric(10, 2) not null,
  quantity integer not null,
  image_url text
);

alter table public.order_items enable row level security;

create policy "order_items_select_owner_or_admin" on public.order_items for select using (
  exists (select 1 from public.orders o where o.id = order_id and (o.profile_id = auth.uid() or public.is_admin()))
);
create policy "order_items_insert_owner_or_admin" on public.order_items for insert with check (
  exists (select 1 from public.orders o where o.id = order_id and (o.profile_id = auth.uid() or public.is_admin()))
);

create table public.order_status_log (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status text not null,
  changed_at timestamptz not null default now()
);

alter table public.order_status_log enable row level security;

create policy "order_status_log_select_owner_or_admin" on public.order_status_log for select using (
  exists (select 1 from public.orders o where o.id = order_id and (o.profile_id = auth.uid() or public.is_admin()))
);

create or replace function public.log_order_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (tg_op = 'INSERT') then
    insert into public.order_status_log (order_id, status) values (new.id, new.order_status);
  elsif (new.order_status is distinct from old.order_status) then
    insert into public.order_status_log (order_id, status) values (new.id, new.order_status);
  end if;
  return new;
end;
$$;

create trigger orders_status_log
  after insert or update on public.orders
  for each row execute function public.log_order_status();

-- =========================================================================
-- reviews, leads, virtual shopping requests
-- =========================================================================

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  customer_name text not null,
  rating integer not null check (rating between 1 and 5),
  text text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reply text,
  created_at timestamptz not null default now()
);

alter table public.reviews enable row level security;

create policy "reviews_select_approved_or_own_or_admin" on public.reviews for select using (
  status = 'approved' or profile_id = auth.uid() or public.is_admin()
);
create policy "reviews_insert_authenticated" on public.reviews for insert with check (auth.uid() is not null);
create policy "reviews_update_admin" on public.reviews for update using (public.is_admin());
create policy "reviews_delete_admin" on public.reviews for delete using (public.is_admin());

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null,
  coupon_code text not null unique,
  redeemed boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.leads enable row level security;

create policy "leads_insert_public" on public.leads for insert with check (true);
create policy "leads_select_admin" on public.leads for select using (public.is_admin());
create policy "leads_update_admin" on public.leads for update using (public.is_admin());

create table public.virtual_shopping_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  product_id uuid references public.products(id) on delete set null,
  product_name text,
  preferred_date date not null,
  preferred_time text not null,
  topic text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'completed')),
  created_at timestamptz not null default now()
);

alter table public.virtual_shopping_requests enable row level security;

create policy "vsr_insert_public" on public.virtual_shopping_requests for insert with check (true);
create policy "vsr_select_admin" on public.virtual_shopping_requests for select using (public.is_admin());
create policy "vsr_update_admin" on public.virtual_shopping_requests for update using (public.is_admin());

-- =========================================================================
-- wishlists + cart_items (per-account, once logged in)
-- =========================================================================

create table public.wishlists (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (profile_id, product_id)
);

alter table public.wishlists enable row level security;

create policy "wishlists_owner_all" on public.wishlists for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());

create table public.cart_items (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  size text not null default '',
  quantity integer not null default 1,
  updated_at timestamptz not null default now(),
  primary key (profile_id, product_id, size)
);

alter table public.cart_items enable row level security;

create policy "cart_items_owner_all" on public.cart_items for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());

-- =========================================================================
-- storage: one public bucket for product images + videos
-- =========================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-media',
  'product-media',
  true,
  52428800, -- 50MB ceiling (accommodates short product videos; images are also resized client-side before upload)
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']
)
on conflict (id) do nothing;

create policy "product_media_public_read" on storage.objects for select using (bucket_id = 'product-media');
create policy "product_media_admin_insert" on storage.objects for insert with check (bucket_id = 'product-media' and public.is_admin());
create policy "product_media_admin_update" on storage.objects for update using (bucket_id = 'product-media' and public.is_admin());
create policy "product_media_admin_delete" on storage.objects for delete using (bucket_id = 'product-media' and public.is_admin());

-- =========================================================================
-- realtime — only the surfaces where "live" matters
-- =========================================================================

alter publication supabase_realtime add table public.products;
alter publication supabase_realtime add table public.offers;
alter publication supabase_realtime add table public.orders;
