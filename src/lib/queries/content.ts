import "server-only"

import { createClient } from "@/lib/supabase/server"
import { pageDefaults, type PageContent } from "@/lib/content-schema"

/** Editable content for a page, merged with defaults. */
export async function getPageContent(pageKey: string): Promise<PageContent> {
  const defaults = pageDefaults(pageKey)
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("settings")
      .select("value")
      .eq("key", `content_${pageKey}`)
      .maybeSingle()
    const stored = (data?.value as Record<string, string> | undefined) ?? {}
    return { ...defaults, ...stored }
  } catch {
    return defaults
  }
}
