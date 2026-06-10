import Link from "next/link"
import Image from "next/image"
import { PlayCircle, Clock, Calendar } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatMinutes, formatDate } from "@/lib/format"

export type VideoCardData = {
  id: string
  title: string
  slug: string
  category: string | null
  duration_minutes: number
  published_at: string | null
  thumbnail: string | null
}

export function VideoCard({
  video,
  basePath,
}: {
  video: VideoCardData
  basePath: string
}) {
  return (
    <Link href={`${basePath}/${video.slug}`} className="group block">
      <Card className="h-full overflow-hidden pt-0 transition-all hover:-translate-y-1 hover:shadow-lg">
        <div className="relative aspect-video bg-muted">
          {video.thumbnail ? (
            <Image
              src={video.thumbnail}
              alt={video.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div className="grid h-full place-items-center bg-gradient-to-br from-violet-500 to-indigo-600" />
          )}
          <div className="absolute inset-0 grid place-items-center bg-black/10 opacity-0 transition-opacity group-hover:opacity-100">
            <PlayCircle className="size-12 text-white drop-shadow" />
          </div>
          {video.category && (
            <Badge className="absolute left-3 top-3 bg-black/70 text-white hover:bg-black/70">
              {video.category}
            </Badge>
          )}
        </div>
        <div className="space-y-3 px-4 pb-4">
          <h3 className="line-clamp-2 font-semibold leading-snug group-hover:text-primary">
            {video.title}
          </h3>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {video.duration_minutes > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="size-3.5" /> {formatMinutes(video.duration_minutes)}
              </span>
            )}
            {video.published_at && (
              <span className="flex items-center gap-1">
                <Calendar className="size-3.5" /> {formatDate(video.published_at)}
              </span>
            )}
          </div>
          <span className="block rounded-md bg-foreground py-2 text-center text-sm font-medium text-background transition-colors group-hover:bg-primary">
            Watch {basePath === "/streams" ? "Stream" : "Tutorial"}
          </span>
        </div>
      </Card>
    </Link>
  )
}
