import Link from "next/link"
import type { Metadata } from "next"
import { Bell } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { requireUser } from "@/lib/auth"
import { getMyNotifications } from "@/lib/queries/dashboard"
import { formatDate } from "@/lib/format"

export const metadata: Metadata = { title: "Notifications" }

export default async function NotificationsPage() {
  const { user } = await requireUser()
  const notifications = (await getMyNotifications(user.id)) as unknown as Array<{
    id: string
    title: string
    body: string | null
    link: string | null
    is_read: boolean
    created_at: string
  }>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground">Your recent activity and updates.</p>
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Bell className="size-6" />
            </span>
            <p className="font-medium">No notifications yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const body = (
              <Card className={n.is_read ? undefined : "border-primary/40"}>
                <CardContent className="flex items-start justify-between gap-3 p-4">
                  <div>
                    <p className="font-medium">
                      {n.title}{" "}
                      {!n.is_read && <Badge className="ml-1 align-middle">New</Badge>}
                    </p>
                    {n.body && <p className="text-sm text-muted-foreground">{n.body}</p>}
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDate(n.created_at)}
                  </span>
                </CardContent>
              </Card>
            )
            return n.link ? (
              <Link key={n.id} href={n.link}>
                {body}
              </Link>
            ) : (
              <div key={n.id}>{body}</div>
            )
          })}
        </div>
      )}
    </div>
  )
}
