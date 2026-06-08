import { redirect, notFound } from "next/navigation"
import type { Metadata } from "next"

import { requireUser } from "@/lib/auth"
import { checkCourseAccess } from "@/lib/queries/courses"
import { getLearnData } from "@/lib/queries/learn"
import { CoursePlayer } from "./player"

export const metadata: Metadata = { title: "Learning" }

export default async function LearnPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params
  const { user } = await requireUser(`/learn/${courseId}`)

  const hasAccess = await checkCourseAccess(courseId)
  if (!hasAccess) {
    // Not enrolled — send them to the course page to enroll.
    const data = await getLearnData(courseId, user.id)
    if (data) redirect(`/courses/${data.course.slug}`)
    redirect("/courses")
  }

  const data = await getLearnData(courseId, user.id)
  if (!data) notFound()

  return <CoursePlayer data={data} />
}
