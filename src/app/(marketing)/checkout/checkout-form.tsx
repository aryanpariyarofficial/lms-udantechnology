"use client"

import { useActionState, useState } from "react"
import { useFormStatus } from "react-dom"
import { Loader2, Upload, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { PAYMENT_METHOD_LABELS } from "@/lib/constants"
import { submitPaymentAction, type CheckoutState } from "./actions"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending && <Loader2 className="size-4 animate-spin" />}
      Submit for approval
    </Button>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="flex items-center gap-1 text-sm text-destructive">
      <AlertCircle className="size-3.5 shrink-0" />
      {message}
    </p>
  )
}

type Errors = { method?: string; transactionId?: string; screenshot?: string }

export function CheckoutForm({
  kind,
  slug,
  couponCode = "",
}: {
  kind: "course" | "membership"
  slug: string
  couponCode?: string
}) {
  const [state, formAction] = useActionState<CheckoutState, FormData>(
    submitPaymentAction,
    {}
  )
  const [method, setMethod] = useState("esewa")
  const [transactionId, setTransactionId] = useState("")
  const [fileName, setFileName] = useState<string | null>(null)
  const [errors, setErrors] = useState<Errors>({})

  function validate(e: React.FormEvent<HTMLFormElement>) {
    const next: Errors = {}
    if (!method) next.method = "Please select the payment method you used."
    if (!transactionId.trim())
      next.transactionId =
        "Enter the transaction ID / reference from your payment."
    if (!fileName) next.screenshot = "Upload a screenshot of your payment."

    if (Object.keys(next).length > 0) {
      e.preventDefault() // stops the server action from running
      setErrors(next)
    } else {
      setErrors({})
    }
  }

  return (
    <form action={formAction} onSubmit={validate} noValidate className="space-y-5">
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="coupon" value={couponCode} />

      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {/* Method */}
      <div className="space-y-2">
        <Label>Which method did you pay with?</Label>
        <RadioGroup
          name="method"
          value={method}
          onValueChange={(v) => {
            setMethod(v)
            setErrors((p) => ({ ...p, method: undefined }))
          }}
          className="grid gap-2"
        >
          {(["esewa", "khalti", "bank_transfer"] as const).map((m) => (
            <Label
              key={m}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-lg border p-3 hover:bg-accent has-[:checked]:border-primary has-[:checked]:bg-accent",
                errors.method && "border-destructive"
              )}
            >
              <RadioGroupItem value={m} />
              <span className="text-sm font-medium">{PAYMENT_METHOD_LABELS[m]}</span>
            </Label>
          ))}
        </RadioGroup>
        <FieldError message={errors.method} />
      </div>

      {/* Transaction ID */}
      <div className="space-y-2">
        <Label htmlFor="transactionId">Transaction ID / Reference</Label>
        <Input
          id="transactionId"
          name="transactionId"
          value={transactionId}
          onChange={(e) => {
            setTransactionId(e.target.value)
            setErrors((p) => ({ ...p, transactionId: undefined }))
          }}
          placeholder="e.g. 9KJ3LM21"
          aria-invalid={!!errors.transactionId}
          className={cn(errors.transactionId && "border-destructive")}
        />
        <FieldError message={errors.transactionId} />
      </div>

      {/* Screenshot */}
      <div className="space-y-2">
        <Label htmlFor="screenshot">Payment screenshot</Label>
        <label
          htmlFor="screenshot"
          className={cn(
            "flex cursor-pointer items-center gap-3 rounded-lg border border-dashed p-4 text-sm text-muted-foreground hover:bg-accent",
            errors.screenshot && "border-destructive text-destructive"
          )}
        >
          <Upload className="size-4" />
          {fileName ?? "Click to upload (PNG/JPG, max 5MB)"}
        </label>
        <Input
          id="screenshot"
          name="screenshot"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            setFileName(e.target.files?.[0]?.name ?? null)
            setErrors((p) => ({ ...p, screenshot: undefined }))
          }}
        />
        <FieldError message={errors.screenshot} />
      </div>

      {/* Remarks */}
      <div className="space-y-2">
        <Label htmlFor="remarks">Remarks (optional)</Label>
        <Textarea
          id="remarks"
          name="remarks"
          rows={2}
          placeholder="Anything we should know?"
        />
      </div>

      <SubmitButton />
      <p className="text-center text-xs text-muted-foreground">
        Access is granted after our team verifies your payment — usually within a
        few hours.
      </p>
    </form>
  )
}
