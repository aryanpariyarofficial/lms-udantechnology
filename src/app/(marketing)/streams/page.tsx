import type { Metadata } from "next"

import { VideoArchive } from "@/components/videos/video-archive"

export const metadata: Metadata = {
  title: "Live Streams & Podcasts",
  description:
    "Topic-based live talks and podcasts with industry professionals — watch the replays anytime.",
  alternates: { canonical: "/streams" },
}

export default async function StreamsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams
  return <VideoArchive kind="stream" category={category} />
}
