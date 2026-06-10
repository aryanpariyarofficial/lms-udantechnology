import "server-only"

import { redirect } from "next/navigation"
import { cache } from "react"

import { createClient } from "@/lib/supabase/server"
import type { Profile } from "@/lib/supabase/types"

/**
 * The authenticated user + their profile, or null. Cached per request so
 * multiple Server Components can call it without extra round-trips.
 */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  return { user, profile: profile as Profile | null }
})

/** Redirect to /login unless authenticated. Returns the user + profile. */
export async function requireUser(nextPath?: string) {
  const current = await getCurrentUser()
  if (!current) {
    const params = nextPath ? `?next=${encodeURIComponent(nextPath)}` : ""
    redirect(`/login${params}`)
  }
  if (current.profile?.is_suspended) {
    redirect("/suspended")
  }
  return current
}

/** Require an admin (super_admin OR admin). Redirects others away. */
export async function requireAdmin() {
  const current = await requireUser("/admin")
  const role = current.profile?.role
  if (role !== "super_admin" && role !== "admin") {
    redirect("/dashboard")
  }
  return current
}

/** Require the super admin — for user role assignment / deletion only. */
export async function requireSuperAdmin() {
  const current = await requireUser("/admin")
  if (current.profile?.role !== "super_admin") {
    redirect("/admin")
  }
  return current
}

/** Require staff (super_admin, admin, or instructor). */
export async function requireStaff() {
  const current = await requireUser("/admin")
  const role = current.profile?.role
  if (role !== "super_admin" && role !== "admin" && role !== "instructor") {
    redirect("/dashboard")
  }
  return current
}

export function isAdmin(profile: Profile | null): boolean {
  return profile?.role === "super_admin" || profile?.role === "admin"
}

export function isStaff(profile: Profile | null): boolean {
  return (
    profile?.role === "super_admin" ||
    profile?.role === "admin" ||
    profile?.role === "instructor"
  )
}
