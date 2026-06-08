"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Check, X, Loader2, ImageIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { formatPrice, formatDate, initials } from "@/lib/format"
import { PAYMENT_METHOD_LABELS } from "@/lib/constants"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { AdminPayment } from "@/lib/queries/admin"
import { approvePayment, rejectPayment } from "../actions"

export function PaymentReviewCard({ payment }: { payment: AdminPayment }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [rejectOpen, setRejectOpen] = useState(false)
  const [note, setNote] = useState("")

  function onApprove() {
    startTransition(async () => {
      const res = await approvePayment(payment.id)
      if (res.ok) {
        toast.success("Payment approved — access granted")
        router.refresh()
      } else {
        toast.error(res.error ?? "Failed to approve")
      }
    })
  }

  function onReject() {
    startTransition(async () => {
      const res = await rejectPayment(payment.id, note)
      if (res.ok) {
        toast.success("Payment rejected")
        setRejectOpen(false)
        router.refresh()
      } else {
        toast.error(res.error ?? "Failed to reject")
      }
    })
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center">
        <div className="flex items-center gap-3 lg:w-56">
          <Avatar className="size-10">
            <AvatarFallback>{initials(payment.user?.full_name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-medium">
              {payment.user?.full_name ?? "Student"}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDate(payment.created_at)}
            </p>
          </div>
        </div>

        <div className="flex-1 space-y-1">
          <p className="font-medium">
            {payment.course?.title ?? payment.plan?.name ?? "—"}
            <Badge variant="secondary" className="ml-2 capitalize">
              {payment.kind}
            </Badge>
          </p>
          <p className="text-sm text-muted-foreground">
            {formatPrice(payment.amount)} · {PAYMENT_METHOD_LABELS[payment.method] ?? payment.method}
            {payment.transaction_id ? ` · TXN ${payment.transaction_id}` : ""}
          </p>
          {payment.remarks && (
            <p className="text-xs text-muted-foreground">Note: {payment.remarks}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {payment.screenshotUrl && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <ImageIcon className="size-4" /> Proof
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Payment screenshot</DialogTitle>
                </DialogHeader>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={payment.screenshotUrl}
                  alt="Payment proof"
                  className="max-h-[70vh] w-full rounded-lg object-contain"
                />
              </DialogContent>
            </Dialog>
          )}

          <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={pending}>
                <X className="size-4" /> Reject
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reject payment</DialogTitle>
              </DialogHeader>
              <Textarea
                placeholder="Reason for rejection (shown to the student)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setRejectOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={onReject} disabled={pending}>
                  {pending && <Loader2 className="size-4 animate-spin" />}
                  Confirm reject
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button size="sm" onClick={onApprove} disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
            Approve
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
