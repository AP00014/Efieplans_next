import { createClient } from "@supabase/supabase-js";

// Load environment variables from .env file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate required environment variables
if (!supabaseUrl) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL environment variable. Please check your .env file."
  );
}
if (!supabaseAnonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable. Please check your .env file."
  );
}

// Create Supabase client with default configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create service role client for admin operations (server-side only)
const supabaseServiceRoleKey =
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
export const supabaseAdmin = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : null;

// Environment variables for Edge Functions and configuration
export const env = {
  SUPABASE_URL: supabaseUrl,
  SUPABASE_ANON_KEY: supabaseAnonKey,
  SUPABASE_SERVICE_ROLE_KEY: supabaseServiceRoleKey || "",
  RESEND_API_KEY: process.env.NEXT_PUBLIC_RESEND_API_KEY || "",
  ADMIN_EMAIL: process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@efieplans.com",
  APP_TITLE: process.env.NEXT_PUBLIC_APP_TITLE || "Efie Plans",
  APP_DESCRIPTION:
    process.env.NEXT_PUBLIC_APP_DESCRIPTION ||
    "Architectural & Construction Excellence",
};

// Helper functions for common operations
export const contactOperations = {
  async submitMessage(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) {
    const { error } = await supabase.from("contact_messages").insert([data]);

    if (error) throw error;
    return { success: true };
  },

  async getMessages() {
    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async updateMessageStatus(id: string, status: string) {
    const { error } = await supabase
      .from("contact_messages")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
    return { success: true };
  },
};

export const newsletterOperations = {
  async subscribeEmail(email: string) {
    const { error } = await supabase
      .from("email_subscriptions")
      .insert([{ email, is_active: true }]);

    if (error) throw error;
    return { success: true };
  },

  async getSubscriptions() {
    const { data, error } = await supabase
      .from("email_subscriptions")
      .select("*")
      .order("subscribed_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async toggleSubscriptionStatus(id: string, isActive: boolean) {
    const { error } = await supabase
      .from("email_subscriptions")
      .update({ is_active: isActive })
      .eq("id", id);

    if (error) throw error;
    return { success: true };
  },

  async deleteSubscription(id: string) {
    const { error } = await supabase
      .from("email_subscriptions")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return { success: true };
  },
};

export const userOperations = {
  async getUsers() {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async updateUserRole(id: string, role: string) {
    const { error } = await supabase
      .from("profiles")
      .update({ role })
      .eq("id", id);

    if (error) throw error;
    return { success: true };
  },

  async banUser(id: string, isBanned: boolean) {
    const { error } = await supabase
      .from("profiles")
      .update({
        is_banned: isBanned,
        banned_at: isBanned ? new Date().toISOString() : null,
        ban_reason: isBanned ? "Banned by admin" : null,
      })
      .eq("id", id);

    if (error) throw error;
    return { success: true };
  },
};

export const postOperations = {
  async getPosts() {
    const { data, error } = await supabase
      .from("posts")
      .select(
        `
        *,
        profiles: user_id (username, full_name)
      `
      )
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async createPost(postData: {
    title: string;
    content: string;
    image_url?: string;
    video_url?: string;
    tags?: string[];
    category?: string;
  }) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase.from("posts").insert({
      user_id: user.id,
      ...postData,
    });

    if (error) throw error;
    return { success: true };
  },

  async updatePost(
    id: string,
    postData: Partial<{
      title: string;
      content: string;
      image_url?: string;
      video_url?: string;
      tags?: string[];
      category?: string;
    }>
  ) {
    const { error } = await supabase
      .from("posts")
      .update({
        ...postData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;
    return { success: true };
  },

  async deletePost(id: string) {
    const { error } = await supabase.from("posts").delete().eq("id", id);

    if (error) throw error;
    return { success: true };
  },
};

