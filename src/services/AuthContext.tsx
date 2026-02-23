import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { supabase } from './supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, role: 'customer' | 'owner') => Promise<{ success: boolean; message?: string }>;
  register: (user: User, password: string) => Promise<{ success: boolean; message?: string }>;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  logout: () => void;
  resetPassword: (email: string) => Promise<{ success: boolean; message?: string }>;
  signInWithGoogle: (role: 'customer' | 'owner') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const mapSessionUserToAppUser = (authUser: any) => {
    // Only access localStorage in the browser
    const pendingRole = typeof window !== 'undefined' ? localStorage.getItem('oauth_role') as 'customer' | 'owner' : null;
    const metadataRole = authUser.user_metadata?.role;
    const activeRole = metadataRole || pendingRole || 'customer';

    const appUser: User = {
      id: authUser.id,
      email: authUser.email || '',
      name: authUser.user_metadata?.name || 'User',
      role: activeRole,
      avatar: authUser.user_metadata?.avatar
    };
    setUser(appUser);
    setLoading(false);
  };

  useEffect(() => {
    // Prevent execution during Next.js build step
    if (typeof window === 'undefined') return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        mapSessionUserToAppUser(session.user);
      } else {
        if (window.location.hash.includes('access_token')) {
          // Stay in loading state for OAuth redirect
        } else {
          setLoading(false);
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const pendingRole = localStorage.getItem('oauth_role');
        if (event === 'SIGNED_IN' && pendingRole) {
          if (!session.user.user_metadata?.role) {
            await supabase.auth.updateUser({ data: { role: pendingRole } });
          }
          localStorage.removeItem('oauth_role');
        }
        mapSessionUserToAppUser(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const register = async (newUser: User, password: string): Promise<{ success: boolean; message?: string }> => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: newUser.email,
      password: password,
      options: { data: { name: newUser.name, role: newUser.role } }
    });

    if (error) {
      setLoading(false);
      return { success: false, message: error.message };
    }

    if (data.user) {
      if (!data.session) {
        setLoading(false);
        return { success: true, message: 'Check your email to confirm your account.' };
      }
      mapSessionUserToAppUser(data.user);
      return { success: true };
    }
    setLoading(false);
    return { success: true };
  };

  const login = async (email: string, password: string, role: 'customer' | 'owner'): Promise<{ success: boolean; message?: string }> => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setLoading(false);
      return { success: false, message: error.message };
    }

    if (data.user) {
      const storedRole = data.user.user_metadata?.role;
      if (storedRole && storedRole !== role) {
        await supabase.auth.signOut();
        setLoading(false);
        return { success: false, message: `Account is registered as ${storedRole}.` };
      }
      mapSessionUserToAppUser(data.user);
      return { success: true };
    }
    setLoading(false);
    return { success: false, message: 'Unknown error' };
  };

  const updateProfile = async (updates: Partial<User>): Promise<boolean> => {
    setLoading(true);
    const { data, error } = await supabase.auth.updateUser({
      data: {
        name: updates.name,
        ...(updates.role && { role: updates.role }),
        ...(updates.avatar && { avatar: updates.avatar })
      }
    });
    if (data.user) mapSessionUserToAppUser(data.user);
    return !error;
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; message?: string }> => {
    if (typeof window === 'undefined') return { success: false };
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/#/reset-password`
    });
    return error ? { success: false, message: error.message } : { success: true, message: 'Reset link sent.' };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const signInWithGoogle = async (role: 'customer' | 'owner') => {
    if (typeof window === 'undefined') return;
    setLoading(true);
    localStorage.setItem('oauth_role', role);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    if (error) { setLoading(false); throw error; }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, updateProfile, logout, resetPassword, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  // CRITICAL FIX: Return a dummy object if context is missing during build
  if (context === undefined) {
    return {
      user: null,
      loading: true,
      login: async () => ({ success: false }),
      register: async () => ({ success: false }),
      updateProfile: async () => false,
      logout: () => {},
      resetPassword: async () => ({ success: false }),
      signInWithGoogle: async () => {},
    } as any;
  }
  return context;
};
