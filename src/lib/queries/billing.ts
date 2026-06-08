import "server-only"

import { createClient } from "@/lib/supabase/server"
import type { Course, MembershipPlan } from "@/lib/supabase/types"

export async function getCourseForCheckout(
  slug: string
): Promise<Pick<Course, "id" | "title" | "slug" | "price" | "discount_price" | "thumbnail_url" | "currency"> | null> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("courses")
      .select("id, title, slug, price, discount_price, thumbnail_url, currency")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle()
    return data ?? null
  } catch {
    return null
  }
}

export async function getPlanForCheckout(
  slug: string
): Promise<MembershipPlan | null> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("membership_plans")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle()
    return data ?? null
  } catch {
    return null
  }
}
