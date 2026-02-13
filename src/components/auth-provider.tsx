'use client';

import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser, SupabaseClient } from '@supabase/supabase-js';
import type { User } from '@/types';

const isMockMode = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

interface AuthContextType {
  user: SupabaseUser | null;
  profile: User | null;
  loading: boolean;
  isMock: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isMock: false,
  signInWithGoogle: async () => {},
  signInWithGitHub: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef<SupabaseClient | null>(null);

  // In mock mode, poll the mock auth API instead of using Supabase
  useEffect(() => {
    if (isMockMode) {
      const checkMockAuth = async () => {
        try {
          const res = await fetch('/api/mock-auth');
          const data = await res.json();
          if (data.user) {
            // Create a fake SupabaseUser-like object
            setUser({ id: data.user.id, email: 'dev@slopmuseum.local' } as SupabaseUser);
            setProfile(data.user);
          } else {
            setUser(null);
            setProfile(null);
          }
        } catch (err) {
          console.error('Mock auth check error:', err);
        } finally {
          setLoading(false);
        }
      };
      checkMockAuth();
      return;
    }

    // Real Supabase auth flow
    if (!supabaseRef.current) {
      supabaseRef.current = createClient();
    }
    const supabase = supabaseRef.current;

    const getUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          setUser(session.user);
          const { data } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          setProfile(data);
        }
      } catch (err) {
        console.error('Auth init error:', err);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event);
      setUser(session?.user ?? null);

      if (session?.user) {
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setProfile(data);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (isMockMode) return;
    if (!supabaseRef.current) supabaseRef.current = createClient();
    await supabaseRef.current.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const signInWithGitHub = async () => {
    if (isMockMode) return;
    if (!supabaseRef.current) supabaseRef.current = createClient();
    await supabaseRef.current.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const signOut = async () => {
    if (isMockMode) {
      await fetch('/api/mock-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' }),
      });
      setUser(null);
      setProfile(null);
      return;
    }

    if (!supabaseRef.current) supabaseRef.current = createClient();
    await supabaseRef.current.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, isMock: isMockMode, signInWithGoogle, signInWithGitHub, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
