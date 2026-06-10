import type { Metadata } from "next"

import { getLeads } from "@/lib/queries/admin-extra"
import { LeadsList } from "./leads-list"

export const metadata: Metadata = { title: "Leads · Admin" }

export default async function AdminLeadsPage() {
  const leads = (await getLeads()) as unknown as Parameters<typeof LeadsList>[0]["leads"]
  const unread = leads.filter((l) => !l.is_read).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
        <p className="text-muted-foreground">
          {leads.length} total · {unread} new — from the website popup form.
        </p>
      </div>
      <LeadsList leads={leads} />
    </div>
  )
}
