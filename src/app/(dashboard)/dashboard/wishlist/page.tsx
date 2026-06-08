import Link from "next/link"
import type { Metadata } from "next"
import { Heart } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { requireUser } from "@/lib/auth"
import { getMyWishlist } from "@/lib/queries/dashboard"
import { formatPrice } from "@/lib/format"

export const metadata: Metadata = { title: "Wishlist" }

export default async function WishlistPage() {
  const { user } = await requireUser()
  const items = (await getMyWishlist(user.id)) as unknown as Array<{
    course: {
      id: string
      title: string
      slug: string
      price: number
      discount_price: number | null
    } | null
  }>
  const courses = items.map((i) => i.course).filter(Boolean) as NonNullable<
    (typeof items)[number]["course"]
  >[]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Wishlist</h1>
        <p className="text-muted-foreground">Courses you saved for later.</p>
      </div>

      {courses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Heart className="size-6" />
            </span>
            <p className="font-medium">Your wishlist is empty</p>
            <Button asChild className="mt-2">
              <Link href="/courses">Browse courses</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <Card key={c.id}>
              <CardContent className="space-y-3 p-5">
                <h3 className="line-clamp-2 font-semibold">{c.title}</h3>
                <p className="text-lg font-bold">
                  {formatPrice(c.discount_price ?? c.price)}
                </p>
                <Button asChild className="w-full">
                  <Link href={`/courses/${c.slug}`}>View course</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
