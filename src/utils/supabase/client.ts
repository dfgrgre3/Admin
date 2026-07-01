import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/**
 * Pure DB client — NO Auth session management.
 *
 * This client authenticates to Supabase via the anon key for Row-Level
 * Security (RLS) only, and does NOT manage Auth sessions/cookies.
 * If your tables rely on `auth.uid()` you must pass the user's JWT
 * as the `Authorization` header instead.
 */
export const createClient = () =>
  createSupabaseClient(
    supabaseUrl!,
    supabaseKey!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    },
  );
