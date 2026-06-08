"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Mail, MailOpen } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { formatDate } from "@/lib/format"
import { markMessageRead } from "../management-actions"

type Msg = {
  id: string
  name: string
  email: string
  subject: string | null
  message: string
  is_read: boolean
  created_at: string
}

export function MessagesList({ messages }: { messages: Msg[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  if (messages.length === 0)
    return (
      <Card>
        <CardContent className="py-16 text-center text-muted-foreground">
          No messages yet.
        </CardContent>
      </Card>
    )

  return (
    <div className="space-y-3">
      {messages.map((m) => (
        <Card key={m.id} className={m.is_read ? "opacity-70" : "border-primary/40"}>
          <CardContent className="space-y-2 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">
                  {m.name}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    &lt;{m.email}&gt;
                  </span>
                </p>
                {m.subject && <p className="text-sm font-medium">{m.subject}</p>}
              </div>
              <div className="flex items-center gap-2">
                {!m.is_read && <Badge>New</Badge>}
                <span className="text-xs text-muted-foreground">{formatDate(m.created_at)}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{m.message}</p>
            <div className="flex gap-2">
              <Button asChild size="sm" variant="outline">
                <a href={`mailto:${m.email}`}>Reply</a>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    await markMessageRead(m.id, !m.is_read)
                    router.refresh()
                  })
                }
              >
                {m.is_read ? <Mail className="size-4" /> : <MailOpen className="size-4" />}
                {m.is_read ? "Mark unread" : "Mark read"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
