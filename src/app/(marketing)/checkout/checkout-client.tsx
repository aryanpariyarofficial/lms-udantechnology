"use client"

import { useState, useTransition } from "react"
import { Landmark, Building2, Tag, Loader2, CheckCircle2, Gift } from "lucide-react"
import { toast } from "sonner"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { CheckoutForm } from "./checkout-form"
import { formatPrice } from "@/lib/format"
import { PAYMENT_INFO } from "@/lib/constants"
import { applyCouponAction, redeemFreeCouponAction } from "./actions"

export type CheckoutOrder = {
  kind: "course" | "membership"
  slug: string
  title: string
  baseAmount: number
}

type Applied = {
  couponId: string
  finalAmount: number
  discount: number
  free: boolean
  code: string
}

export function CheckoutClient({ order }: { order: CheckoutOrder }) {
  const [code, setCode] = useState("")
  const [applied, setApplied] = useState<Applied | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const amount = applied ? applied.finalAmount : order.baseAmount

  function apply() {
    if (!code.trim()) return
    startTransition(async () => {
      const res = await applyCouponAction(order.kind, order.slug, code)
      if (res.ok) {
        setApplied({
          couponId: res.couponId,
          finalAmount: res.finalAmount,
          discount: res.discount,
          free: res.free,
          code: code.trim().toUpperCase(),
        })
        setMsg(res.message)
        toast.success(res.message)
      } else {
        setApplied(null)
        setMsg(res.message)
        toast.error(res.message)
      }
    })
  }

  function redeemFree() {
    if (!applied) return
    startTransition(async () => {
      const res = await redeemFreeCouponAction(order.kind, order.slug, applied.code)
      if (!res.ok) toast.error(res.error ?? "Failed")
      // success redirects server-side
    })
  }

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      {/* Left: payment instructions (only if not free) */}
      <div className="space-y-6 lg:col-span-3">
        {applied?.free ? (
          <Card className="border-success">
            <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
              <span className="grid size-14 place-items-center rounded-2xl bg-success/10 text-success">
                <Gift className="size-7" />
              </span>
              <div>
                <p className="text-lg font-semibold">This coupon makes it free! 🎉</p>
                <p className="text-muted-foreground">
                  No payment needed — get instant access.
                </p>
              </div>
              <Button size="lg" onClick={redeemFree} disabled={pending}>
                {pending && <Loader2 className="size-4 animate-spin" />}
                Get it free — Enroll now
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <QrPaymentMethod
              logoSrc="/brand/esewa-logo.png"
              alt="eSewa"
              qrSrc="/qr/esewa-qr.jpeg"
              number={PAYMENT_INFO.esewa}
              amount={amount}
            />
            <QrPaymentMethod
              logoSrc="/brand/khalti-logo.png"
              alt="Khalti"
              qrSrc="/qr/khalti-qr.jpeg"
              number={PAYMENT_INFO.khalti}
              amount={amount}
            />
            <Card>
              <CardHeader className="flex-row items-center gap-2 space-y-0">
                <Landmark className="size-5" />
                <h2 className="font-semibold">Bank Transfer</h2>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Row label="Bank" value={PAYMENT_INFO.bankName} icon={<Building2 className="size-4" />} />
                {PAYMENT_INFO.bankBranch && (
                  <>
                    <Separator />
                    <Row label="Branch" value={PAYMENT_INFO.bankBranch} />
                  </>
                )}
                <Separator />
                <Row label="Account number" value={PAYMENT_INFO.bankAccountNumber} />
                <Separator />
                <Row label="Account holder" value={PAYMENT_INFO.bankAccountHolder} />
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Right: summary + coupon + form */}
      <div className="lg:col-span-2">
        <div className="space-y-4 lg:sticky lg:top-20">
          {/* Order summary */}
          <Card>
            <CardContent className="space-y-3 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <Badge variant="secondary" className="mb-1 capitalize">
                    {order.kind}
                  </Badge>
                  <p className="font-medium">{order.title}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(order.baseAmount)}</span>
              </div>
              {applied && applied.discount > 0 && (
                <div className="flex items-center justify-between text-sm text-success">
                  <span>Discount</span>
                  <span>− {formatPrice(applied.discount)}</span>
                </div>
              )}
              <div className="flex items-center justify-between font-bold">
                <span>Total</span>
                <span className="text-xl">{formatPrice(amount)}</span>
              </div>

              {/* Coupon */}
              <div className="flex gap-2 pt-1">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Coupon code"
                    className="pl-9 uppercase"
                  />
                </div>
                <Button variant="outline" onClick={apply} disabled={pending}>
                  {pending ? <Loader2 className="size-4 animate-spin" /> : "Apply"}
                </Button>
              </div>
              {msg && applied && (
                <p className="flex items-center gap-1 text-xs text-success">
                  <CheckCircle2 className="size-3.5" /> {msg}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Payment proof form (hidden when free) */}
          {!applied?.free && (
            <Card>
              <CardHeader>
                <h2 className="font-semibold">Submit payment proof</h2>
                <p className="text-sm text-muted-foreground">
                  Pay {formatPrice(amount)}, then upload your proof.
                </p>
              </CardHeader>
              <CardContent>
                <CheckoutForm
                  kind={order.kind}
                  slug={order.slug}
                  couponCode={applied?.code ?? ""}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function QrPaymentMethod({
  logoSrc,
  alt,
  qrSrc,
  number,
  amount,
}: {
  logoSrc: string
  alt: string
  qrSrc: string
  number: string
  amount: number
}) {
  return (
    <Card>
      <CardHeader className="space-y-0 pb-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} alt={alt} className="h-8 w-auto object-contain" />
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrSrc}
          alt={`${alt} QR code`}
          className="size-52 shrink-0 rounded-xl border bg-white object-contain p-2 shadow-sm"
        />
        <div className="space-y-1 text-center sm:text-left">
          <p className="text-sm text-muted-foreground">Scan the QR, or send to</p>
          <p className="text-lg font-semibold">{number || "Not configured"}</p>
          <p className="text-sm text-muted-foreground">
            Amount: <span className="font-medium text-foreground">{formatPrice(amount)}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function Row({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="font-medium">{value || "—"}</span>
    </div>
  )
}
