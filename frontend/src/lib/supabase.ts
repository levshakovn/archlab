import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create client only if env vars are available
// This prevents the app from crashing on import
let supabase: SupabaseClient | null = null

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
} else {
  console.warn(
    '⚠️ Missing Supabase environment variables.\n' +
    'Please check your .env file:\n' +
    'VITE_SUPABASE_URL=https://your-project.supabase.co\n' +
    'VITE_SUPABASE_ANON_KEY=your-anon-key-here'
  )
}

// Export with null check helper
export { supabase }

export function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      'Supabase client not initialized. Please check your .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
    )
  }
  return supabase
}
