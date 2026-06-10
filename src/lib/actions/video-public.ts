"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { requireUser } from "@/lib/auth"
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
  const text = body.trim()
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
  await requireUser()
  const supabase = await createClient()
  const { error } = await supabase.from("video_comments").delete().eq("id", id)
  if (error) return { ok: false, error: error.message }
  revalidatePath(path)
  return { ok: true }
}
