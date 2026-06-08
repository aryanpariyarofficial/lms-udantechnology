"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth"
import { slugify } from "@/lib/format"
import type { ContentStatus } from "@/lib/supabase/types"

export type Result = { ok: boolean; error?: string }

export async function createBlog(formData: FormData) {
  const { user } = await requireAdmin()
  const supabase = await createClient()
  const title = String(formData.get("title") ?? "").trim()
  if (!title) return
  const slug = `${slugify(title)}-${Math.random().toString(36).slice(2, 6)}`
  const { data, error } = await supabase
    .from("blogs")
    .insert({ title, slug, author_id: user.id, status: "draft" })
    .select("id")
    .single()
  if (error || !data) return
  redirect(`/admin/blog/${data.id}`)
}

export async function updateBlog(id: string, formData: FormData): Promise<Result> {
  await requireAdmin()
  const supabase = await createClient()
  const status = String(formData.get("status") ?? "draft") as ContentStatus
  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)

  const { error } = await supabase
    .from("blogs")
    .update({
      title: String(formData.get("title") ?? "").trim(),
      excerpt: String(formData.get("excerpt") ?? "").trim() || null,
      content: String(formData.get("content") ?? "") || null,
      cover_url: String(formData.get("cover_url") ?? "") || null,
      tags,
      status,
      published_at: status === "published" ? new Date().toISOString() : null,
    })
    .eq("id", id)

  if (error) return { ok: false, error: error.message }
  revalidatePath(`/admin/blog/${id}`)
  revalidatePath("/blog")
  return { ok: true }
}

export async function deleteBlog(id: string) {
  await requireAdmin()
  const supabase = await createClient()
  await supabase.from("blogs").delete().eq("id", id)
  redirect("/admin/blog")
}
