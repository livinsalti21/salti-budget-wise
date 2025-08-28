-- Create missing profile for authenticated user
INSERT INTO public.profiles (id, email, completed_onboarding, created_at, updated_at)
VALUES ('36b8396e-202b-4438-9784-34c3510bc989', 'jsalti24@gmail.com', false, now(), now())
ON CONFLICT (id) DO NOTHING;

-- Create trigger to auto-create profiles for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, completed_onboarding, created_at, updated_at)
  VALUES (new.id, new.email, false, now(), now())
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for auto profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();