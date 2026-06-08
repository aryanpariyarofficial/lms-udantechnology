"use client"

import { useActionState, useState, useTransition } from "react"
import { useFormStatus } from "react-dom"
import { useRouter } from "next/navigation"
import { Loader2, Eye, EyeOff, Trash2, ExternalLink } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ImageUpload } from "@/components/cloudinary/image-upload"
import { updateCourse, setCourseStatus, deleteCourse, type ActionResult } from "../actions"
import type { Course } from "@/lib/supabase/types"

function SaveButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="size-4 animate-spin" />}
      Save details
    </Button>
  )
}

export function CourseForm({
  course,
  categories,
}: {
  course: Course
  categories: { id: string; name: string }[]
}) {
  const router = useRouter()
  const [thumb, setThumb] = useState<string | null>(course.thumbnail_url)
  const [pending, startTransition] = useTransition()

  const [state, formAction] = useActionState<ActionResult, FormData>(
    async (_prev, fd) => {
      const res = await updateCourse(course.id, fd)
      if (res.ok) toast.success("Course saved")
      return res
    },
    { ok: true }
  )

  const isPublished = course.status === "published"

  function togglePublish() {
    startTransition(async () => {
      const res = await setCourseStatus(course.id, isPublished ? "draft" : "published")
      if (res.ok) {
        toast.success(isPublished ? "Unpublished" : "Published")
        router.refresh()
      } else toast.error(res.error ?? "Failed")
    })
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold">Course details</h2>
          <Badge variant={isPublished ? "default" : "secondary"} className="capitalize">
            {course.status}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {isPublished && (
            <Button asChild variant="ghost" size="sm">
              <Link href={`/courses/${course.slug}`} target="_blank">
                <ExternalLink className="size-4" /> View
              </Link>
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={togglePublish} disabled={pending}>
            {isPublished ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            {isPublished ? "Unpublish" : "Publish"}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-destructive">
                <Trash2 className="size-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this course?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently deletes the course and all its modules, lessons,
                  enrollments, and progress. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => startTransition(() => deleteCourse(course.id))}
                  className="bg-destructive text-white hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>

      <CardContent>
        <form action={formAction} className="grid gap-5 lg:grid-cols-3">
          {/* Left: fields */}
          <div className="space-y-4 lg:col-span-2">
            {state.error && (
              <Alert variant="destructive">
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" defaultValue={course.title} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input id="subtitle" name="subtitle" defaultValue={course.subtitle ?? ""} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                rows={4}
                defaultValue={course.description ?? ""}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category_id">Category</Label>
                <select
                  id="category_id"
                  name="category_id"
                  defaultValue={course.category_id ?? ""}
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                >
                  <option value="">Uncategorized</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="level">Level</Label>
                <select
                  id="level"
                  name="level"
                  defaultValue={course.level}
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                >
                  <option value="all_levels">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="price">Price (Rs)</Label>
                <Input id="price" name="price" type="number" min="0" defaultValue={course.price} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount_price">Original price</Label>
                <Input
                  id="discount_price"
                  name="discount_price"
                  type="number"
                  min="0"
                  defaultValue={course.discount_price ?? ""}
                  placeholder="for strikethrough"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration_minutes">Duration (min)</Label>
                <Input
                  id="duration_minutes"
                  name="duration_minutes"
                  type="number"
                  min="0"
                  defaultValue={course.duration_minutes}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Input id="language" name="language" defaultValue={course.language} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trailer_url">Trailer (YouTube URL)</Label>
                <Input id="trailer_url" name="trailer_url" defaultValue={course.trailer_url ?? ""} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="what_you_learn">What you&apos;ll learn (one per line)</Label>
              <Textarea
                id="what_you_learn"
                name="what_you_learn"
                rows={4}
                defaultValue={course.what_you_learn.join("\n")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements (one per line)</Label>
              <Textarea
                id="requirements"
                name="requirements"
                rows={3}
                defaultValue={course.requirements.join("\n")}
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch id="is_featured" name="is_featured" defaultChecked={course.is_featured} />
              <Label htmlFor="is_featured">Feature on homepage</Label>
            </div>

            <SaveButton />
          </div>

          {/* Right: thumbnail */}
          <div className="space-y-2">
            <Label>Thumbnail</Label>
            <ImageUpload value={thumb} onChange={setThumb} />
            <input type="hidden" name="thumbnail_url" value={thumb ?? ""} />
            <p className="text-xs text-muted-foreground">
              16:9 image. Uploaded to Cloudinary.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
