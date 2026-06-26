-- Update handle_new_user trigger to better handle custom signup fields

-- Drop existing trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Update the function to handle custom metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _first_name text;
  _middle_name text;
  _last_name text;
  _account_type text;
  _full_name text;
BEGIN
  -- Extract custom fields from raw_user_meta_data
  _first_name := COALESCE(
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );
  
  _middle_name := NEW.raw_user_meta_data->>'middle_name';
  _last_name := COALESCE(
    NEW.raw_user_meta_data->>'last_name',
    ''
  );
  
  _account_type := COALESCE(
    NEW.raw_user_meta_data->>'account_type',
    'consumer'
  );

  -- Build full name
  IF _middle_name IS NOT NULL AND _middle_name != '' THEN
    _full_name := _first_name || ' ' || _middle_name || ' ' || _last_name;
  ELSE
    _full_name := _first_name || ' ' || _last_name;
  END IF;

  -- Trim whitespace
  _full_name := trim(_full_name);
  _first_name := trim(_first_name);
  _last_name := trim(_last_name);

  -- Insert profile with all available data
  INSERT INTO public.profiles (
    id, 
    email, 
    name,
    first_name,
    middle_name,
    last_name,
    phone
  )
  VALUES (
    NEW.id, 
    NEW.email,
    _full_name,
    _first_name,
    NULLIF(_middle_name, ''),
    NULLIF(_last_name, ''),
    NEW.raw_user_meta_data->>'phone'
  );

  -- Insert user role
  INSERT INTO public.user_roles (user_id, role) 
  VALUES (NEW.id, _account_type::public.app_role);

  RETURN NEW;
END $$;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.user_roles TO authenticated;