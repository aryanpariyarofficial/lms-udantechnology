"use client"

import { useMemo, useState, useTransition } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Circle,
  PlayCircle,
  FileText,
  HelpCircle,
  ClipboardList,
  Download,
  Menu,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { youtubeEmbedUrl, formatDuration } from "@/lib/format"
import type { LearnData, LearnLesson } from "@/lib/queries/learn"
import { toggleLessonComplete } from "./actions"
import { QuizRunner } from "./quiz-runner"
import { AssignmentSubmit } from "./assignment-submit"

const ICON: Record<string, typeof PlayCircle> = {
  video: PlayCircle,
  pdf: FileText,
  text: FileText,
  quiz: HelpCircle,
  assignment: ClipboardList,
  file: Download,
}

export function CoursePlayer({ data }: { data: LearnData }) {
  const allLessons = useMemo(
    () => data.modules.flatMap((m) => m.lessons),
    [data.modules]
  )
  const [completed, setCompleted] = useState<Record<string, boolean>>(
    Object.fromEntries(allLessons.map((l) => [l.id, l.completed]))
  )
  const firstIncomplete = allLessons.find((l) => !l.completed) ?? allLessons[0]
  const [currentId, setCurrentId] = useState<string | null>(firstIncomplete?.id ?? null)
  const [pending, startTransition] = useTransition()

  const current = allLessons.find((l) => l.id === currentId) ?? null
  const completedCount = Object.values(completed).filter(Boolean).length
  const progress = allLessons.length
    ? Math.round((completedCount / allLessons.length) * 100)
    : 0

  function toggle(lesson: LearnLesson) {
    const next = !completed[lesson.id]
    setCompleted((c) => ({ ...c, [lesson.id]: next }))
    startTransition(async () => {
      const res = await toggleLessonComplete(lesson.id, data.course.id, next)
      if (!res.ok) {
        setCompleted((c) => ({ ...c, [lesson.id]: !next }))
        toast.error(res.error ?? "Could not update progress")
      } else if (res.certificateIssued) {
        toast.success("🎉 Course complete! Your certificate has been issued.")
      }
    })
  }

  function markComplete(lesson: LearnLesson) {
    if (completed[lesson.id]) return
    setCompleted((c) => ({ ...c, [lesson.id]: true }))
    startTransition(async () => {
      const res = await toggleLessonComplete(lesson.id, data.course.id, true)
      if (res.certificateIssued)
        toast.success("🎉 Course complete! Your certificate has been issued.")
    })
  }

  const Sidebar = (
    <div className="flex h-full flex-col">
      <div className="border-b p-4">
        <p className="text-sm font-semibold">Course content</p>
        <div className="mt-2 flex items-center gap-2">
          <Progress value={progress} className="h-2" />
          <span className="text-xs text-muted-foreground">{progress}%</span>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2">
          {data.modules.map((mod) => (
            <div key={mod.id} className="mb-2">
              <p className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {mod.title}
              </p>
              {mod.lessons.map((lesson) => {
                const Icon = ICON[lesson.type] ?? PlayCircle
                const isCurrent = lesson.id === currentId
                const done = completed[lesson.id]
                return (
                  <button
                    key={lesson.id}
                    onClick={() => setCurrentId(lesson.id)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors",
                      isCurrent ? "bg-accent" : "hover:bg-accent/60"
                    )}
                  >
                    {done ? (
                      <CheckCircle2 className="size-4 shrink-0 text-success" />
                    ) : (
                      <Circle className="size-4 shrink-0 text-muted-foreground" />
                    )}
                    <Icon className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="flex-1 line-clamp-2">{lesson.title}</span>
                    {lesson.duration_seconds > 0 && (
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatDuration(lesson.duration_seconds)}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )

  return (
    <div className="flex h-svh flex-col">
      {/* Top bar */}
      <header className="flex h-14 shrink-0 items-center gap-3 border-b px-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/dashboard/courses" aria-label="Back">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <h1 className="line-clamp-1 flex-1 font-semibold">{data.course.title}</h1>
        <span className="hidden text-sm text-muted-foreground sm:inline">
          {completedCount}/{allLessons.length} complete
        </span>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 p-0">
            <SheetTitle className="sr-only">Course content</SheetTitle>
            {Sidebar}
          </SheetContent>
        </Sheet>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Main */}
        <main className="min-w-0 flex-1 overflow-y-auto">
          {current ? (
            <div>
              {/* Video area (only for video lessons) */}
              {current.type === "video" &&
                (youtubeEmbedUrl(current.video_url) ? (
                  <div className="aspect-video w-full bg-black">
                    <iframe
                      key={current.id}
                      src={youtubeEmbedUrl(current.video_url)!}
                      title={current.title}
                      className="size-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="grid aspect-video w-full place-items-center bg-muted">
                    <PlayCircle className="size-12 text-muted-foreground" />
                  </div>
                ))}

              <div className="mx-auto max-w-3xl space-y-6 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Badge variant="secondary" className="mb-2 capitalize">
                      {current.type}
                    </Badge>
                    <h2 className="text-xl font-bold">{current.title}</h2>
                  </div>
                  <Button
                    onClick={() => toggle(current)}
                    variant={completed[current.id] ? "outline" : "default"}
                    disabled={pending}
                  >
                    {pending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Check className="size-4" />
                    )}
                    {completed[current.id] ? "Completed" : "Mark complete"}
                  </Button>
                </div>

                {current.content && (
                  <div className="prose prose-sm max-w-none whitespace-pre-line text-muted-foreground">
                    {current.content}
                  </div>
                )}

                {current.attachment_url && (
                  <Button asChild variant="outline">
                    <a href={current.attachment_url} target="_blank" rel="noreferrer">
                      <Download className="size-4" /> Download resource
                    </a>
                  </Button>
                )}

                {/* Quiz */}
                {current.type === "quiz" &&
                  (current.quizId ? (
                    <QuizRunner quizId={current.quizId} onPassed={() => markComplete(current)} />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      This quiz hasn&apos;t been set up yet.
                    </p>
                  ))}

                {/* Assignment */}
                {current.type === "assignment" &&
                  (current.assignmentId ? (
                    <AssignmentSubmit
                      assignmentId={current.assignmentId}
                      courseId={data.course.id}
                      onSubmitted={() => markComplete(current)}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      This assignment hasn&apos;t been set up yet.
                    </p>
                  ))}
              </div>
            </div>
          ) : (
            <div className="grid h-full place-items-center text-muted-foreground">
              No lessons available yet.
            </div>
          )}
        </main>

        {/* Desktop sidebar */}
        <aside className="hidden w-80 shrink-0 border-l lg:block">{Sidebar}</aside>
      </div>
    </div>
  )
}
