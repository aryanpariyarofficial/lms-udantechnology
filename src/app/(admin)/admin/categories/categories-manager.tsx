"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { createCategory, deleteCategory } from "../management-actions"
import type { CourseCategory } from "@/lib/supabase/types"

export function CategoriesManager({ categories }: { categories: CourseCategory[] }) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [pending, startTransition] = useTransition()

  function add() {
    if (!name.trim()) return
    startTransition(async () => {
      const res = await createCategory(name.trim())
      if (res.ok) {
        setName("")
        router.refresh()
      } else toast.error(res.error ?? "Failed")
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category name"
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
        />
        <Button onClick={add} disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
          Add
        </Button>
      </div>

      <Card>
        <CardContent className="divide-y p-0">
          {categories.length === 0 && (
            <p className="p-6 text-sm text-muted-foreground">No categories yet.</p>
          )}
          {categories.map((c) => (
            <div key={c.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground">/{c.slug}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive"
                onClick={() =>
                  startTransition(async () => {
                    const res = await deleteCategory(c.id)
                    if (res.ok) router.refresh()
                    else toast.error(res.error ?? "Failed")
                  })
                }
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
