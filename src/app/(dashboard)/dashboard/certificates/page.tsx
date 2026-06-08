import Link from "next/link"
import type { Metadata } from "next"
import { Award, ExternalLink } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { requireUser } from "@/lib/auth"
import { getMyCertificates } from "@/lib/queries/dashboard"
import { formatDate } from "@/lib/format"

export const metadata: Metadata = { title: "Certificates" }

export default async function CertificatesPage() {
  const { user } = await requireUser()
  const certificates = (await getMyCertificates(user.id)) as unknown as Array<{
    id: string
    certificate_code: string
    issued_at: string
    course: { title: string; slug: string } | null
  }>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Certificates</h1>
        <p className="text-muted-foreground">
          Earn a certificate by completing a course 100%.
        </p>
      </div>

      {certificates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Award className="size-6" />
            </span>
            <p className="font-medium">No certificates yet</p>
            <p className="text-sm text-muted-foreground">
              Complete a course to earn your first certificate.
            </p>
            <Button asChild className="mt-2">
              <Link href="/dashboard/courses">Go to my courses</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {certificates.map((c) => (
            <Card key={c.id}>
              <CardContent className="flex items-center gap-4 p-5">
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Award className="size-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{c.course?.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Issued {formatDate(c.issued_at)} · ID {c.certificate_code}
                  </p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/certificate/${c.certificate_code}`}>
                    View <ExternalLink className="size-3.5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
