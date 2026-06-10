"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { requireSuperAdmin } from "@/lib/auth"
import { CONTENT_PAGES } from "@/lib/content-schema"
import type { Json } from "@/lib/supabase/types"

export type Result = { ok: boolean; error?: string }

export async function saveContent(
  pageKey: string,
  formData: FormData
): Promise<Result> {
  await requireSuperAdmin()
  const page = CONTENT_PAGES.find((p) => p.key === pageKey)
  if (!page) return { ok: false, error: "Unknown page." }

  const value: Record<string, string> = {}
  for (const section of page.sections) {
    for (const field of section.fields) {
      value[field.key] = String(formData.get(field.key) ?? "").trim()
    }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("settings")
    .upsert({ key: `content_${pageKey}`, value: value as unknown as Json }, { onConflict: "key" })

  if (error) return { ok: false, error: error.message }
  revalidatePath("/", "layout")
  revalidatePath(`/admin/content/${pageKey}`)
  return { ok: true }
}
