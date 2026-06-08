import Link from "next/link"
import type { Metadata } from "next"
import {
  Users,
  BookOpen,
  CreditCard,
  Crown,
  Wallet,
  ArrowRight,
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getAdminStats } from "@/lib/queries/admin"
import { formatPrice } from "@/lib/format"

export const metadata: Metadata = { title: "Admin" }

export default async function AdminOverview() {
  const stats = await getAdminStats()

  const cards = [
    { label: "Total students", value: stats.students, icon: Users },
    { label: "Courses", value: stats.courses, icon: BookOpen },
    { label: "Active memberships", value: stats.activeMemberships, icon: Crown },
    { label: "Revenue (approved)", value: formatPrice(stats.revenue), icon: Wallet },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Overview</h1>
        <p className="text-muted-foreground">Your platform at a glance.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <c.icon className="size-5" />
              </span>
              <div>
                <p className="text-2xl font-bold">{c.value}</p>
                <p className="text-sm text-muted-foreground">{c.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pending payments callout */}
      <Card className={stats.pendingPayments > 0 ? "border-primary" : undefined}>
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
              <CreditCard className="size-5" />
            </span>
            <div>
              <p className="font-semibold">
                Pending payments
                {stats.pendingPayments > 0 && (
                  <Badge className="ml-2">{stats.pendingPayments}</Badge>
                )}
              </p>
              <p className="text-sm text-muted-foreground">
                Review and approve student payments to grant access.
              </p>
            </div>
          </div>
          <Button asChild>
            <Link href="/admin/payments">
              Review <ArrowRight className="size-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <QuickLink href="/admin/courses" title="Manage courses" desc="Create & edit courses" />
        <QuickLink href="/admin/students" title="Students" desc="View & manage students" />
        <QuickLink href="/admin/memberships" title="Memberships" desc="Plans & subscriptions" />
      </div>
    </div>
  )
}

function QuickLink({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link href={href}>
      <Card className="h-full transition-colors hover:border-primary hover:bg-accent">
        <CardContent className="p-5">
          <p className="font-medium">{title}</p>
          <p className="text-sm text-muted-foreground">{desc}</p>
        </CardContent>
      </Card>
    </Link>
  )
}
