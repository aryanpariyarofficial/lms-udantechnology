"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireUser } from "@/lib/auth"
import { sendEmail, certificateIssuedEmail } from "@/lib/email"

export type ToggleResult = {
  ok: boolean
  progress: number
  certificateIssued?: boolean
  error?: string
}

function makeCertCode() {
  const rand = Math.random().toString(36).slice(2, 10).toUpperCase()
  return `UDAN-${rand}`
}

export async function submitAssignment(
  assignmentId: string,
  courseId: string,
  content: string,
  linkUrl: string
): Promise<{ ok: boolean; error?: string }> {
  const { user } = await requireUser()
  const supabase = await createClient()
  const { error } = await supabase.from("assignment_submissions").upsert(
    {
      assignment_id: assignmentId,
      user_id: user.id,
      content: content || null,
      link_url: linkUrl || null,
      status: "submitted",
    },
    { onConflict: "assignment_id,user_id" }
  )
  if (error) return { ok: false, error: error.message }
  revalidatePath(`/learn/${courseId}`)
  return { ok: true }
}

export async function toggleLessonComplete(
  lessonId: string,
  courseId: string,
  completed: boolean
): Promise<ToggleResult> {
  const { user } = await requireUser()
  const supabase = await createClient()

  const { error } = await supabase.from("lesson_progress").upsert(
    {
      user_id: user.id,
      lesson_id: lessonId,
      course_id: courseId,
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    },
    { onConflict: "user_id,lesson_id" }
  )

  if (error) return { ok: false, progress: 0, error: error.message }

  // Recompute progress
  const rpc = supabase.rpc as unknown as (
    fn: "course_progress",
    args: { uid: string; cid: string }
  ) => Promise<{ data: number | null }>
  const { data: prog } = await rpc("course_progress", {
    uid: user.id,
    cid: courseId,
  })
  const progress = Number(prog ?? 0)

  let certificateIssued = false

  // Auto-issue certificate at 100% (server-verified, admin client bypasses RLS).
  if (progress >= 100) {
    try {
      const admin = createAdminClient()
      const { data: existing } = await admin
        .from("certificates")
        .select("id")
        .eq("user_id", user.id)
        .eq("course_id", courseId)
        .maybeSingle()

      if (!existing) {
        const code = makeCertCode()
        await admin.from("certificates").insert({
          user_id: user.id,
          course_id: courseId,
          certificate_code: code,
        })
        await admin.from("notifications").insert({
          user_id: user.id,
          title: "🎉 Certificate issued!",
          body: "Congratulations on completing the course. Your certificate is ready.",
          type: "certificate",
          link: "/dashboard/certificates",
        })
        certificateIssued = true

        // Email the certificate
        const [{ data: course }, { data: profile }] = await Promise.all([
          admin.from("courses").select("title").eq("id", courseId).maybeSingle(),
          admin.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
        ])
        if (user.email) {
          const mail = certificateIssuedEmail(
            profile?.full_name ?? "there",
            course?.title ?? "your course",
            code
          )
          await sendEmail({ to: user.email, ...mail })
        }
      }
    } catch {
      // Certificate issuance is best-effort; don't fail the completion.
    }
  }

  revalidatePath(`/learn/${courseId}`)
  return { ok: true, progress, certificateIssued }
}
