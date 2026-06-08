import Link from "next/link"
import { CheckCircle2, Quote } from "lucide-react"

import { Logo } from "@/components/brand/logo"

const HIGHLIGHTS = [
  "Project-based courses in Nepali",
  "Lifetime access & verifiable certificates",
  "Affordable memberships — learn everything",
  "Pay with eSewa, Khalti or bank transfer",
]

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Form side */}
      <div className="flex flex-col gap-8 p-6 md:p-10">
        <div className="flex justify-between">
          <Logo />
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to site
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>

      {/* Brand side */}
      <div className="relative hidden overflow-hidden bg-primary lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.1),transparent_40%)]" />
        <div className="relative flex h-full flex-col justify-between p-12 text-primary-foreground">
          <div className="space-y-6">
            <h2 className="max-w-md text-3xl font-bold leading-tight">
              Grow your skills, grow your future.
            </h2>
            <ul className="space-y-3">
              {HIGHLIGHTS.map((h) => (
                <li key={h} className="flex items-center gap-3 text-primary-foreground/90">
                  <CheckCircle2 className="size-5 shrink-0" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>

          <figure className="max-w-md rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
            <Quote className="size-6 opacity-70" />
            <blockquote className="mt-3 text-primary-foreground/90">
              “The courses are practical and in Nepali — I built my first
              website within a month and landed freelance work.”
            </blockquote>
            <figcaption className="mt-4 text-sm font-medium">
              — Sandip, Web Development student
            </figcaption>
          </figure>
        </div>
      </div>
    </div>
  )
}
