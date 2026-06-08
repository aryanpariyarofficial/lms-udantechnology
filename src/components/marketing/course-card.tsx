import Link from "next/link"
import Image from "next/image"
import { Star, Users, Clock, PlayCircle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { formatPrice, formatMinutes } from "@/lib/format"
import { COURSE_LEVEL_LABELS } from "@/lib/constants"
import type { CourseCard as DbCourseCard } from "@/lib/queries/courses"
import type { SampleCourse } from "@/lib/sample-data"

export type CourseCardData = {
  slug: string
  title: string
  subtitle: string | null
  category: string | null
  level: string
  price: number
  discount_price: number | null
  thumbnail_url: string | null
  rating: number
  reviews: number
  students: number
  duration_minutes: number
  instructor: string | null
}

export function toCardData(c: DbCourseCard): CourseCardData {
  return {
    slug: c.slug,
    title: c.title,
    subtitle: c.subtitle,
    category: c.category?.name ?? null,
    level: c.level,
    price: c.discount_price ?? c.price,
    discount_price: c.discount_price ? c.price : null,
    thumbnail_url: c.thumbnail_url,
    rating: c.avg_rating,
    reviews: c.review_count,
    students: c.student_count,
    duration_minutes: c.duration_minutes,
    instructor: c.instructor?.full_name ?? null,
  }
}

export function sampleToCardData(c: SampleCourse): CourseCardData {
  return {
    slug: c.slug,
    title: c.title,
    subtitle: c.subtitle,
    category: c.category,
    level: c.level,
    price: c.discount_price ?? c.price,
    discount_price: c.discount_price ? c.price : null,
    thumbnail_url: c.thumbnail_url,
    rating: c.rating,
    reviews: c.reviews,
    students: c.students,
    duration_minutes: c.duration_minutes,
    instructor: c.instructor,
  }
}

const GRADIENTS = [
  "from-violet-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-sky-500 to-blue-600",
  "from-rose-500 to-pink-600",
  "from-fuchsia-500 to-purple-600",
]

export function CourseCard({
  course,
  className,
}: {
  course: CourseCardData
  className?: string
}) {
  const gradient =
    GRADIENTS[
      Math.abs(
        course.slug.split("").reduce((a, c) => a + c.charCodeAt(0), 0)
      ) % GRADIENTS.length
    ]

  return (
    <Link href={`/courses/${course.slug}`} className={cn("group block", className)}>
      <Card className="h-full overflow-hidden pt-0 transition-all hover:-translate-y-1 hover:shadow-lg">
        <div className="relative aspect-video overflow-hidden">
          {course.thumbnail_url ? (
            <Image
              src={course.thumbnail_url}
              alt={course.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div
              className={cn(
                "flex h-full w-full items-center justify-center bg-gradient-to-br",
                gradient
              )}
            >
              <PlayCircle className="size-12 text-white/80" />
            </div>
          )}
          {course.discount_price && (
            <Badge className="absolute left-3 top-3 bg-destructive text-white">
              Sale
            </Badge>
          )}
        </div>

        <div className="space-y-3 px-5 pb-5">
          <div className="flex items-center gap-2">
            {course.category && (
              <Badge variant="secondary" className="font-normal">
                {course.category}
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {COURSE_LEVEL_LABELS[course.level] ?? course.level}
            </span>
          </div>

          <h3 className="line-clamp-2 font-semibold leading-snug group-hover:text-primary">
            {course.title}
          </h3>
          {course.subtitle && (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {course.subtitle}
            </p>
          )}

          {course.instructor && (
            <p className="text-xs text-muted-foreground">By {course.instructor}</p>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {course.rating > 0 && (
              <span className="flex items-center gap-1 font-medium text-amber-600">
                <Star className="size-3.5 fill-current" />
                {course.rating.toFixed(1)}
                <span className="text-muted-foreground">({course.reviews})</span>
              </span>
            )}
            {course.students > 0 && (
              <span className="flex items-center gap-1">
                <Users className="size-3.5" />
                {course.students.toLocaleString()}
              </span>
            )}
            {course.duration_minutes > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="size-3.5" />
                {formatMinutes(course.duration_minutes)}
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-lg font-bold">{formatPrice(course.price)}</span>
            {course.discount_price && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(course.discount_price)}
              </span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  )
}
