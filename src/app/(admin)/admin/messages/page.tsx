import type { Metadata } from "next"

import { getContactMessages } from "@/lib/queries/admin-extra"
import { MessagesList } from "./messages-list"

export const metadata: Metadata = { title: "Messages · Admin" }

export default async function AdminMessagesPage() {
  const messages = (await getContactMessages()) as unknown as Parameters<
    typeof MessagesList
  >[0]["messages"]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground">Contact form submissions.</p>
      </div>
      <MessagesList messages={messages} />
    </div>
  )
}
