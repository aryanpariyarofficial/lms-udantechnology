import "server-only"

import type { SupabaseClient } from "@supabase/supabase-js"

import type { Database } from "@/lib/supabase/types"
import { slugify } from "@/lib/format"

/**
 * Returns a clean, unique slug for a table. Tries the base slug first; only
 * if it's taken does it append -2, -3, … (no random characters).
 */
export async function uniqueSlug(
  supabase: SupabaseClient<Database>,
  table: "blogs" | "courses" | "videos",
  rawBase: string,
  currentId?: string
): Promise<string> {
  const base = slugify(rawBase) || "post"
  let candidate = base
  let n = 1

  // Safety cap to avoid infinite loops.
  for (let i = 0; i < 50; i++) {
    let query = supabase.from(table).select("id").eq("slug", candidate)
    if (currentId) query = query.neq("id", currentId)
    const { data } = await query.maybeSingle()
    if (!data) return candidate
    n += 1
    candidate = `${base}-${n}`
  }
  return `${base}-${Date.now()}`
}
