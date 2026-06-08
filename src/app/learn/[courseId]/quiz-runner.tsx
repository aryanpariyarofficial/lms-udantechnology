"use client"

import { useEffect, useState, useCallback } from "react"
import { CheckCircle2, XCircle, Loader2, RotateCcw, Award } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

type Q = {
  id: string
  question: string
  type: "mcq" | "multiple" | "true_false"
  options: { id: string; text: string }[]
  points: number
}

export function QuizRunner({
  quizId,
  onPassed,
}: {
  quizId: string
  onPassed: () => void
}) {
  const supabase = createClient()
  const [questions, setQuestions] = useState<Q[] | null>(null)
  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(async () => {
    setResult(null)
    setAnswers({})
    const rpc = supabase.rpc as unknown as (
      fn: string,
      args: Record<string, unknown>
    ) => Promise<{ data: unknown; error: { message: string } | null }>
    const { data, error } = await rpc("get_quiz_questions", { p_quiz_id: quizId })
    if (error) {
      toast.error(error.message)
      setQuestions([])
      return
    }
    const rows = (data as { id: string; question: string; type: Q["type"]; options: unknown; points: number }[]) ?? []
    setQuestions(
      rows.map((r) => ({
        id: r.id,
        question: r.question,
        type: r.type,
        options: (r.options as { id: string; text: string }[]) ?? [],
        points: r.points,
      }))
    )
  }, [supabase, quizId])

  useEffect(() => {
    load()
  }, [load])

  function pick(qId: string, optId: string, multiple: boolean) {
    setAnswers((prev) => {
      const cur = prev[qId] ?? []
      if (multiple) {
        return { ...prev, [qId]: cur.includes(optId) ? cur.filter((x) => x !== optId) : [...cur, optId] }
      }
      return { ...prev, [qId]: [optId] }
    })
  }

  async function submit() {
    if (!questions) return
    if (questions.some((q) => !(answers[q.id]?.length))) {
      toast.error("Please answer every question.")
      return
    }
    setSubmitting(true)
    const rpc = supabase.rpc as unknown as (
      fn: string,
      args: Record<string, unknown>
    ) => Promise<{ data: unknown; error: { message: string } | null }>
    const { data, error } = await rpc("submit_quiz_attempt", { p_quiz_id: quizId, p_answers: answers })
    setSubmitting(false)
    if (error) {
      toast.error(error.message)
      return
    }
    const attempt = data as { score: number; passed: boolean }
    setResult({ score: attempt.score, passed: attempt.passed })
    if (attempt.passed) {
      onPassed()
      toast.success("Passed! 🎉")
    }
  }

  if (questions === null)
    return (
      <div className="grid place-items-center py-12 text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
      </div>
    )

  if (questions.length === 0)
    return <p className="text-sm text-muted-foreground">This quiz has no questions yet.</p>

  if (result) {
    return (
      <Card className={result.passed ? "border-success" : "border-destructive"}>
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          {result.passed ? (
            <Award className="size-14 text-success" />
          ) : (
            <XCircle className="size-14 text-destructive" />
          )}
          <div>
            <p className="text-2xl font-bold">{result.score.toFixed(0)}%</p>
            <p className="text-muted-foreground">
              {result.passed ? "You passed this quiz!" : "Not quite — try again."}
            </p>
          </div>
          <Button variant="outline" onClick={load}>
            <RotateCcw className="size-4" /> Retake quiz
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-5">
      {questions.map((q, i) => (
        <Card key={q.id}>
          <CardContent className="space-y-3 p-5">
            <p className="font-medium">
              {i + 1}. {q.question}
              <Badge variant="secondary" className="ml-2 align-middle">{q.points} pt</Badge>
              {q.type === "multiple" && (
                <span className="ml-2 text-xs text-muted-foreground">(select all that apply)</span>
              )}
            </p>
            <div className="space-y-2">
              {q.options.map((o) => {
                const selected = (answers[q.id] ?? []).includes(o.id)
                return (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => pick(q.id, o.id, q.type === "multiple")}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg border p-3 text-left text-sm transition-colors",
                      selected ? "border-primary bg-accent" : "hover:bg-accent/50"
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-5 shrink-0 place-items-center border",
                        q.type === "multiple" ? "rounded" : "rounded-full",
                        selected && "border-primary bg-primary text-primary-foreground"
                      )}
                    >
                      {selected && <CheckCircle2 className="size-3.5" />}
                    </span>
                    {o.text}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      ))}
      <Button onClick={submit} disabled={submitting} size="lg">
        {submitting && <Loader2 className="size-4 animate-spin" />} Submit quiz
      </Button>
    </div>
  )
}
