import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getQuizForLesson } from "@/lib/queries/admin-courses"
import { QuizBuilder } from "./quiz-builder"

export const metadata: Metadata = { title: "Quiz builder · Admin" }

export default async function QuizBuilderPage({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }>
}) {
  const { id, lessonId } = await params
  const data = await getQuizForLesson(lessonId)
  if (!data) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href={`/admin/courses/${id}`} aria-label="Back">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Quiz: {data.lessonTitle}</h1>
          <p className="text-sm text-muted-foreground">Build questions and grading rules.</p>
        </div>
      </div>
      <QuizBuilder quiz={data.quiz} questions={data.questions} courseId={id} />
    </div>
  )
}
