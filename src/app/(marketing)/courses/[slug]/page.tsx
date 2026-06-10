import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import {
  Star,
  Users,
  Clock,
  PlayCircle,
  FileText,
  HelpCircle,
  ClipboardList,
  Download,
  Lock,
  CheckCircle2,
  ChevronRight,
  Globe,
  BarChart3,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Separator } from "@/components/ui/separator"
import {
  getCourseBySlug,
  getCourseOutline,
  getCourseFaqs,
  getCourseReviews,
  checkCourseAccess,
} from "@/lib/queries/courses"
import { SAMPLE_COURSES, sampleCourseDetail } from "@/lib/sample-data"
import { ReviewForm } from "./review-form"
import { JsonLd, courseLd, breadcrumbLd } from "@/components/seo/json-ld"
import { formatPrice, formatMinutes, formatDuration, initials } from "@/lib/format"
import { COURSE_LEVEL_LABELS, SITE } from "@/lib/constants"

const LESSON_ICON: Record<string, typeof PlayCircle> = {
  video: PlayCircle,
  pdf: FileText,
  text: FileText,
  quiz: HelpCircle,
  assignment: ClipboardList,
  file: Download,
}

type ViewModel = {
  courseId: string | null
  slug: string
  title: string
  subtitle: string | null
  description: string | null
  category: string | null
  level: string
  language: string
  price: number
  discountPrice: number | null
  thumbnail: string | null
  instructor: { name: string; headline: string | null; avatar: string | null }
  rating: number
  students: number
  reviewCount: number
  durationMinutes: number
  whatYouLearn: string[]
  requirements: string[]
  curriculum: {
    module_title: string
    lessons: { title: string; type: string; duration_seconds: number; is_preview: boolean }[]
  }[]
  faqs: { question: string; answer: string }[]
  reviews: { name: string; avatar: string | null; rating: number; comment: string | null }[]
  hasAccess: boolean
}

async function buildViewModel(slug: string): Promise<ViewModel | null> {
  const course = await getCourseBySlug(slug)

  if (course) {
    const [outline, faqs, reviews, hasAccess] = await Promise.all([
      getCourseOutline(course.id),
      getCourseFaqs(course.id),
      getCourseReviews(course.id),
      checkCourseAccess(course.id),
    ])
    const ratings = reviews.map((r) => (r as unknown as { rating: number }).rating)
    const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0
    return {
      courseId: course.id,
      slug: course.slug,
      title: course.title,
      subtitle: course.subtitle,
      description: course.description,
      category: course.category?.name ?? null,
      level: course.level,
      language: course.language,
      price: course.discount_price ?? course.price,
      discountPrice: course.discount_price ? course.price : null,
      thumbnail: course.thumbnail_url,
      instructor: {
        name: course.instructor?.full_name ?? "Instructor",
        headline: course.instructor?.headline ?? null,
        avatar: course.instructor?.avatar_url ?? null,
      },
      rating: avg,
      students: 0,
      reviewCount: reviews.length,
      durationMinutes: course.duration_minutes,
      whatYouLearn: course.what_you_learn,
      requirements: course.requirements,
      curriculum: outline.map((m) => ({
        module_title: m.module_title,
        lessons: m.lessons,
      })),
      faqs: faqs.map((f) => ({
        question: (f as { question: string }).question,
        answer: (f as { answer: string }).answer,
      })),
      reviews: reviews.map((r) => {
        const row = r as unknown as { rating: number; comment: string | null; user?: { full_name: string | null; avatar_url: string | null } }
        return {
          name: row.user?.full_name ?? "Student",
          avatar: row.user?.avatar_url ?? null,
          rating: row.rating,
          comment: row.comment,
        }
      }),
      hasAccess,
    }
  }

  // Sample fallback
  const sample = SAMPLE_COURSES.find((c) => c.slug === slug)
  if (!sample) return null
  const detail = sampleCourseDetail(sample)
  return {
    courseId: null,
    slug: sample.slug,
    title: sample.title,
    subtitle: sample.subtitle,
    description: `${sample.subtitle}. This project-based course is designed for the Nepali market with practical lessons you can apply immediately.`,
    category: sample.category,
    level: sample.level,
    language: "Nepali",
    price: sample.discount_price ?? sample.price,
    discountPrice: sample.discount_price ? sample.price : null,
    thumbnail: sample.thumbnail_url,
    instructor: { name: sample.instructor, headline: "Experienced instructor", avatar: null },
    rating: sample.rating,
    students: sample.students,
    reviewCount: sample.reviews,
    durationMinutes: sample.duration_minutes,
    whatYouLearn: detail.what_you_learn,
    requirements: detail.requirements,
    curriculum: detail.curriculum,
    faqs: [],
    reviews: [],
    hasAccess: false,
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const vm = await buildViewModel(slug)
  if (!vm) return { title: "Course not found" }
  return {
    title: vm.title,
    description: vm.subtitle ?? vm.description ?? undefined,
    alternates: { canonical: `/courses/${slug}` },
    openGraph: {
      title: vm.title,
      description: vm.subtitle ?? undefined,
      images: vm.thumbnail ? [vm.thumbnail] : undefined,
    },
    twitter: { card: "summary_large_image", title: vm.title },
  }
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const vm = await buildViewModel(slug)
  if (!vm) notFound()

  const totalLessons = vm.curriculum.reduce((n, m) => n + m.lessons.length, 0)

  return (
    <div>
      <JsonLd
        data={courseLd({
          title: vm.title,
          description: vm.description,
          slug: vm.slug,
          thumbnail: vm.thumbnail,
          price: vm.price,
          rating: vm.rating,
          reviewCount: vm.reviewCount,
          instructor: vm.instructor.name,
        })}
      />
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Courses", path: "/courses" },
          { name: vm.title, path: `/courses/${vm.slug}` },
        ])}
      />
      {/* Hero */}
      <div className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <nav className="mb-4 flex items-center gap-1 text-sm text-muted-foreground">
            <Link href="/courses" className="hover:text-foreground">Courses</Link>
            <ChevronRight className="size-3.5" />
            <span className="text-foreground">{vm.category ?? "Course"}</span>
          </nav>
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              {vm.category && <Badge variant="secondary">{vm.category}</Badge>}
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{vm.title}</h1>
              {vm.subtitle && (
                <p className="text-lg text-muted-foreground">{vm.subtitle}</p>
              )}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                {vm.rating > 0 && (
                  <span className="flex items-center gap-1 font-medium text-amber-600">
                    <Star className="size-4 fill-current" /> {vm.rating.toFixed(1)}
                    <span className="text-muted-foreground">({vm.reviewCount} reviews)</span>
                  </span>
                )}
                {vm.students > 0 && (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Users className="size-4" /> {vm.students.toLocaleString()} students
                  </span>
                )}
                <span className="flex items-center gap-1 text-muted-foreground">
                  <BarChart3 className="size-4" /> {COURSE_LEVEL_LABELS[vm.level] ?? vm.level}
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Globe className="size-4" /> {vm.language}
                </span>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Avatar className="size-10">
                  <AvatarImage src={vm.instructor.avatar ?? undefined} />
                  <AvatarFallback>{initials(vm.instructor.name)}</AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <p className="font-medium">{vm.instructor.name}</p>
                  {vm.instructor.headline && (
                    <p className="text-muted-foreground">{vm.instructor.headline}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-3">
          {/* Left content */}
          <div className="space-y-10 lg:col-span-2">
            {/* What you'll learn */}
            {vm.whatYouLearn.length > 0 && (
              <section>
                <h2 className="mb-4 text-xl font-bold">What you&apos;ll learn</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {vm.whatYouLearn.map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Curriculum */}
            <section>
              <div className="mb-4 flex items-end justify-between">
                <h2 className="text-xl font-bold">Course content</h2>
                <p className="text-sm text-muted-foreground">
                  {vm.curriculum.length} modules · {totalLessons} lessons
                </p>
              </div>
              <Accordion type="multiple" className="rounded-xl border">
                {vm.curriculum.map((mod, i) => (
                  <AccordionItem
                    key={i}
                    value={`m-${i}`}
                    className="border-b px-4 last:border-b-0"
                  >
                    <AccordionTrigger className="text-left">
                      <span className="flex-1 font-medium">{mod.module_title}</span>
                      <span className="mr-2 text-xs font-normal text-muted-foreground">
                        {mod.lessons.length} lessons
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-1">
                        {mod.lessons.map((lesson, j) => {
                          const Icon = LESSON_ICON[lesson.type] ?? PlayCircle
                          return (
                            <li
                              key={j}
                              className="flex items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-accent"
                            >
                              <Icon className="size-4 shrink-0 text-muted-foreground" />
                              <span className="flex-1">{lesson.title}</span>
                              {lesson.is_preview ? (
                                <Badge variant="secondary" className="text-xs">Preview</Badge>
                              ) : (
                                <Lock className="size-3.5 text-muted-foreground" />
                              )}
                              {lesson.duration_seconds > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  {formatDuration(lesson.duration_seconds)}
                                </span>
                              )}
                            </li>
                          )
                        })}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>

            {/* Requirements */}
            {vm.requirements.length > 0 && (
              <section>
                <h2 className="mb-4 text-xl font-bold">Requirements</h2>
                <ul className="space-y-2">
                  {vm.requirements.map((r) => (
                    <li key={r} className="flex items-start gap-2 text-sm">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground" />
                      {r}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Description */}
            {vm.description && (
              <section>
                <h2 className="mb-4 text-xl font-bold">Description</h2>
                <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {vm.description}
                </p>
              </section>
            )}

            {/* Instructor */}
            <section>
              <h2 className="mb-4 text-xl font-bold">Instructor</h2>
              <div className="flex items-start gap-4">
                <Avatar className="size-16">
                  <AvatarImage src={vm.instructor.avatar ?? undefined} />
                  <AvatarFallback className="text-lg">
                    {initials(vm.instructor.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{vm.instructor.name}</p>
                  {vm.instructor.headline && (
                    <p className="text-sm text-muted-foreground">{vm.instructor.headline}</p>
                  )}
                </div>
              </div>
            </section>

            {/* Reviews */}
            {(vm.reviews.length > 0 || (vm.hasAccess && vm.courseId)) && (
              <section>
                <h2 className="mb-4 text-xl font-bold">Student reviews</h2>
                {vm.hasAccess && vm.courseId && (
                  <div className="mb-4">
                    <ReviewForm courseId={vm.courseId} slug={vm.slug} />
                  </div>
                )}
                <div className="space-y-4">
                  {vm.reviews.map((r, i) => (
                    <Card key={i}>
                      <CardContent className="p-5">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-9">
                            <AvatarImage src={r.avatar ?? undefined} />
                            <AvatarFallback>{initials(r.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{r.name}</p>
                            <div className="flex gap-0.5">
                              {Array.from({ length: r.rating }).map((_, k) => (
                                <Star key={k} className="size-3 fill-amber-400 text-amber-400" />
                              ))}
                            </div>
                          </div>
                        </div>
                        {r.comment && <p className="mt-3 text-sm">{r.comment}</p>}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* FAQ */}
            {vm.faqs.length > 0 && (
              <section>
                <h2 className="mb-4 text-xl font-bold">FAQs</h2>
                <Accordion type="single" collapsible>
                  {vm.faqs.map((f, i) => (
                    <AccordionItem key={i} value={`f-${i}`}>
                      <AccordionTrigger className="text-left">{f.question}</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {f.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            )}
          </div>

          {/* Right: sticky purchase card */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-20">
              <Card className="overflow-hidden pt-0">
                <div className="relative aspect-video bg-gradient-to-br from-violet-500 to-indigo-600">
                  {vm.thumbnail ? (
                    <Image src={vm.thumbnail} alt={vm.title} fill className="object-cover" />
                  ) : (
                    <div className="grid h-full place-items-center">
                      <PlayCircle className="size-14 text-white/80" />
                    </div>
                  )}
                </div>
                <CardContent className="space-y-4 px-5 pb-5">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">{formatPrice(vm.price)}</span>
                    {vm.discountPrice && (
                      <span className="text-base text-muted-foreground line-through">
                        {formatPrice(vm.discountPrice)}
                      </span>
                    )}
                  </div>

                  {vm.hasAccess && vm.courseId ? (
                    <Button asChild size="lg" className="w-full">
                      <Link href={`/learn/${vm.courseId}`}>Go to course</Link>
                    </Button>
                  ) : (
                    <Button asChild size="lg" className="w-full">
                      <Link
                        href={
                          vm.courseId
                            ? `/checkout?course=${vm.slug}`
                            : "/register"
                        }
                      >
                        Enroll now
                      </Link>
                    </Button>
                  )}
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/membership">Get with Membership</Link>
                  </Button>

                  <Separator />

                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Clock className="size-4 text-muted-foreground" />
                      {formatMinutes(vm.durationMinutes)} of content
                    </li>
                    <li className="flex items-center gap-2">
                      <PlayCircle className="size-4 text-muted-foreground" />
                      {totalLessons} lessons
                    </li>
                    <li className="flex items-center gap-2">
                      <BarChart3 className="size-4 text-muted-foreground" />
                      {COURSE_LEVEL_LABELS[vm.level] ?? vm.level}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-success" />
                      Lifetime access & certificate
                    </li>
                  </ul>

                  <p className="text-center text-xs text-muted-foreground">
                    Pay via eSewa, Khalti or bank transfer · {SITE.name}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
