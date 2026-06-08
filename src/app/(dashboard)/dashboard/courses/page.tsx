import Link from "next/link"
import type { Metadata } from "next"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { requireUser } from "@/lib/auth"
import { getMyEnrollments } from "@/lib/queries/dashboard"
import { formatDate } from "@/lib/format"

export const metadata: Metadata = { title: "My Courses" }

export default async function MyCoursesPage() {
  const { user } = await requireUser()
  const enrollments = await getMyEnrollments(user.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Courses</h1>
        <p className="text-muted-foreground">
          {enrollments.length} enrolled course{enrollments.length === 1 ? "" : "s"}
        </p>
      </div>

      {enrollments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <p className="font-medium">No courses yet</p>
            <Button asChild>
              <Link href="/courses">Browse courses</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((e) => (
            <Card key={e.course_id} className="flex flex-col">
              <CardContent className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="line-clamp-2 font-semibold">{e.title}</h3>
                  <Badge variant="secondary" className="shrink-0 capitalize">
                    {e.source}
                  </Badge>
                </div>
                <Progress value={e.progress} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {Math.round(e.progress)}% complete ·{" "}
                  {e.expires_at ? `expires ${formatDate(e.expires_at)}` : "lifetime access"}
                </p>
                <Button asChild className="mt-auto">
                  <Link href={`/learn/${e.course_id}`}>
                    {e.progress > 0 ? "Continue" : "Start learning"}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
