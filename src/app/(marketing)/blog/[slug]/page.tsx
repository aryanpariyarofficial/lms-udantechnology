import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import {
  ChevronRight,
  Calendar,
  Clock,
  ListTree,
  ArrowLeft,
  ArrowRight,
  Newspaper,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Markdown } from "@/components/blog/markdown"
import { BlogBlocks } from "@/components/blog/blog-blocks"
import { ShareButtons } from "@/components/blog/share-buttons"
import {
  getBlogBySlug,
  getAdjacentPosts,
  getRelatedPosts,
} from "@/lib/queries/blog"
import { extractToc, extractTocFromBlocks, blocksPlainText } from "@/lib/blog-toc"
import { formatDate, initials, readingTime } from "@/lib/format"
import { JsonLd, articleLd } from "@/components/seo/json-ld"
import { SITE } from "@/lib/constants"

type Post = {
  id: string
  title: string
  excerpt: string | null
  content: string | null
  cover_url: string | null
  tags: string[]
  published_at: string | null
  author: { full_name: string | null; avatar_url: string | null } | null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = (await getBlogBySlug(slug)) as Post | null
  if (!post) return { title: "Post not found" }
  return { title: post.title, description: post.excerpt ?? undefined }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = (await getBlogBySlug(slug)) as unknown as Post | null
  if (!post) notFound()

  const [{ prev, next }, related] = await Promise.all([
    getAdjacentPosts(post.published_at),
    getRelatedPosts(post.id, 3),
  ])

  const isJson = !!post.content?.trim().startsWith("[")
  const toc = isJson ? extractTocFromBlocks(post.content) : extractToc(post.content)
  const minutes = readingTime(isJson ? blocksPlainText(post.content) : post.content)
  const authorName = post.author?.full_name ?? "UDAN Technology"
  const url = `${SITE.url}/blog/${slug}`

  return (
    <article className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <JsonLd
        data={articleLd({
          title: post.title,
          excerpt: post.excerpt,
          slug,
          cover: post.cover_url,
          publishedAt: post.published_at,
          author: authorName,
        })}
      />

      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="size-3.5" />
        <Link href="/blog" className="hover:text-foreground">Blog</Link>
      </nav>

      {/* Header */}
      <header className="mx-auto max-w-3xl space-y-4">
        <div className="flex flex-wrap gap-2">
          {post.tags.map((t) => (
            <Badge key={t} variant="secondary">{t}</Badge>
          ))}
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{post.title}</h1>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <Avatar className="size-7">
              <AvatarImage src={post.author?.avatar_url ?? undefined} />
              <AvatarFallback>{initials(authorName)}</AvatarFallback>
            </Avatar>
            <span className="font-medium text-foreground">{authorName}</span>
          </span>
          {post.published_at && (
            <span className="flex items-center gap-1">
              <Calendar className="size-4" /> {formatDate(post.published_at)}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="size-4" /> {minutes} min read
          </span>
        </div>
        <ShareButtons url={url} title={post.title} />
      </header>

      {/* Cover */}
      {post.cover_url && (
        <div className="relative mx-auto mt-8 aspect-[16/8] max-w-4xl overflow-hidden rounded-2xl">
          <Image src={post.cover_url} alt={post.title} fill className="object-cover" sizes="900px" priority />
        </div>
      )}

      {/* Body + TOC */}
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_260px]">
        <div className="min-w-0">
          {!post.content ? (
            <p className="text-muted-foreground">No content.</p>
          ) : isJson ? (
            <BlogBlocks json={post.content} />
          ) : (
            <Markdown content={post.content} />
          )}

          {/* Author byline */}
          <Card className="mt-12">
            <CardContent className="flex items-center gap-4 p-5">
              <Avatar className="size-12">
                <AvatarImage src={post.author?.avatar_url ?? undefined} />
                <AvatarFallback>{initials(authorName)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Written by
                </p>
                <p className="font-semibold">{authorName}</p>
              </div>
            </CardContent>
          </Card>

          {/* Prev / Next */}
          {(prev || next) && (
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {prev ? (
                <Link href={`/blog/${prev.slug}`}>
                  <Card className="h-full transition-colors hover:border-primary">
                    <CardContent className="p-4">
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <ArrowLeft className="size-3.5" /> Previous
                      </p>
                      <p className="mt-1 line-clamp-2 font-medium">{prev.title}</p>
                    </CardContent>
                  </Card>
                </Link>
              ) : (
                <span />
              )}
              {next && (
                <Link href={`/blog/${next.slug}`}>
                  <Card className="h-full transition-colors hover:border-primary">
                    <CardContent className="p-4 text-right">
                      <p className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                        Next <ArrowRight className="size-3.5" />
                      </p>
                      <p className="mt-1 line-clamp-2 font-medium">{next.title}</p>
                    </CardContent>
                  </Card>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* TOC sidebar */}
        {toc.length > 0 && (
          <aside className="hidden lg:block">
            <div className="sticky top-20 rounded-xl border p-4">
              <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <ListTree className="size-4 text-primary" /> Table of Contents
              </p>
              <nav className="space-y-1 text-sm">
                {toc.map((item) => (
                  <a
                    key={item.slug}
                    href={`#${item.slug}`}
                    className={`block rounded px-2 py-1 text-muted-foreground hover:bg-accent hover:text-foreground ${
                      item.level === 3 ? "pl-5 text-xs" : ""
                    }`}
                  >
                    {item.text}
                  </a>
                ))}
              </nav>
            </div>
          </aside>
        )}
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-xl font-bold">Related articles</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <Link key={r.id} href={`/blog/${r.slug}`} className="group block">
                <Card className="h-full overflow-hidden pt-0">
                  <div className="relative aspect-video bg-muted">
                    {r.cover_url ? (
                      <Image src={r.cover_url} alt={r.title} fill className="object-cover" sizes="300px" />
                    ) : (
                      <div className="grid h-full place-items-center bg-gradient-to-br from-violet-500 to-indigo-600">
                        <Newspaper className="size-8 text-white/80" />
                      </div>
                    )}
                  </div>
                  <CardContent className="px-4 pb-4">
                    <h3 className="line-clamp-2 text-sm font-semibold group-hover:text-primary">
                      {r.title}
                    </h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  )
}
