"use server"

import { revalidatePath } from "next/cache"

import { createAdminClient } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/auth"
import {
  sendEmail,
  paymentApprovedEmail,
  paymentRejectedEmail,
} from "@/lib/email"

/** Fetch a user's email + display name (admin only). */
async function getRecipient(
  db: ReturnType<typeof createAdminClient>,
  userId: string
) {
  const [{ data: authUser }, { data: profile }] = await Promise.all([
    db.auth.admin.getUserById(userId),
    db.from("profiles").select("full_name").eq("id", userId).maybeSingle(),
  ])
  return {
    email: authUser?.user?.email ?? null,
    name: profile?.full_name ?? "there",
  }
}

export type ReviewResult = { ok: boolean; error?: string }

export async function approvePayment(paymentId: string): Promise<ReviewResult> {
  const { user: admin } = await requireAdmin()
  const db = createAdminClient()

  const { data: payment, error } = await db
    .from("payments")
    .select("*")
    .eq("id", paymentId)
    .maybeSingle()
  if (error || !payment) return { ok: false, error: "Payment not found" }
  if (payment.status === "approved")
    return { ok: false, error: "Already approved" }

  // Grant access
  if (payment.kind === "course" && payment.course_id) {
    await db.from("enrollments").upsert(
      {
        user_id: payment.user_id,
        course_id: payment.course_id,
        source: "purchase",
        expires_at: null,
      },
      { onConflict: "user_id,course_id" }
    )
  } else if (payment.kind === "membership" && payment.membership_plan_id) {
    const { data: plan } = await db
      .from("membership_plans")
      .select("duration_days")
      .eq("id", payment.membership_plan_id)
      .maybeSingle()
    const days = plan?.duration_days ?? 30
    const expires = new Date()
    expires.setDate(expires.getDate() + days)

    await db.from("memberships").insert({
      user_id: payment.user_id,
      plan_id: payment.membership_plan_id,
      status: "active",
      expires_at: expires.toISOString(),
    })
    await db
      .from("profiles")
      .update({ role: "membership_user" })
      .eq("id", payment.user_id)
  }

  await db
    .from("payments")
    .update({
      status: "approved",
      reviewed_by: admin.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", paymentId)

  // Count coupon redemption on approval
  if (payment.coupon_id) {
    const { data: c } = await db
      .from("coupons")
      .select("used_count")
      .eq("id", payment.coupon_id)
      .maybeSingle()
    await db
      .from("coupons")
      .update({ used_count: ((c?.used_count as number | undefined) ?? 0) + 1 })
      .eq("id", payment.coupon_id)
  }

  await db.from("notifications").insert({
    user_id: payment.user_id,
    title: "✅ Payment approved",
    body: "Your payment was approved and access has been granted. Start learning now!",
    type: "payment",
    link: payment.kind === "membership" ? "/dashboard/membership" : "/dashboard/courses",
  })

  // Email the student
  const isMembership = payment.kind === "membership"
  let itemTitle = "your purchase"
  if (isMembership && payment.membership_plan_id) {
    const { data: p } = await db
      .from("membership_plans")
      .select("name")
      .eq("id", payment.membership_plan_id)
      .maybeSingle()
    if (p) itemTitle = `${p.name} Membership`
  } else if (payment.course_id) {
    const { data: c } = await db
      .from("courses")
      .select("title")
      .eq("id", payment.course_id)
      .maybeSingle()
    if (c) itemTitle = c.title
  }
  const recipient = await getRecipient(db, payment.user_id)
  if (recipient.email) {
    const mail = paymentApprovedEmail(recipient.name, itemTitle, isMembership)
    await sendEmail({ to: recipient.email, ...mail })
  }

  revalidatePath("/admin/payments")
  return { ok: true }
}

export async function rejectPayment(
  paymentId: string,
  note: string
): Promise<ReviewResult> {
  const { user: admin } = await requireAdmin()
  const db = createAdminClient()

  const { data: payment } = await db
    .from("payments")
    .select("user_id, kind, course_id, membership_plan_id")
    .eq("id", paymentId)
    .maybeSingle()
  if (!payment) return { ok: false, error: "Payment not found" }

  const reason = note || "Payment could not be verified."

  await db
    .from("payments")
    .update({
      status: "rejected",
      review_note: reason,
      reviewed_by: admin.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", paymentId)

  await db.from("notifications").insert({
    user_id: payment.user_id,
    title: "Payment rejected",
    body: reason,
    type: "payment",
    link: "/dashboard/payments",
  })

  let itemTitle = "your purchase"
  if (payment.kind === "membership" && payment.membership_plan_id) {
    const { data: p } = await db
      .from("membership_plans")
      .select("name")
      .eq("id", payment.membership_plan_id)
      .maybeSingle()
    if (p) itemTitle = `${p.name} Membership`
  } else if (payment.course_id) {
    const { data: c } = await db
      .from("courses")
      .select("title")
      .eq("id", payment.course_id)
      .maybeSingle()
    if (c) itemTitle = c.title
  }
  const recipient = await getRecipient(db, payment.user_id)
  if (recipient.email) {
    const mail = paymentRejectedEmail(recipient.name, itemTitle, reason)
    await sendEmail({ to: recipient.email, ...mail })
  }

  revalidatePath("/admin/payments")
  return { ok: true }
}
