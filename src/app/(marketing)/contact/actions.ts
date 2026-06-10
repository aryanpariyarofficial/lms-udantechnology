"use server"

import { createClient } from "@/lib/supabase/server"
import { validateEmail } from "@/lib/validation/email-server"

export type ContactState = { error?: string; message?: string }

export async function sendContactAction(
  _prev: ContactState,
  formData: FormData
): Promise<ContactState> {
  const name = String(formData.get("name") ?? "").trim()
  const email = String(formData.get("email") ?? "").trim()
  const subject = String(formData.get("subject") ?? "").trim()
  const message = String(formData.get("message") ?? "").trim()

  if (!name || !message) {
    return { error: "Please fill in your name and message." }
  }
  const eErr = await validateEmail(email)
  if (eErr) return { error: eErr }

  try {
    const supabase = await createClient()
    const { error } = await supabase.from("contact_messages").insert({
      name,
      email,
      subject: subject || null,
      message,
    })
    if (error) return { error: error.message }
  } catch {
    return { error: "Something went wrong. Please try again." }
  }

  return { message: "Thanks for reaching out! We'll get back to you soon." }
}
