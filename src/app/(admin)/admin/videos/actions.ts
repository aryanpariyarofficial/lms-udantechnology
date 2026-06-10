"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { requireStaff } from "@/lib/auth"
import { uniqueSlug } from "@/lib/slug"
import type { ContentStatus, VideoKind } from "@/lib/supabase/types"

export type Result = { ok: boolean; error?: string }

function basePath(kind: VideoKind) {
  return kind === "tutorial" ? "/admin/tutorials" : "/admin/streams"
}

export async function createVideo(kind: VideoKind, formData: FormData) {
  const { user } = await requireStaff()
  const supabase = await createClient()
  const title = String(formData.get("title") ?? "").trim()
  if (!title) return
  const slug = await uniqueSlug(supabase, "videos", title)
  const { data, error } = await supabase
    .from("videos")
    .insert({ kind, title, slug, youtube_url: "", author_id: user.id, status: "draft" })
    .select("id")
    .single()
  if (error || !data) return
  redirect(`${basePath(kind)}/${data.id}`)
}

export async function updateVideo(
  id: string,
  kind: VideoKind,
  formData: FormData
): Promise<Result> {
  await requireStaff()
  const supabase = await createClient()

  const status = String(formData.get("status") ?? "draft") as ContentStatus
  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
  const slugInput = String(formData.get("slug") ?? "").trim()
  const slug = slugInput ? await uniqueSlug(supabase, "videos", slugInput, id) : undefined
  const publishedInput = String(formData.get("published_at") ?? "").trim()

  const { error } = await supabase
    .from("videos")
    .update({
      title: String(formData.get("title") ?? "").trim(),
      ...(slug ? { slug } : {}),
      description: String(formData.get("description") ?? "").trim() || null,
      youtube_url: String(formData.get("youtube_url") ?? "").trim(),
      thumbnail_url: String(formData.get("thumbnail_url") ?? "").trim() || null,
      category: String(formData.get("category") ?? "").trim() || null,
      tags,
      duration_minutes: Number(formData.get("duration_minutes") ?? 0) || 0,
      status,
      published_at:
        status === "published"
          ? publishedInput
            ? new Date(publishedInput).toISOString()
            : new Date().toISOString()
          : null,
    })
    .eq("id", id)

  if (error) return { ok: false, error: error.message }
  revalidatePath(`${basePath(kind)}/${id}`)
  revalidatePath(kind === "tutorial" ? "/tutorials" : "/streams")
  return { ok: true }
}

export async function deleteVideo(id: string, kind: VideoKind) {
  await requireStaff()
  const supabase = await createClient()
  await supabase.from("videos").delete().eq("id", id)
  redirect(basePath(kind))
}
