import type { Metadata } from "next"
import { Inbox } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getPayments } from "@/lib/queries/admin"
import { formatPrice, formatDate } from "@/lib/format"
import { PAYMENT_METHOD_LABELS } from "@/lib/constants"
import { PaymentReviewCard } from "./payment-review"

export const metadata: Metadata = { title: "Payments · Admin" }

const STATUS_VARIANT: Record<string, "secondary" | "default" | "destructive"> = {
  pending: "secondary",
  approved: "default",
  rejected: "destructive",
}

export default async function AdminPaymentsPage() {
  const [pending, all] = await Promise.all([
    getPayments("pending"),
    getPayments(),
  ])
  const history = all.filter((p) => p.status !== "pending")

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
        <p className="text-muted-foreground">
          Approve to grant access · reject with a reason.
        </p>
      </div>

      {/* Pending queue */}
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 font-semibold">
          Pending approval
          {pending.length > 0 && <Badge>{pending.length}</Badge>}
        </h2>
        {pending.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
              <Inbox className="size-8" />
              <p>No pending payments. You&apos;re all caught up!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {pending.map((p) => (
              <PaymentReviewCard key={p.id} payment={p} />
            ))}
          </div>
        )}
      </section>

      {/* History */}
      <section className="space-y-3">
        <h2 className="font-semibold">History</h2>
        {history.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              No processed payments yet.
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.user?.full_name ?? "—"}</TableCell>
                      <TableCell>{p.course?.title ?? p.plan?.name ?? "—"}</TableCell>
                      <TableCell>{formatPrice(p.amount)}</TableCell>
                      <TableCell>
                        {PAYMENT_METHOD_LABELS[p.method] ?? p.method}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(p.created_at)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={STATUS_VARIANT[p.status] ?? "secondary"}
                          className="capitalize"
                        >
                          {p.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  )
}
