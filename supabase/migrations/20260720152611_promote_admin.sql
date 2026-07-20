-- Promotes the manually-created Supabase Auth user (created via the dashboard's
-- Auth panel, not the SQL editor) to admin. This user predates the
-- handle_new_user trigger, so it has no profiles row yet — insert one.
insert into public.profiles (id, email, is_admin)
select id, email, true
from auth.users
where email = 'binduvastram@gmail.com'
on conflict (id) do update set is_admin = true;
