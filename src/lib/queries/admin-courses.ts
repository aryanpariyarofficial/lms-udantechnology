import "server-only"

import { createClient } from "@/lib/supabase/server"
import type {
  Course,
  Module,
  Lesson,
  Quiz,
  QuizQuestion,
  Assignment,
} from "@/lib/supabase/types"

export async function getAdminCourses(): Promise<
  (Course & { category: { name: string } | null })[]
> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("courses")
      .select("*, category:course_categories(name)")
      .order("created_at", { ascending: false })
    return (data as unknown as (Course & { category: { name: string } | null })[]) ?? []
  } catch {
    return []
  }
}

export type AdminCourseDetail = Course & {
  modules: (Module & { lessons: Lesson[] })[]
}

export async function getAdminCourse(id: string): Promise<AdminCourseDetail | null> {
  try {
    const supabase = await createClient()
    const { data: course } = await supabase
      .from("courses")
      .select("*")
      .eq("id", id)
      .maybeSingle()
    if (!course) return null

    const { data: modules } = await supabase
      .from("modules")
      .select("*")
      .eq("course_id", id)
      .order("sort_order")

    const { data: lessons } = await supabase
      .from("lessons")
      .select("*")
      .eq("course_id", id)
      .order("sort_order")

    const lessonRows = (lessons ?? []) as unknown as Lesson[]
    const moduleRows = (modules ?? []) as unknown as Module[]

    return {
      ...(course as Course),
      modules: moduleRows.map((m) => ({
        ...m,
        lessons: lessonRows.filter((l) => l.module_id === m.id),
      })),
    }
  } catch {
    return null
  }
}

export async function getQuizForLesson(
  lessonId: string
): Promise<{ quiz: Quiz; questions: QuizQuestion[]; lessonTitle: string } | null> {
  try {
    const supabase = await createClient()
    const { data: quiz } = await supabase
      .from("quizzes")
      .select("*")
      .eq("lesson_id", lessonId)
      .maybeSingle()
    if (!quiz) return null
    const { data: questions } = await supabase
      .from("quiz_questions")
      .select("*")
      .eq("quiz_id", quiz.id)
      .order("sort_order")
    const { data: lesson } = await supabase
      .from("lessons")
      .select("title")
      .eq("id", lessonId)
      .maybeSingle()
    return {
      quiz: quiz as Quiz,
      questions: (questions as unknown as QuizQuestion[]) ?? [],
      lessonTitle: lesson?.title ?? "Quiz",
    }
  } catch {
    return null
  }
}

export async function getAssignmentForLesson(
  lessonId: string
): Promise<{ assignment: Assignment; lessonTitle: string } | null> {
  try {
    const supabase = await createClient()
    const { data: assignment } = await supabase
      .from("assignments")
      .select("*")
      .eq("lesson_id", lessonId)
      .maybeSingle()
    if (!assignment) return null
    const { data: lesson } = await supabase
      .from("lessons")
      .select("title")
      .eq("id", lessonId)
      .maybeSingle()
    return { assignment: assignment as Assignment, lessonTitle: lesson?.title ?? "Assignment" }
  } catch {
    return null
  }
}

export async function getCategoryOptions(): Promise<{ id: string; name: string }[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("course_categories")
      .select("id, name")
      .order("sort_order")
    return data ?? []
  } catch {
    return []
  }
}
