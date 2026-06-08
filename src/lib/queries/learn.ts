import "server-only"

import { createClient } from "@/lib/supabase/server"

export type LearnLesson = {
  id: string
  title: string
  type: string
  content: string | null
  video_url: string | null
  duration_seconds: number
  attachment_url: string | null
  is_preview: boolean
  completed: boolean
  quizId: string | null
  assignmentId: string | null
}

export type LearnModule = {
  id: string
  title: string
  lessons: LearnLesson[]
}

export type LearnData = {
  course: { id: string; title: string; slug: string }
  modules: LearnModule[]
  totalLessons: number
  completedLessons: number
  progress: number
}

export async function getLearnData(
  courseId: string,
  userId: string
): Promise<LearnData | null> {
  try {
    const supabase = await createClient()

    const { data: course } = await supabase
      .from("courses")
      .select("id, title, slug")
      .eq("id", courseId)
      .maybeSingle()
    if (!course) return null

    const { data: modules } = await supabase
      .from("modules")
      .select("id, title, sort_order")
      .eq("course_id", courseId)
      .order("sort_order")

    // RLS only returns lessons the user can access (or previews).
    const { data: lessons } = await supabase
      .from("lessons")
      .select(
        "id, module_id, title, type, content, video_url, duration_seconds, attachment_url, is_preview, sort_order"
      )
      .eq("course_id", courseId)
      .order("sort_order")

    const { data: progress } = await supabase
      .from("lesson_progress")
      .select("lesson_id, completed")
      .eq("course_id", courseId)
      .eq("user_id", userId)

    const [{ data: quizzes }, { data: assignments }] = await Promise.all([
      supabase.from("quizzes").select("id, lesson_id").eq("course_id", courseId),
      supabase.from("assignments").select("id, lesson_id").eq("course_id", courseId),
    ])
    const quizByLesson = new Map(
      (quizzes ?? []).map((q) => [
        (q as { lesson_id: string }).lesson_id,
        (q as { id: string }).id,
      ])
    )
    const assignmentByLesson = new Map(
      (assignments ?? []).map((a) => [
        (a as { lesson_id: string }).lesson_id,
        (a as { id: string }).id,
      ])
    )

    const completedSet = new Set(
      (progress ?? [])
        .filter((p) => (p as { completed: boolean }).completed)
        .map((p) => (p as { lesson_id: string }).lesson_id)
    )

    const lessonRows = (lessons ?? []) as unknown as Array<{
      id: string
      module_id: string
      title: string
      type: string
      content: string | null
      video_url: string | null
      duration_seconds: number
      attachment_url: string | null
      is_preview: boolean
    }>

    const moduleRows = (modules ?? []) as unknown as Array<{ id: string; title: string }>

    const builtModules: LearnModule[] = moduleRows.map((m) => ({
      id: m.id,
      title: m.title,
      lessons: lessonRows
        .filter((l) => l.module_id === m.id)
        .map((l) => ({
          id: l.id,
          title: l.title,
          type: l.type,
          content: l.content,
          video_url: l.video_url,
          duration_seconds: l.duration_seconds,
          attachment_url: l.attachment_url,
          is_preview: l.is_preview,
          completed: completedSet.has(l.id),
          quizId: quizByLesson.get(l.id) ?? null,
          assignmentId: assignmentByLesson.get(l.id) ?? null,
        })),
    }))

    const totalLessons = lessonRows.length
    const completedLessons = lessonRows.filter((l) => completedSet.has(l.id)).length

    return {
      course,
      modules: builtModules,
      totalLessons,
      completedLessons,
      progress: totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0,
    }
  } catch {
    return null
  }
}
