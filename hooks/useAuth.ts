import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types/index';
import type { User } from '@supabase/supabase-js';

// Cache keys for localStorage
const AUTH_CACHE_KEY = 'efie_auth_cache';
const PROFILE_CACHE_KEY = 'efie_profile_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface AuthCache {
  user: User | null;
  timestamp: number;
}

interface ProfileCache {
  profile: Profile | null;
  isAdmin: boolean;
  timestamp: number;
}

// Cache helper functions
const getCachedAuth = (): AuthCache | null => {
  try {
    const cached = localStorage.getItem(AUTH_CACHE_KEY);
    if (cached) {
      const parsed: AuthCache = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < CACHE_DURATION) {
        return parsed;
      }
    }
  } catch (error) {
    console.warn('Error reading auth cache:', error);
  }
  return null;
};

const setCachedAuth = (user: User | null) => {
  try {
    const cache: AuthCache = { user, timestamp: Date.now() };
    localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.warn('Error caching auth data:', error);
  }
};

const getCachedProfile = (): ProfileCache | null => {
  try {
    const cached = localStorage.getItem(PROFILE_CACHE_KEY);
    if (cached) {
      const parsed: ProfileCache = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < CACHE_DURATION) {
        return parsed;
      }
    }
  } catch (error) {
    console.warn('Error reading profile cache:', error);
  }
  return null;
};

const setCachedProfile = (profile: Profile | null, isAdmin: boolean) => {
  try {
    const cache: ProfileCache = { profile, isAdmin, timestamp: Date.now() };
    localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.warn('Error caching profile data:', error);
  }
};

const clearAuthCache = () => {
  try {
    localStorage.removeItem(AUTH_CACHE_KEY);
    localStorage.removeItem(PROFILE_CACHE_KEY);
  } catch (error) {
    console.warn('Error clearing auth cache:', error);
  }
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      // Check cache first
      const cachedProfile = getCachedProfile();
      if (cachedProfile && cachedProfile.profile?.id === userId) {
        setProfile(cachedProfile.profile);
        setIsAdmin(cachedProfile.isAdmin);
        setLoading(false);
        return;
      }

      // Fetch from network
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      const isAdminRole = data?.role === 'admin';
      setProfile(data);
      setIsAdmin(isAdminRole);

      // Cache the profile data
      setCachedProfile(data, isAdminRole);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
      setIsAdmin(false);
      // Clear cache on error
      clearAuthCache();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Get initial session with caching
    const getInitialSession = async () => {
      try {
        // Check cache first for faster initial load
        const cachedAuth = getCachedAuth();
        const cachedProfile = getCachedProfile();

        if (cachedAuth && cachedProfile) {
          // Use cached data for instant loading
          setUser(cachedAuth.user);
          setProfile(cachedProfile.profile);
          setIsAdmin(cachedProfile.isAdmin);
          setLoading(false);

          // Verify cache validity in background
          const { data: { session } } = await supabase.auth.getSession();
          if (session && session.user?.id === cachedAuth.user?.id) {
            // Cache is still valid, refresh in background
            fetchProfile(session.user.id);
            return;
          }
        }

        // No valid cache, fetch from network
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        setCachedAuth(session?.user ?? null);

        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        setCachedAuth(currentUser);

        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setIsAdmin(false);
          clearAuthCache();
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  return {
    user,
    profile,
    isAdmin,
    loading
  };
};