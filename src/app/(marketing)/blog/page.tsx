import Link from "next/link"
import Image from "next/image"
import type { Metadata } from "next"
import { Newspaper, Calendar, User, ArrowRight } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getPublishedBlogs } from "@/lib/queries/blog"
import { formatDate } from "@/lib/format"

export const metadata: Metadata = {
  title: "The Blog",
  description: "Tips, tutorials, and stories on learning skills for the Nepali market.",
}

export default async function BlogPage() {
  const posts = await getPublishedBlogs()

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header card */}
      <Card className="mb-10 border-primary/30">
        <CardContent className="py-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">The Blog</h1>
          <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
            Don&apos;t like watching videos? Read these informative articles on web
            development, design, AI &amp; marketing.
          </p>
        </CardContent>
      </Card>

      {posts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-20 text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Newspaper className="size-6" />
            </span>
            <p className="font-medium">No posts yet</p>
            <p className="text-sm text-muted-foreground">Check back soon for new articles.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <Card key={p.id} className="flex h-full flex-col overflow-hidden pt-0">
              <Link href={`/blog/${p.slug}`} className="group block">
                <div className="relative aspect-video bg-muted">
                  {p.cover_url ? (
                    <Image
                      src={p.cover_url}
                      alt={p.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="400px"
                    />
                  ) : (
                    <div className="grid h-full place-items-center bg-gradient-to-br from-violet-500 to-indigo-600">
                      <Newspaper className="size-10 text-white/80" />
                    </div>
                  )}
                </div>
              </Link>
              <CardContent className="flex flex-1 flex-col gap-3 px-5 pb-5">
                {p.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {p.tags.slice(0, 2).map((t) => (
                      <Badge key={t} variant="secondary" className="font-normal">
                        {t}
                      </Badge>
                    ))}
                  </div>
                )}
                <Link href={`/blog/${p.slug}`}>
                  <h2 className="line-clamp-2 font-semibold leading-snug hover:text-primary">
                    {p.title}
                  </h2>
                </Link>
                {p.excerpt && (
                  <p className="line-clamp-2 text-sm text-muted-foreground">{p.excerpt}</p>
                )}
                <div className="mt-auto flex items-center gap-4 border-t pt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="size-3.5" />
                    {p.author?.full_name ?? "UDAN Technology"}
                  </span>
                  {p.published_at && (
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3.5" />
                      {formatDate(p.published_at)}
                    </span>
                  )}
                </div>
                <Button asChild className="mt-2 w-full">
                  <Link href={`/blog/${p.slug}`}>
                    Read Article <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
