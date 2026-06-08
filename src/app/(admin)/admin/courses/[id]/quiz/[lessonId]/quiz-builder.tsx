"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Check, Loader2, X } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { updateQuiz, addQuestion, deleteQuestion } from "../../../quiz-actions"
import type { Quiz, QuizQuestion, QuizQuestionType } from "@/lib/supabase/types"

export function QuizBuilder({
  quiz,
  questions,
  courseId,
}: {
  quiz: Quiz
  questions: QuizQuestion[]
  courseId: string
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function saveSettings(formData: FormData) {
    startTransition(async () => {
      const res = await updateQuiz(quiz.id, courseId, formData)
      if (res.ok) toast.success("Quiz settings saved")
      else toast.error(res.error ?? "Failed")
    })
  }

  return (
    <div className="space-y-6">
      {/* Settings */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold">Quiz settings</h2>
        </CardHeader>
        <CardContent>
          <form action={saveSettings} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" defaultValue={quiz.title} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pass_percentage">Pass mark (%)</Label>
              <Input id="pass_percentage" name="pass_percentage" type="number" min="0" max="100" defaultValue={quiz.pass_percentage} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time_limit_minutes">Time limit (min, blank = none)</Label>
              <Input id="time_limit_minutes" name="time_limit_minutes" type="number" min="0" defaultValue={quiz.time_limit_minutes ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_attempts">Max attempts (0 = unlimited)</Label>
              <Input id="max_attempts" name="max_attempts" type="number" min="0" defaultValue={quiz.max_attempts} />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={pending}>
                {pending && <Loader2 className="size-4 animate-spin" />} Save settings
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Questions */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <h2 className="font-semibold">Questions ({questions.length})</h2>
        </CardHeader>
        <CardContent className="space-y-3">
          {questions.map((q, i) => {
            const opts = (q.options as unknown as { id: string; text: string }[]) ?? []
            const correct = (q.correct_answers as unknown as string[]) ?? []
            return (
              <div key={q.id} className="rounded-lg border p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium">
                    {i + 1}. {q.question}{" "}
                    <Badge variant="secondary" className="ml-1 align-middle capitalize">
                      {q.type.replace("_", "/")}
                    </Badge>
                    <span className="ml-1 text-xs text-muted-foreground">{q.points} pt</span>
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() =>
                      startTransition(async () => {
                        const res = await deleteQuestion(q.id, courseId)
                        if (res.ok) router.refresh()
                      })
                    }
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
                <ul className="mt-2 space-y-1 text-sm">
                  {opts.map((o) => (
                    <li key={o.id} className="flex items-center gap-2">
                      {correct.includes(o.id) ? (
                        <Check className="size-4 text-success" />
                      ) : (
                        <span className="inline-block size-4 rounded-full border" />
                      )}
                      {o.text}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}

          <AddQuestion quizId={quiz.id} courseId={courseId} />
        </CardContent>
      </Card>
    </div>
  )
}

function AddQuestion({ quizId, courseId }: { quizId: string; courseId: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [type, setType] = useState<QuizQuestionType>("mcq")
  const [question, setQuestion] = useState("")
  const [points, setPoints] = useState(1)
  const [options, setOptions] = useState<string[]>(["", ""])
  const [correct, setCorrect] = useState<Set<number>>(new Set())

  function reset() {
    setQuestion("")
    setPoints(1)
    setOptions(["", ""])
    setCorrect(new Set())
    setType("mcq")
  }

  function toggleCorrect(i: number) {
    setCorrect((prev) => {
      const next = type === "mcq" || type === "true_false" ? new Set<number>() : new Set(prev)
      if (prev.has(i) && (type === "multiple")) next.delete(i)
      else next.add(i)
      return next
    })
  }

  function submit() {
    const finalOptions =
      type === "true_false"
        ? [
            { id: "true", text: "True" },
            { id: "false", text: "False" },
          ]
        : options
            .map((t, i) => ({ id: `o${i}`, text: t.trim() }))
            .filter((o) => o.text)

    const correctIds =
      type === "true_false"
        ? [...correct].map((i) => (i === 0 ? "true" : "false"))
        : [...correct].map((i) => `o${i}`).filter((id) => finalOptions.some((o) => o.id === id))

    if (type !== "true_false" && finalOptions.length < 2) {
      toast.error("Add at least 2 options.")
      return
    }

    startTransition(async () => {
      const res = await addQuestion({
        quizId,
        courseId,
        question,
        type,
        options: finalOptions,
        correct_answers: correctIds,
        points,
      })
      if (res.ok) {
        reset()
        router.refresh()
        toast.success("Question added")
      } else toast.error(res.error ?? "Failed")
    })
  }

  const tfOptions = ["True", "False"]

  return (
    <div className="rounded-lg border border-dashed p-4">
      <p className="mb-3 text-sm font-medium">Add a question</p>
      <div className="space-y-3">
        <Textarea
          placeholder="Question text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={2}
        />
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Type</Label>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value as QuizQuestionType)
                setCorrect(new Set())
              }}
              className="h-9 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="mcq">Single choice (MCQ)</option>
              <option value="multiple">Multiple answers</option>
              <option value="true_false">True / False</option>
            </select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Points</Label>
            <Input type="number" min="1" value={points} onChange={(e) => setPoints(Number(e.target.value))} />
          </div>
        </div>

        {/* Options */}
        <div className="space-y-2">
          <Label className="text-xs">
            Options {type === "multiple" ? "(check all correct)" : "(select the correct one)"}
          </Label>
          {type === "true_false"
            ? tfOptions.map((t, i) => (
                <label key={t} className="flex items-center gap-2 text-sm">
                  <button
                    type="button"
                    onClick={() => toggleCorrect(i)}
                    className={cn(
                      "grid size-5 place-items-center rounded-full border",
                      correct.has(i) && "border-success bg-success text-white"
                    )}
                  >
                    {correct.has(i) && <Check className="size-3" />}
                  </button>
                  {t}
                </label>
              ))
            : options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleCorrect(i)}
                    className={cn(
                      "grid size-7 shrink-0 place-items-center rounded-md border",
                      correct.has(i) && "border-success bg-success text-white"
                    )}
                    title="Mark correct"
                  >
                    {correct.has(i) && <Check className="size-4" />}
                  </button>
                  <Input
                    placeholder={`Option ${i + 1}`}
                    value={opt}
                    onChange={(e) =>
                      setOptions((prev) => prev.map((o, j) => (j === i ? e.target.value : o)))
                    }
                  />
                  {options.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setOptions((prev) => prev.filter((_, j) => j !== i))
                        setCorrect(new Set())
                      }}
                    >
                      <X className="size-4" />
                    </Button>
                  )}
                </div>
              ))}
          {type !== "true_false" && (
            <Button type="button" variant="outline" size="sm" onClick={() => setOptions((p) => [...p, ""])}>
              <Plus className="size-4" /> Option
            </Button>
          )}
        </div>

        <Button onClick={submit} disabled={pending || !question.trim()}>
          {pending && <Loader2 className="size-4 animate-spin" />} Add question
        </Button>
      </div>
    </div>
  )
}
