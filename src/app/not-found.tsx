import Link from "next/link"
import type { Metadata } from "next"
import { Home, Compass, Rocket } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Logo } from "@/components/brand/logo"

export const metadata: Metadata = { title: "Page not found" }

const QUICK_LINKS = [
  { label: "Courses", href: "/courses" },
  { label: "Tutorials", href: "/tutorials" },
  { label: "Membership", href: "/membership" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
]

export default function NotFound() {
  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden bg-background">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 size-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 size-[400px] rounded-full bg-success/10 blur-3xl" />
      </div>

      {/* Header */}
      <header className="p-6 sm:p-8">
        <Logo />
      </header>

      {/* Content */}
      <main className="flex flex-1 items-center justify-center px-4 pb-20">
        <div className="mx-auto max-w-xl text-center">
          <div className="relative mx-auto mb-2 inline-block">
            <h1 className="bg-gradient-to-br from-primary to-indigo-600 bg-clip-text text-[7rem] font-extrabold leading-none tracking-tighter text-transparent sm:text-[10rem]">
              404
            </h1>
            <Rocket className="absolute -right-6 top-2 size-12 rotate-45 text-primary sm:-right-10 sm:size-16" />
          </div>

          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Oops! This page took off without us
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or may have moved.
            Let&apos;s get you back on track.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="gap-2">
              <Link href="/">
                <Home className="size-4" /> Back to Home
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-2">
              <Link href="/courses">
                <Compass className="size-4" /> Browse Courses
              </Link>
            </Button>
          </div>

          <div className="mt-10 border-t pt-6">
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Or explore
            </p>
            <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm">
              {QUICK_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
