"use client"

import { useActionState, useState } from "react"
import { useFormStatus } from "react-dom"
import { Loader2, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { DEFAULT_PRIMARY } from "@/lib/constants"
import { updateSettings, type Result } from "./actions"
import type { SiteSettings } from "@/lib/queries/settings"

const COLOR_PRESETS = [
  { name: "Indigo", value: "#5650EF" },
  { name: "Violet", value: "#7C3AED" },
  { name: "Blue", value: "#2563EB" },
  { name: "Emerald", value: "#059669" },
  { name: "Teal", value: "#0D9488" },
  { name: "Rose", value: "#E11D48" },
  { name: "Orange", value: "#EA580C" },
  { name: "Pink", value: "#DB2777" },
]

function SaveButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="size-4 animate-spin" />} Save settings
    </Button>
  )
}

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, formAction] = useActionState<Result, FormData>(
    async (_prev, fd) => updateSettings(fd),
    { ok: true }
  )
  const [color, setColor] = useState(settings.primary_color || DEFAULT_PRIMARY)

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      {state.ok && state.error === undefined && (
        <Alert>
          <AlertDescription>Settings saved.</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <h2 className="font-semibold">Site</h2>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Input id="tagline" name="tagline" defaultValue={settings.tagline} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="support_email">Support email</Label>
            <Input id="support_email" name="support_email" type="email" defaultValue={settings.support_email} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-semibold">Social links</h2>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="facebook">Facebook URL</Label>
            <Input id="facebook" name="facebook" defaultValue={settings.facebook} placeholder="https://facebook.com/…" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram URL</Label>
            <Input id="instagram" name="instagram" defaultValue={settings.instagram} placeholder="https://instagram.com/…" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="youtube">YouTube URL</Label>
            <Input id="youtube" name="youtube" defaultValue={settings.youtube} placeholder="https://youtube.com/…" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-semibold">Payment</h2>
          <p className="text-sm text-muted-foreground">
            Account numbers come from environment variables; this is the instruction
            text shown on checkout.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="payment_instructions">Payment instructions</Label>
            <Textarea
              id="payment_instructions"
              name="payment_instructions"
              rows={3}
              defaultValue={settings.payment_instructions}
            />
          </div>
        </CardContent>
      </Card>

      {/* Brand color */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold">Brand color</h2>
          <p className="text-sm text-muted-foreground">
            Controls the primary color across the whole website (buttons, links,
            highlights). Takes effect after saving.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <input type="hidden" name="primary_color" value={color} />
          <div className="flex flex-wrap gap-2">
            {COLOR_PRESETS.map((p) => (
              <button
                key={p.value}
                type="button"
                title={p.name}
                onClick={() => setColor(p.value)}
                className={cn(
                  "grid size-10 place-items-center rounded-lg border-2 transition",
                  color.toLowerCase() === p.value.toLowerCase()
                    ? "border-foreground"
                    : "border-transparent"
                )}
                style={{ backgroundColor: p.value }}
              >
                {color.toLowerCase() === p.value.toLowerCase() && (
                  <Check className="size-4 text-white" />
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="size-10 cursor-pointer rounded-lg border bg-transparent p-0.5"
              aria-label="Custom brand color"
            />
            <Input
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-32 font-mono"
            />
            <span
              className="rounded-lg px-4 py-2 text-sm font-medium text-white"
              style={{ backgroundColor: color }}
            >
              Preview
            </span>
          </div>
        </CardContent>
      </Card>

      <SaveButton />
    </form>
  )
}
