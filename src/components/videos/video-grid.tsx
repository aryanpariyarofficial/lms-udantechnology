"use client"

import { useState, useTransition } from "react"
import { Loader2, ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { VideoCard, type VideoCardData } from "@/components/videos/video-card"
import { loadMoreVideos } from "@/lib/actions/video-public"
import type { VideoKind } from "@/lib/supabase/types"

const PAGE = 9

export function VideoGrid({
  kind,
  basePath,
  initial,
  category,
}: {
  kind: VideoKind
  basePath: string
  initial: VideoCardData[]
  category?: string
}) {
  const [items, setItems] = useState<VideoCardData[]>(initial)
  const [hasMore, setHasMore] = useState(initial.length === PAGE)
  const [pending, startTransition] = useTransition()

  function loadMore() {
    startTransition(async () => {
      const next = await loadMoreVideos(kind, items.length, category)
      setItems((prev) => [...prev, ...next])
      setHasMore(next.length === PAGE)
    })
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed py-20 text-center text-muted-foreground">
        No {kind === "stream" ? "streams" : "tutorials"} yet — check back soon!
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((v) => (
          <VideoCard key={v.id} video={v} basePath={basePath} />
        ))}
      </div>
      {hasMore && (
        <div className="flex justify-center">
          <Button variant="outline" size="lg" onClick={loadMore} disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : <ChevronDown className="size-4" />}
            Load more
          </Button>
        </div>
      )}
    </div>
  )
}
