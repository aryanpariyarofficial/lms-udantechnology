import Link from "next/link"
import type { Metadata } from "next"
import { PlayCircle, Clock, Calendar } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SAMPLE_TUTORIALS } from "@/lib/sample-data"

export const metadata: Metadata = {
  title: "Free Tutorials",
  description:
    "Free single-video tutorials and crash courses on web development, AI, design, marketing and more.",
}

const GRADIENTS = [
  "from-violet-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-sky-500 to-blue-600",
  "from-rose-500 to-pink-600",
  "from-fuchsia-500 to-purple-600",
]

export default function TutorialsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Free Tutorials</h1>
        <p className="mt-2 text-muted-foreground">
          Quick, practical, single-video tutorials to learn a skill in one sitting —
          all free.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {SAMPLE_TUTORIALS.map((t, i) => (
          <Link key={t.title} href="/courses" className="group block">
            <Card className="h-full overflow-hidden pt-0 transition-all hover:-translate-y-1 hover:shadow-lg">
              <div
                className={`relative flex aspect-video items-center justify-center bg-gradient-to-br ${
                  GRADIENTS[i % GRADIENTS.length]
                }`}
              >
                <span className="grid size-14 place-items-center rounded-full bg-white/20 backdrop-blur transition-transform group-hover:scale-110">
                  <PlayCircle className="size-8 text-white" />
                </span>
                <Badge className="absolute left-3 top-3 bg-white/90 text-foreground hover:bg-white">
                  Free
                </Badge>
              </div>
              <div className="space-y-3 px-5 pb-5">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="font-normal">
                    {t.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{t.level}</span>
                </div>
                <h3 className="line-clamp-2 font-semibold leading-snug group-hover:text-primary">
                  {t.title}
                </h3>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="size-3.5" /> {t.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3.5" /> {t.date}
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
