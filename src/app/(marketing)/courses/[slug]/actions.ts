"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { requireUser } from "@/lib/auth"

export type ReviewState = { error?: string; message?: string }

export async function submitReviewAction(
  courseId: string,
  slug: string,
  _prev: ReviewState,
  formData: FormData
): Promise<ReviewState> {
  const { user } = await requireUser()
  const supabase = await createClient()

  const rating = Number(formData.get("rating") ?? 0)
  const comment = String(formData.get("comment") ?? "").trim()
  if (rating < 1 || rating > 5) return { error: "Please select a star rating." }

  const { error } = await supabase.from("reviews").upsert(
    {
      course_id: courseId,
      user_id: user.id,
      rating,
      comment: comment || null,
      status: "pending",
    },
    { onConflict: "user_id,course_id" }
  )

  if (error) return { error: error.message }
  revalidatePath(`/courses/${slug}`)
  return { message: "Thanks! Your review was submitted and is awaiting approval." }
}
