import Link from "next/link"
import Image from "next/image"
import type { Metadata } from "next"
import { Newspaper } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getPublishedBlogs } from "@/lib/queries/blog"
import { formatDate } from "@/lib/format"

export const metadata: Metadata = {
  title: "Blog",
  description: "Tips, tutorials, and stories on learning skills for the Nepali market.",
}

export default async function BlogPage() {
  const posts = await getPublishedBlogs()

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Blog</h1>
        <p className="mt-2 text-muted-foreground">
          Tips, tutorials, and stories to help you grow.
        </p>
      </div>

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
            <Link key={p.id} href={`/blog/${p.slug}`} className="group">
              <Card className="h-full overflow-hidden pt-0 transition-shadow hover:shadow-md">
                <div className="relative aspect-video bg-muted">
                  {p.cover_url ? (
                    <Image src={p.cover_url} alt={p.title} fill className="object-cover" sizes="400px" />
                  ) : (
                    <div className="grid h-full place-items-center bg-gradient-to-br from-violet-500 to-indigo-600">
                      <Newspaper className="size-10 text-white/80" />
                    </div>
                  )}
                </div>
                <CardContent className="space-y-2 px-5 pb-5">
                  {p.published_at && (
                    <p className="text-xs text-muted-foreground">{formatDate(p.published_at)}</p>
                  )}
                  <h2 className="line-clamp-2 font-semibold group-hover:text-primary">{p.title}</h2>
                  {p.excerpt && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">{p.excerpt}</p>
                  )}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {p.tags.slice(0, 3).map((t) => (
                      <Badge key={t} variant="secondary" className="font-normal">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
