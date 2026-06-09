import "server-only"

import { createClient } from "@/lib/supabase/server"

export type EnrolledCourse = {
  course_id: string
  title: string
  slug: string
  thumbnail_url: string | null
  source: string
  expires_at: string | null
  progress: number
}

export async function getMyEnrollments(userId: string): Promise<EnrolledCourse[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("enrollments")
      .select("course_id, source, expires_at, course:courses(title, slug, thumbnail_url)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
    if (error || !data) return []

    const results: EnrolledCourse[] = []
    for (const row of data as unknown as {
      course_id: string
      source: string
      expires_at: string | null
      course: { title: string; slug: string; thumbnail_url: string | null } | null
    }[]) {
      if (!row.course) continue
      const { data: prog } = await supabase.rpc("course_progress", {
        uid: userId,
        cid: row.course_id,
      } as never)
      results.push({
        course_id: row.course_id,
        title: row.course.title,
        slug: row.course.slug,
        thumbnail_url: row.course.thumbnail_url,
        source: row.source,
        expires_at: row.expires_at,
        progress: Number(prog ?? 0),
      })
    }
    return results
  } catch {
    return []
  }
}

export async function getMyPayments(userId: string) {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("payments")
      .select(
        "*, course:courses(title, slug), plan:membership_plans(name)"
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
    return data ?? []
  } catch {
    return []
  }
}

export async function getMyMembership(userId: string) {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("memberships")
      .select("*, plan:membership_plans(name, slug)")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("expires_at", { ascending: false })
      .maybeSingle()
    return data ?? null
  } catch {
    return null
  }
}

export async function getMyCertificates(userId: string) {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("certificates")
      .select("*, course:courses(title, slug)")
      .eq("user_id", userId)
      .order("issued_at", { ascending: false })
    return data ?? []
  } catch {
    return []
  }
}

export async function getLearningStats(
  userId: string
): Promise<{ completedLessons: number }> {
  try {
    const supabase = await createClient()
    const { count } = await supabase
      .from("lesson_progress")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("completed", true)
    return { completedLessons: count ?? 0 }
  } catch {
    return { completedLessons: 0 }
  }
}

export async function getMyNotifications(userId: string) {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50)
    return data ?? []
  } catch {
    return []
  }
}

export async function getMyWishlist(userId: string) {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("wishlists")
      .select("course:courses(id, title, slug, thumbnail_url, price, discount_price)")
      .eq("user_id", userId)
    return data ?? []
  } catch {
    return []
  }
}
