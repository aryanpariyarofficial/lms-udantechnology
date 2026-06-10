import Link from "next/link"
import { Sparkles, ArrowRight, GraduationCap } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { VideoGrid } from "@/components/videos/video-grid"
import { listVideos, getVideoCategories } from "@/lib/queries/videos"
import { cn } from "@/lib/utils"
import type { VideoKind } from "@/lib/supabase/types"

export async function VideoArchive({
  kind,
  category,
}: {
  kind: VideoKind
  category?: string
}) {
  const base = kind === "tutorial" ? "/tutorials" : "/streams"
  const [initial, categories] = await Promise.all([
    listVideos(kind, { category }),
    getVideoCategories(kind),
  ])

  const title = kind === "tutorial" ? "Tutorials" : "Live Streams & Podcasts"
  const subtitle =
    kind === "tutorial"
      ? "Short and detailed video tutorials from basic to advanced — learn a new skill in one sitting, all free."
      : "Topic-based live talks and podcasts with industry professionals. Watch the replays anytime."

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-primary to-indigo-800 p-10 text-center text-primary-foreground sm:p-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.15),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.12),transparent_40%)]" />
        <div className="relative">
          <h1 className="text-3xl font-bold uppercase tracking-wide sm:text-5xl">{title}</h1>
          <p className="mx-auto mt-3 max-w-2xl text-primary-foreground/85">{subtitle}</p>
        </div>
      </div>

      {/* Start Here CTA */}
      <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-2xl border bg-accent/50 p-5 sm:flex-row">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground">
            <GraduationCap className="size-5" />
          </span>
          <div>
            <p className="flex items-center gap-1.5 font-semibold">
              <Sparkles className="size-4 text-primary" /> New to digital skills?
            </p>
            <p className="text-sm text-muted-foreground">
              Start with a structured, project-based course and learn step by step.
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href="/courses">
            Start Here <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>

      {/* Category filter */}
      {categories.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          <Link href={base}>
            <Badge variant={!category ? "default" : "secondary"} className="cursor-pointer px-3 py-1.5 font-normal">
              All
            </Badge>
          </Link>
          {categories.map((c) => (
            <Link key={c} href={`${base}?category=${encodeURIComponent(c)}`}>
              <Badge
                variant={category === c ? "default" : "secondary"}
                className={cn("cursor-pointer px-3 py-1.5 font-normal")}
              >
                {c}
              </Badge>
            </Link>
          ))}
        </div>
      )}

      {/* Grid + load more */}
      <div className="mt-8">
        <VideoGrid kind={kind} basePath={base} initial={initial} category={category} />
      </div>
    </div>
  )
}
