"use client"

import { useActionState, useState } from "react"
import { useFormStatus } from "react-dom"
import { Star, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { submitReviewAction, type ReviewState } from "./actions"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="size-4 animate-spin" />}
      Submit review
    </Button>
  )
}

export function ReviewForm({ courseId, slug }: { courseId: string; slug: string }) {
  const action = submitReviewAction.bind(null, courseId, slug)
  const [state, formAction] = useActionState<ReviewState, FormData>(action, {})
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)

  if (state.message) {
    return (
      <Alert>
        <AlertDescription>{state.message}</AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardContent className="p-5">
        <form action={formAction} className="space-y-4">
          <p className="font-medium">Write a review</p>
          {state.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          <input type="hidden" name="rating" value={rating} />
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                aria-label={`${n} stars`}
              >
                <Star
                  className={cn(
                    "size-7 transition-colors",
                    (hover || rating) >= n
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground"
                  )}
                />
              </button>
            ))}
          </div>
          <Textarea name="comment" rows={3} placeholder="Share your experience (optional)" />
          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  )
}
