import Link from "next/link"
import type { Metadata } from "next"
import { Crown, Calendar, CheckCircle2 } from "lucide-react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { requireUser } from "@/lib/auth"
import { getMyMembership } from "@/lib/queries/dashboard"
import { formatDate } from "@/lib/format"

export const metadata: Metadata = { title: "Membership" }

export default async function MembershipPage() {
  const { user } = await requireUser()
  const membership = (await getMyMembership(user.id)) as unknown as {
    status: string
    starts_at: string
    expires_at: string
    plan: { name: string; slug: string } | null
  } | null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Membership</h1>
        <p className="text-muted-foreground">Your subscription status and benefits.</p>
      </div>

      {membership ? (
        <Card className="border-primary">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground">
                <Crown className="size-5" />
              </span>
              <div>
                <p className="font-semibold">{membership.plan?.name} Membership</p>
                <Badge variant="default" className="mt-1 capitalize">
                  {membership.status}
                </Badge>
              </div>
            </div>
            <Button asChild variant="outline">
              <Link href="/membership">Renew / Upgrade</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="size-4 text-muted-foreground" />
              Started {formatDate(membership.starts_at)} · Expires{" "}
              <span className="font-medium">{formatDate(membership.expires_at)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="size-4 text-success" />
              Access to all membership courses and new content during your plan.
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Crown className="size-6" />
            </span>
            <p className="font-medium">No active membership</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Get a membership to unlock all included courses and new content at one
              affordable price.
            </p>
            <Button asChild className="mt-2">
              <Link href="/membership">View membership plans</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
