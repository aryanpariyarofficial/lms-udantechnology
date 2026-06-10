import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ArrowLeft, ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import { requireSuperAdmin } from "@/lib/auth"
import { CONTENT_PAGES } from "@/lib/content-schema"
import { getPageContent } from "@/lib/queries/content"
import { ContentForm } from "./content-form"

export const metadata: Metadata = { title: "Edit content · Admin" }

const VIEW_PATH: Record<string, string> = {
  home: "/",
  about: "/about",
  contact: "/contact",
}

export default async function EditContentPage({
  params,
}: {
  params: Promise<{ page: string }>
}) {
  await requireSuperAdmin()
  const { page } = await params
  const config = CONTENT_PAGES.find((p) => p.key === page)
  if (!config) notFound()

  const values = await getPageContent(page)

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link href="/admin/content" aria-label="Back">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <h1 className="text-xl font-bold tracking-tight">{config.label}</h1>
        </div>
        {VIEW_PATH[page] && (
          <Button asChild variant="outline" size="sm">
            <Link href={VIEW_PATH[page]} target="_blank">
              <ExternalLink className="size-4" /> View page
            </Link>
          </Button>
        )}
      </div>

      <ContentForm pageKey={page} sections={config.sections} values={values} />
    </div>
  )
}
