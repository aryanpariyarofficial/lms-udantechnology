import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

import { requireUser } from "@/lib/auth"
import { getCourseForCheckout, getPlanForCheckout } from "@/lib/queries/billing"
import { CheckoutClient, type CheckoutOrder } from "./checkout-client"

export const metadata: Metadata = { title: "Checkout" }

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ course?: string; plan?: string }>
}) {
  await requireUser("/checkout")
  const { course: courseSlug, plan: planSlug } = await searchParams

  let order: CheckoutOrder | null = null

  if (courseSlug) {
    const c = await getCourseForCheckout(courseSlug)
    if (c)
      order = {
        kind: "course",
        slug: c.slug,
        title: c.title,
        baseAmount: c.discount_price ?? c.price,
      }
  } else if (planSlug) {
    const p = await getPlanForCheckout(planSlug)
    if (p)
      order = {
        kind: "membership",
        slug: p.slug,
        title: `${p.name} Membership`,
        baseAmount: p.price,
      }
  }

  if (!order) notFound()

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Complete your payment</h1>
        <p className="mt-2 text-muted-foreground">
          Apply a coupon, pay with any method, then submit your proof for approval.
        </p>
      </div>

      <CheckoutClient order={order} />

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Having trouble?{" "}
        <Link href="/contact" className="text-primary hover:underline">
          Contact support
        </Link>
      </p>
    </div>
  )
}
