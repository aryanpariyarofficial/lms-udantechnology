"use client"

import { useEffect, useState } from "react"
import { createReactBlockSpec } from "@blocknote/react"
import { Clock, ArrowRight, GraduationCap } from "lucide-react"

import { createClient } from "@/lib/supabase/client"
import { formatPrice, formatMinutes } from "@/lib/format"

type CourseLite = {
  id: string
  title: string
  slug: string
  subtitle: string | null
  thumbnail_url: string | null
  price: number
  discount_price: number | null
  duration_minutes: number
}

const SELECT = "id, title, slug, subtitle, thumbnail_url, price, discount_price, duration_minutes"

/** Promotional CTA card that showcases a course inside a blog post. */
export const CourseCardBlock = createReactBlockSpec(
  {
    type: "coursecard",
    propSchema: {
      courseId: { default: "" },
      heading: { default: "Start your journey with" },
    },
    content: "none",
  },
  {
    render: ({ block, editor }) => {
      const p = block.props
      const [course, setCourse] = useState<CourseLite | null>(null)
      const [list, setList] = useState<CourseLite[]>([])

      useEffect(() => {
        const supabase = createClient()
        if (editor.isEditable) {
          supabase
            .from("courses")
            .select(SELECT)
            .eq("status", "published")
            .order("title")
            .then(({ data }) => setList((data as CourseLite[]) ?? []))
        }
        if (p.courseId) {
          supabase
            .from("courses")
            .select(SELECT)
            .eq("id", p.courseId)
            .maybeSingle()
            .then(({ data }) => setCourse((data as CourseLite) ?? null))
        } else {
          setCourse(null)
        }
      }, [p.courseId, editor.isEditable])

      const price = course ? course.discount_price ?? course.price : 0

      const card = course ? (
        <a
          href={`/courses/${course.slug}`}
          className="my-4 flex flex-col gap-4 rounded-2xl border bg-card p-4 no-underline shadow-sm transition-shadow hover:shadow-md sm:flex-row"
        >
          <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 sm:w-48">
            {course.thumbnail_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={course.thumbnail_url} alt={course.title} className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full place-items-center">
                <GraduationCap className="size-10 text-white/80" />
              </div>
            )}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-primary">{p.heading}</p>
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
        </a>
      ) : (
        <div className="my-4 grid place-items-center rounded-2xl border border-dashed bg-muted/30 p-8 text-sm text-muted-foreground">
          {editor.isEditable ? "Select a course below ↓" : ""}
        </div>
      )

      if (!editor.isEditable) return course ? card : <></>

      return (
        <div className="my-2 rounded-lg border border-dashed bg-muted/30 p-3">
          {card}
          <div className="grid gap-2 text-xs sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-muted-foreground">Course</span>
              <select
                className="bn-input"
                value={p.courseId}
                onChange={(e) => editor.updateBlock(block, { props: { ...p, courseId: e.target.value } })}
              >
                <option value="">— Select a course —</option>
                {list.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-muted-foreground">Heading</span>
              <input
                className="bn-input"
                value={p.heading}
                onChange={(e) => editor.updateBlock(block, { props: { ...p, heading: e.target.value } })}
              />
            </label>
          </div>
        </div>
      )
    },
  }
)
