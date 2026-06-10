"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth"
import type { Json } from "@/lib/supabase/types"

export type Result = { ok: boolean; error?: string }

export async function updateSettings(formData: FormData): Promise<Result> {
  await requireAdmin()
  const supabase = await createClient()
  const get = (k: string) => String(formData.get(k) ?? "").trim()

  const rows = [
    { key: "site", value: { tagline: get("tagline"), support_email: get("support_email") } },
    {
      key: "socials",
      value: { facebook: get("facebook"), instagram: get("instagram"), youtube: get("youtube") },
    },
    { key: "payment", value: { instructions: get("payment_instructions") } },
    { key: "theme", value: { primary: get("primary_color") } },
  ]

  const { error } = await supabase
    .from("settings")
    .upsert(
      rows.map((r) => ({ key: r.key, value: r.value as unknown as Json })),
      { onConflict: "key" }
    )

  if (error) return { ok: false, error: error.message }
  revalidatePath("/", "layout")
  revalidatePath("/admin/settings")
  return { ok: true }
}
