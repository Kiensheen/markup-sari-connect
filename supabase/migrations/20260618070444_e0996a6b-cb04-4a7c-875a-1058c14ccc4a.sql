
-- Profiles: admin read/update all, plus block flag
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_blocked boolean NOT NULL DEFAULT false;

DROP POLICY IF EXISTS "Admins view all profiles" ON public.profiles;
CREATE POLICY "Admins view all profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins update all profiles" ON public.profiles;
CREATE POLICY "Admins update all profiles" ON public.profiles
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- user_roles: admins manage
DROP POLICY IF EXISTS "Admins insert roles" ON public.user_roles;
CREATE POLICY "Admins insert roles" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins delete roles" ON public.user_roles;
CREATE POLICY "Admins delete roles" ON public.user_roles
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- points_transactions: admins insert manual adjustments
DROP POLICY IF EXISTS "Admins insert points" ON public.points_transactions;
CREATE POLICY "Admins insert points" ON public.points_transactions
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Helper function: admin adjusts user points (positive = earn, negative = redeem)
CREATE OR REPLACE FUNCTION public.admin_adjust_points(_user_id uuid, _delta integer, _note text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  IF _delta = 0 THEN RETURN; END IF;
  IF _delta > 0 THEN
    INSERT INTO public.points_transactions(user_id, points_earned, source)
    VALUES (_user_id, _delta, COALESCE(_note, 'Admin adjustment'));
  ELSE
    INSERT INTO public.points_transactions(user_id, points_redeemed, source)
    VALUES (_user_id, -_delta, COALESCE(_note, 'Admin adjustment'));
  END IF;
  UPDATE public.profiles
  SET points_balance = GREATEST(points_balance + _delta, 0)
  WHERE id = _user_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_adjust_points(uuid, integer, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_adjust_points(uuid, integer, text) TO authenticated;

-- app_settings table
CREATE TABLE IF NOT EXISTS public.app_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.app_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO service_role;

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone reads settings" ON public.app_settings;
CREATE POLICY "Anyone reads settings" ON public.app_settings
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Admins write settings" ON public.app_settings;
CREATE POLICY "Admins write settings" ON public.app_settings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed defaults
INSERT INTO public.app_settings(key, value) VALUES
  ('delivery_fee', '49'::jsonb),
  ('points_per_peso', '0.01'::jsonb),
  ('points_redeem_rate', '10'::jsonb),
  ('low_stock_threshold', '10'::jsonb),
  ('bottle_exchange_enabled', 'true'::jsonb),
  ('allow_cancellation', 'true'::jsonb)
ON CONFLICT (key) DO NOTHING;
