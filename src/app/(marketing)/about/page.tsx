import Link from "next/link"
import Image from "next/image"
import type { Metadata } from "next"
import { ArrowRight, Quote, Globe } from "lucide-react"

import { Button } from "@/components/ui/button"
import { FacebookIcon, XIcon, LinkedinIcon } from "@/components/brand/social-icons"
import { getPageContent } from "@/lib/queries/content"
import { SITE } from "@/lib/constants"
import { initials } from "@/lib/format"
import type { PageContent } from "@/lib/content-schema"

export const metadata: Metadata = {
  title: "About",
  description: `Learn about ${SITE.name} — our story, mission and the team behind it.`,
  alternates: { canonical: "/about" },
}

function paragraphs(text: string): string[] {
  return text.split("\n").map((s) => s.trim()).filter(Boolean)
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto mb-10 flex max-w-3xl items-center gap-4">
      <span className="h-px flex-1 bg-border" />
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{children}</h2>
      <span className="h-px flex-1 bg-border" />
    </div>
  )
}

export default async function AboutPage() {
  const c = await getPageContent("about")

  return (
    <div className="pb-20">
      {/* ---------------- Hero ---------------- */}
      <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border-2 border-primary/30 p-10 text-center sm:p-16">
          {c.hero_bg ? (
            <>
              <Image src={c.hero_bg} alt="" fill className="object-cover" priority />
              <div className="absolute inset-0 bg-black/60" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-accent to-muted" />
          )}
          <div className="relative">
            <h1
              className={`text-3xl font-extrabold uppercase tracking-tight sm:text-5xl ${
                c.hero_bg ? "text-white" : "text-foreground"
              }`}
            >
              {c.hero_heading}
            </h1>
            <p
              className={`mx-auto mt-4 max-w-2xl ${
                c.hero_bg ? "text-white/85" : "text-muted-foreground"
              }`}
            >
              {c.hero_subheading}
            </p>
          </div>
        </div>
      </section>

      {/* ---------------- Our Story ---------------- */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionTitle>{c.story_title}</SectionTitle>
        <div className="space-y-4 text-center text-muted-foreground">
          {paragraphs(c.story_body).map((p, i) => (
            <p key={i} className="leading-relaxed">{p}</p>
          ))}
        </div>
      </section>

      {/* ---------------- Our Mission ---------------- */}
      <section className="border-y bg-muted/40 py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <SectionTitle>{c.mission_title}</SectionTitle>
          <div className="space-y-4 text-center text-muted-foreground">
            {paragraphs(c.mission_body).map((p, i) => (
              <p key={i} className="leading-relaxed">{p}</p>
            ))}
          </div>
          {c.mission_quote && (
            <div className="mt-10 text-center">
              <Quote className="mx-auto size-10 text-primary/30" />
              <p className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">
                {c.mission_quote}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ---------------- CTA card (middle) ---------------- */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-12 text-center text-primary-foreground sm:px-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.18),transparent_40%),radial-gradient(circle_at_85%_80%,rgba(255,255,255,0.12),transparent_40%)]" />
          <div className="relative mx-auto max-w-2xl space-y-4">
            <h2 className="text-2xl font-bold sm:text-3xl">{c.cta_heading}</h2>
            <p className="text-primary-foreground/90">{c.cta_text}</p>
            <Button asChild size="lg" variant="secondary" className="mt-2">
              <Link href={c.cta_link || "/courses"}>
                {c.cta_button} <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ---------------- Founders ---------------- */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <SectionTitle>{c.founders_title}</SectionTitle>
        {c.founders_intro && (
          <p className="mx-auto mb-12 max-w-2xl text-center text-muted-foreground">
            {c.founders_intro}
          </p>
        )}
        <div className="space-y-8">
          <FounderCard content={c} n="1" />
          <FounderCard content={c} n="2" reverse />
        </div>
      </section>
    </div>
  )
}

function FounderCard({
  content: c,
  n,
  reverse = false,
}: {
  content: PageContent
  n: string
  reverse?: boolean
}) {
  const name = c[`founder${n}_name`]
  const role = c[`founder${n}_role`]
  const bio = c[`founder${n}_bio`]
  const image = c[`founder${n}_image`]
  if (!name) return null

  const socials = [
    { href: c[`founder${n}_facebook`], Icon: FacebookIcon },
    { href: c[`founder${n}_twitter`], Icon: XIcon },
    { href: c[`founder${n}_linkedin`], Icon: LinkedinIcon },
    { href: c[`founder${n}_website`], Icon: Globe },
  ].filter((s) => s.href)

  const photo = (
    <div className="relative aspect-square w-full overflow-hidden rounded-xl sm:w-56 sm:shrink-0">
      {image ? (
        <Image src={image} alt={name} fill className="object-cover" sizes="224px" />
      ) : (
        <div className="grid h-full place-items-center bg-gradient-to-br from-primary to-indigo-700 text-4xl font-bold text-white">
          {initials(name)}
        </div>
      )}
    </div>
  )

  return (
    <div className="flex flex-col gap-6 rounded-2xl border p-5 sm:flex-row sm:items-center sm:p-6">
      {!reverse && photo}
      <div className="flex-1 space-y-2">
        <h3 className="text-xl font-bold tracking-tight">{name}</h3>
        <p className="text-sm font-medium text-primary">{role}</p>
        <p className="text-sm leading-relaxed text-muted-foreground">{bio}</p>
        {socials.length > 0 && (
          <div className="flex gap-2 pt-1">
            {socials.map(({ href, Icon }, i) => (
              <a
                key={i}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="grid size-8 place-items-center rounded-md bg-foreground text-background transition-opacity hover:opacity-80"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        )}
      </div>
      {reverse && photo}
    </div>
  )
}
