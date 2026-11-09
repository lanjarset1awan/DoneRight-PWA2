// ---------------------------------------------------------------------------
// supabase.js — Direct Supabase BaaS Client for DoneRight PWA 2
// Enables direct serverless connection to Supabase PostgreSQL & Storage.
// ---------------------------------------------------------------------------

import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://mmdrzvvnmoplbdfaiixx.supabase.co";

const supabaseKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tZHJ6dnZubW9wbGJkZmFpaXh4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODQxMzQyMSwiZXhwIjoyMDkzOTg5NDIxfQ.QAWjLM_QnVe-VrSvOUkxesEkGVNOHEj3v_J3Q7T_fyo";

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export default supabase;

