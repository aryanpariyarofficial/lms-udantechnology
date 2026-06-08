import "server-only"

import { createClient } from "@/lib/supabase/server"
import type {
  Course,
  CourseCategory,
  CourseOutlineRow,
  MembershipPlan,
} from "@/lib/supabase/types"

export type CourseCard = Course & {
  category: { name: string; slug: string } | null
  instructor: { full_name: string | null } | null
  avg_rating: number
  review_count: number
  student_count: number
}

const CARD_SELECT = `
  *,
  category:course_categories(name, slug),
  instructor:profiles!courses_instructor_id_fkey(full_name)
`

/** Attach lightweight rating/student aggregates (best-effort). */
async function decorate(courses: Course[]): Promise<CourseCard[]> {
  return courses.map((c) => ({
    ...(c as Course),
    category: (c as unknown as { category: CourseCard["category"] }).category ?? null,
    instructor:
      (c as unknown as { instructor: CourseCard["instructor"] }).instructor ?? null,
    avg_rating: 0,
    review_count: 0,
    student_count: 0,
  }))
}

export async function getFeaturedCourses(limit = 6): Promise<CourseCard[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("courses")
      .select(CARD_SELECT)
      .eq("status", "published")
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(limit)
    if (error || !data) return []
    return decorate(data as unknown as Course[])
  } catch {
    return []
  }
}

export type CourseFilters = {
  category?: string
  level?: string
  search?: string
  sort?: "newest" | "price_asc" | "price_desc"
}

export async function listCourses(
  filters: CourseFilters = {}
): Promise<CourseCard[]> {
  try {
    const supabase = await createClient()
    let query = supabase
      .from("courses")
      .select(CARD_SELECT)
      .eq("status", "published")

    if (filters.search) {
      query = query.ilike("title", `%${filters.search}%`)
    }
    if (filters.level) {
      query = query.eq("level", filters.level as Course["level"])
    }

    switch (filters.sort) {
      case "price_asc":
        query = query.order("price", { ascending: true })
        break
      case "price_desc":
        query = query.order("price", { ascending: false })
        break
      default:
        query = query.order("created_at", { ascending: false })
    }

    const { data, error } = await query
    if (error || !data) return []

    let cards = await decorate(data as unknown as Course[])
    if (filters.category) {
      cards = cards.filter((c) => c.category?.slug === filters.category)
    }
    return cards
  } catch {
    return []
  }
}

export type CourseDetail = Course & {
  category: { name: string; slug: string } | null
  instructor: { full_name: string | null; headline: string | null; avatar_url: string | null } | null
}

export async function getCourseBySlug(slug: string): Promise<CourseDetail | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("courses")
      .select(
        `*,
         category:course_categories(name, slug),
         instructor:profiles!courses_instructor_id_fkey(full_name, headline, avatar_url)`
      )
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle()
    if (error || !data) return null
    return data as unknown as CourseDetail
  } catch {
    return null
  }
}

export type OutlineModule = {
  module_id: string
  module_title: string
  lessons: {
    id: string
    title: string
    type: string
    duration_seconds: number
    is_preview: boolean
  }[]
}

export async function getCourseOutline(courseId: string): Promise<OutlineModule[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("course_outline")
      .select("*")
      .eq("course_id", courseId)
      .order("module_order")
      .order("sort_order")
    if (error || !data) return []

    const rows = data as unknown as CourseOutlineRow[]
    const map = new Map<string, OutlineModule>()
    for (const row of rows) {
      if (!map.has(row.module_id)) {
        map.set(row.module_id, {
          module_id: row.module_id,
          module_title: row.module_title,
          lessons: [],
        })
      }
      map.get(row.module_id)!.lessons.push({
        id: row.id,
        title: row.title,
        type: row.type,
        duration_seconds: row.duration_seconds,
        is_preview: row.is_preview,
      })
    }
    return [...map.values()]
  } catch {
    return []
  }
}

export async function getCourseFaqs(courseId: string) {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("course_faqs")
      .select("*")
      .eq("course_id", courseId)
      .order("sort_order")
    return data ?? []
  } catch {
    return []
  }
}

export async function getCourseReviews(courseId: string) {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("reviews")
      .select("*, user:profiles(full_name, avatar_url)")
      .eq("course_id", courseId)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(12)
    return data ?? []
  } catch {
    return []
  }
}

export async function getCategories(): Promise<CourseCategory[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("course_categories")
      .select("*")
      .order("sort_order")
    if (error || !data) return []
    return data
  } catch {
    return []
  }
}

/** Whether the signed-in user can access a course's content. */
export async function checkCourseAccess(courseId: string): Promise<boolean> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return false

    // Admins & instructors can access every course — no enrollment needed.
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()
    if (profile?.role === "super_admin" || profile?.role === "instructor") {
      return true
    }

    const rpc = supabase.rpc as unknown as (
      fn: "has_course_access",
      args: { uid: string; cid: string }
    ) => Promise<{ data: boolean | null; error: unknown }>
    const { data, error } = await rpc("has_course_access", {
      uid: user.id,
      cid: courseId,
    })
    if (error) return false
    return Boolean(data)
  } catch {
    return false
  }
}

export async function getActivePlans(): Promise<MembershipPlan[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("membership_plans")
      .select("*")
      .eq("is_active", true)
      .order("sort_order")
    if (error || !data) return []
    return data
  } catch {
    return []
  }
}
