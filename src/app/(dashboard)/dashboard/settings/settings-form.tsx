"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { updateProfileAction, type SettingsState } from "./actions"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="size-4 animate-spin" />}
      Save changes
    </Button>
  )
}

export function SettingsForm({
  defaults,
}: {
  defaults: { full_name: string; phone: string; bio: string; email: string }
}) {
  const [state, formAction] = useActionState<SettingsState, FormData>(
    updateProfileAction,
    {}
  )

  return (
    <form action={formAction} className="max-w-lg space-y-5">
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      {state.message && (
        <Alert>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={defaults.email} disabled />
        <p className="text-xs text-muted-foreground">Email can&apos;t be changed here.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="full_name">Full name</Label>
        <Input id="full_name" name="full_name" defaultValue={defaults.full_name} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" defaultValue={defaults.phone} placeholder="98XXXXXXXX" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" name="bio" defaultValue={defaults.bio} rows={3} />
      </div>

      <SubmitButton />
    </form>
  )
}
