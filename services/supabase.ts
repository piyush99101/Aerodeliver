import { createClient } from '@supabase/supabase-js';

// Fallback logic to check both Next.js and Vite style variables
const supabaseUrl = 
  process.env.NEXT_PUBLIC_SUPABASE_URL || 
  process.env.VITE_SUPABASE_URL || 
  (typeof window !== 'undefined' ? (window as any)._env_?.VITE_SUPABASE_URL : "");

const supabaseAnonKey = 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  process.env.VITE_SUPABASE_ANON_KEY || 
  (typeof window !== 'undefined' ? (window as any)._env_?.VITE_SUPABASE_ANON_KEY : "");

// Provide a default string to prevent createClient from throwing an error during build
export const supabase = createClient(
  supabaseUrl || "https://placeholder-url.supabase.co", 
  supabaseAnonKey || "placeholder-key"
);

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Ensure Environment Variables are set in Render.');
}
