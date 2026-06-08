import type { Metadata } from "next"
import { CheckCircle2, Clock, XCircle } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { requireUser } from "@/lib/auth"
import { getMyPayments } from "@/lib/queries/dashboard"
import { formatPrice, formatDate } from "@/lib/format"
import { PAYMENT_METHOD_LABELS } from "@/lib/constants"

export const metadata: Metadata = { title: "Payments" }

const STATUS = {
  pending: { label: "Pending", variant: "secondary" as const, icon: Clock },
  approved: { label: "Approved", variant: "default" as const, icon: CheckCircle2 },
  rejected: { label: "Rejected", variant: "destructive" as const, icon: XCircle },
}

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string }>
}) {
  const { user } = await requireUser()
  const { submitted } = await searchParams
  const payments = (await getMyPayments(user.id)) as unknown as Array<{
    id: string
    kind: string
    amount: number
    method: string
    status: keyof typeof STATUS
    transaction_id: string | null
    review_note: string | null
    created_at: string
    course: { title: string } | null
    plan: { name: string } | null
  }>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payment History</h1>
        <p className="text-muted-foreground">Track your submissions and approvals.</p>
      </div>

      {submitted && (
        <Alert>
          <CheckCircle2 className="size-4" />
          <AlertTitle>Payment submitted!</AlertTitle>
          <AlertDescription>
            Our team will verify it shortly. You&apos;ll get access once approved.
          </AlertDescription>
        </Alert>
      )}

      {payments.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            No payments yet.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => {
                  const s = STATUS[p.status] ?? STATUS.pending
                  const Icon = s.icon
                  return (
                    <TableRow key={p.id}>
                      <TableCell>
                        <p className="font-medium">
                          {p.course?.title ?? p.plan?.name ?? "—"}
                        </p>
                        <p className="text-xs capitalize text-muted-foreground">
                          {p.kind}
                          {p.transaction_id ? ` · ${p.transaction_id}` : ""}
                        </p>
                        {p.status === "rejected" && p.review_note && (
                          <p className="mt-1 text-xs text-destructive">
                            Reason: {p.review_note}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        {PAYMENT_METHOD_LABELS[p.method] ?? p.method}
                      </TableCell>
                      <TableCell>{formatPrice(p.amount)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(p.created_at)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={s.variant} className="gap-1">
                          <Icon className="size-3" />
                          {s.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
