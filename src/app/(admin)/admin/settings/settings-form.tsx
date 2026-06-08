"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { updateSettings, type Result } from "./actions"
import type { SiteSettings } from "@/lib/queries/settings"

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
          <h2 className="font-semibold">Homepage hero</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hero_heading">Heading</Label>
            <Input id="hero_heading" name="hero_heading" defaultValue={settings.hero_heading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hero_subheading">Subheading</Label>
            <Textarea id="hero_subheading" name="hero_subheading" rows={2} defaultValue={settings.hero_subheading} />
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

      <SaveButton />
    </form>
  )
}
