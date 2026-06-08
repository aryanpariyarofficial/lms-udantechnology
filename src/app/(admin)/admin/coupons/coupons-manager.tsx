"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Loader2, Tag } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { formatPrice, formatDate } from "@/lib/format"
import { createCoupon, toggleCoupon, deleteCoupon } from "./actions"

type Coupon = {
  id: string
  code: string
  type: "percentage" | "fixed"
  value: number
  applies_to: string
  max_uses: number
  used_count: number
  expires_at: string | null
  is_active: boolean
  course: { title: string } | null
}

export function CouponsManager({
  coupons,
  courses,
}: {
  coupons: Coupon[]
  courses: { id: string; title: string }[]
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <CreateCouponDialog courses={courses} />
      </div>

      {coupons.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Tag className="size-6" />
            </span>
            <p className="font-medium">No coupons yet</p>
            <p className="text-sm text-muted-foreground">
              Create discount or free-access codes for your students.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Applies to</TableHead>
                  <TableHead>Uses</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono font-medium">{c.code}</TableCell>
                    <TableCell>
                      {c.type === "percentage" ? `${c.value}%` : formatPrice(c.value)}
                    </TableCell>
                    <TableCell className="capitalize">
                      {c.applies_to === "course" && c.course
                        ? c.course.title
                        : c.applies_to}
                    </TableCell>
                    <TableCell>
                      {c.used_count}
                      {c.max_uses > 0 ? ` / ${c.max_uses}` : ""}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {c.expires_at ? formatDate(c.expires_at) : "—"}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={c.is_active}
                        onCheckedChange={(v) =>
                          startTransition(async () => {
                            const res = await toggleCoupon(c.id, v)
                            if (res.ok) router.refresh()
                            else toast.error(res.error ?? "Failed")
                          })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        disabled={pending}
                        onClick={() =>
                          startTransition(async () => {
                            const res = await deleteCoupon(c.id)
                            if (res.ok) router.refresh()
                          })
                        }
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function CreateCouponDialog({ courses }: { courses: { id: string; title: string }[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [appliesTo, setAppliesTo] = useState("all")
  const [type, setType] = useState("percentage")

  function submit(formData: FormData) {
    startTransition(async () => {
      const res = await createCoupon(formData)
      if (res.ok) {
        setOpen(false)
        router.refresh()
        toast.success("Coupon created")
      } else toast.error(res.error ?? "Failed")
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" /> New coupon
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create coupon</DialogTitle>
        </DialogHeader>
        <form action={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Code</Label>
            <Input id="code" name="code" placeholder="DASHAIN50" className="uppercase" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                name="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed (Rs)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">
                {type === "percentage" ? "Percent off (100 = free)" : "Amount off (Rs)"}
              </Label>
              <Input id="value" name="value" type="number" min="0" defaultValue={type === "percentage" ? 100 : 0} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="applies_to">Applies to</Label>
            <select
              id="applies_to"
              name="applies_to"
              value={appliesTo}
              onChange={(e) => setAppliesTo(e.target.value)}
              className="h-9 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="all">All courses & memberships</option>
              <option value="course">A specific course</option>
              <option value="membership">Memberships only</option>
            </select>
          </div>
          {appliesTo === "course" && (
            <div className="space-y-2">
              <Label htmlFor="course_id">Course</Label>
              <select
                id="course_id"
                name="course_id"
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                {courses.length === 0 && <option value="">No courses</option>}
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max_uses">Max uses (0 = unlimited)</Label>
              <Input id="max_uses" name="max_uses" type="number" min="0" defaultValue={0} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expires_at">Expires (optional)</Label>
              <Input id="expires_at" name="expires_at" type="date" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="size-4 animate-spin" />} Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
