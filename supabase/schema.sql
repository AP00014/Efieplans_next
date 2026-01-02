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

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Profiles: Users can view all profiles, but only edit their own
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Posts: Anyone can view, authenticated users can create, only author can update/delete
CREATE POLICY "Posts are viewable by everyone" ON posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create posts" ON posts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own posts" ON posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON posts FOR DELETE USING (auth.uid() = user_id);

-- Comments: Similar to posts
CREATE POLICY "Comments are viewable by everyone" ON comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own comments" ON comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

-- Likes: Authenticated users can manage their likes
CREATE POLICY "Likes are viewable by everyone" ON likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create likes" ON likes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can delete own likes" ON likes FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX posts_user_id_idx ON posts(user_id);
CREATE INDEX posts_created_at_idx ON posts(created_at DESC);
CREATE INDEX comments_post_id_idx ON comments(post_id);
CREATE INDEX comments_created_at_idx ON comments(created_at DESC);
CREATE INDEX likes_post_id_idx ON likes(post_id);
CREATE INDEX likes_user_id_idx ON likes(user_id);

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



residential ,commercial , town houses,group dwelling 


┌─────────────────────────────────────────────────────────────────────────────────┐
│                              CONTACT SYSTEM FLOW                                │
│                                                                                 │
│  ┌─────────────┐    ┌─────────────────┐    ┌─────────────────────┐             │
│  │ contact_    │    │ contact_        │    │ send-contact-       │             │
│  │ messages    │◄──►│ messages        │◄──►│ notification        │             │
│  │ table       │    │ table           │    │ function            │             │
│  └─────────────┘    └─────────────────┘    └─────────────────────┘             │
│         ▲                     ▲                     │                          │
│         │                     │                     │                          │
│         │                     │                     ▼                          │
│         │            ┌─────────────────┐    ┌─────────────────────┐             │
│         │            │ send-contact-   │    │ Resend API          │             │
│         │            │ reply           │───►│ (Email Service)     │             │
│         │            │ function        │    └─────────────────────┘             │
│         │            └─────────────────┘                                         │
│         │                                                                       │
│         └───────────────────────────────────────────────────────────────────────┘
│                                                                                 │
│  ┌─────────────┐    ┌─────────────────┐    ┌─────────────────────┐             │
│  │ email_      │    │ profiles        │    │ send-newsletter     │             │
│  │ subscriptions│◄──►│ table          │◄──►│ function            │             │
│  │ table       │    │                 │    └─────────────────────┘             │
│  └─────────────┘    └─────────────────┘           │                          │
│                                                   ▼                          │
│                                            ┌─────────────────────┐             │
│                                            │ newsletter_sends    │             │
│                                            │ table               │             │
│                                            └─────────────────────┘             │
└─────────────────────────────────────────────────────────────────────────────────┘



1. User submits contact form
   ↓
2. Frontend calls supabase.contact_messages.insert()
   ↓
3. Database trigger fires send-contact-notification
   ↓
4. Admin receives notification email
   ↓
5. Admin replies via admin panel
   ↓
6. Frontend calls send-contact-reply function
   ↓
7. Function updates contact_messages.status to 'replied'
   ↓
8. User receives reply email
   ↓
9. Admin creates newsletter
   ↓
10. Frontend calls send-newsletter function
    ↓
11. Function queries email_subscriptions + profiles
    ↓
12. Sends bulk email via Resend
    ↓
13. Records send in newsletter_sends table


┌─────────────────────────────────────────────────────────────────────────────┐
│                           SUPABASE EDGE FUNCTIONS SYSTEM                     │
│                                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐          │
│  │ Frontend        │    │ Database        │    │ Edge Functions  │          │
│  │ (React App)     │◄──►│ Tables          │◄──►│ (Deno Runtime)  │          │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘          │
│           │                   │                        │                    │
│           │                   │                        │                    │
│           ▼                   ▼                        ▼                    │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐               │
│  │ Contact Form    │ │ Admin Panel     │ │ Newsletter Form │               │
│  │ Submission      │ │ Management      │ │ Creation        │               │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘


check the edge function and ensure i get nofication on email for every contact submission and replies should also be sent to the contacted user email and also newsletters should be sent authenticated user and email subscribers emails

