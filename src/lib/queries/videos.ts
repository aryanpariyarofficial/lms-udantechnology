import "server-only"

import { createClient } from "@/lib/supabase/server"
import { youtubeThumbnail } from "@/lib/format"
import type { Video, VideoKind } from "@/lib/supabase/types"

export type VideoCard = {
  id: string
  title: string
  slug: string
  category: string | null
  tags: string[]
  duration_minutes: number
  published_at: string | null
  thumbnail: string | null
  author: string | null
}

export const VIDEO_PAGE_SIZE = 9

function toCard(v: Video & { author?: { full_name: string | null } | null }): VideoCard {
  return {
    id: v.id,
    title: v.title,
    slug: v.slug,
    category: v.category,
    tags: v.tags,
    duration_minutes: v.duration_minutes,
    published_at: v.published_at,
    thumbnail: v.thumbnail_url ?? youtubeThumbnail(v.youtube_url),
    author: v.author?.full_name ?? null,
  }
}

export async function listVideos(
  kind: VideoKind,
  opts: { offset?: number; limit?: number; category?: string } = {}
): Promise<VideoCard[]> {
  try {
    const supabase = await createClient()
    const limit = opts.limit ?? VIDEO_PAGE_SIZE
    const offset = opts.offset ?? 0
    let query = supabase
      .from("videos")
      .select("*, author:profiles(full_name)")
      .eq("kind", kind)
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .range(offset, offset + limit - 1)
    if (opts.category) query = query.eq("category", opts.category)
    const { data } = await query
    return ((data as unknown as Video[]) ?? []).map(toCard)
  } catch {
    return []
  }
}

export async function getVideoCategories(kind: VideoKind): Promise<string[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("videos")
      .select("category")
      .eq("kind", kind)
      .eq("status", "published")
      .not("category", "is", null)
    const set = new Set<string>()
    for (const r of data ?? []) {
      const c = (r as { category: string | null }).category
      if (c) set.add(c)
    }
    return [...set].sort()
  } catch {
    return []
  }
}

export async function getVideoBySlug(kind: VideoKind, slug: string) {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("videos")
      .select("*, author:profiles(full_name, avatar_url)")
      .eq("kind", kind)
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle()
    return data ?? null
  } catch {
    return null
  }
}

export async function getRelatedVideos(
  kind: VideoKind,
  currentId: string,
  limit = 5
): Promise<VideoCard[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("videos")
      .select("*, author:profiles(full_name)")
      .eq("kind", kind)
      .eq("status", "published")
      .neq("id", currentId)
      .order("published_at", { ascending: false })
      .limit(limit)
    return ((data as unknown as Video[]) ?? []).map(toCard)
  } catch {
    return []
  }
}

export async function getVideoComments(videoId: string) {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("video_comments")
      .select("*, user:profiles(full_name, avatar_url)")
      .eq("video_id", videoId)
      .order("created_at", { ascending: false })
    return data ?? []
  } catch {
    return []
  }
}

// ---------- Admin ----------
export async function getAdminVideos(kind: VideoKind): Promise<Video[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("videos")
      .select("*")
      .eq("kind", kind)
      .order("created_at", { ascending: false })
    return (data as unknown as Video[]) ?? []
  } catch {
    return []
  }
}

export async function getAdminVideo(id: string): Promise<Video | null> {
  try {
    const supabase = await createClient()
    const { data } = await supabase.from("videos").select("*").eq("id", id).maybeSingle()
    return (data as Video) ?? null
  } catch {
    return null
  }
}
