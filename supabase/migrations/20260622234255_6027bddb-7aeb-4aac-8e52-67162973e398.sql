
-- Enforce block on order creation
DROP POLICY IF EXISTS "Consumers create own orders" ON public.orders;
CREATE POLICY "Consumers create own orders" ON public.orders
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = consumer_id
    AND NOT EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (p.is_blocked = true OR (p.blocked_until IS NOT NULL AND p.blocked_until > now()))
    )
  );
