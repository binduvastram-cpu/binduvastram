-- Enables reliable phone -> email lookup for phone-based login: a phone
-- number must map to at most one account.
create unique index profiles_phone_unique on public.profiles (phone) where phone is not null and phone <> '';
