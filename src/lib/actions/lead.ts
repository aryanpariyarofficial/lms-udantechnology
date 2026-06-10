"use server"

import { createClient } from "@/lib/supabase/server"

export type LeadState = { ok: boolean; error?: string }

export async function submitLead(formData: FormData): Promise<LeadState> {
  const full_name = String(formData.get("full_name") ?? "").trim()
  const email = String(formData.get("email") ?? "").trim()
  const phone = String(formData.get("phone") ?? "").trim()
  const city = String(formData.get("city") ?? "").trim()
  const courseId = String(formData.get("course_id") ?? "").trim()
  const interested = String(formData.get("interested_course") ?? "").trim()

  if (!full_name) return { ok: false, error: "Please enter your name." }
  if (!/^\S+@\S+\.\S+$/.test(email)) return { ok: false, error: "Enter a valid email." }

  try {
    const supabase = await createClient()
    const { error } = await supabase.from("leads").insert({
      full_name,
      email,
      phone: phone || null,
      city: city || null,
      course_id: courseId || null,
      interested_course: interested || null,
    })
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  } catch {
    return { ok: false, error: "Something went wrong. Please try again." }
  }
}
