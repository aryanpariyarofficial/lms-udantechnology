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
import { saveContent, type Result } from "../actions"
import type { ContentSection, PageContent } from "@/lib/content-schema"

function SaveButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="size-4 animate-spin" />} Save content
    </Button>
  )
}

export function ContentForm({
  pageKey,
  sections,
  values,
}: {
  pageKey: string
  sections: ContentSection[]
  values: PageContent
}) {
  const action = saveContent.bind(null, pageKey)
  const [state, formAction] = useActionState<Result, FormData>(
    async (_prev, fd) => action(fd),
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
          <AlertDescription>Content saved.</AlertDescription>
        </Alert>
      )}

      {sections.map((section) => (
        <Card key={section.title}>
          <CardHeader>
            <h2 className="font-semibold">{section.title}</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            {section.fields.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={field.key}>{field.label}</Label>
                {field.type === "textarea" ? (
                  <Textarea
                    id={field.key}
                    name={field.key}
                    rows={3}
                    defaultValue={values[field.key] ?? field.default}
                  />
                ) : (
                  <Input
                    id={field.key}
                    name={field.key}
                    defaultValue={values[field.key] ?? field.default}
                  />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      <SaveButton />
    </form>
  )
}
