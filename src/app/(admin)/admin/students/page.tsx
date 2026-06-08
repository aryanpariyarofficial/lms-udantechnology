import type { Metadata } from "next"

import { getStudents } from "@/lib/queries/admin-extra"
import { getAdminCourses } from "@/lib/queries/admin-courses"
import { getPlansAdmin } from "@/lib/queries/admin-extra"
import { StudentsManager } from "./students-manager"

export const metadata: Metadata = { title: "Students · Admin" }

export default async function AdminStudentsPage() {
  const [students, courses, plans] = await Promise.all([
    getStudents(),
    getAdminCourses(),
    getPlansAdmin(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Students</h1>
        <p className="text-muted-foreground">{students.length} users</p>
      </div>
      <StudentsManager
        students={students}
        courses={courses.map((c) => ({ id: c.id, title: c.title }))}
        plans={plans.map((p) => ({ id: p.id, name: p.name }))}
      />
    </div>
  )
}
