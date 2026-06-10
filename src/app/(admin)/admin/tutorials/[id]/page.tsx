import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getAdminVideo } from "@/lib/queries/videos"
import { VideoForm } from "../../videos/video-form"

export const metadata: Metadata = { title: "Edit tutorial · Admin" }

export default async function EditTutorialPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const video = await getAdminVideo(id)
  if (!video) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href="/admin/tutorials" aria-label="Back">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <h1 className="text-xl font-bold tracking-tight">{video.title}</h1>
      </div>
      <VideoForm video={video} kind="tutorial" />
    </div>
  )
}
