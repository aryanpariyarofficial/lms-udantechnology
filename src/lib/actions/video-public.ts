"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { requireUser, isAdmin } from "@/lib/auth"
import { rateLimit } from "@/lib/rate-limit"
import { listVideos, type VideoCard } from "@/lib/queries/videos"
import type { VideoKind } from "@/lib/supabase/types"

/** Lazy-load the next page of videos for the archive "Load more" button. */
export async function loadMoreVideos(
  kind: VideoKind,
  offset: number,
  category?: string
): Promise<VideoCard[]> {
  return listVideos(kind, { offset, category })
}

export async function addVideoComment(
  videoId: string,
  path: string,
  body: string
): Promise<{ ok: boolean; error?: string }> {
  const { user } = await requireUser()
  const limited = await rateLimit("comment", 10, 60_000)
  if (limited) return { ok: false, error: limited }

  const text = body.trim().slice(0, 2000)
  if (!text) return { ok: false, error: "Comment can't be empty." }
  const supabase = await createClient()
  const { error } = await supabase
    .from("video_comments")
    .insert({ video_id: videoId, user_id: user.id, body: text })
  if (error) return { ok: false, error: error.message }
  revalidatePath(path)
  return { ok: true }
}

export async function deleteVideoComment(
  id: string,
  path: string
): Promise<{ ok: boolean; error?: string }> {
  const { user, profile } = await requireUser()
  const supabase = await createClient()

  // Defense in depth: verify ownership in code, not just via RLS.
  const { data: comment } = await supabase
    .from("video_comments")
    .select("user_id")
    .eq("id", id)
    .maybeSingle()
  if (!comment) return { ok: false, error: "Comment not found." }
  if (comment.user_id !== user.id && !isAdmin(profile)) {
    return { ok: false, error: "You can only delete your own comments." }
  }

  const { error } = await supabase.from("video_comments").delete().eq("id", id)
  if (error) return { ok: false, error: error.message }
  revalidatePath(path)
  return { ok: true }
}
