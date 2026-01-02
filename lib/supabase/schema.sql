-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indyb3FrcHBnZmVxaXh5c3B4a21vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDAzNDEwMywiZXhwIjoyMDc1NjEwMTAzfQ.GKHY4gbJ3n--4HuQg2oFeoSi-Mz2sjnJPNqgv5XzBBY';

-- Create profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_banned BOOLEAN DEFAULT FALSE,
  banned_at TIMESTAMP WITH TIME ZONE,
  ban_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create posts table
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  image_url TEXT,
  video_url TEXT,
  tags TEXT[],
  category TEXT CHECK (category IN ('architectural design', 'construction', 'interior design')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create comments table
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create likes table
CREATE TABLE likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(post_id, user_id)
  );
  
  -- Create contact_messages table
  CREATE TABLE contact_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    phone TEXT,
    status TEXT DEFAULT 'pending',
    reply TEXT,
    reply_subject TEXT,
    reply_sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
  );
  
  -- Create email_subscriptions table
  CREATE TABLE email_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
  );
  
  -- Create newsletter_sends table
  CREATE TABLE newsletter_sends (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE,
    recipient_count INTEGER DEFAULT 0
  );
  
  -- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_sends ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Profiles: Users can view all profiles, but only edit their own
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can manage all profiles" ON profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Auth admin policies (these need to be set in Supabase dashboard with service role)
-- Note: These policies require service role permissions and should be run in Supabase dashboard
/*
-- Allow admins to delete users from auth.users
-- This policy needs to be created in the Supabase dashboard under Authentication > Policies
-- with service role permissions
*/

-- Posts: Only admins can create/manage posts, everyone can view
CREATE POLICY "Posts are viewable by everyone" ON posts FOR SELECT USING (true);
CREATE POLICY "Only admins can create posts" ON posts FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Only admins can update posts" ON posts FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Only admins can delete posts" ON posts FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Comments: Authenticated users can create comments, everyone can view
CREATE POLICY "Comments are viewable by everyone" ON comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own comments" ON comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all comments" ON comments FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Likes: Authenticated users can manage likes, everyone can view
CREATE POLICY "Likes are viewable by everyone" ON likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage likes" ON likes FOR ALL USING (auth.role() = 'authenticated');

-- Contact messages policies
CREATE POLICY "Anyone can submit contact messages" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage contact messages" ON contact_messages FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Email subscriptions policies
CREATE POLICY "Anyone can subscribe to emails" ON email_subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage email subscriptions" ON email_subscriptions FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Newsletter sends policies
CREATE POLICY "Only admins can manage newsletter sends" ON newsletter_sends FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Storage policies (run these separately in Supabase SQL editor with service role)
-- Note: Storage policies require service role permissions and should be run in Supabase dashboard
/*
-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow public access to view files
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'storage');

-- Only admins can upload files
CREATE POLICY "Admins can upload files" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'storage' AND EXISTS (
  SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
));

-- Only admins can update files
CREATE POLICY "Admins can update files" ON storage.objects FOR UPDATE
USING (bucket_id = 'storage' AND EXISTS (
  SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
));

-- Only admins can delete files
CREATE POLICY "Admins can delete files" ON storage.objects FOR DELETE
USING (bucket_id = 'storage' AND EXISTS (
  SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
));
*/

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow public access to view files
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'storage');

-- Only admins can upload files
CREATE POLICY "Admins can upload files" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'storage' AND EXISTS (
  SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
));

-- Only admins can update files
CREATE POLICY "Admins can update files" ON storage.objects FOR UPDATE
USING (bucket_id = 'storage' AND EXISTS (
  SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
));

-- Only admins can delete files
CREATE POLICY "Admins can delete files" ON storage.objects FOR DELETE
USING (bucket_id = 'storage' AND EXISTS (
  SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
));

-- Create indexes for performance
CREATE INDEX posts_user_id_idx ON posts(user_id);
CREATE INDEX posts_created_at_idx ON posts(created_at DESC);
CREATE INDEX comments_post_id_idx ON comments(post_id);
CREATE INDEX comments_created_at_idx ON comments(created_at DESC);
CREATE INDEX likes_post_id_idx ON likes(post_id);
CREATE INDEX likes_user_id_idx ON likes(user_id);
CREATE INDEX contact_messages_created_at_idx ON contact_messages(created_at DESC);
CREATE INDEX email_subscriptions_email_idx ON email_subscriptions(email);
CREATE INDEX newsletter_sends_sent_at_idx ON newsletter_sends(sent_at DESC);

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contact_messages_updated_at BEFORE UPDATE ON contact_messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sync user data from auth.users to profiles table
UPDATE profiles
SET
  full_name = COALESCE(profiles.full_name, auth_users.raw_user_meta_data->>'full_name'),
  email = COALESCE(profiles.email, auth_users.email)
FROM auth.users auth_users
WHERE profiles.id = auth_users.id
  AND (profiles.full_name IS NULL OR profiles.email IS NULL);

-- For users who don't have profiles yet, create them
INSERT INTO profiles (id, username, email, full_name, bio, avatar_url, role)
SELECT
  au.id,
  COALESCE(au.raw_user_meta_data->>'username', SPLIT_PART(au.email, '@', 1)),
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', ''),
  '',
  '',
  'user'
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- Function to notify admin of new contact messages
-- Note: This function requires the pg_net extension to be enabled
-- You can enable it by running: CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE OR REPLACE FUNCTION notify_contact_message()
RETURNS trigger AS $$
BEGIN
  -- Check if pg_net extension is available and send notification
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN
    PERFORM
      net.http_post(
        url := 'https://wroqkppgfeqixyspxkmo.supabase.co/functions/v1/send-contact-notification',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.service_role_key', true)
        ),
        body := jsonb_build_object('record', row_to_json(NEW)::jsonb)
      );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically send notification email on new contact message
DROP TRIGGER IF EXISTS contact_message_notification ON contact_messages;
CREATE TRIGGER contact_message_notification
  AFTER INSERT ON contact_messages
  FOR EACH ROW EXECUTE FUNCTION notify_contact_message();

-- Function to log newsletter sends
CREATE OR REPLACE FUNCTION log_newsletter_send()
RETURNS trigger AS $$
BEGIN
  -- Log newsletter send activity
  INSERT INTO newsletter_sends (subject, content, sent_at, recipient_count)
  VALUES (NEW.subject, NEW.content, NEW.sent_at, NEW.recipient_count);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update contact message status on reply
CREATE OR REPLACE FUNCTION update_contact_status_on_reply()
RETURNS trigger AS $$
BEGIN
  -- Update status when reply is added
  IF NEW.reply IS NOT NULL AND OLD.reply IS NULL THEN
    NEW.status := 'replied';
    NEW.reply_sent_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update contact status when reply is added
DROP TRIGGER IF EXISTS contact_reply_status_update ON contact_messages;
CREATE TRIGGER contact_reply_status_update
  BEFORE UPDATE ON contact_messages
  FOR EACH ROW EXECUTE FUNCTION update_contact_status_on_reply();
