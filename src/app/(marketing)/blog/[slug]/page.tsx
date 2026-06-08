import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ArrowLeft } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { getBlogBySlug } from "@/lib/queries/blog"
import { formatDate, initials } from "@/lib/format"
import { JsonLd, articleLd } from "@/components/seo/json-ld"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = (await getBlogBySlug(slug)) as { title: string; excerpt: string | null } | null
  if (!post) return { title: "Post not found" }
  return { title: post.title, description: post.excerpt ?? undefined }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = (await getBlogBySlug(slug)) as unknown as {
    title: string
    excerpt: string | null
    content: string | null
    cover_url: string | null
    tags: string[]
    published_at: string | null
    author: { full_name: string | null; avatar_url: string | null } | null
  } | null

  if (!post) notFound()

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <JsonLd
        data={articleLd({
          title: post.title,
          excerpt: post.excerpt,
          slug,
          cover: post.cover_url,
          publishedAt: post.published_at,
          author: post.author?.full_name ?? "UDAN Technology",
        })}
      />
      <Link
        href="/blog"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> All posts
      </Link>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {post.tags.map((t) => (
            <Badge key={t} variant="secondary">{t}</Badge>
          ))}
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{post.title}</h1>
        <div className="flex items-center gap-3">
          <Avatar className="size-9">
            <AvatarImage src={post.author?.avatar_url ?? undefined} />
            <AvatarFallback>{initials(post.author?.full_name)}</AvatarFallback>
          </Avatar>
          <div className="text-sm">
            <p className="font-medium">{post.author?.full_name ?? "UDAN Technology"}</p>
            {post.published_at && (
              <p className="text-muted-foreground">{formatDate(post.published_at)}</p>
            )}
          </div>
        </div>
      </div>

      {post.cover_url && (
        <div className="relative mt-8 aspect-video overflow-hidden rounded-xl">
          <Image src={post.cover_url} alt={post.title} fill className="object-cover" sizes="768px" />
        </div>
      )}

      <div className="prose prose-neutral mt-8 max-w-none whitespace-pre-line leading-relaxed">
        {post.content}
      </div>
    </article>
  )
}
