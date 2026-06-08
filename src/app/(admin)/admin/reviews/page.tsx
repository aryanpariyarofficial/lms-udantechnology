import type { Metadata } from "next"

import { getAllReviews } from "@/lib/queries/admin-extra"
import { ReviewsManager } from "./reviews-manager"

export const metadata: Metadata = { title: "Reviews · Admin" }

export default async function AdminReviewsPage() {
  const reviews = (await getAllReviews()) as unknown as Parameters<
    typeof ReviewsManager
  >[0]["reviews"]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reviews</h1>
        <p className="text-muted-foreground">Approve, hide, or remove course reviews.</p>
      </div>
      <ReviewsManager reviews={reviews} />
    </div>
  )
}
