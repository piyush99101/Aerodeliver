import { createClient } from '@supabase/supabase-js';

/**
 * Robust environment variable fetcher
 * Works in Next.js (Node), Vite, and Browser environments.
 */
const getEnv = (key: string): string => {
  // Check process.env (Next.js / Node)
  if (typeof process !== 'undefined' && process.env[key]) {
    return process.env[key] as string;
  }
  // Check import.meta.env (Vite)
  try {
    // @ts-ignore
    if (import.meta.env && import.meta.env[key]) {
      // @ts-ignore
      return import.meta.env[key];
    }
  } catch (e) {
    // Silent catch for environments where import.meta is not defined
  }
  return "";
};

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL') || getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY') || getEnv('VITE_SUPABASE_ANON_KEY');

// Use placeholders to prevent build-time crashes. 
// Render will provide the real values to the running container.
export const supabase = createClient(
  supabaseUrl || "https://placeholder-url.supabase.co", 
  supabaseAnonKey || "placeholder-key"
);

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials not found. Check Render Environment variables.');
}
