import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getAdminBlog } from "@/lib/queries/blog"
import { BlogForm } from "./blog-form"

export const metadata: Metadata = { title: "Edit post · Admin" }

export default async function EditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const post = await getAdminBlog(id)
  if (!post) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href="/admin/blog" aria-label="Back">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <h1 className="text-xl font-bold tracking-tight">{post.title}</h1>
      </div>
      <BlogForm post={post} />
    </div>
  )
}
