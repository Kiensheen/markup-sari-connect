CREATE POLICY "Consumers cancel own pending orders" ON public.orders
FOR UPDATE TO authenticated
USING (auth.uid() = consumer_id AND rider_id IS NULL AND status IN ('pending','confirmed','assigned'))
WITH CHECK (auth.uid() = consumer_id AND status = 'cancelled');