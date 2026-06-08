"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { Bell, CheckCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

type Notif = {
  id: string
  title: string
  body: string | null
  link: string | null
  is_read: boolean
  created_at: string
}

export function NotificationBell() {
  const [items, setItems] = useState<Notif[]>([])
  const supabase = createClient()

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("notifications")
      .select("id, title, body, link, is_read, created_at")
      .order("created_at", { ascending: false })
      .limit(20)
    setItems((data as Notif[]) ?? [])
  }, [supabase])

  useEffect(() => {
    load()
  }, [load])

  const unread = items.filter((n) => !n.is_read).length

  async function markAllRead() {
    const ids = items.filter((n) => !n.is_read).map((n) => n.id)
    if (ids.length === 0) return
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })))
    await supabase.from("notifications").update({ is_read: true }).in("id", ids)
  }

  return (
    <Popover onOpenChange={(o) => o && load()}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="size-5" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b p-3">
          <p className="text-sm font-semibold">Notifications</p>
          {unread > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={markAllRead}>
              <CheckCheck className="size-3.5" /> Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-96">
          {items.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">
              No notifications yet.
            </p>
          ) : (
            <ul className="divide-y">
              {items.map((n) => {
                const inner = (
                  <div
                    className={cn(
                      "p-3 text-sm hover:bg-accent",
                      !n.is_read && "bg-accent/40"
                    )}
                  >
                    <p className="font-medium">{n.title}</p>
                    {n.body && <p className="text-muted-foreground">{n.body}</p>}
                  </div>
                )
                return (
                  <li key={n.id}>
                    {n.link ? <Link href={n.link}>{inner}</Link> : inner}
                  </li>
                )
              })}
            </ul>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
