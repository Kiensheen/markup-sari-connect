import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xjwqtqticgygibaetela.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhqd3F0cXRpY2d5Z2liYWV0ZWxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyMzc3MjUsImV4cCI6MjA5NzgxMzcyNX0.0fwuS-tBilwDX9m3Q0-ENDLBG5mNs94bqh9nPETn-70'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      apikey: supabaseAnonKey,
    },
  },
})

