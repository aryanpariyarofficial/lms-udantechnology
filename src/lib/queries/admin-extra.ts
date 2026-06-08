import "server-only"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { CourseCategory, MembershipPlan } from "@/lib/supabase/types"

// ---------- Categories ----------
export async function getAdminCategories(): Promise<CourseCategory[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("course_categories")
      .select("*")
      .order("sort_order")
    return data ?? []
  } catch {
    return []
  }
}

// ---------- Students ----------
export type AdminStudent = {
  id: string
  full_name: string | null
  role: string
  is_suspended: boolean
  created_at: string
  email: string | null
}

export async function getStudents(): Promise<AdminStudent[]> {
  try {
    const supabase = await createClient()
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, role, is_suspended, created_at")
      .order("created_at", { ascending: false })

    // Map emails via admin auth listing.
    const admin = createAdminClient()
    const emails = new Map<string, string>()
    try {
      const { data: list } = await admin.auth.admin.listUsers({ perPage: 1000 })
      for (const u of list?.users ?? []) emails.set(u.id, u.email ?? "")
    } catch {
      /* ignore */
    }

    return (
      (profiles as unknown as Omit<AdminStudent, "email">[]) ?? []
    ).map((p) => ({ ...p, email: emails.get(p.id) ?? null }))
  } catch {
    return []
  }
}

// ---------- Reviews ----------
export async function getAllReviews() {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("reviews")
      .select("*, course:courses(title), user:profiles(full_name)")
      .order("created_at", { ascending: false })
    return data ?? []
  } catch {
    return []
  }
}

// ---------- Contact messages ----------
export async function getContactMessages() {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false })
    return data ?? []
  } catch {
    return []
  }
}

// ---------- Membership plans + active memberships ----------
export async function getPlansAdmin(): Promise<MembershipPlan[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("membership_plans")
      .select("*")
      .order("sort_order")
    return data ?? []
  } catch {
    return []
  }
}

export async function getActiveMemberships() {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("memberships")
      .select("*, plan:membership_plans(name), user:profiles(full_name)")
      .order("expires_at", { ascending: false })
    return data ?? []
  } catch {
    return []
  }
}

// ---------- Coupons ----------
export async function getCoupons() {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("coupons")
      .select("*, course:courses(title)")
      .order("created_at", { ascending: false })
    return data ?? []
  } catch {
    return []
  }
}

/** Courses included in a given plan (set of course ids). */
export async function getPlanCourseIds(planId: string): Promise<string[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("membership_plan_courses")
      .select("course_id")
      .eq("plan_id", planId)
    return (data ?? []).map((r) => (r as { course_id: string }).course_id)
  } catch {
    return []
  }
}
