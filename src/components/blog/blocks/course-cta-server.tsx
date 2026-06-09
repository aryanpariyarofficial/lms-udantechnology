import Link from "next/link"
import Image from "next/image"
import { Clock, ArrowRight, GraduationCap } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { formatPrice, formatMinutes } from "@/lib/format"

/** Server-rendered course promo card for published blog posts (SEO-friendly). */
export async function CourseCtaServer({
  courseId,
  heading,
}: {
  courseId: string
  heading: string
}) {
  if (!courseId) return null
  let course: {
    title: string
    slug: string
    subtitle: string | null
    thumbnail_url: string | null
    price: number
    discount_price: number | null
    duration_minutes: number
  } | null = null

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("courses")
      .select("title, slug, subtitle, thumbnail_url, price, discount_price, duration_minutes")
      .eq("id", courseId)
      .eq("status", "published")
      .maybeSingle()
    course = data ?? null
  } catch {
    course = null
  }

  if (!course) return null
  const price = course.discount_price ?? course.price

  return (
    <Link
      href={`/courses/${course.slug}`}
      className="not-prose my-6 flex flex-col gap-4 rounded-2xl border bg-card p-4 no-underline shadow-sm transition-shadow hover:shadow-md sm:flex-row"
    >
      <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 sm:w-52">
        {course.thumbnail_url ? (
          <Image src={course.thumbnail_url} alt={course.title} fill className="object-cover" sizes="220px" />
        ) : (
          <div className="grid h-full place-items-center">
            <GraduationCap className="size-10 text-white/80" />
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-primary">{heading}</p>
        <p className="font-bold leading-snug text-foreground">{course.title}</p>
        {course.subtitle && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{course.subtitle}</p>
        )}
        <div className="mt-auto flex flex-wrap items-center gap-3 pt-1">
          <span
            className={`rounded-md px-2 py-0.5 text-sm font-semibold ${
              price === 0 ? "bg-success/10 text-success" : "bg-primary/10 text-primary"
            }`}
          >
            {price === 0 ? "Free" : formatPrice(price)}
          </span>
          {course.duration_minutes > 0 && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="size-3.5" /> {formatMinutes(course.duration_minutes)}
            </span>
          )}
          <span className="ml-auto inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground">
            Start learning <ArrowRight className="size-4" />
          </span>
        </div>
      </div>
    </Link>
  )
}
