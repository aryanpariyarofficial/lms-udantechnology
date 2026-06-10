"use client"

import { useActionState, useState, useTransition } from "react"
import { useFormStatus } from "react-dom"
import Link from "next/link"
import { Loader2, Trash2, ExternalLink, Film } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ImageUpload } from "@/components/cloudinary/image-upload"
import { youtubeThumbnail } from "@/lib/format"
import { updateVideo, deleteVideo, type Result } from "./actions"
import type { Video, VideoKind } from "@/lib/supabase/types"

function SaveButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="size-4 animate-spin" />} Save
    </Button>
  )
}

export function VideoForm({ video, kind }: { video: Video; kind: VideoKind }) {
  const [thumb, setThumb] = useState<string | null>(video.thumbnail_url)
  const [youtube, setYoutube] = useState(video.youtube_url)
  const [, startTransition] = useTransition()
  const action = updateVideo.bind(null, video.id, kind)
  const [state, formAction] = useActionState<Result, FormData>(
    async (_prev, fd) => {
      const res = await action(fd)
      if (res.ok) toast.success("Saved")
      return res
    },
    { ok: true }
  )

  const label = kind === "tutorial" ? "Tutorial" : "Stream"
  const base = kind === "tutorial" ? "/tutorials" : "/streams"
  const autoThumb = youtubeThumbnail(youtube)
  const publishedDate = video.published_at
    ? new Date(video.published_at).toISOString().slice(0, 10)
    : ""

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
              <Input id="title" name="title" defaultValue={video.title} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">URL slug</Label>
              <Input id="slug" name="slug" defaultValue={video.slug} />
              <p className="text-xs text-muted-foreground">
                {base}/<span className="font-medium text-foreground">{video.slug}</span>
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="youtube_url" className="flex items-center gap-1">
                <Film className="size-4 text-red-600" /> YouTube link
              </Label>
              <Input
                id="youtube_url"
                name="youtube_url"
                value={youtube}
                onChange={(e) => setYoutube(e.target.value)}
                placeholder="https://youtube.com/watch?v=…"
                required
              />
              <p className="text-xs text-muted-foreground">
                Thumbnail is auto-pulled from YouTube unless you upload one →
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" rows={6} defaultValue={video.description ?? ""} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" name="category" defaultValue={video.category ?? ""} placeholder="e.g. Web Development" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration_minutes">Duration (min)</Label>
                <Input id="duration_minutes" name="duration_minutes" type="number" min="0" defaultValue={video.duration_minutes} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="published_at">Publish date</Label>
                <Input id="published_at" name="published_at" type="date" defaultValue={publishedDate} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input id="tags" name="tags" defaultValue={video.tags.join(", ")} />
            </div>
            <SaveButton />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                defaultValue={video.status}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Featured image (optional)</Label>
              <ImageUpload value={thumb} onChange={setThumb} />
              <input type="hidden" name="thumbnail_url" value={thumb ?? ""} />
              {!thumb && autoThumb && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Auto from YouTube:</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={autoThumb} alt="YouTube thumbnail" className="w-full rounded-lg border" />
                </div>
              )}
            </div>

            {video.status === "published" && (
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href={`${base}/${video.slug}`} target="_blank">
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
                if (confirm(`Delete this ${label.toLowerCase()}?`)) {
                  startTransition(() => deleteVideo(video.id, kind))
                }
              }}
            >
              <Trash2 className="size-4" /> Delete
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
