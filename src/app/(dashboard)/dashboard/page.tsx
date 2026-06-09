import Link from "next/link"
import type { Metadata } from "next"
import {
  BookOpen,
  Award,
  Zap,
  ArrowRight,
  GraduationCap,
  CheckCircle2,
  Trophy,
  PlayCircle,
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { requireUser } from "@/lib/auth"
import {
  getMyEnrollments,
  getMyMembership,
  getMyCertificates,
  getLearningStats,
} from "@/lib/queries/dashboard"

export const metadata: Metadata = { title: "Dashboard" }

export default async function DashboardOverview() {
  const { user, profile } = await requireUser()
  const [enrollments, membership, certificates, stats] = await Promise.all([
    getMyEnrollments(user.id),
    getMyMembership(user.id),
    getMyCertificates(user.id),
    getLearningStats(user.id),
  ])

  const firstName = profile?.full_name?.split(" ")[0] ?? "learner"
  const inProgress = enrollments.filter((e) => e.progress > 0 && e.progress < 100)
  const continueCourse = inProgress[0] ?? enrollments[0]
  const overall =
    enrollments.length > 0
      ? Math.round(
          enrollments.reduce((s, e) => s + e.progress, 0) / enrollments.length
        )
      : 0

  const xp = stats.completedLessons * 50
  const level = Math.floor(xp / 500) + 1

  const statCards = [
    {
      label: "Active courses",
      value: String(enrollments.length),
      sub: `${certificates.length} completed`,
      icon: BookOpen,
      tint: "bg-primary/10 text-primary",
    },
    {
      label: "Lessons done",
      value: String(stats.completedLessons),
      sub: "Core learning modules",
      icon: CheckCircle2,
      tint: "bg-success/10 text-success",
    },
    {
      label: "Certificates",
      value: String(certificates.length),
      sub: membership ? "Membership active" : "Keep learning",
      icon: Award,
      tint: "bg-amber-500/10 text-amber-600",
    },
    {
      label: "Academic level",
      value: `Level ${level}`,
      sub: `${xp} XP earned`,
      icon: Zap,
      tint: "bg-violet-500/10 text-violet-600",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-indigo-700 p-6 text-primary-foreground sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.18),transparent_45%)]" />
        <div className="relative flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold sm:text-3xl">
              Welcome back, {firstName}! 🎓
            </h1>
            <p className="max-w-xl text-sm text-primary-foreground/85 sm:text-base">
              {stats.completedLessons > 0
                ? `You've finished ${stats.completedLessons} lesson${
                    stats.completedLessons === 1 ? "" : "s"
                  } so far. ${
                    inProgress.length > 0
                      ? `${inProgress.length} course${
                          inProgress.length === 1 ? " is" : "s are"
                        } in progress — keep the momentum going!`
                      : "Great work — start a new course to keep growing!"
                  }`
                : "Stay on top of your learning. Browse courses and start your journey today!"}
            </p>
          </div>
          <GraduationCap className="hidden size-16 shrink-0 text-primary-foreground/30 sm:block" />
        </div>
      </div>

      {/* Continue learning reminder */}
      {continueCourse && (
        <Card className="border-primary/30">
          <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <PlayCircle className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Continue learning
                </p>
                <p className="truncate font-semibold">{continueCourse.title}</p>
                <div className="mt-1 flex items-center gap-2">
                  <Progress value={continueCourse.progress} className="h-1.5 w-40" />
                  <span className="text-xs text-muted-foreground">
                    {Math.round(continueCourse.progress)}%
                  </span>
                </div>
              </div>
            </div>
            <Button asChild className="shrink-0">
              <Link href={`/learn/${continueCourse.course_id}`}>
                Resume <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className={`grid size-10 place-items-center rounded-xl ${s.tint}`}>
                  <s.icon className="size-5" />
                </span>
              </div>
              <p className="mt-3 text-2xl font-bold">{s.value}</p>
              <p className="text-sm font-medium">{s.label}</p>
              <p className="text-xs text-muted-foreground">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Learning progress */}
      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="size-5 text-amber-500" />
              <h2 className="font-semibold">Learning progress</h2>
            </div>
            <Badge className="bg-primary">{overall}% Completed</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Your overall progress across {enrollments.length} enrolled course
            {enrollments.length === 1 ? "" : "s"}.
          </p>
          <Progress value={overall} className="h-3" />
        </CardContent>
      </Card>

      {/* My courses */}
      {enrollments.length > 0 ? (
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
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
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
    </div>
  )
}
