import type { Metadata } from "next"

import { VideoArchive } from "@/components/videos/video-archive"

export const metadata: Metadata = {
  title: "Free Tutorials",
  description:
    "Free video tutorials on web development, AI, design, marketing and more — basic to advanced.",
  alternates: { canonical: "/tutorials" },
}

export default async function TutorialsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams
  return <VideoArchive kind="tutorial" category={category} />
}
