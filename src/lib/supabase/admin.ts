import "server-only"

import { createClient as createSupabaseClient } from "@supabase/supabase-js"

import type { Database } from "@/lib/supabase/types"

/**
 * Service-role Supabase client — SERVER ONLY.
 *
 * Bypasses Row Level Security. Use ONLY inside trusted server code after you
 * have independently verified the caller is an admin (see `requireAdmin`).
 * Never import this into a Client Component.
 *
 * Used for: approving/rejecting payments, manual enrollment, issuing
 * certificates, and other privileged admin operations.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
