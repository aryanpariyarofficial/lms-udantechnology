import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getAssignmentForLesson } from "@/lib/queries/admin-courses"
import { AssignmentForm } from "./assignment-form"

export const metadata: Metadata = { title: "Assignment · Admin" }

export default async function AssignmentBuilderPage({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }>
}) {
  const { id, lessonId } = await params
  const data = await getAssignmentForLesson(lessonId)
  if (!data) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href={`/admin/courses/${id}`} aria-label="Back">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <h1 className="text-xl font-bold tracking-tight">Assignment: {data.lessonTitle}</h1>
      </div>
      <AssignmentForm assignment={data.assignment} courseId={id} />
    </div>
  )
}
