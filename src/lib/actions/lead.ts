"use server"

import { createClient } from "@/lib/supabase/server"
import { rateLimit } from "@/lib/rate-limit"
import { phoneProblem, nameProblem } from "@/lib/validation/email"
import { validateEmail } from "@/lib/validation/email-server"

export type LeadField = "full_name" | "email" | "phone"
export type LeadState = { ok: boolean; error?: string; field?: LeadField }

export async function submitLead(formData: FormData): Promise<LeadState> {
  const limited = await rateLimit("lead", 5, 10 * 60_000)
  if (limited) return { ok: false, error: limited }

  const full_name = String(formData.get("full_name") ?? "").trim().slice(0, 100)
  const email = String(formData.get("email") ?? "").trim().slice(0, 200)
  const phone = String(formData.get("phone") ?? "").trim().slice(0, 30)
  const city = String(formData.get("city") ?? "").trim().slice(0, 100)
  const courseId = String(formData.get("course_id") ?? "").trim().slice(0, 60)
  const interested = String(formData.get("interested_course") ?? "").trim().slice(0, 200)

  const nErr = nameProblem(full_name)
  if (nErr) return { ok: false, error: nErr, field: "full_name" }
  const eErr = await validateEmail(email)
  if (eErr) return { ok: false, error: eErr, field: "email" }
  const pErr = phoneProblem(phone)
  if (pErr) return { ok: false, error: pErr, field: "phone" }

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
