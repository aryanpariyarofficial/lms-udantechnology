"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Settings2, Ban, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { formatDate } from "@/lib/format"
import {
  toggleSuspend,
  setRole,
  manualEnroll,
  grantMembership,
} from "../management-actions"
import type { AdminStudent } from "@/lib/queries/admin-extra"
import type { UserRole } from "@/lib/supabase/types"

type Option = { id: string; name?: string; title?: string }

export function StudentsManager({
  students,
  courses,
  plans,
}: {
  students: AdminStudent[]
  courses: Option[]
  plans: Option[]
}) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Manage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((s) => (
              <StudentRow key={s.id} student={s} courses={courses} plans={plans} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function StudentRow({
  student,
  courses,
  plans,
}: {
  student: AdminStudent
  courses: Option[]
  plans: Option[]
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [courseId, setCourseId] = useState(courses[0]?.id ?? "")
  const [planId, setPlanId] = useState(plans[0]?.id ?? "")

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, msg: string) =>
    startTransition(async () => {
      const res = await fn()
      if (res.ok) {
        toast.success(msg)
        router.refresh()
      } else toast.error(res.error ?? "Failed")
    })

  return (
    <TableRow>
      <TableCell>
        <p className="font-medium">{student.full_name ?? "—"}</p>
        <p className="text-xs text-muted-foreground">{student.email}</p>
      </TableCell>
      <TableCell>
        <Badge variant="secondary" className="capitalize">
          {student.role.replace("_", " ")}
        </Badge>
      </TableCell>
      <TableCell className="text-muted-foreground">{formatDate(student.created_at)}</TableCell>
      <TableCell>
        {student.is_suspended ? (
          <Badge variant="destructive">Suspended</Badge>
        ) : (
          <Badge variant="outline">Active</Badge>
        )}
      </TableCell>
      <TableCell className="text-right">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm">
              <Settings2 className="size-4" /> Manage
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{student.full_name ?? student.email}</DialogTitle>
            </DialogHeader>
            <div className="space-y-5">
              {/* Suspend */}
              <div className="flex items-center justify-between">
                <span className="text-sm">Account status</span>
                {student.is_suspended ? (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pending}
                    onClick={() => run(() => toggleSuspend(student.id, false), "Unsuspended")}
                  >
                    <CheckCircle2 className="size-4" /> Unsuspend
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={pending}
                    onClick={() => run(() => toggleSuspend(student.id, true), "Suspended")}
                  >
                    <Ban className="size-4" /> Suspend
                  </Button>
                )}
              </div>

              {/* Role */}
              <div className="space-y-2">
                <Label>Role</Label>
                <select
                  defaultValue={student.role}
                  onChange={(e) => run(() => setRole(student.id, e.target.value as UserRole), "Role updated")}
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                >
                  <option value="student">Student</option>
                  <option value="membership_user">Membership user</option>
                  <option value="instructor">Instructor</option>
                  <option value="super_admin">Super admin</option>
                </select>
              </div>

              {/* Manual enroll */}
              <div className="space-y-2">
                <Label>Grant course access (free)</Label>
                <div className="flex gap-2">
                  <select
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    className="h-9 flex-1 rounded-md border bg-background px-3 text-sm"
                  >
                    {courses.length === 0 && <option value="">No courses</option>}
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                  <Button
                    size="sm"
                    disabled={pending || !courseId}
                    onClick={() => run(() => manualEnroll(student.id, courseId), "Enrolled")}
                  >
                    Enroll
                  </Button>
                </div>
              </div>

              {/* Grant membership */}
              <div className="space-y-2">
                <Label>Grant membership</Label>
                <div className="flex gap-2">
                  <select
                    value={planId}
                    onChange={(e) => setPlanId(e.target.value)}
                    className="h-9 flex-1 rounded-md border bg-background px-3 text-sm"
                  >
                    {plans.length === 0 && <option value="">No plans</option>}
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <Button
                    size="sm"
                    disabled={pending || !planId}
                    onClick={() => run(() => grantMembership(student.id, planId), "Membership granted")}
                  >
                    Grant
                  </Button>
                </div>
              </div>

              {pending && (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" /> Working…
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </TableCell>
    </TableRow>
  )
}
