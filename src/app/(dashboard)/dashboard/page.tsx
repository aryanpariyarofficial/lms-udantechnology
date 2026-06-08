import Link from "next/link"
import type { Metadata } from "next"
import { BookOpen, Award, Crown, ArrowRight, GraduationCap } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { requireUser } from "@/lib/auth"
import {
  getMyEnrollments,
  getMyMembership,
  getMyCertificates,
} from "@/lib/queries/dashboard"
import { formatDate } from "@/lib/format"

export const metadata: Metadata = { title: "Dashboard" }

export default async function DashboardOverview() {
  const { user, profile } = await requireUser()
  const [enrollments, membership, certificates] = await Promise.all([
    getMyEnrollments(user.id),
    getMyMembership(user.id),
    getMyCertificates(user.id),
  ])

  const inProgress = enrollments.filter((e) => e.progress > 0 && e.progress < 100)
  const continueCourse = inProgress[0] ?? enrollments[0]

  const stats = [
    { label: "Active courses", value: enrollments.length, icon: BookOpen },
    { label: "Certificates", value: certificates.length, icon: Award },
    {
      label: "Membership",
      value: membership ? "Active" : "None",
      icon: Crown,
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {profile?.full_name?.split(" ")[0] ?? "learner"} 👋
        </h1>
        <p className="text-muted-foreground">Here&apos;s your learning at a glance.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <s.icon className="size-5" />
              </span>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Continue learning */}
      {continueCourse ? (
        <Card>
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1 space-y-2">
              <Badge variant="secondary">Continue learning</Badge>
              <h2 className="truncate text-lg font-semibold">{continueCourse.title}</h2>
              <div className="flex items-center gap-3">
                <Progress value={continueCourse.progress} className="h-2 max-w-xs" />
                <span className="text-sm text-muted-foreground">
                  {Math.round(continueCourse.progress)}%
                </span>
              </div>
            </div>
            <Button asChild>
              <Link href={`/learn/${continueCourse.course_id}`}>
                Resume <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
              <GraduationCap className="size-6" />
            </span>
            <p className="font-medium">You haven&apos;t enrolled in any course yet</p>
            <p className="text-sm text-muted-foreground">
              Browse our catalog and start learning today.
            </p>
            <Button asChild className="mt-2">
              <Link href="/courses">Browse courses</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* My courses preview */}
      {enrollments.length > 0 && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">My courses</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/courses">View all</Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {enrollments.slice(0, 3).map((e) => (
              <Link key={e.course_id} href={`/learn/${e.course_id}`}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardContent className="space-y-3 p-5">
                    <h3 className="line-clamp-2 font-medium">{e.title}</h3>
                    <Progress value={e.progress} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {Math.round(e.progress)}% complete
                      {e.expires_at
                        ? ` · expires ${formatDate(e.expires_at)}`
                        : " · lifetime access"}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
