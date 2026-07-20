create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_percent numeric(5, 2) not null check (discount_percent > 0 and discount_percent <= 100),
  scope text not null default 'all' check (scope in ('all', 'category', 'product')),
  category_id uuid references public.categories(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  start_date timestamptz,
  end_date timestamptz not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint coupons_scope_target_check check (
    (scope = 'all' and category_id is null and product_id is null) or
    (scope = 'category' and category_id is not null and product_id is null) or
    (scope = 'product' and product_id is not null and category_id is null)
  )
);

alter table public.coupons enable row level security;

create policy "coupons_admin_all" on public.coupons
  for all using (public.is_admin()) with check (public.is_admin());

-- No public select policy — codes are meant to be told to customers out of
-- band (marketing), not discoverable by browsing the table. Validation only
-- ever happens through this security-definer RPC.
create or replace function public.validate_coupon(p_code text)
returns table (
  valid boolean,
  discount_percent numeric,
  scope text,
  category_value text,
  product_id uuid,
  message text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  c record;
begin
  select co.*, cat.value as category_value
    into c
    from public.coupons co
    left join public.categories cat on cat.id = co.category_id
    where upper(co.code) = upper(p_code)
    limit 1;

  if c is null then
    return query select false, null::numeric, null::text, null::text, null::uuid, 'Invalid coupon code';
    return;
  end if;

  if not c.is_active then
    return query select false, null::numeric, null::text, null::text, null::uuid, 'This coupon is no longer active';
    return;
  end if;

  if c.start_date is not null and c.start_date > now() then
    return query select false, null::numeric, null::text, null::text, null::uuid, 'This coupon is not active yet';
    return;
  end if;

  if c.end_date < now() then
    return query select false, null::numeric, null::text, null::text, null::uuid, 'This coupon has expired';
    return;
  end if;

  return query select true, c.discount_percent, c.scope, c.category_value, c.product_id, 'Coupon applied';
end;
$$;

grant execute on function public.validate_coupon(text) to anon, authenticated;

-- Best-effort literal auto-expiry on Supabase's managed Postgres (no
-- Docker/local dependency). validate_coupon defensively re-checks the
-- expiry window too, in case this ever isn't available on a given plan.
do $outer$
begin
  create extension if not exists pg_cron with schema extensions;
  perform cron.schedule('expire-coupons', '0 * * * *', $job$delete from public.coupons where end_date < now()$job$);
exception when others then
  raise notice 'pg_cron unavailable — coupons will only stop validating at expiry, not auto-delete: %', sqlerrm;
end;
$outer$;

alter table public.orders add column coupon_code text;
alter table public.orders add column discount_amount numeric(10, 2) not null default 0;
