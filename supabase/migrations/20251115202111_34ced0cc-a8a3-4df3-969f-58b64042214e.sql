-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table for role-based access control
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Only admins can insert roles"
  ON public.user_roles
  FOR INSERT
  WITH CHECK (false); -- Only allow via direct DB access or admin functions

CREATE POLICY "Only admins can update roles"
  ON public.user_roles
  FOR UPDATE
  USING (false);

CREATE POLICY "Only admins can delete roles"
  ON public.user_roles
  FOR DELETE
  USING (false);

-- Create security definer function to check user roles without RLS recursion
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Update enterprise_inquiries SELECT policy to use role check
DROP POLICY IF EXISTS "Only admins can view inquiries" ON public.enterprise_inquiries;

CREATE POLICY "Admins can view enterprise inquiries"
  ON public.enterprise_inquiries
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Add phone number validation constraints to businesses table
ALTER TABLE public.businesses
  ADD CONSTRAINT business_phone_format CHECK (
    business_phone ~ '^\+?[1-9]\d{9,14}$' AND length(business_phone) BETWEEN 10 AND 16
  ),
  ADD CONSTRAINT notification_phone_format CHECK (
    notification_phone ~ '^\+?[1-9]\d{9,14}$' AND length(notification_phone) BETWEEN 10 AND 16
  );

-- Add phone number validation constraint to calls table
ALTER TABLE public.calls
  ADD CONSTRAINT customer_phone_format CHECK (
    customer_phone ~ '^\+?[1-9]\d{9,14}$' AND length(customer_phone) BETWEEN 10 AND 16
  );

-- Add phone number validation constraint to enterprise_inquiries table
ALTER TABLE public.enterprise_inquiries
  ADD CONSTRAINT phone_format CHECK (
    phone ~ '^\+?[1-9]\d{9,14}$' AND length(phone) BETWEEN 10 AND 16
  );

-- Create trigger for user_roles updated_at
CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();