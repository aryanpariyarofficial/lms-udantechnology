"use client"

import { useTransition } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { updateAssignment } from "../../../quiz-actions"
import type { Assignment } from "@/lib/supabase/types"

export function AssignmentForm({
  assignment,
  courseId,
}: {
  assignment: Assignment
  courseId: string
}) {
  const [pending, startTransition] = useTransition()

  function save(formData: FormData) {
    startTransition(async () => {
      const res = await updateAssignment(assignment.id, courseId, formData)
      if (res.ok) toast.success("Assignment saved")
      else toast.error(res.error ?? "Failed")
    })
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form action={save} className="max-w-xl space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" defaultValue={assignment.title} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions</Label>
            <Textarea id="instructions" name="instructions" rows={6} defaultValue={assignment.instructions ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max_points">Max points</Label>
            <Input id="max_points" name="max_points" type="number" min="1" defaultValue={assignment.max_points} className="w-32" />
          </div>
          <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="size-4 animate-spin" />} Save assignment
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
