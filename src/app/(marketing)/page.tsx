import Link from "next/link"
import {
  ArrowRight,
  Star,
  Code,
  Brain,
  Palette,
  Clapperboard,
  Megaphone,
  Briefcase,
  Terminal,
  BadgeCheck,
  Wallet,
  Infinity as InfinityIcon,
  Award,
  Users,
  PlayCircle,
  Quote,
  GraduationCap,
  Clock,
  Calendar,
  Sparkles,
  BookOpen,
  MonitorPlay,
  type LucideIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"
import { CourseCard, sampleToCardData, toCardData } from "@/components/marketing/course-card"
import { PricingCard } from "@/components/marketing/pricing-card"
import { HeroVideo } from "@/components/marketing/hero-video"
import { getFeaturedCourses, getActivePlans } from "@/lib/queries/courses"
import { getSettings } from "@/lib/queries/settings"
import {
  SAMPLE_COURSES,
  SAMPLE_REVIEWS,
  SAMPLE_INSTRUCTORS,
  HOME_FAQS,
  HOME_STATS,
  SAMPLE_TUTORIALS,
} from "@/lib/sample-data"
import { initials } from "@/lib/format"
import { JsonLd, organizationLd, websiteLd } from "@/components/seo/json-ld"
import type { MembershipPlan } from "@/lib/supabase/types"

const CATEGORIES: { name: string; slug: string; icon: LucideIcon }[] = [
  { name: "Web Development", slug: "web-development", icon: Code },
  { name: "AI", slug: "ai", icon: Brain },
  { name: "Graphic Design", slug: "graphic-design", icon: Palette },
  { name: "Video Editing", slug: "video-editing", icon: Clapperboard },
  { name: "Digital Marketing", slug: "digital-marketing", icon: Megaphone },
  { name: "Business", slug: "business", icon: Briefcase },
  { name: "Programming", slug: "programming", icon: Terminal },
]

const FALLBACK_PLANS: Pick<
  MembershipPlan,
  "name" | "slug" | "description" | "price" | "duration_days" | "features"
>[] = [
  { name: "1 Month", slug: "1-month", description: "Try it out", price: 999, duration_days: 30, features: ["All membership courses", "New courses", "Premium community", "Downloads & resources"] },
  { name: "3 Months", slug: "3-months", description: "Save more", price: 2499, duration_days: 90, features: ["Everything in 1 Month", "Priority support"] },
  { name: "6 Months", slug: "6-months", description: "For serious learners", price: 4499, duration_days: 180, features: ["Everything in 3 Months", "Early access to new content"] },
  { name: "1 Year", slug: "1-year", description: "Best value", price: 7999, duration_days: 365, features: ["Everything in 6 Months", "Certificate priority", "Exclusive workshops"] },
]

const FEATURES = [
  { icon: Wallet, title: "Easy local payments", desc: "Pay with eSewa, Khalti or bank transfer. Access granted after quick admin approval." },
  { icon: InfinityIcon, title: "Lifetime access", desc: "Buy once, learn forever. Revisit your courses anytime, on any device." },
  { icon: Award, title: "Verifiable certificates", desc: "Earn a certificate with a unique ID and QR code when you complete a course." },
  { icon: BadgeCheck, title: "Project-based learning", desc: "Practical lessons in Nepali designed to get you job-ready and freelance-ready." },
]

const STAT_ICONS: Record<string, LucideIcon> = {
  Users,
  BookOpen,
  MonitorPlay,
  Award,
  Star,
}

export default async function HomePage() {
  const [dbCourses, dbPlans, settings] = await Promise.all([
    getFeaturedCourses(6),
    getActivePlans(),
    getSettings(),
  ])

  const courses =
    dbCourses.length > 0
      ? dbCourses.map(toCardData)
      : SAMPLE_COURSES.map(sampleToCardData)

  const plans = dbPlans.length > 0 ? dbPlans : FALLBACK_PLANS

  return (
    <>
      <JsonLd data={organizationLd()} />
      <JsonLd data={websiteLd()} />

      {/* ---------------- Hero ---------------- */}
      <section className="relative overflow-hidden border-b">
        <HeroVideo videoId="S5lN7uHWEyM" />
        <div className="mx-auto flex min-h-[560px] max-w-7xl items-center px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-5 gap-1.5 border-white/20 bg-white/10 text-white backdrop-blur">
              <span className="inline-block size-1.5 rounded-full bg-success" />
              Nepal&apos;s practical learning platform
            </Badge>
            <h1 className="text-balance text-4xl font-bold tracking-tight text-white drop-shadow-sm sm:text-5xl lg:text-6xl">
              {settings.hero_heading}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-white/85">
              {settings.hero_subheading}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="gap-2">
                <Link href="/courses">
                  Browse Courses <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/30 bg-white/5 text-white backdrop-blur hover:bg-white/15 hover:text-white"
              >
                <Link href="/membership">View Memberships</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Stats bar ---------------- */}
      <section className="border-b bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 divide-x divide-y sm:grid-cols-3 lg:grid-cols-5 lg:divide-y-0">
            {HOME_STATS.map((s) => {
              const Icon = STAT_ICONS[s.icon] ?? Users
              return (
                <div
                  key={s.label}
                  className="flex flex-col items-center gap-2 py-8 text-center"
                >
                  <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <p className="text-3xl font-bold sm:text-4xl">{s.value}</p>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {s.label}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ---------------- Categories ---------------- */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Explore categories
            </h2>
            <p className="mt-2 text-muted-foreground">
              Find the right path for your goals
            </p>
          </div>
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link href="/courses">All courses →</Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
          {CATEGORIES.map(({ name, slug, icon: Icon }) => (
            <Link key={slug} href={`/courses?category=${slug}`}>
              <Card className="group h-full transition-colors hover:border-primary hover:bg-accent">
                <CardContent className="flex flex-col items-center gap-3 p-5 text-center">
                  <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="size-5" />
                  </span>
                  <span className="text-sm font-medium leading-tight">{name}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------------- Getting started banner ---------------- */}
      <section className="mx-auto max-w-7xl px-4 pb-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 overflow-hidden rounded-3xl border bg-gradient-to-r from-accent via-background to-accent p-8 sm:flex-row sm:justify-between sm:p-10">
          <div className="max-w-2xl space-y-3 text-center sm:text-left">
            <Badge variant="secondary" className="gap-1.5">
              <Sparkles className="size-3.5 text-primary" /> New here?
            </Badge>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              New to digital skills? Start free.
            </h2>
            <p className="text-muted-foreground">
              Begin with our beginner-friendly path — learn the fundamentals of web
              development, design, and AI step by step, in Nepali. No experience needed.
            </p>
            <Button asChild size="lg" className="mt-1">
              <Link href="/courses">
                Start Learning <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
          <div className="grid size-32 shrink-0 place-items-center rounded-2xl bg-primary/10 sm:size-40">
            <GraduationCap className="size-16 text-primary sm:size-20" />
          </div>
        </div>
      </section>

      {/* ---------------- Featured courses ---------------- */}
      <section className="bg-muted/30 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Featured courses
              </h2>
              <p className="mt-2 text-muted-foreground">
                Hand-picked courses to kickstart your journey
              </p>
            </div>
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link href="/courses">View all →</Link>
            </Button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              <CourseCard key={c.slug} course={c} />
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Popular Tutorials ---------------- */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Popular tutorials
            </h2>
            <p className="mt-2 text-muted-foreground">
              Free single-video tutorials and crash courses for quick wins.
            </p>
          </div>
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link href="/courses">All tutorials →</Link>
          </Button>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SAMPLE_TUTORIALS.map((t, i) => {
            const gradient = [
              "from-violet-500 to-indigo-600",
              "from-emerald-500 to-teal-600",
              "from-amber-500 to-orange-600",
            ][i % 3]
            return (
              <Link key={t.title} href="/courses" className="group block">
                <Card className="h-full overflow-hidden pt-0 transition-all hover:-translate-y-1 hover:shadow-lg">
                  <div
                    className={`relative flex aspect-video items-center justify-center bg-gradient-to-br ${gradient}`}
                  >
                    <span className="grid size-14 place-items-center rounded-full bg-white/20 backdrop-blur transition-transform group-hover:scale-110">
                      <PlayCircle className="size-8 text-white" />
                    </span>
                    <Badge className="absolute left-3 top-3 bg-white/90 text-foreground hover:bg-white">
                      Free
                    </Badge>
                  </div>
                  <div className="space-y-3 px-5 pb-5">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="font-normal">
                        {t.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{t.level}</span>
                    </div>
                    <h3 className="line-clamp-2 font-semibold leading-snug group-hover:text-primary">
                      {t.title}
                    </h3>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="size-3.5" /> {t.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3.5" /> {t.date}
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ---------------- Why choose us ---------------- */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Why learn with UDAN Technology
          </h2>
          <p className="mt-2 text-muted-foreground">
            Built for Nepali learners — affordable, practical, and trustworthy.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <Card key={title} className="h-full">
              <CardContent className="space-y-3 p-6">
                <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </span>
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ---------------- Membership ---------------- */}
      <section className="bg-muted/30 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <Badge variant="secondary" className="mb-3">Membership</Badge>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Learn everything, one membership
            </h2>
            <p className="mt-2 text-muted-foreground">
              Get access to membership courses and all new content during your plan.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {plans.map((p, i) => (
              <PricingCard key={p.slug} plan={p} featured={i === 3} />
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Reviews ---------------- */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Loved by students
          </h2>
          <p className="mt-2 text-muted-foreground">
            Real results from real learners across Nepal.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SAMPLE_REVIEWS.map((r) => (
            <Card key={r.name} className="h-full">
              <CardContent className="flex h-full flex-col gap-4 p-6">
                <Quote className="size-6 text-primary/40" />
                <p className="flex-1 text-sm">{r.comment}</p>
                <div className="flex gap-0.5">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <Avatar className="size-9">
                    <AvatarFallback>{initials(r.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ---------------- Instructors ---------------- */}
      <section className="bg-muted/30 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Learn from experienced instructors
            </h2>
            <p className="mt-2 text-muted-foreground">
              Industry professionals who&apos;ve done the work.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SAMPLE_INSTRUCTORS.map((ins) => (
              <Card key={ins.name} className="h-full text-center">
                <CardContent className="flex flex-col items-center gap-3 p-6">
                  <Avatar className="size-16">
                    <AvatarFallback className="text-lg">
                      {initials(ins.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{ins.name}</p>
                    <p className="text-sm text-muted-foreground">{ins.headline}</p>
                  </div>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>{ins.courses} courses</span>
                    <span>{ins.students.toLocaleString()} students</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- FAQ ---------------- */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Frequently asked questions
          </h2>
          <p className="mt-2 text-muted-foreground">
            Everything you need to know to get started.
          </p>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {HOME_FAQS.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* ---------------- Final CTA ---------------- */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-16 text-center text-primary-foreground sm:px-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.15),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.1),transparent_40%)]" />
          <div className="relative mx-auto max-w-2xl space-y-6">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Ready to start learning?
            </h2>
            <p className="text-primary-foreground/90">
              Join thousands of Nepali learners building real skills. Create your
              free account today.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" variant="secondary">
                <Link href="/register">Create free account</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <Link href="/courses">Browse courses</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
