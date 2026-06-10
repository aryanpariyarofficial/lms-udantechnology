import Link from "next/link"
import type { Metadata } from "next"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  CourseCard,
  sampleToCardData,
  toCardData,
  type CourseCardData,
} from "@/components/marketing/course-card"
import { CourseSearch } from "@/components/marketing/course-search"
import { listCourses } from "@/lib/queries/courses"
import { SAMPLE_COURSES } from "@/lib/sample-data"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "All Courses",
  description:
    "Browse project-based courses in web development, AI, design, marketing and more.",
  alternates: { canonical: "/courses" },
}

const CATEGORIES = [
  { name: "All", slug: "" },
  { name: "Web Development", slug: "web-development" },
  { name: "AI", slug: "ai" },
  { name: "Graphic Design", slug: "graphic-design" },
  { name: "Video Editing", slug: "video-editing" },
  { name: "Digital Marketing", slug: "digital-marketing" },
  { name: "Business", slug: "business" },
  { name: "Programming", slug: "programming" },
]

const LEVELS = [
  { name: "All levels", slug: "" },
  { name: "Beginner", slug: "beginner" },
  { name: "Intermediate", slug: "intermediate" },
  { name: "Advanced", slug: "advanced" },
]

const SORTS = [
  { name: "Newest", slug: "" },
  { name: "Price: Low to High", slug: "price_asc" },
  { name: "Price: High to Low", slug: "price_desc" },
]

function buildHref(base: Record<string, string | undefined>, patch: Record<string, string>) {
  const params = new URLSearchParams()
  const merged = { ...base, ...patch }
  for (const [k, v] of Object.entries(merged)) {
    if (v) params.set(k, v)
  }
  const qs = params.toString()
  return `/courses${qs ? `?${qs}` : ""}`
}

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string
    level?: string
    sort?: string
    search?: string
  }>
}) {
  const sp = await searchParams
  const filters = {
    category: sp.category,
    level: sp.level,
    sort: (sp.sort as "price_asc" | "price_desc" | undefined) ?? undefined,
    search: sp.search,
  }

  const db = await listCourses(filters)

  // Fallback to sample data (filtered client-side) when DB has none.
  let courses: CourseCardData[]
  if (db.length > 0) {
    courses = db.map(toCardData)
  } else {
    courses = SAMPLE_COURSES.filter((c) => {
      if (sp.category && c.category.toLowerCase().replace(/\s+/g, "-") !== sp.category)
        return false
      if (sp.level && c.level !== sp.level) return false
      if (sp.search && !c.title.toLowerCase().includes(sp.search.toLowerCase()))
        return false
      return true
    }).map(sampleToCardData)
    if (sp.sort === "price_asc") courses.sort((a, b) => a.price - b.price)
    if (sp.sort === "price_desc") courses.sort((a, b) => b.price - a.price)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">All Courses</h1>
        <p className="mt-2 text-muted-foreground">
          {courses.length} course{courses.length === 1 ? "" : "s"} to grow your skills
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4">
        <CourseSearch />

        {/* Category chips */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <Link key={cat.slug} href={buildHref(sp, { category: cat.slug })}>
              <Badge
                variant={
                  (sp.category ?? "") === cat.slug ? "default" : "secondary"
                }
                className="cursor-pointer px-3 py-1.5 font-normal"
              >
                {cat.name}
              </Badge>
            </Link>
          ))}
        </div>

        {/* Level + Sort */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Level:</span>
            {LEVELS.map((lvl) => (
              <Link
                key={lvl.slug}
                href={buildHref(sp, { level: lvl.slug })}
                className={cn(
                  "rounded px-2 py-1 hover:text-foreground",
                  (sp.level ?? "") === lvl.slug
                    ? "font-medium text-primary"
                    : "text-muted-foreground"
                )}
              >
                {lvl.name}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Sort:</span>
            {SORTS.map((s) => (
              <Link
                key={s.slug}
                href={buildHref(sp, { sort: s.slug })}
                className={cn(
                  "rounded px-2 py-1 hover:text-foreground",
                  (sp.sort ?? "") === s.slug
                    ? "font-medium text-primary"
                    : "text-muted-foreground"
                )}
              >
                {s.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="rounded-xl border border-dashed py-20 text-center">
          <p className="text-lg font-medium">No courses found</p>
          <p className="mt-1 text-muted-foreground">
            Try a different category or search term.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/courses">Clear filters</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {courses.map((c) => (
            <CourseCard key={c.slug} course={c} />
          ))}
        </div>
      )}
    </div>
  )
}
