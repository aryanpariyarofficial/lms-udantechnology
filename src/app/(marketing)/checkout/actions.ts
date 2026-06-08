"use server"

import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireUser } from "@/lib/auth"
import { getCourseForCheckout, getPlanForCheckout } from "@/lib/queries/billing"
import { validateCoupon, type CouponResult } from "@/lib/coupons"
import type { PaymentMethod } from "@/lib/supabase/types"

export type CheckoutState = { error?: string }

/** Validate a coupon for the checkout UI (returns discount + final amount). */
export async function applyCouponAction(
  kind: "course" | "membership",
  slug: string,
  code: string
): Promise<CouponResult> {
  await requireUser()
  return validateCoupon(code, kind, slug)
}

/** 100%-off coupon → enroll/grant immediately, no payment needed. */
export async function redeemFreeCouponAction(
  kind: "course" | "membership",
  slug: string,
  code: string
): Promise<{ ok: boolean; error?: string }> {
  const { user } = await requireUser()
  const result = await validateCoupon(code, kind, slug)
  if (!result.ok) return { ok: false, error: result.message }
  if (!result.free)
    return { ok: false, error: "This coupon doesn't make the order free." }

  const db = createAdminClient()

  if (kind === "course") {
    const course = await getCourseForCheckout(slug)
    if (!course) return { ok: false, error: "Course not found." }
    await db.from("enrollments").upsert(
      { user_id: user.id, course_id: course.id, source: "free", expires_at: null },
      { onConflict: "user_id,course_id" }
    )
  } else {
    const plan = await getPlanForCheckout(slug)
    if (!plan) return { ok: false, error: "Plan not found." }
    const expires = new Date()
    expires.setDate(expires.getDate() + plan.duration_days)
    await db.from("memberships").insert({
      user_id: user.id,
      plan_id: plan.id,
      status: "active",
      expires_at: expires.toISOString(),
    })
    await db.from("profiles").update({ role: "membership_user" }).eq("id", user.id)
  }

  // Count the redemption
  await db
    .from("coupons")
    .update({ used_count: await nextUsedCount(db, result.couponId) })
    .eq("id", result.couponId)

  await db.from("notifications").insert({
    user_id: user.id,
    title: "🎁 Free access unlocked",
    body: "Your coupon was applied and access has been granted. Enjoy!",
    type: "enrollment",
    link: kind === "membership" ? "/dashboard/membership" : "/dashboard/courses",
  })

  redirect(kind === "membership" ? "/dashboard/membership" : "/dashboard/courses")
}

async function nextUsedCount(
  db: ReturnType<typeof createAdminClient>,
  couponId: string
) {
  const { data } = await db
    .from("coupons")
    .select("used_count")
    .eq("id", couponId)
    .maybeSingle()
  return ((data?.used_count as number | undefined) ?? 0) + 1
}

export async function submitPaymentAction(
  _prev: CheckoutState,
  formData: FormData
): Promise<CheckoutState> {
  const { user } = await requireUser()
  const supabase = await createClient()

  const kind = String(formData.get("kind") ?? "course") as "course" | "membership"
  const slug = String(formData.get("slug") ?? "")
  const method = String(formData.get("method") ?? "") as PaymentMethod
  const transactionId = String(formData.get("transactionId") ?? "").trim()
  const remarks = String(formData.get("remarks") ?? "").trim()
  const couponCode = String(formData.get("coupon") ?? "").trim()
  const screenshot = formData.get("screenshot") as File | null

  if (!method) return { error: "Please select the payment method you used." }
  if (!transactionId) return { error: "Please enter the transaction ID." }
  if (!screenshot || screenshot.size === 0)
    return { error: "Please upload your payment screenshot." }
  if (screenshot.size > 5 * 1024 * 1024)
    return { error: "Screenshot must be under 5MB." }

  // Resolve the target + price on the server (never trust client amounts).
  let amount = 0
  let courseId: string | null = null
  let planId: string | null = null

  if (kind === "course") {
    const course = await getCourseForCheckout(slug)
    if (!course) return { error: "Course not found." }
    courseId = course.id
    amount = course.discount_price ?? course.price
  } else {
    const plan = await getPlanForCheckout(slug)
    if (!plan) return { error: "Membership plan not found." }
    planId = plan.id
    amount = plan.price
  }

  // Re-validate coupon server-side and apply discount to the recorded amount.
  let couponId: string | null = null
  if (couponCode) {
    const res = await validateCoupon(couponCode, kind, slug)
    if (res.ok) {
      amount = res.finalAmount
      couponId = res.couponId
    }
  }

  // Upload screenshot to the private payment-proofs bucket under {uid}/...
  const ext = screenshot.name.split(".").pop() ?? "jpg"
  const path = `${user.id}/${Date.now()}.${ext}`
  const { error: uploadError } = await supabase.storage
    .from("payment-proofs")
    .upload(path, screenshot, { upsert: false })

  if (uploadError) {
    return { error: `Upload failed: ${uploadError.message}` }
  }

  const { error: insertError } = await supabase.from("payments").insert({
    user_id: user.id,
    kind,
    course_id: courseId,
    membership_plan_id: planId,
    method,
    amount,
    transaction_id: transactionId,
    screenshot_url: path,
    remarks: remarks || null,
    status: "pending",
    // Only set when a coupon was used (so the column is optional pre-migration)
    ...(couponId ? { coupon_id: couponId } : {}),
  })

  if (insertError) {
    return { error: insertError.message }
  }

  redirect("/dashboard/payments?submitted=1")
}
