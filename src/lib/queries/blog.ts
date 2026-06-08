import "server-only"

import { createClient } from "@/lib/supabase/server"
import type { Blog } from "@/lib/supabase/types"

export type BlogCard = Pick<
  Blog,
  "id" | "title" | "slug" | "excerpt" | "cover_url" | "published_at" | "tags"
> & { author: { full_name: string | null } | null }

export async function getPublishedBlogs(): Promise<BlogCard[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("blogs")
      .select("id, title, slug, excerpt, cover_url, published_at, tags, author:profiles(full_name)")
      .eq("status", "published")
      .order("published_at", { ascending: false })
    return (data as unknown as BlogCard[]) ?? []
  } catch {
    return []
  }
}

export async function getBlogBySlug(slug: string) {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("blogs")
      .select("*, author:profiles(full_name, avatar_url)")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle()
    return data ?? null
  } catch {
    return null
  }
}

export async function getAdminBlogs(): Promise<Blog[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("blogs")
      .select("*")
      .order("created_at", { ascending: false })
    return (data as unknown as Blog[]) ?? []
  } catch {
    return []
  }
}

export async function getAdminBlog(id: string): Promise<Blog | null> {
  try {
    const supabase = await createClient()
    const { data } = await supabase.from("blogs").select("*").eq("id", id).maybeSingle()
    return (data as Blog) ?? null
  } catch {
    return null
  }
}
