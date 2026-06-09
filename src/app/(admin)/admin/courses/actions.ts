"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth"
import { uniqueSlug } from "@/lib/slug"
import type { CourseLevel, CourseStatus, LessonType } from "@/lib/supabase/types"

export type ActionResult = { ok: boolean; error?: string }

async function nextSort(
  table: "modules" | "lessons",
  column: string,
  value: string
): Promise<number> {
  const supabase = await createClient()
  const { data } = await supabase
    .from(table)
    .select("sort_order")
    .eq(column, value)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle()
  return ((data as { sort_order: number } | null)?.sort_order ?? -1) + 1
}

// ---------- Course ----------

export async function createCourse(formData: FormData) {
  await requireAdmin()
  const supabase = await createClient()
  const title = String(formData.get("title") ?? "").trim()
  if (!title) return

  const slug = await uniqueSlug(supabase, "courses", title)
  const { data, error } = await supabase
    .from("courses")
    .insert({ title, slug, status: "draft" })
    .select("id")
    .single()

  if (error || !data) return
  redirect(`/admin/courses/${data.id}`)
}

export async function updateCourse(
  courseId: string,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin()
  const supabase = await createClient()

  const lines = (key: string) =>
    String(formData.get(key) ?? "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)

  const num = (key: string) => {
    const v = Number(formData.get(key))
    return Number.isFinite(v) ? v : 0
  }

  const slugInput = String(formData.get("slug") ?? "").trim()
  const slug = slugInput
    ? await uniqueSlug(supabase, "courses", slugInput, courseId)
    : undefined

  const { error } = await supabase
    .from("courses")
    .update({
      title: String(formData.get("title") ?? "").trim(),
      ...(slug ? { slug } : {}),
      subtitle: String(formData.get("subtitle") ?? "").trim() || null,
      description: String(formData.get("description") ?? "").trim() || null,
      category_id: String(formData.get("category_id") ?? "") || null,
      level: (String(formData.get("level") ?? "all_levels") as CourseLevel),
      language: String(formData.get("language") ?? "Nepali").trim() || "Nepali",
      price: num("price"),
      discount_price: formData.get("discount_price")
        ? num("discount_price")
        : null,
      duration_minutes: num("duration_minutes"),
      thumbnail_url: String(formData.get("thumbnail_url") ?? "") || null,
      trailer_url: String(formData.get("trailer_url") ?? "").trim() || null,
      what_you_learn: lines("what_you_learn"),
      requirements: lines("requirements"),
      is_featured: formData.get("is_featured") === "on",
    })
    .eq("id", courseId)

  if (error) return { ok: false, error: error.message }
  revalidatePath(`/admin/courses/${courseId}`)
  return { ok: true }
}

export async function setCourseStatus(
  courseId: string,
  status: CourseStatus
): Promise<ActionResult> {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase
    .from("courses")
    .update({
      status,
      published_at: status === "published" ? new Date().toISOString() : null,
    })
    .eq("id", courseId)
  if (error) return { ok: false, error: error.message }
  revalidatePath(`/admin/courses/${courseId}`)
  revalidatePath("/admin/courses")
  return { ok: true }
}

export async function deleteCourse(courseId: string) {
  await requireAdmin()
  const supabase = await createClient()
  await supabase.from("courses").delete().eq("id", courseId)
  redirect("/admin/courses")
}

// ---------- Modules ----------

export async function addModule(
  courseId: string,
  title: string
): Promise<ActionResult> {
  await requireAdmin()
  const supabase = await createClient()
  const sort = await nextSort("modules", "course_id", courseId)
  const { error } = await supabase
    .from("modules")
    .insert({ course_id: courseId, title, sort_order: sort })
  if (error) return { ok: false, error: error.message }
  revalidatePath(`/admin/courses/${courseId}`)
  return { ok: true }
}

export async function renameModule(
  moduleId: string,
  courseId: string,
  title: string
): Promise<ActionResult> {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase.from("modules").update({ title }).eq("id", moduleId)
  if (error) return { ok: false, error: error.message }
  revalidatePath(`/admin/courses/${courseId}`)
  return { ok: true }
}

export async function deleteModule(
  moduleId: string,
  courseId: string
): Promise<ActionResult> {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase.from("modules").delete().eq("id", moduleId)
  if (error) return { ok: false, error: error.message }
  revalidatePath(`/admin/courses/${courseId}`)
  return { ok: true }
}

// ---------- Lessons ----------

export async function addLesson(input: {
  courseId: string
  moduleId: string
  title: string
  type: LessonType
  video_url?: string
  content?: string
  attachment_url?: string
  duration_seconds?: number
  is_preview?: boolean
}): Promise<ActionResult> {
  await requireAdmin()
  const supabase = await createClient()
  const sort = await nextSort("lessons", "module_id", input.moduleId)
  const { data: lesson, error } = await supabase
    .from("lessons")
    .insert({
      course_id: input.courseId,
      module_id: input.moduleId,
      title: input.title,
      type: input.type,
      video_url: input.video_url || null,
      content: input.content || null,
      attachment_url: input.attachment_url || null,
      duration_seconds: input.duration_seconds ?? 0,
      is_preview: input.is_preview ?? false,
      sort_order: sort,
    })
    .select("id")
    .single()
  if (error || !lesson) return { ok: false, error: error?.message ?? "Failed" }

  // Create a quiz / assignment shell so the builder has something to edit.
  if (input.type === "quiz") {
    await supabase.from("quizzes").insert({
      lesson_id: lesson.id,
      course_id: input.courseId,
      title: input.title,
    })
  } else if (input.type === "assignment") {
    await supabase.from("assignments").insert({
      lesson_id: lesson.id,
      course_id: input.courseId,
      title: input.title,
    })
  }

  revalidatePath(`/admin/courses/${input.courseId}`)
  return { ok: true }
}

export async function deleteLesson(
  lessonId: string,
  courseId: string
): Promise<ActionResult> {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase.from("lessons").delete().eq("id", lessonId)
  if (error) return { ok: false, error: error.message }
  revalidatePath(`/admin/courses/${courseId}`)
  return { ok: true }
}
