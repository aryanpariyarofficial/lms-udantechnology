import Link from "next/link"
import { Check, Crown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatPrice } from "@/lib/format"
import type { MembershipPlan } from "@/lib/supabase/types"

function months(days: number) {
  if (days % 365 === 0) return `${days / 365} year${days / 365 > 1 ? "s" : ""}`
  const m = Math.round(days / 30)
  return `${m} month${m > 1 ? "s" : ""}`
}

export function PricingCard({
  plan,
  featured,
  href = "/membership",
}: {
  plan: Pick<
    MembershipPlan,
    "name" | "slug" | "description" | "price" | "duration_days" | "features"
  >
  featured?: boolean
  href?: string
}) {
  return (
    <Card
      className={cn(
        "relative flex flex-col transition-transform",
        featured &&
          "z-10 border-primary shadow-xl ring-2 ring-primary lg:scale-[1.06]"
      )}
    >
      {featured && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 gap-1">
          <Crown className="size-3" /> Most Popular
        </Badge>
      )}
      <CardHeader>
        <h3 className="text-lg font-semibold">{plan.name}</h3>
        {plan.description && (
          <p className="text-sm text-muted-foreground">{plan.description}</p>
        )}
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-3xl font-bold">{formatPrice(plan.price)}</span>
          <span className="text-sm text-muted-foreground">
            / {months(plan.duration_days)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-6">
        <ul className="flex-1 space-y-3">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm">
              <Check className="mt-0.5 size-4 shrink-0 text-success" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
        <Button asChild variant={featured ? "default" : "outline"} className="w-full">
          <Link href={`${href}?plan=${plan.slug}`}>Choose {plan.name}</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
