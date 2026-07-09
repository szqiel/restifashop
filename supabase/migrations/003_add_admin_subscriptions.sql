-- Create table for web push subscriptions
CREATE TABLE public.admin_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  endpoint TEXT UNIQUE NOT NULL,
  keys_auth TEXT NOT NULL,
  keys_p256dh TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.admin_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow admins to insert and manage their own subscriptions
CREATE POLICY "Admins can insert their own subscriptions"
ON public.admin_subscriptions FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id 
  AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

CREATE POLICY "Admins can view their own subscriptions"
ON public.admin_subscriptions FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id 
  AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

CREATE POLICY "Admins can update their own subscriptions"
ON public.admin_subscriptions FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id 
  AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

CREATE POLICY "Admins can delete their own subscriptions"
ON public.admin_subscriptions FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id 
  AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);
