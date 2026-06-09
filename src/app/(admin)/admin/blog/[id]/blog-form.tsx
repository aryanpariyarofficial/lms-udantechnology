"use client"

import { useActionState, useState, useTransition } from "react"
import { useFormStatus } from "react-dom"
import dynamic from "next/dynamic"
import Link from "next/link"
import { Loader2, Trash2, ExternalLink } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ImageUpload } from "@/components/cloudinary/image-upload"
import { updateBlog, deleteBlog, type Result } from "../actions"
import type { Blog } from "@/lib/supabase/types"

// Block editor is client/DOM-only — load without SSR.
const BlockEditor = dynamic(
  () => import("@/components/blog/block-editor").then((m) => m.BlockEditor),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-40 place-items-center rounded-lg border text-sm text-muted-foreground">
        Loading editor…
      </div>
    ),
  }
)

function SaveButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="size-4 animate-spin" />}
      Save post
    </Button>
  )
}

export function BlogForm({ post }: { post: Blog }) {
  const [cover, setCover] = useState<string | null>(post.cover_url)
  const [content, setContent] = useState(post.content ?? "")
  const [, startTransition] = useTransition()
  const [state, formAction] = useActionState<Result, FormData>(
    async (_prev, fd) => {
      const res = await updateBlog(post.id, fd)
      if (res.ok) toast.success("Post saved")
      return res
    },
    { ok: true }
  )

  return (
    <Card>
      <CardContent className="p-6">
        <form action={formAction} className="grid gap-5 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {state.error && (
              <Alert variant="destructive">
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" defaultValue={post.title} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">URL slug</Label>
              <Input id="slug" name="slug" defaultValue={post.slug} />
              <p className="text-xs text-muted-foreground">
                /blog/<span className="font-medium text-foreground">{post.slug}</span>
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Input id="excerpt" name="excerpt" defaultValue={post.excerpt ?? ""} />
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <input type="hidden" name="content" value={content} />
              <BlockEditor initialContent={post.content ?? ""} onChange={setContent} />
              <p className="text-xs text-muted-foreground">
                Type <code className="rounded bg-muted px-1">/</code> for blocks —
                headings, lists, quote, code, image, table, and{" "}
                <strong>CTA blocks</strong> (Course Card, Button, Contact). Click a CTA
                block to edit its settings. Drag ⠿ to reorder.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input id="tags" name="tags" defaultValue={post.tags.join(", ")} />
            </div>
            <SaveButton />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                defaultValue={post.status}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Cover image</Label>
              <ImageUpload value={cover} onChange={setCover} />
              <input type="hidden" name="cover_url" value={cover ?? ""} />
            </div>
            {post.status === "published" && (
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href={`/blog/${post.slug}`} target="_blank">
                  <ExternalLink className="size-4" /> View live
                </Link>
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full text-destructive"
              onClick={() => {
                if (confirm("Delete this post?")) {
                  startTransition(() => deleteBlog(post.id))
                }
              }}
            >
              <Trash2 className="size-4" /> Delete post
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
