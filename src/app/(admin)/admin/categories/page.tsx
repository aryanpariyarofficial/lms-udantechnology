import type { Metadata } from "next"

import { getAdminCategories } from "@/lib/queries/admin-extra"
import { CategoriesManager } from "./categories-manager"

export const metadata: Metadata = { title: "Categories · Admin" }

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories()
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
        <p className="text-muted-foreground">Organize courses into categories.</p>
      </div>
      <CategoriesManager categories={categories} />
    </div>
  )
}
