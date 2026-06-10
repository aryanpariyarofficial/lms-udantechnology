import { notFound } from "next/navigation"
import type { Metadata } from "next"

import { getVideoBySlug } from "@/lib/queries/videos"
import { VideoSingle } from "@/components/videos/video-single"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const v = (await getVideoBySlug("stream", slug)) as { title: string; description: string | null } | null
  if (!v) return { title: "Stream not found" }
  return { title: v.title, description: v.description ?? undefined }
}

export default async function StreamPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const video = await getVideoBySlug("stream", slug)
  if (!video) notFound()
  return <VideoSingle video={video as unknown as Parameters<typeof VideoSingle>[0]["video"]} kind="stream" />
}
