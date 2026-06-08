import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"
import { getCourseForCheckout, getPlanForCheckout } from "@/lib/queries/billing"

export type CouponResult =
  | { ok: false; message: string }
  | {
      ok: true
      couponId: string
      base: number
      discount: number
      finalAmount: number
      free: boolean
      message: string
    }

/**
 * Validates a coupon against an order and computes the discounted amount.
 * Runs with the service role (bypasses RLS) so the coupon list is never
 * exposed to the client.
 */
export async function validateCoupon(
  code: string,
  kind: "course" | "membership",
  slug: string
): Promise<CouponResult> {
  const trimmed = code.trim().toUpperCase()
  if (!trimmed) return { ok: false, message: "Enter a coupon code." }

  const db = createAdminClient()
  const { data: coupon } = await db
    .from("coupons")
    .select("*")
    .eq("code", trimmed)
    .maybeSingle()

  if (!coupon || !coupon.is_active)
    return { ok: false, message: "Invalid coupon code." }
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date())
    return { ok: false, message: "This coupon has expired." }
  if (coupon.max_uses > 0 && coupon.used_count >= coupon.max_uses)
    return { ok: false, message: "This coupon has reached its usage limit." }
  if (coupon.applies_to === "membership" && kind !== "membership")
    return { ok: false, message: "This coupon is only valid for memberships." }
  if (coupon.applies_to === "course" && kind !== "course")
    return { ok: false, message: "This coupon is only valid for courses." }

  // Resolve the order's base amount
  let base = 0
  if (kind === "course") {
    const c = await getCourseForCheckout(slug)
    if (!c) return { ok: false, message: "Course not found." }
    base = c.discount_price ?? c.price
    if (coupon.course_id && coupon.course_id !== c.id)
      return { ok: false, message: "This coupon isn't valid for this course." }
  } else {
    const p = await getPlanForCheckout(slug)
    if (!p) return { ok: false, message: "Plan not found." }
    base = p.price
  }

  let discount =
    coupon.type === "percentage" ? (base * coupon.value) / 100 : coupon.value
  discount = Math.min(discount, base)
  const finalAmount = Math.max(0, Math.round(base - discount))

  return {
    ok: true,
    couponId: coupon.id,
    base,
    discount: Math.round(discount),
    finalAmount,
    free: finalAmount === 0,
    message:
      coupon.type === "percentage"
        ? `Coupon applied — ${coupon.value}% off!`
        : `Coupon applied — Rs ${coupon.value} off!`,
  }
}
