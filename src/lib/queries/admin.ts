import "server-only"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function getAdminStats() {
  try {
    const supabase = await createClient()
    const [students, courses, pending, memberships, approved] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("courses").select("id", { count: "exact", head: true }),
      supabase
        .from("payments")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase
        .from("memberships")
        .select("id", { count: "exact", head: true })
        .eq("status", "active"),
      supabase.from("payments").select("amount").eq("status", "approved"),
    ])

    const revenue = (approved.data ?? []).reduce(
      (sum, p) => sum + Number((p as { amount: number }).amount),
      0
    )

    return {
      students: students.count ?? 0,
      courses: courses.count ?? 0,
      pendingPayments: pending.count ?? 0,
      activeMemberships: memberships.count ?? 0,
      revenue,
    }
  } catch {
    return {
      students: 0,
      courses: 0,
      pendingPayments: 0,
      activeMemberships: 0,
      revenue: 0,
    }
  }
}

export type AdminPayment = {
  id: string
  kind: string
  amount: number
  method: string
  status: string
  transaction_id: string | null
  remarks: string | null
  review_note: string | null
  created_at: string
  user: { full_name: string | null; id: string } | null
  course: { title: string } | null
  plan: { name: string } | null
  screenshotUrl: string | null
}

export async function getPayments(status?: string): Promise<AdminPayment[]> {
  try {
    const supabase = await createClient()
    let query = supabase
      .from("payments")
      .select(
        "*, user:profiles!payments_user_id_fkey(id, full_name), course:courses(title), plan:membership_plans(name)"
      )
      .order("created_at", { ascending: false })
    if (status) query = query.eq("status", status as "pending")

    const { data } = await query
    const rows = (data ?? []) as unknown as AdminPayment[]

    // Sign screenshot URLs (private bucket) via admin client.
    const admin = createAdminClient()
    for (const p of rows) {
      const raw = (p as unknown as { screenshot_url: string | null }).screenshot_url
      if (raw) {
        const { data: signed } = await admin.storage
          .from("payment-proofs")
          .createSignedUrl(raw, 60 * 30)
        p.screenshotUrl = signed?.signedUrl ?? null
      } else {
        p.screenshotUrl = null
      }
    }
    return rows
  } catch {
    return []
  }
}
