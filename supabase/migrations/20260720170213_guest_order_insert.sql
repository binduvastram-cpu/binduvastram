-- `profile_id = auth.uid()` evaluates to NULL (not true) when a guest places
-- an order (both sides NULL), so true guest checkout was silently rejected
-- by RLS. Guests must be allowed to insert an order with profile_id null.
drop policy if exists "orders_insert_own_or_admin" on public.orders;
create policy "orders_insert_own_or_admin" on public.orders
  for insert with check (profile_id = auth.uid() or profile_id is null or public.is_admin());
