import type { Metadata } from "next"
import { Crown, Check } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { PricingCard } from "@/components/marketing/pricing-card"
import { getActivePlans } from "@/lib/queries/courses"
import type { MembershipPlan } from "@/lib/supabase/types"

export const metadata: Metadata = {
  title: "Membership Plans",
  description:
    "One affordable membership to access all included courses and new content.",
  alternates: { canonical: "/membership" },
}

const FALLBACK_PLANS: Pick<
  MembershipPlan,
  "name" | "slug" | "description" | "price" | "duration_days" | "features"
>[] = [
  { name: "1 Month", slug: "1-month", description: "Try it out", price: 999, duration_days: 30, features: ["All membership courses", "New courses during your plan", "Premium community", "Downloads & resources"] },
  { name: "3 Months", slug: "3-months", description: "Save more", price: 2499, duration_days: 90, features: ["Everything in 1 Month", "Priority support"] },
  { name: "6 Months", slug: "6-months", description: "For serious learners", price: 4499, duration_days: 180, features: ["Everything in 3 Months", "Early access to new content"] },
  { name: "1 Year", slug: "1-year", description: "Best value", price: 7999, duration_days: 365, features: ["Everything in 6 Months", "Certificate priority", "Exclusive workshops"] },
]

const BENEFITS = [
  "Access to all membership courses",
  "New courses added during your plan",
  "Premium learning community",
  "Downloadable resources & source code",
  "Learn on any device, anytime",
  "Cancel or switch plans anytime",
]

const FAQS = [
  { q: "What's included in membership?", a: "Access to every course marked as part of membership, plus any new courses added while your plan is active — all for one price." },
  { q: "How is this different from buying a course?", a: "Buying a single course gives you lifetime access to just that course. Membership gives you access to many courses for the duration of your plan — far better value if you want to learn multiple skills." },
  { q: "What happens when my plan expires?", a: "Membership course access pauses until you renew. Courses you purchased individually remain yours forever." },
  { q: "How do I pay?", a: "Choose a plan, pay via eSewa, Khalti, or bank transfer, and upload your payment proof. We activate your membership after quick verification." },
]

export default async function MembershipPage() {
  const dbPlans = await getActivePlans()
  const plans = dbPlans.length > 0 ? dbPlans : FALLBACK_PLANS

  return (
    <div>
      {/* Hero */}
      <section className="border-b bg-muted/30">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <Badge variant="secondary" className="mb-4 gap-1">
            <Crown className="size-3" /> Membership
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Learn everything for one price
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Unlock all membership courses and every new course we add during your
            plan. The most affordable way to build multiple skills.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((p, i) => (
            <PricingCard key={p.slug} plan={p} featured={i === 2} href="/checkout" />
          ))}
        </div>

        {/* Benefits */}
        <div className="mx-auto mt-16 max-w-2xl">
          <h2 className="mb-6 text-center text-2xl font-bold">Every plan includes</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {BENEFITS.map((b) => (
              <div key={b} className="flex items-center gap-2">
                <Check className="size-4 shrink-0 text-success" />
                <span className="text-sm">{b}</span>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mx-auto mt-16 max-w-3xl">
          <h2 className="mb-6 text-center text-2xl font-bold">Membership FAQs</h2>
          <Accordion type="single" collapsible>
            {FAQS.map((f, i) => (
              <AccordionItem key={i} value={`f-${i}`}>
                <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </div>
  )
}
