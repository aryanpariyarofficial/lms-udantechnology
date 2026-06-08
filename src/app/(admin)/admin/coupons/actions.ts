"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth"
import type { CouponType } from "@/lib/supabase/types"

export type Result = { ok: boolean; error?: string }

export async function createCoupon(formData: FormData): Promise<Result> {
  await requireAdmin()
  const supabase = await createClient()

  const code = String(formData.get("code") ?? "").trim().toUpperCase()
  if (!code) return { ok: false, error: "Code required." }

  const appliesTo = String(formData.get("applies_to") ?? "all")
  const courseId = String(formData.get("course_id") ?? "")
  const expires = String(formData.get("expires_at") ?? "")

  const { error } = await supabase.from("coupons").insert({
    code,
    type: String(formData.get("type") ?? "percentage") as CouponType,
    value: Number(formData.get("value") ?? 0),
    applies_to: appliesTo,
    course_id: appliesTo === "course" && courseId ? courseId : null,
    max_uses: Number(formData.get("max_uses") ?? 0),
    expires_at: expires ? new Date(expires).toISOString() : null,
    is_active: true,
  })

  if (error) {
    return {
      ok: false,
      error: error.code === "23505" ? "That code already exists." : error.message,
    }
  }
  revalidatePath("/admin/coupons")
  return { ok: true }
}

export async function toggleCoupon(id: string, active: boolean): Promise<Result> {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase.from("coupons").update({ is_active: active }).eq("id", id)
  if (error) return { ok: false, error: error.message }
  revalidatePath("/admin/coupons")
  return { ok: true }
}

export async function deleteCoupon(id: string): Promise<Result> {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase.from("coupons").delete().eq("id", id)
  if (error) return { ok: false, error: error.message }
  revalidatePath("/admin/coupons")
  return { ok: true }
}
