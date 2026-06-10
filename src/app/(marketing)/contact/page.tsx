import type { Metadata } from "next"
import { Mail, MessageSquare, MapPin } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { getPageContent } from "@/lib/queries/content"
import { SITE } from "@/lib/constants"
import { ContactForm } from "./contact-form"

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the UDAN Technology team.",
}

export default async function ContactPage() {
  const c = await getPageContent("contact")

  const details = [
    { icon: Mail, title: "Email", value: c.email },
    { icon: MessageSquare, title: "Response time", value: c.response_time },
    { icon: MapPin, title: "Based in", value: c.location },
  ]

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight">{c.heading}</h1>
        <p className="mt-2 text-muted-foreground">{c.subtitle}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4">
          {details.map(({ icon: Icon, title, value }) => (
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

        <ContactForm />
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {SITE.name}
      </p>
    </div>
  )
}
