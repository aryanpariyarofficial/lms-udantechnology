import { createBrowserClient } from "@supabase/ssr"

import type { Database } from "@/lib/supabase/types"

/**
 * Browser-side Supabase client (Client Components).
 * Uses the public anon key — all access is gated by RLS.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
