"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Trash2, Mail, Check, Inbox } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDate } from "@/lib/format"
import { markLeadRead, deleteLead } from "../management-actions"

type Lead = {
  id: string
  full_name: string
  email: string
  phone: string | null
  city: string | null
  interested_course: string | null
  is_read: boolean
  created_at: string
}

export function LeadsList({ leads }: { leads: Lead[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  if (leads.length === 0)
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
          <Inbox className="size-8" />
          <p>No leads yet. They&apos;ll appear here when visitors submit the popup form.</p>
        </CardContent>
      </Card>
    )

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Interested in</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((l) => (
              <TableRow key={l.id} className={l.is_read ? "opacity-60" : undefined}>
                <TableCell>
                  <span className="flex items-center gap-2 font-medium">
                    {!l.is_read && <span className="size-2 rounded-full bg-primary" />}
                    {l.full_name}
                  </span>
                </TableCell>
                <TableCell>
                  <a href={`mailto:${l.email}`} className="text-primary hover:underline">{l.email}</a>
                  {l.phone && <p className="text-xs text-muted-foreground">{l.phone}</p>}
                </TableCell>
                <TableCell className="text-muted-foreground">{l.city ?? "—"}</TableCell>
                <TableCell>
                  {l.interested_course ? (
                    <Badge variant="secondary">{l.interested_course}</Badge>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">{formatDate(l.created_at)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button asChild variant="ghost" size="icon" className="size-8" title="Email">
                      <a href={`mailto:${l.email}`}>
                        <Mail className="size-4" />
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      title={l.is_read ? "Mark unread" : "Mark read"}
                      disabled={pending}
                      onClick={() =>
                        startTransition(async () => {
                          await markLeadRead(l.id, !l.is_read)
                          router.refresh()
                        })
                      }
                    >
                      <Check className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-destructive"
                      title="Delete"
                      disabled={pending}
                      onClick={() =>
                        startTransition(async () => {
                          await deleteLead(l.id)
                          router.refresh()
                        })
                      }
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
