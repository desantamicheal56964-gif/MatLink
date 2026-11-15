import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { UserProfile, UserRole } from '../types';
import { db, supabase } from '../services/db';

export interface AuthActionResult {
  ok: boolean;
  error?: string;
  needsEmailConfirmation?: boolean;
  schemaMissing?: boolean;
  message?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<AuthActionResult>;
  signup: (data: {
    email: string;
    full_name: string;
    phone_number?: string;
    user_type: UserRole;
    company_name?: string;
    password?: string;
  }) => Promise<AuthActionResult>;
  resetPassword: (email: string) => Promise<AuthActionResult>;
  resendConfirmation: (email: string) => Promise<AuthActionResult>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  switchPersona: (userId: string) => Promise<void>;
  availableProfiles: UserProfile[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_KEY = 'circubuild_current_user_id';
const LOGGED_OUT_KEY = 'circubuild_logged_out';

function buildProfileFromSupabaseUser(sbUser: SupabaseUser, existing?: UserProfile | null): UserProfile {
  const meta = sbUser.user_metadata || {};
  const validRoles: UserRole[] = ['seller', 'buyer', 'both', 'admin'];
  const rawRole = meta.user_type as UserRole | undefined;
  const userType: UserRole =
    rawRole && validRoles.includes(rawRole)
      ? rawRole
      : existing?.user_type || 'both';

  return {
    id: sbUser.id,
    email: sbUser.email || existing?.email || '',
    full_name:
      meta.full_name ||
      existing?.full_name ||
      (sbUser.email ? sbUser.email.split('@')[0] : 'MatLink User'),
    phone_number: meta.phone_number || existing?.phone_number,
    user_type: userType,
    company_name: meta.company_name || existing?.company_name,
    avatar_url: meta.avatar_url || existing?.avatar_url,
    is_verified: true,
    created_at: sbUser.created_at || existing?.created_at || new Date().toISOString(),
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [availableProfiles, setAvailableProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Load Supabase session or fallback demo profile
  useEffect(() => {
    let mounted = true;

    async function loadAuth() {
      const profiles = await db.getProfiles();
      if (!mounted) return;
      setAvailableProfiles(profiles);

      // 1. Check active Supabase Auth session first
      if (supabase) {
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          const sbUser = sessionData.session?.user;
          if (sbUser) {
            const dbProfile = await db.getProfileById(sbUser.id);
            const resolved = buildProfileFromSupabaseUser(sbUser, dbProfile);
            if (!mounted) return;
            setUser(resolved);
            localStorage.setItem(CURRENT_USER_KEY, resolved.id);
            localStorage.removeItem(LOGGED_OUT_KEY);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn('Failed to restore Supabase auth session:', err);
        }
      }

      // 2. If user explicitly logged out, stay signed out
      if (localStorage.getItem(LOGGED_OUT_KEY) === 'true') {
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      // 3. Fallback to stored evaluation persona if present
      const storedId = localStorage.getItem(CURRENT_USER_KEY);
      if (storedId) {
        const found = profiles.find((p) => p.id === storedId);
        if (found) {
          setUser(found);
          setLoading(false);
          return;
        }
      }

      if (profiles.length > 0) {
        const fallbackUser = profiles[1] || profiles[0];
        setUser(fallbackUser);
        localStorage.setItem(CURRENT_USER_KEY, fallbackUser.id);
      }

      setLoading(false);
    }

    loadAuth();

    // Listen to Supabase auth state changes (email link callback, token refresh, sign out)
    let unsubscribe: (() => void) | undefined;
    if (supabase) {
      const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return;
        if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem(CURRENT_USER_KEY);
          return;
        }
        if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
          const dbProfile = await db.getProfileById(session.user.id);
          const resolved = buildProfileFromSupabaseUser(session.user, dbProfile);
          if (!mounted) return;
          setUser(resolved);
          localStorage.setItem(CURRENT_USER_KEY, resolved.id);
          localStorage.removeItem(LOGGED_OUT_KEY);
          if (event === 'SIGNED_IN') {
            await db.syncSupabaseUserRecord(resolved, 'signin');
            setAvailableProfiles(await db.getProfiles());
          }
        }
      });
      unsubscribe = () => listener.subscription.unsubscribe();
    }

    return () => {
      mounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const login = async (email: string, password?: string): Promise<AuthActionResult> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      return { ok: false, error: 'Please enter a valid email address.' };
    }

    if (supabase) {
      if (!password) {
        return { ok: false, error: 'Please enter your password to sign in.' };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        const lowerMsg = error.message.toLowerCase();
        if (lowerMsg.includes('email not confirmed')) {
          return {
            ok: false,
            needsEmailConfirmation: true,
            error:
              'Your email address is not confirmed yet. Please check your inbox for the verification link or click resend below.',
          };
        }
        if (lowerMsg.includes('invalid login credentials')) {
          return {
            ok: false,
            error:
              'Invalid email or password. If you are new to MatLink, please switch to Sign Up to create an account.',
          };
        }
        return { ok: false, error: error.message };
      }

      if (data.user) {
        const existingProfile = await db.getProfileById(data.user.id);
        const resolved = buildProfileFromSupabaseUser(data.user, existingProfile);
        const syncRes = await db.syncSupabaseUserRecord(resolved, 'signin');

        setUser(resolved);
        localStorage.setItem(CURRENT_USER_KEY, resolved.id);
        localStorage.removeItem(LOGGED_OUT_KEY);
        setAvailableProfiles(await db.getProfiles());

        if (syncRes.schemaMissing) {
          return {
            ok: true,
            schemaMissing: true,
            message:
              'Signed in with Supabase Auth, but your Supabase database tables (profiles / sign_in_logs) have not been created yet.',
          };
        }

        return { ok: true };
      }
    }

    // Local fallback when Supabase is not configured
    const profiles = await db.getProfiles();
    const found = profiles.find((p) => p.email.toLowerCase() === cleanEmail);
    if (found) {
      setUser(found);
      localStorage.setItem(CURRENT_USER_KEY, found.id);
      localStorage.removeItem(LOGGED_OUT_KEY);
      return { ok: true };
    }

    const newProfile = await db.updateProfile(`usr_${Date.now()}`, {
      email: cleanEmail,
      full_name: cleanEmail.split('@')[0],
      user_type: 'both',
    });
    setUser(newProfile);
    localStorage.setItem(CURRENT_USER_KEY, newProfile.id);
    localStorage.removeItem(LOGGED_OUT_KEY);
    setAvailableProfiles(await db.getProfiles());
    return { ok: true };
  };

  const signup = async (data: {
    email: string;
    full_name: string;
    phone_number?: string;
    user_type: UserRole;
    company_name?: string;
    password?: string;
  }): Promise<AuthActionResult> => {
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanName = data.full_name.trim();
    const cleanPhone = data.phone_number?.trim() || undefined;
    const cleanCompany = data.company_name?.trim() || undefined;

    if (!cleanEmail || !cleanName) {
      return { ok: false, error: 'Full name and email address are required.' };
    }

    if (supabase) {
      if (!data.password || data.password.length < 6) {
        return { ok: false, error: 'Password must be at least 6 characters long.' };
      }

      const { data: authData, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: data.password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            full_name: cleanName,
            phone_number: cleanPhone || null,
            user_type: data.user_type || 'both',
            company_name: cleanCompany || null,
          },
        },
      });

      if (error) {
        return { ok: false, error: error.message };
      }

      const tableStatus = await db.checkSupabaseTablesReady();
      const schemaMissing = !tableStatus.ready;

      if (authData.user && authData.session) {
        const resolved = buildProfileFromSupabaseUser(authData.user, {
          id: authData.user.id,
          email: cleanEmail,
          full_name: cleanName,
          phone_number: cleanPhone,
          user_type: data.user_type,
          company_name: cleanCompany,
          is_verified: true,
        });

        await db.syncSupabaseUserRecord(resolved, 'signup');
        setUser(resolved);
        localStorage.setItem(CURRENT_USER_KEY, resolved.id);
        localStorage.removeItem(LOGGED_OUT_KEY);
        setAvailableProfiles(await db.getProfiles());

        return {
          ok: true,
          schemaMissing,
        };
      }

      // When Supabase has email confirmation enabled, session is null until verified.
      // Note: DB trigger `on_auth_user_created` stores the user in `public.profiles` & `public.sign_in_logs` immediately.
      if (authData.user && !authData.session) {
        return {
          ok: true,
          needsEmailConfirmation: true,
          schemaMissing,
          message:
            'Your account has been created in Supabase! Please check your email inbox and click the confirmation link to sign in.',
        };
      }

      return { ok: false, error: 'Could not complete registration. Please try again.' };
    }

    // Local fallback when Supabase is not configured
    const newProfile = await db.updateProfile(`usr_${Date.now()}`, {
      email: cleanEmail,
      full_name: cleanName,
      phone_number: cleanPhone,
      user_type: data.user_type,
      company_name: cleanCompany,
      is_verified: true,
      created_at: new Date().toISOString(),
    });
    setUser(newProfile);
    localStorage.setItem(CURRENT_USER_KEY, newProfile.id);
    localStorage.removeItem(LOGGED_OUT_KEY);
    setAvailableProfiles(await db.getProfiles());
    return { ok: true };
  };

  const resetPassword = async (email: string): Promise<AuthActionResult> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      return { ok: false, error: 'Please enter your email address.' };
    }
    if (supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: window.location.origin,
      });
      if (error) {
        return { ok: false, error: error.message };
      }
    }
    return { ok: true };
  };

  const resendConfirmation = async (email: string): Promise<AuthActionResult> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !supabase) {
      return { ok: false, error: 'Unable to resend confirmation email.' };
    }
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: cleanEmail,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) {
      return { ok: false, error: error.message };
    }
    return { ok: true, message: 'Verification email resent! Please check your inbox.' };
  };

  const logout = async () => {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase signOut error:', err);
      }
    }
    setUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.setItem(LOGGED_OUT_KEY, 'true');
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = await db.updateProfile(user.id, updates);
    setUser(updated);
    setAvailableProfiles(await db.getProfiles());
  };

  const switchPersona = async (userId: string) => {
    const found = availableProfiles.find((p) => p.id === userId);
    if (found) {
      setUser(found);
      localStorage.setItem(CURRENT_USER_KEY, found.id);
      localStorage.removeItem(LOGGED_OUT_KEY);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F1F2F5]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#7561A8] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-[#51416F]">Loading MatLink Platform...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        signup,
        resetPassword,
        resendConfirmation,
        logout,
        updateProfile,
        switchPersona,
        availableProfiles,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
