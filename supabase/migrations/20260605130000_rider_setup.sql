-- Assign rider role to an existing user (replace email with your rider account)
-- Run in Supabase SQL Editor after the user has signed up

-- Example: promote user to rider
-- INSERT INTO public.user_roles (user_id, role)
-- SELECT id, 'rider'::public.app_role
-- FROM auth.users
-- WHERE email = 'rider@example.com'
-- ON CONFLICT (user_id, role) DO NOTHING;

-- Optional: add accepted / out_for_delivery statuses if you prefer exact naming
-- (App currently maps: accepted → confirmed, out_for_delivery → assigned)
-- ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'accepted';
-- ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'out_for_delivery';
