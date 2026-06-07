
-- 1. Drop redundant rider UPDATE policy
DROP POLICY IF EXISTS "Riders can update orders they are assigned to" ON public.orders;

-- 2. Lock down SECURITY DEFINER function EXECUTE grants
-- Trigger-only functions: revoke from everyone except postgres/service_role
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.enforce_order_update_fields() FROM PUBLIC, anon, authenticated;

-- Used inside RLS only: revoke from anon (still need authenticated for some policy contexts; RLS evaluates regardless of grants, so safe to revoke)
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- Client-callable RPCs: authenticated only, never anon
REVOKE ALL ON FUNCTION public.redeem_points(integer, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.redeem_points(integer, text) TO authenticated;

REVOKE ALL ON FUNCTION public.award_order_points(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.award_order_points(uuid) TO authenticated;
