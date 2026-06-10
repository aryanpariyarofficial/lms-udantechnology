"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { headers } from "next/headers"

import { createClient } from "@/lib/supabase/server"
import { SITE } from "@/lib/constants"
import { nameProblem } from "@/lib/validation/email"
import { validateEmail } from "@/lib/validation/email-server"

export type AuthState = { error?: string; message?: string }

async function siteOrigin() {
  // Prefer the real request origin (works behind custom domains / previews),
  // fall back to the configured site URL.
  const h = await headers()
  return h.get("origin") ?? SITE.url
}

export async function signInAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "")
  const password = String(formData.get("password") ?? "")
  const next = String(formData.get("next") ?? "/dashboard")

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/", "layout")
  redirect(next || "/dashboard")
}

export async function signUpAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const fullName = String(formData.get("fullName") ?? "")
  const email = String(formData.get("email") ?? "")
  const password = String(formData.get("password") ?? "")

  const nErr = nameProblem(fullName)
  if (nErr) return { error: nErr }
  const eErr = await validateEmail(email)
  if (eErr) return { error: eErr }

  const supabase = await createClient()
  const origin = await siteOrigin()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${origin}/auth/confirm`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return {
    message:
      "Check your inbox — we sent a verification link to confirm your email.",
  }
}

export async function signInWithGoogleAction(formData: FormData) {
  const next = String(formData.get("next") ?? "/dashboard")
  const supabase = await createClient()
  const origin = await siteOrigin()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  })

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }
  if (data.url) {
    redirect(data.url)
  }
}

export async function forgotPasswordAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "")

  const eErr = await validateEmail(email, { checkMx: false })
  if (eErr) return { error: eErr }

  const supabase = await createClient()
  const origin = await siteOrigin()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  })

  if (error) {
    return { error: error.message }
  }
  return {
    message: "If an account exists, a password reset link is on its way.",
  }
}

export async function resetPasswordAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const password = String(formData.get("password") ?? "")
  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({ password })
  if (error) {
    return { error: error.message }
  }

  revalidatePath("/", "layout")
  redirect("/dashboard")
}

export async function signOutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/login")
}
