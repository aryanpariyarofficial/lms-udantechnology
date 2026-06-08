"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth"
import type { QuizQuestionType, Json } from "@/lib/supabase/types"

export type Result = { ok: boolean; error?: string }

// ---------- Quiz settings ----------
export async function updateQuiz(
  quizId: string,
  courseId: string,
  formData: FormData
): Promise<Result> {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase
    .from("quizzes")
    .update({
      title: String(formData.get("title") ?? "").trim() || "Quiz",
      pass_percentage: Number(formData.get("pass_percentage") ?? 60),
      time_limit_minutes: formData.get("time_limit_minutes")
        ? Number(formData.get("time_limit_minutes"))
        : null,
      max_attempts: Number(formData.get("max_attempts") ?? 0),
    })
    .eq("id", quizId)
  if (error) return { ok: false, error: error.message }
  revalidatePath(`/admin/courses/${courseId}/quiz`)
  return { ok: true }
}

// ---------- Questions ----------
export async function addQuestion(input: {
  quizId: string
  courseId: string
  question: string
  type: QuizQuestionType
  options: { id: string; text: string }[]
  correct_answers: string[]
  points: number
}): Promise<Result> {
  await requireAdmin()
  const supabase = await createClient()

  if (!input.question.trim()) return { ok: false, error: "Question text required." }
  if (input.correct_answers.length === 0)
    return { ok: false, error: "Mark at least one correct answer." }

  const { data: existing } = await supabase
    .from("quiz_questions")
    .select("sort_order")
    .eq("quiz_id", input.quizId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle()
  const sort = ((existing as { sort_order: number } | null)?.sort_order ?? -1) + 1

  const { error } = await supabase.from("quiz_questions").insert({
    quiz_id: input.quizId,
    question: input.question.trim(),
    type: input.type,
    options: input.options as unknown as Json,
    correct_answers: input.correct_answers as unknown as Json,
    points: input.points,
    sort_order: sort,
  })
  if (error) return { ok: false, error: error.message }
  revalidatePath(`/admin/courses/${input.courseId}/quiz`)
  return { ok: true }
}

export async function deleteQuestion(
  questionId: string,
  courseId: string
): Promise<Result> {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase.from("quiz_questions").delete().eq("id", questionId)
  if (error) return { ok: false, error: error.message }
  revalidatePath(`/admin/courses/${courseId}/quiz`)
  return { ok: true }
}

// ---------- Assignment ----------
export async function updateAssignment(
  assignmentId: string,
  courseId: string,
  formData: FormData
): Promise<Result> {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase
    .from("assignments")
    .update({
      title: String(formData.get("title") ?? "").trim() || "Assignment",
      instructions: String(formData.get("instructions") ?? "").trim() || null,
      max_points: Number(formData.get("max_points") ?? 100),
    })
    .eq("id", assignmentId)
  if (error) return { ok: false, error: error.message }
  revalidatePath(`/admin/courses/${courseId}/assignment`)
  return { ok: true }
}
