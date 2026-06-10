import Link from "next/link"
import Image from "next/image"
import { ChevronRight, Calendar, Clock } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Markdown } from "@/components/blog/markdown"
import { ShareButtons } from "@/components/blog/share-buttons"
import { VideoComments } from "@/components/videos/video-comments"
import { getRelatedVideos, getVideoComments } from "@/lib/queries/videos"
import { getCurrentUser } from "@/lib/auth"
import {
  youtubeEmbedUrl,
  youtubeThumbnail,
  formatDate,
  formatMinutes,
  initials,
} from "@/lib/format"
import { SITE } from "@/lib/constants"
import { JsonLd, videoLd, breadcrumbLd } from "@/components/seo/json-ld"
import type { VideoKind } from "@/lib/supabase/types"

type VideoFull = {
  id: string
  title: string
  slug: string
  description: string | null
  youtube_url: string
  thumbnail_url?: string | null
  category: string | null
  duration_minutes: number
  published_at: string | null
  author: { full_name: string | null; avatar_url: string | null } | null
}

export async function VideoSingle({
  video,
  kind,
}: {
  video: VideoFull
  kind: VideoKind
}) {
  const base = kind === "tutorial" ? "/tutorials" : "/streams"
  const label = kind === "tutorial" ? "Tutorials" : "Streams"
  const [related, comments, current] = await Promise.all([
    getRelatedVideos(kind, video.id, 6),
    getVideoComments(video.id),
    getCurrentUser(),
  ])

  const embed = youtubeEmbedUrl(video.youtube_url)
  const authorName = video.author?.full_name ?? "UDAN Technology"
  const url = `${SITE.url}${base}/${video.slug}`
  const path = `${base}/${video.slug}`

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <JsonLd
        data={videoLd({
          title: video.title,
          description: video.description,
          slug: video.slug,
          basePath: base,
          thumbnail: video.thumbnail_url ?? youtubeThumbnail(video.youtube_url),
          youtubeUrl: video.youtube_url,
          publishedAt: video.published_at,
          durationMinutes: video.duration_minutes,
        })}
      />
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: label, path: base },
          { name: video.title, path: `${base}/${video.slug}` },
        ])}
      />
      {/* Breadcrumb */}
      <nav className="mb-5 flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="size-3.5" />
        <Link href={base} className="hover:text-foreground">{label}</Link>
        {video.category && (
          <>
            <ChevronRight className="size-3.5" />
            <span className="text-foreground">{video.category}</span>
          </>
        )}
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Main */}
        <div className="min-w-0 space-y-6">
          <header className="space-y-3">
            {video.category && <Badge variant="secondary">{video.category}</Badge>}
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{video.title}</h1>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Avatar className="size-7">
                  <AvatarImage src={video.author?.avatar_url ?? undefined} />
                  <AvatarFallback>{initials(authorName)}</AvatarFallback>
                </Avatar>
                <span className="font-medium text-foreground">{authorName}</span>
              </span>
              {video.published_at && (
                <span className="flex items-center gap-1">
                  <Calendar className="size-4" /> {formatDate(video.published_at)}
                </span>
              )}
              {video.duration_minutes > 0 && (
                <span className="flex items-center gap-1">
                  <Clock className="size-4" /> {formatMinutes(video.duration_minutes)}
                </span>
              )}
            </div>
            <ShareButtons url={url} title={video.title} />
          </header>

          {/* Player */}
          <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black">
            {embed ? (
              <iframe
                src={embed}
                title={video.title}
                className="size-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="grid h-full place-items-center text-white/70">Invalid video link</div>
            )}
          </div>

          {/* Description */}
          {video.description && (
            <div className="border-t pt-6">
              <Markdown content={video.description} />
            </div>
          )}

          {/* Comments */}
          <div className="border-t pt-6">
            <VideoComments
              videoId={video.id}
              path={path}
              comments={comments as unknown as Parameters<typeof VideoComments>[0]["comments"]}
              currentUserId={current?.user.id ?? null}
            />
          </div>
        </div>

        {/* Sidebar: Watch More */}
        {related.length > 0 && (
          <aside className="space-y-3">
            <h2 className="font-semibold">Watch more</h2>
            <div className="space-y-3">
              {related.map((r) => {
                const thumb = r.thumbnail ?? youtubeThumbnail(null)
                return (
                  <Link key={r.id} href={`${base}/${r.slug}`} className="group flex gap-3">
                    <div className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {thumb && (
                        <Image src={thumb} alt={r.title} fill className="object-cover" sizes="130px" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-sm font-medium group-hover:text-primary">{r.title}</p>
                      {r.published_at && (
                        <p className="mt-1 text-xs text-muted-foreground">{formatDate(r.published_at)}</p>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
