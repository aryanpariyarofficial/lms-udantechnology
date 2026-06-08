"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { requireUser } from "@/lib/auth"

export type SettingsState = { error?: string; message?: string }

export async function updateProfileAction(
  _prev: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const { user } = await requireUser()
  const supabase = await createClient()

  const full_name = String(formData.get("full_name") ?? "").trim()
  const phone = String(formData.get("phone") ?? "").trim()
  const bio = String(formData.get("bio") ?? "").trim()

  if (!full_name) return { error: "Name cannot be empty." }

  const { error } = await supabase
    .from("profiles")
    .update({ full_name, phone: phone || null, bio: bio || null })
    .eq("id", user.id)

  if (error) return { error: error.message }

  revalidatePath("/dashboard/settings")
  revalidatePath("/", "layout")
  return { message: "Profile updated." }
}
