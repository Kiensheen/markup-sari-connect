
-- 1. Remove client INSERT on points_transactions
DROP POLICY IF EXISTS "Users insert own points" ON public.points_transactions;
REVOKE INSERT, UPDATE, DELETE ON public.points_transactions FROM authenticated, anon;

-- 2. Secure RPC: award points for an order (idempotent)
CREATE OR REPLACE FUNCTION public.award_order_points(_order_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _total numeric;
  _delivery_fee numeric;
  _earned integer;
  _exists boolean;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT total, delivery_fee INTO _total, _delivery_fee
  FROM public.orders WHERE id = _order_id AND consumer_id = _uid;
  IF NOT FOUND THEN RAISE EXCEPTION 'Order not found'; END IF;
  SELECT EXISTS(SELECT 1 FROM public.points_transactions
    WHERE user_id = _uid AND source = 'Order ' || substr(_order_id::text,1,8))
    INTO _exists;
  IF _exists THEN RETURN 0; END IF;
  _earned := floor(GREATEST(_total - _delivery_fee, 0) / 100);
  IF _earned > 0 THEN
    INSERT INTO public.points_transactions(user_id, points_earned, source)
    VALUES (_uid, _earned, 'Order ' || substr(_order_id::text,1,8));
    UPDATE public.profiles SET points_balance = points_balance + _earned WHERE id = _uid;
  END IF;
  RETURN _earned;
END; $$;
GRANT EXECUTE ON FUNCTION public.award_order_points(uuid) TO authenticated;

-- 3. Secure RPC: redeem points
CREATE OR REPLACE FUNCTION public.redeem_points(_cost integer, _source text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _bal integer;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF _cost IS NULL OR _cost <= 0 OR _cost > 100000 THEN RAISE EXCEPTION 'Invalid cost'; END IF;
  IF _source IS NULL OR length(_source) > 200 THEN RAISE EXCEPTION 'Invalid source'; END IF;
  SELECT points_balance INTO _bal FROM public.profiles WHERE id = _uid FOR UPDATE;
  IF _bal IS NULL OR _bal < _cost THEN RAISE EXCEPTION 'Insufficient points'; END IF;
  INSERT INTO public.points_transactions(user_id, points_redeemed, source)
  VALUES (_uid, _cost, _source);
  UPDATE public.profiles SET points_balance = points_balance - _cost WHERE id = _uid;
END; $$;
GRANT EXECUTE ON FUNCTION public.redeem_points(integer, text) TO authenticated;

-- 4. Restrict rider order updates to safe columns via trigger
CREATE OR REPLACE FUNCTION public.enforce_order_update_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin') THEN RETURN NEW; END IF;
  IF public.has_role(auth.uid(), 'rider') THEN
    IF NEW.consumer_id IS DISTINCT FROM OLD.consumer_id
       OR NEW.total IS DISTINCT FROM OLD.total
       OR NEW.delivery_fee IS DISTINCT FROM OLD.delivery_fee
       OR NEW.payment_method IS DISTINCT FROM OLD.payment_method
       OR NEW.delivery_address IS DISTINCT FROM OLD.delivery_address
       OR NEW.created_at IS DISTINCT FROM OLD.created_at
    THEN RAISE EXCEPTION 'Riders cannot modify these order fields'; END IF;
    IF NEW.rider_id IS DISTINCT FROM OLD.rider_id
       AND (NEW.rider_id IS DISTINCT FROM auth.uid() OR OLD.rider_id IS NOT NULL) THEN
      RAISE EXCEPTION 'Riders can only self-assign unassigned orders';
    END IF;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS enforce_order_update_fields_trg ON public.orders;
CREATE TRIGGER enforce_order_update_fields_trg
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.enforce_order_update_fields();

-- Tighten the rider UPDATE policy with explicit WITH CHECK
DROP POLICY IF EXISTS "Riders update assigned" ON public.orders;
CREATE POLICY "Riders update assigned" ON public.orders
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'rider') AND (rider_id = auth.uid() OR rider_id IS NULL))
WITH CHECK (public.has_role(auth.uid(), 'rider') AND rider_id = auth.uid());

-- 5. Lock down user_roles: only admins may write
REVOKE INSERT, UPDATE, DELETE ON public.user_roles FROM authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON public.user_roles TO service_role;

DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;
CREATE POLICY "Admins manage roles" ON public.user_roles
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
