"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Star, Check, EyeOff, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { formatDate } from "@/lib/format"
import { setReviewStatus, deleteReview } from "../management-actions"

type ReviewRow = {
  id: string
  rating: number
  comment: string | null
  status: string
  created_at: string
  course: { title: string } | null
  user: { full_name: string | null } | null
}

const VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  approved: "default",
  pending: "secondary",
  hidden: "outline",
}

export function ReviewsManager({ reviews }: { reviews: ReviewRow[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    startTransition(async () => {
      const res = await fn()
      if (res.ok) router.refresh()
      else toast.error(res.error ?? "Failed")
    })

  if (reviews.length === 0)
    return (
      <Card>
        <CardContent className="py-16 text-center text-muted-foreground">
          No reviews yet.
        </CardContent>
      </Card>
    )

  return (
    <div className="space-y-3">
      {reviews.map((r) => (
        <Card key={r.id}>
          <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{r.user?.full_name ?? "Student"}</p>
                <div className="flex">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <Badge variant={VARIANT[r.status] ?? "secondary"} className="capitalize">
                  {r.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {r.course?.title} · {formatDate(r.created_at)}
              </p>
              {r.comment && <p className="text-sm">{r.comment}</p>}
            </div>
            <div className="flex items-center gap-2">
              {r.status !== "approved" && (
                <Button size="sm" disabled={pending} onClick={() => run(() => setReviewStatus(r.id, "approved"))}>
                  <Check className="size-4" /> Approve
                </Button>
              )}
              {r.status !== "hidden" && (
                <Button size="sm" variant="outline" disabled={pending} onClick={() => run(() => setReviewStatus(r.id, "hidden"))}>
                  <EyeOff className="size-4" /> Hide
                </Button>
              )}
              <Button size="icon" variant="ghost" className="text-destructive" disabled={pending} onClick={() => run(() => deleteReview(r.id))}>
                <Trash2 className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
