"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Plus, Pencil, Trash2, ListChecks, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { formatPrice } from "@/lib/format"
import { createPlan, updatePlan, deletePlan, setPlanCourses } from "../management-actions"
import type { MembershipPlan } from "@/lib/supabase/types"

type CourseOpt = { id: string; title: string }

export function PlansManager({
  plans,
  courses,
  planCourses,
}: {
  plans: MembershipPlan[]
  courses: CourseOpt[]
  planCourses: Record<string, string[]>
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Plans</h2>
        <PlanDialog courses={courses} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {plans.map((p) => (
          <Card key={p.id}>
            <CardContent className="space-y-3 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(p.price)} · {p.duration_days} days
                  </p>
                </div>
                <Badge variant={p.is_active ? "default" : "outline"}>
                  {p.is_active ? "Active" : "Hidden"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {(planCourses[p.id]?.length ?? 0)} courses included
              </p>
              <div className="flex flex-wrap gap-2">
                <PlanDialog plan={p} courses={courses} />
                <IncludedCoursesDialog
                  plan={p}
                  courses={courses}
                  selected={planCourses[p.id] ?? []}
                />
                <DeletePlanButton id={p.id} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function PlanDialog({ plan, courses: _courses }: { plan?: MembershipPlan; courses: CourseOpt[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  function submit(formData: FormData) {
    startTransition(async () => {
      const res = plan ? await updatePlan(plan.id, formData) : await createPlan(formData)
      if (res.ok) {
        setOpen(false)
        router.refresh()
      } else toast.error(res.error ?? "Failed")
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {plan ? (
          <Button variant="outline" size="sm">
            <Pencil className="size-4" /> Edit
          </Button>
        ) : (
          <Button size="sm">
            <Plus className="size-4" /> New plan
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{plan ? "Edit plan" : "New plan"}</DialogTitle>
        </DialogHeader>
        <form action={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="p-name">Name</Label>
            <Input id="p-name" name="name" defaultValue={plan?.name} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="p-price">Price (Rs)</Label>
              <Input id="p-price" name="price" type="number" min="0" defaultValue={plan?.price ?? 0} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-days">Duration (days)</Label>
              <Input id="p-days" name="duration_days" type="number" min="1" defaultValue={plan?.duration_days ?? 30} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-desc">Description</Label>
            <Input id="p-desc" name="description" defaultValue={plan?.description ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-feat">Features (one per line)</Label>
            <Textarea id="p-feat" name="features" rows={4} defaultValue={plan?.features.join("\n")} />
          </div>
          <div className="flex items-center gap-3">
            <Switch id="p-active" name="is_active" defaultChecked={plan?.is_active ?? true} />
            <Label htmlFor="p-active">Visible to students</Label>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="size-4 animate-spin" />}
              {plan ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function IncludedCoursesDialog({
  plan,
  courses,
  selected,
}: {
  plan: MembershipPlan
  courses: CourseOpt[]
  selected: string[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [picked, setPicked] = useState<Set<string>>(new Set(selected))
  const [pending, startTransition] = useTransition()

  function toggle(id: string) {
    setPicked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function save() {
    startTransition(async () => {
      const res = await setPlanCourses(plan.id, [...picked])
      if (res.ok) {
        toast.success("Included courses updated")
        setOpen(false)
        router.refresh()
      } else toast.error(res.error ?? "Failed")
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <ListChecks className="size-4" /> Courses
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Courses in {plan.name}</DialogTitle>
        </DialogHeader>
        <div className="max-h-80 space-y-2 overflow-y-auto">
          {courses.length === 0 && (
            <p className="text-sm text-muted-foreground">No courses yet.</p>
          )}
          {courses.map((c) => (
            <label key={c.id} className="flex items-center gap-3 rounded-md border p-2.5 text-sm">
              <Checkbox checked={picked.has(c.id)} onCheckedChange={() => toggle(c.id)} />
              {c.title}
            </label>
          ))}
        </div>
        <DialogFooter>
          <Button onClick={save} disabled={pending}>
            {pending && <Loader2 className="size-4 animate-spin" />}
            Save ({picked.size})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function DeletePlanButton({ id }: { id: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-destructive"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await deletePlan(id)
          if (res.ok) router.refresh()
          else toast.error(res.error ?? "Failed")
        })
      }
    >
      <Trash2 className="size-4" />
    </Button>
  )
}
