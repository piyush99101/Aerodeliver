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
    const pendingRole = localStorage.getItem('oauth_role') as 'customer' | 'owner';
    const metadataRole = authUser.user_metadata?.role;

    // Prioritize metadata, but fallback to pending if metadata is missing (first signup)
    const activeRole = metadataRole || pendingRole || 'customer';

    console.log('AuthContext: Mapping user:', { id: authUser.id, role: activeRole });

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
    console.log('AuthContext: Current URL:', window.location.href);

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('AuthContext: Initial session check:', session ? 'User logged in' : 'No session');
      if (session?.user) {
        mapSessionUserToAppUser(session.user);
      } else {
        // If we see a hash but no session yet, don't set loading=false immediately
        if (window.location.hash.includes('access_token')) {
          console.log('AuthContext: Access token detected in hash, waiting for onAuthStateChange...');
        } else {
          setLoading(false);
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthContext: Auth state changed:', event, session?.user?.email);
      if (session?.user) {
        // Handle pending OAuth role if it's a new user
        const pendingRole = localStorage.getItem('oauth_role');
        if (event === 'SIGNED_IN' && pendingRole) {
          if (!session.user.user_metadata?.role) {
            console.log('AuthContext: Applying pending role to user metadata:', pendingRole);
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
      options: {
        data: {
          name: newUser.name,
          role: newUser.role,
        }
      }
    });

    if (error) {
      console.error('Registration error:', error.message);
      setLoading(false);
      return { success: false, message: error.message };
    }

    if (data.user) {
      if (!data.session) {
        setLoading(false);
        return { success: true, message: 'Registration successful! Please check your email to confirm your account.' };
      }
      mapSessionUserToAppUser(data.user);
      return { success: true };
    }

    setLoading(false);
    return { success: true };
  };

  const login = async (email: string, password: string, role: 'customer' | 'owner'): Promise<{ success: boolean; message?: string }> => {
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error.message);
      setLoading(false);
      return { success: false, message: error.message };
    }

    if (data.user) {
      const storedRole = data.user.user_metadata?.role;
      if (storedRole && storedRole !== role) {
        console.warn(`Role mismatch: Expected ${role}, got ${storedRole}`);
        await supabase.auth.signOut();
        setLoading(false);
        return { success: false, message: `Account exists but is registered as a ${storedRole}. Please switch tabs to login.` };
      }

      mapSessionUserToAppUser(data.user);
      return { success: true };
    }

    setLoading(false);
    return { success: false, message: 'Unknown login error' };
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

    if (error) {
      console.error('Error updating profile:', error);
      setLoading(false);
      return false;
    }

    if (data.user) {
      mapSessionUserToAppUser(data.user);
      return true;
    }

    setLoading(false);
    return false;
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const resetPromise = supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/#/reset-password`
      });

      const { error } = await resetPromise;

      if (error) {
        console.error('Supabase reset password error:', error);
        return { success: false, message: error.message };
      }

      return { success: true, message: 'Password reset link sent to your email. Check your inbox.' };
    } catch (err: any) {
      console.error('Unexpected error in resetPassword:', err);
      return { success: false, message: 'An unexpected error occurred. Please try again.' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const signInWithGoogle = async (role: 'customer' | 'owner') => {
    setLoading(true);
    localStorage.setItem('oauth_role', role);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });

    if (error) {
      console.error('Google Login Error:', error.message);
      setLoading(false);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, updateProfile, logout, resetPassword, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
