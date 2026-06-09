import Link from "next/link"
import type { Metadata } from "next"
import { Radio, Clock, Calendar } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { YoutubeIcon } from "@/components/brand/social-icons"
import { SAMPLE_STREAMS } from "@/lib/sample-data"

export const metadata: Metadata = {
  title: "Live Streams & Podcasts",
  description:
    "Topic-based live talks and podcasts with industry professionals — learn, ask, and grow.",
}

const GRADIENTS = [
  "from-cyan-500 to-blue-600",
  "from-violet-500 to-purple-600",
  "from-rose-500 to-pink-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-indigo-500 to-blue-700",
]

export default function StreamsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Live Streams &amp; Podcasts
          </h1>
          <p className="mt-2 text-muted-foreground">
            Topic-based talks and podcasts with professionals from the industry.
            Watch live or catch the replay.
          </p>
        </div>
        <Button asChild variant="outline">
          <a href="#" target="_blank" rel="noreferrer">
            <YoutubeIcon className="size-4" /> Subscribe on YouTube
          </a>
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {SAMPLE_STREAMS.map((s, i) => (
          <Link key={s.title} href="#" className="group block">
            <Card className="h-full overflow-hidden pt-0 transition-all hover:-translate-y-1 hover:shadow-lg">
              <div
                className={`relative flex aspect-video items-center justify-center bg-gradient-to-br ${
                  GRADIENTS[i % GRADIENTS.length]
                }`}
              >
                <Radio className="size-10 text-white/90" />
                <Badge className="absolute left-3 top-3 gap-1 bg-red-600 text-white hover:bg-red-600">
                  <span className="inline-block size-1.5 animate-pulse rounded-full bg-white" />
                  REPLAY
                </Badge>
                <Badge className="absolute right-3 top-3 bg-white/90 text-foreground hover:bg-white">
                  {s.tag}
                </Badge>
              </div>
              <div className="space-y-3 px-5 pb-5">
                <h3 className="line-clamp-2 font-semibold leading-snug group-hover:text-primary">
                  {s.title}
                </h3>
                <p className="text-sm text-muted-foreground">with {s.host}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="size-3.5" /> {s.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3.5" /> {s.date}
                  </span>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
