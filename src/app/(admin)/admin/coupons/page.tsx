import type { Metadata } from "next"

import { getCoupons } from "@/lib/queries/admin-extra"
import { getAdminCourses } from "@/lib/queries/admin-courses"
import { CouponsManager } from "./coupons-manager"

export const metadata: Metadata = { title: "Coupons · Admin" }

export default async function AdminCouponsPage() {
  const [coupons, courses] = await Promise.all([getCoupons(), getAdminCourses()])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Coupons</h1>
        <p className="text-muted-foreground">
          Create discount or 100%-off (free) codes for promotions.
        </p>
      </div>
      <CouponsManager
        coupons={coupons as unknown as Parameters<typeof CouponsManager>[0]["coupons"]}
        courses={courses.map((c) => ({ id: c.id, title: c.title }))}
      />
    </div>
  )
}
