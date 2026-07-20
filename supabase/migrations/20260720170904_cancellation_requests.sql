create table public.cancellation_requests (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  reason text,
  status text not null default 'Pending' check (status in ('Pending', 'Approved', 'Rejected')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

alter table public.cancellation_requests enable row level security;

create policy "cancel_req_select_own_or_admin" on public.cancellation_requests
  for select using (profile_id = auth.uid() or public.is_admin());

create policy "cancel_req_insert_own" on public.cancellation_requests
  for insert with check (
    profile_id = auth.uid()
    and exists (select 1 from public.orders o where o.id = order_id and o.profile_id = auth.uid())
  );

create policy "cancel_req_admin_update" on public.cancellation_requests
  for update using (public.is_admin());

create policy "cancel_req_admin_delete" on public.cancellation_requests
  for delete using (public.is_admin());

alter publication supabase_realtime add table public.cancellation_requests;
