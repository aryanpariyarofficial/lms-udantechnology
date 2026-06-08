"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth"
import { slugify } from "@/lib/format"
import type { CourseStatus, ReviewStatus, UserRole } from "@/lib/supabase/types"

export type Result = { ok: boolean; error?: string }

// NOTE: these use the admin's own server session (not service role) so that
// `is_admin(auth.uid())` is true — required by RLS policies AND by the profile/
// review guard triggers (service role has a null auth.uid()).

// ---------- Categories ----------
export async function createCategory(name: string): Promise<Result> {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase
    .from("course_categories")
    .insert({ name, slug: slugify(name) })
  if (error) return { ok: false, error: error.message }
  revalidatePath("/admin/categories")
  return { ok: true }
}

export async function deleteCategory(id: string): Promise<Result> {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase.from("course_categories").delete().eq("id", id)
  if (error) return { ok: false, error: error.message }
  revalidatePath("/admin/categories")
  return { ok: true }
}

// ---------- Students ----------
export async function toggleSuspend(userId: string, suspend: boolean): Promise<Result> {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase
    .from("profiles")
    .update({ is_suspended: suspend })
    .eq("id", userId)
  if (error) return { ok: false, error: error.message }
  revalidatePath("/admin/students")
  return { ok: true }
}

export async function setRole(userId: string, role: UserRole): Promise<Result> {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId)
  if (error) return { ok: false, error: error.message }
  revalidatePath("/admin/students")
  return { ok: true }
}

export async function manualEnroll(userId: string, courseId: string): Promise<Result> {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase
    .from("enrollments")
    .upsert(
      { user_id: userId, course_id: courseId, source: "manual", expires_at: null },
      { onConflict: "user_id,course_id" }
    )
  if (error) return { ok: false, error: error.message }
  await supabase.from("notifications").insert({
    user_id: userId,
    title: "🎁 You've been enrolled in a course",
    body: "An admin granted you free access to a course. Start learning now!",
    type: "enrollment",
    link: "/dashboard/courses",
  })
  revalidatePath("/admin/students")
  return { ok: true }
}

export async function grantMembership(userId: string, planId: string): Promise<Result> {
  await requireAdmin()
  const supabase = await createClient()
  const { data: plan } = await supabase
    .from("membership_plans")
    .select("duration_days, name")
    .eq("id", planId)
    .maybeSingle()
  const days = plan?.duration_days ?? 30
  const expires = new Date()
  expires.setDate(expires.getDate() + days)

  const { error } = await supabase.from("memberships").insert({
    user_id: userId,
    plan_id: planId,
    status: "active",
    expires_at: expires.toISOString(),
  })
  if (error) return { ok: false, error: error.message }
  await supabase.from("profiles").update({ role: "membership_user" }).eq("id", userId)
  await supabase.from("notifications").insert({
    user_id: userId,
    title: "👑 Membership activated",
    body: `Your ${plan?.name ?? "membership"} is now active. Enjoy all included courses!`,
    type: "membership",
    link: "/dashboard/membership",
  })
  revalidatePath("/admin/students")
  return { ok: true }
}

// ---------- Reviews ----------
export async function setReviewStatus(
  reviewId: string,
  status: ReviewStatus
): Promise<Result> {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase.from("reviews").update({ status }).eq("id", reviewId)
  if (error) return { ok: false, error: error.message }
  revalidatePath("/admin/reviews")
  return { ok: true }
}

export async function deleteReview(reviewId: string): Promise<Result> {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase.from("reviews").delete().eq("id", reviewId)
  if (error) return { ok: false, error: error.message }
  revalidatePath("/admin/reviews")
  return { ok: true }
}

// ---------- Contact messages ----------
export async function markMessageRead(id: string, read: boolean): Promise<Result> {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase
    .from("contact_messages")
    .update({ is_read: read })
    .eq("id", id)
  if (error) return { ok: false, error: error.message }
  revalidatePath("/admin/messages")
  return { ok: true }
}

// ---------- Membership plans ----------
function planFields(formData: FormData) {
  const features = String(formData.get("features") ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
  return {
    name: String(formData.get("name") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || null,
    price: Number(formData.get("price") ?? 0),
    duration_days: Number(formData.get("duration_days") ?? 30),
    features,
    is_active: formData.get("is_active") === "on",
  }
}

export async function createPlan(formData: FormData): Promise<Result> {
  await requireAdmin()
  const supabase = await createClient()
  const f = planFields(formData)
  if (!f.name) return { ok: false, error: "Name required" }
  const { error } = await supabase
    .from("membership_plans")
    .insert({ ...f, slug: `${slugify(f.name)}-${Math.random().toString(36).slice(2, 5)}` })
  if (error) return { ok: false, error: error.message }
  revalidatePath("/admin/memberships")
  return { ok: true }
}

export async function updatePlan(id: string, formData: FormData): Promise<Result> {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase
    .from("membership_plans")
    .update(planFields(formData))
    .eq("id", id)
  if (error) return { ok: false, error: error.message }
  revalidatePath("/admin/memberships")
  return { ok: true }
}

export async function deletePlan(id: string): Promise<Result> {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase.from("membership_plans").delete().eq("id", id)
  if (error) return { ok: false, error: error.message }
  revalidatePath("/admin/memberships")
  return { ok: true }
}

/** Replace the set of courses included in a plan. */
export async function setPlanCourses(
  planId: string,
  courseIds: string[]
): Promise<Result> {
  await requireAdmin()
  const supabase = await createClient()
  await supabase.from("membership_plan_courses").delete().eq("plan_id", planId)
  if (courseIds.length > 0) {
    const { error } = await supabase
      .from("membership_plan_courses")
      .insert(courseIds.map((course_id) => ({ plan_id: planId, course_id })))
    if (error) return { ok: false, error: error.message }
  }
  revalidatePath("/admin/memberships")
  return { ok: true }
}

// ---------- Status setters for course list quick actions (reused) ----------
export async function quickSetCourseStatus(
  courseId: string,
  status: CourseStatus
): Promise<Result> {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase.from("courses").update({ status }).eq("id", courseId)
  if (error) return { ok: false, error: error.message }
  revalidatePath("/admin/courses")
  return { ok: true }
}
