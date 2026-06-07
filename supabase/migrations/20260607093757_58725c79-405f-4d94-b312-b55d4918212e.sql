-- Tighten user_roles read policy: users can only read their own role
DROP POLICY IF EXISTS "Allow authenticated users to read user_roles" ON public.user_roles;
CREATE POLICY "Users read own role" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Admins can read all roles (for admin dashboard)
CREATE POLICY "Admins read all roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));