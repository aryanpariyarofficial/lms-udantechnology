import type { Metadata } from "next"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  getPlansAdmin,
  getActiveMemberships,
  getPlanCourseIds,
} from "@/lib/queries/admin-extra"
import { getAdminCourses } from "@/lib/queries/admin-courses"
import { formatDate } from "@/lib/format"
import { PlansManager } from "./plans-manager"

export const metadata: Metadata = { title: "Memberships · Admin" }

export default async function AdminMembershipsPage() {
  const [plans, courses, memberships] = await Promise.all([
    getPlansAdmin(),
    getAdminCourses(),
    getActiveMemberships(),
  ])

  const planCourses: Record<string, string[]> = {}
  await Promise.all(
    plans.map(async (p) => {
      planCourses[p.id] = await getPlanCourseIds(p.id)
    })
  )

  const rows = memberships as unknown as Array<{
    id: string
    status: string
    starts_at: string
    expires_at: string
    plan: { name: string } | null
    user: { full_name: string | null } | null
  }>

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Memberships</h1>
        <p className="text-muted-foreground">Plans, included courses, and subscribers.</p>
      </div>

      <PlansManager
        plans={plans}
        courses={courses.map((c) => ({ id: c.id, title: c.title }))}
        planCourses={planCourses}
      />

      <section className="space-y-3">
        <h2 className="font-semibold">Members</h2>
        {rows.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No active memberships yet.
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell>{m.user?.full_name ?? "—"}</TableCell>
                      <TableCell>{m.plan?.name ?? "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(m.starts_at)}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(m.expires_at)}</TableCell>
                      <TableCell>
                        <Badge variant={m.status === "active" ? "default" : "outline"} className="capitalize">
                          {m.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  )
}
