"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Plus,
  Trash2,
  GripVertical,
  PlayCircle,
  FileText,
  HelpCircle,
  ClipboardList,
  Download,
  Loader2,
  Lock,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FileUpload } from "@/components/cloudinary/file-upload"
import { formatDuration } from "@/lib/format"
import type { Module, Lesson, LessonType } from "@/lib/supabase/types"
import { addModule, deleteModule, addLesson, deleteLesson } from "../actions"

const ICON: Record<string, typeof PlayCircle> = {
  video: PlayCircle,
  pdf: FileText,
  text: FileText,
  quiz: HelpCircle,
  assignment: ClipboardList,
  file: Download,
}

export function CurriculumBuilder({
  courseId,
  modules,
}: {
  courseId: string
  modules: (Module & { lessons: Lesson[] })[]
}) {
  const router = useRouter()
  const [newModule, setNewModule] = useState("")
  const [pending, startTransition] = useTransition()

  function onAddModule() {
    if (!newModule.trim()) return
    startTransition(async () => {
      const res = await addModule(courseId, newModule.trim())
      if (res.ok) {
        setNewModule("")
        router.refresh()
      } else toast.error(res.error ?? "Failed")
    })
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="font-semibold">Curriculum</h2>
        <p className="text-sm text-muted-foreground">
          Organize content into modules and lessons.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {modules.length === 0 && (
          <p className="text-sm text-muted-foreground">No modules yet. Add one below.</p>
        )}

        {modules.map((mod) => (
          <div key={mod.id} className="rounded-lg border">
            <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-3">
              <GripVertical className="size-4 text-muted-foreground" />
              <span className="flex-1 font-medium">{mod.title}</span>
              <Badge variant="secondary">{mod.lessons.length} lessons</Badge>
              <AddLessonDialog courseId={courseId} moduleId={mod.id} />
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive"
                onClick={() =>
                  startTransition(async () => {
                    const res = await deleteModule(mod.id, courseId)
                    if (res.ok) router.refresh()
                  })
                }
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
            <ul className="divide-y">
              {mod.lessons.map((lesson) => {
                const Icon = ICON[lesson.type] ?? PlayCircle
                return (
                  <li key={lesson.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                    <Icon className="size-4 text-muted-foreground" />
                    <span className="flex-1">{lesson.title}</span>
                    {lesson.is_preview && <Badge variant="outline" className="text-xs">Preview</Badge>}
                    {!lesson.is_preview && <Lock className="size-3 text-muted-foreground" />}
                    {lesson.duration_seconds > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {formatDuration(lesson.duration_seconds)}
                      </span>
                    )}
                    {lesson.type === "quiz" && (
                      <Button asChild size="sm" variant="outline" className="h-7">
                        <Link href={`/admin/courses/${courseId}/quiz/${lesson.id}`}>Build quiz</Link>
                      </Button>
                    )}
                    {lesson.type === "assignment" && (
                      <Button asChild size="sm" variant="outline" className="h-7">
                        <Link href={`/admin/courses/${courseId}/assignment/${lesson.id}`}>Setup</Link>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-destructive"
                      onClick={() =>
                        startTransition(async () => {
                          const res = await deleteLesson(lesson.id, courseId)
                          if (res.ok) router.refresh()
                        })
                      }
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </li>
                )
              })}
              {mod.lessons.length === 0 && (
                <li className="px-4 py-3 text-xs text-muted-foreground">No lessons yet.</li>
              )}
            </ul>
          </div>
        ))}

        {/* Add module */}
        <div className="flex items-center gap-2 pt-2">
          <Input
            value={newModule}
            onChange={(e) => setNewModule(e.target.value)}
            placeholder="New module title (e.g. Getting Started)"
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), onAddModule())}
          />
          <Button onClick={onAddModule} disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            Module
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function AddLessonDialog({ courseId, moduleId }: { courseId: string; moduleId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [type, setType] = useState<LessonType>("video")
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null)

  function submit(formData: FormData) {
    const title = String(formData.get("title") ?? "").trim()
    if (!title) return
    if ((type === "pdf" || type === "file") && !attachmentUrl) {
      toast.error("Please upload the file first.")
      return
    }
    const durationMin = Number(formData.get("duration_minutes") ?? 0)
    startTransition(async () => {
      const res = await addLesson({
        courseId,
        moduleId,
        title,
        type,
        video_url: String(formData.get("video_url") ?? ""),
        content: String(formData.get("content") ?? ""),
        attachment_url: attachmentUrl ?? "",
        duration_seconds: Math.round(durationMin * 60),
        is_preview: formData.get("is_preview") === "on",
      })
      if (res.ok) {
        setOpen(false)
        setAttachmentUrl(null)
        router.refresh()
      } else toast.error(res.error ?? "Failed")
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="size-4" /> Lesson
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add lesson</DialogTitle>
        </DialogHeader>
        <form action={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="l-title">Title</Label>
            <Input id="l-title" name="title" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="l-type">Type</Label>
              <select
                id="l-type"
                value={type}
                onChange={(e) => setType(e.target.value as LessonType)}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="video">Video</option>
                <option value="text">Text / Article</option>
                <option value="pdf">PDF</option>
                <option value="file">Downloadable file</option>
                <option value="quiz">Quiz</option>
                <option value="assignment">Assignment</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="l-duration">Duration (min)</Label>
              <Input id="l-duration" name="duration_minutes" type="number" min="0" defaultValue={0} />
            </div>
          </div>

          {type === "video" && (
            <div className="space-y-2">
              <Label htmlFor="l-video">YouTube URL or ID</Label>
              <Input id="l-video" name="video_url" placeholder="https://youtube.com/watch?v=..." />
            </div>
          )}
          {(type === "text") && (
            <div className="space-y-2">
              <Label htmlFor="l-content">Content</Label>
              <Textarea id="l-content" name="content" rows={4} />
            </div>
          )}
          {(type === "pdf" || type === "file") && (
            <div className="space-y-2">
              <Label>{type === "pdf" ? "PDF file" : "Downloadable file"}</Label>
              <FileUpload
                value={attachmentUrl}
                onChange={setAttachmentUrl}
                accept={type === "pdf" ? ".pdf" : undefined}
              />
            </div>
          )}

          <div className="flex items-center gap-3">
            <Switch id="l-preview" name="is_preview" />
            <Label htmlFor="l-preview">Free preview</Label>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="size-4 animate-spin" />}
              Add lesson
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
