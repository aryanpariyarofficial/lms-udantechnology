"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Loader2, Mail, MessageSquare, MapPin } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SITE } from "@/lib/constants"
import { sendContactAction, type ContactState } from "./actions"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending && <Loader2 className="size-4 animate-spin" />}
      Send message
    </Button>
  )
}

export default function ContactPage() {
  const [state, formAction] = useActionState<ContactState, FormData>(
    sendContactAction,
    {}
  )

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Get in touch</h1>
        <p className="mt-2 text-muted-foreground">
          Questions about courses, payments, or membership? We&apos;re here to help.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4">
          {[
            { icon: Mail, title: "Email", value: `support@udantechnology.com` },
            { icon: MessageSquare, title: "Response time", value: "Within a few hours" },
            { icon: MapPin, title: "Based in", value: "Nepal 🇳🇵" },
          ].map(({ icon: Icon, title, value }) => (
            <Card key={title}>
              <CardContent className="flex items-center gap-3 p-4">
                <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-medium">{title}</p>
                  <p className="text-sm text-muted-foreground">{value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            {state.message ? (
              <Alert>
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            ) : (
              <form action={formAction} className="space-y-4">
                {state.error && (
                  <Alert variant="destructive">
                    <AlertDescription>{state.error}</AlertDescription>
                  </Alert>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" name="subject" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" name="message" rows={5} required />
                </div>
                <SubmitButton />
              </form>
            )}
          </CardContent>
        </Card>
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {SITE.name}
      </p>
    </div>
  )
}
