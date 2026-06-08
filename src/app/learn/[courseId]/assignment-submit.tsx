"use client"

import { useEffect, useState, useCallback } from "react"
import { Loader2, CheckCircle2, Award } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"
import { submitAssignment } from "./actions"

type Submission = {
  content: string | null
  link_url: string | null
  status: string
  grade: number | null
  feedback: string | null
}

export function AssignmentSubmit({
  assignmentId,
  courseId,
  onSubmitted,
}: {
  assignmentId: string
  courseId: string
  onSubmitted: () => void
}) {
  const supabase = createClient()
  const [sub, setSub] = useState<Submission | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [content, setContent] = useState("")
  const [link, setLink] = useState("")
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("assignment_submissions")
      .select("content, link_url, status, grade, feedback")
      .eq("assignment_id", assignmentId)
      .maybeSingle()
    if (data) {
      const s = data as Submission
      setSub(s)
      setContent(s.content ?? "")
      setLink(s.link_url ?? "")
    }
    setLoaded(true)
  }, [supabase, assignmentId])

  useEffect(() => {
    load()
  }, [load])

  async function submit() {
    if (!content.trim() && !link.trim()) {
      toast.error("Add your work as text or a link.")
      return
    }
    setSaving(true)
    const res = await submitAssignment(assignmentId, courseId, content, link)
    setSaving(false)
    if (res.ok) {
      toast.success("Assignment submitted")
      onSubmitted()
      load()
    } else toast.error(res.error ?? "Failed")
  }

  if (!loaded)
    return (
      <div className="grid place-items-center py-8 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
      </div>
    )

  return (
    <div className="space-y-4">
      {sub?.status === "graded" && (
        <Alert>
          <Award className="size-4" />
          <AlertDescription>
            <span className="font-medium">Graded: {sub.grade}%</span>
            {sub.feedback && <p className="mt-1">{sub.feedback}</p>}
          </AlertDescription>
        </Alert>
      )}
      {sub && sub.status !== "graded" && (
        <Badge variant="secondary" className="gap-1">
          <CheckCircle2 className="size-3" /> Submitted — awaiting review
        </Badge>
      )}

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="space-y-2">
            <Label htmlFor="a-content">Your answer</Label>
            <Textarea
              id="a-content"
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type your response, or paste a summary…"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="a-link">Link (Google Drive, GitHub, etc.)</Label>
            <Input
              id="a-link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://…"
            />
          </div>
          <Button onClick={submit} disabled={saving}>
            {saving && <Loader2 className="size-4 animate-spin" />}
            {sub ? "Update submission" : "Submit assignment"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
