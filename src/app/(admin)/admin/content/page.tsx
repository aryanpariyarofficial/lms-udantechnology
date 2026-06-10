import Link from "next/link"
import type { Metadata } from "next"
import { FileText, ChevronRight } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { requireSuperAdmin } from "@/lib/auth"
import { CONTENT_PAGES } from "@/lib/content-schema"

export const metadata: Metadata = { title: "Content · Admin" }

export default async function ContentPage() {
  await requireSuperAdmin()

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Content Editor</h1>
        <p className="text-muted-foreground">
          Edit the text on your public pages. Dynamic data (courses, reviews…) stays automatic.
        </p>
      </div>

      <div className="grid gap-3">
        {CONTENT_PAGES.map((p) => (
          <Link key={p.key} href={`/admin/content/${p.key}`}>
            <Card className="transition-colors hover:border-primary hover:bg-accent">
              <CardContent className="flex items-center gap-4 p-5">
                <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <FileText className="size-5" />
                </span>
                <div className="flex-1">
                  <p className="font-medium">{p.label}</p>
                  <p className="text-sm text-muted-foreground">{p.description}</p>
                </div>
                <ChevronRight className="size-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
