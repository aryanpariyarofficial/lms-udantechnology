import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getAdminCourse, getCategoryOptions } from "@/lib/queries/admin-courses"
import { CourseForm } from "./course-form"
import { CurriculumBuilder } from "./curriculum-builder"

export const metadata: Metadata = { title: "Edit course · Admin" }

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [course, categories] = await Promise.all([
    getAdminCourse(id),
    getCategoryOptions(),
  ])
  if (!course) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href="/admin/courses" aria-label="Back">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <h1 className="text-xl font-bold tracking-tight">{course.title}</h1>
      </div>

      <CourseForm course={course} categories={categories} />
      <CurriculumBuilder courseId={course.id} modules={course.modules} />
    </div>
  )
}
