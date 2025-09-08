import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

// Define types for our Supabase client
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

// Create a function to initialize the Supabase client
export const createSupabaseClient = () => {
  // Get environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  // Validate environment variables
  if (!supabaseUrl || supabaseUrl === "https://your-project.supabase.co") {
    console.error('Missing or invalid NEXT_PUBLIC_SUPABASE_URL environment variable');
    throw new Error('Please update NEXT_PUBLIC_SUPABASE_URL in your .env file with your actual Supabase project URL');
  }

  if (!supabaseAnonKey || supabaseAnonKey === "your-anon-key-here") {
    console.error('Missing or invalid NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
    throw new Error('Please update NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env file with your actual Supabase anon key');
  }

  // Validate that the URL looks like a real Supabase URL
  if (!supabaseUrl.match(/^https:\/\/[a-z0-9-]+\.supabase\.co$/)) {
    console.error('Invalid Supabase URL format');
    throw new Error('NEXT_PUBLIC_SUPABASE_URL must be a valid Supabase project URL (e.g., https://your-project-id.supabase.co)');
  }

  // Create a single supabase client for client-side operations
  return createClient<Database>(supabaseUrl, supabaseAnonKey);
};

// Export a singleton instance that will be created lazily
let supabaseClient: ReturnType<typeof createSupabaseClient> | null = null;

export const getSupabaseClient = () => {
  if (!supabaseClient) {
    supabaseClient = createSupabaseClient();
  }
  return supabaseClient;
};