import Link from "next/link"
import type { Metadata } from "next"
import { Target, BookOpen, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getPageContent } from "@/lib/queries/content"
import { SITE } from "@/lib/constants"

export const metadata: Metadata = {
  title: "About",
  description: `Learn about ${SITE.name} — our story and mission.`,
}

export default async function AboutPage() {
  const c = await getPageContent("about")

  return (
    <div>
      {/* Hero */}
      <section className="border-b bg-gradient-to-br from-primary to-indigo-800 text-primary-foreground">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">{c.hero_heading}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/85">{c.hero_subheading}</p>
        </div>
      </section>

      {/* Story + Mission */}
      <section className="mx-auto max-w-4xl space-y-6 px-4 py-16 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="space-y-3 p-6 sm:p-8">
            <div className="flex items-center gap-2 text-primary">
              <BookOpen className="size-5" />
              <h2 className="text-xl font-bold text-foreground">{c.story_title}</h2>
            </div>
            <p className="leading-relaxed text-muted-foreground">{c.story_body}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-3 p-6 sm:p-8">
            <div className="flex items-center gap-2 text-primary">
              <Target className="size-5" />
              <h2 className="text-xl font-bold text-foreground">{c.mission_title}</h2>
            </div>
            <p className="leading-relaxed text-muted-foreground">{c.mission_body}</p>
          </CardContent>
        </Card>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-primary px-6 py-14 text-center text-primary-foreground">
          <h2 className="text-2xl font-bold sm:text-3xl">{c.cta_heading}</h2>
          <Button asChild size="lg" variant="secondary" className="mt-6">
            <Link href="/courses">
              {c.cta_button} <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
