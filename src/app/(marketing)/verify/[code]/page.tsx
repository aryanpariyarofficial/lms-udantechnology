import Link from "next/link"
import type { Metadata } from "next"
import { BadgeCheck, XCircle, GraduationCap } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getCertificateByCode } from "@/lib/queries/certificates"
import { formatDate } from "@/lib/format"
import { SITE } from "@/lib/constants"

export const metadata: Metadata = { title: "Certificate Verification" }

export default async function VerifyCodePage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params
  const cert = await getCertificateByCode(decodeURIComponent(code))

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      {cert ? (
        <Card className="overflow-hidden">
          <div className="flex items-center gap-3 bg-success/10 px-6 py-4 text-success">
            <BadgeCheck className="size-6" />
            <p className="font-semibold">Valid certificate</p>
          </div>
          <CardContent className="space-y-6 p-8">
            <div className="flex items-center gap-2">
              <GraduationCap className="size-5 text-primary" />
              <span className="font-semibold">{SITE.name}</span>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">This certifies that</p>
              <p className="text-2xl font-bold">
                {cert.user?.full_name ?? "Student"}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                successfully completed
              </p>
              <p className="text-lg font-semibold">{cert.course?.title}</p>
            </div>

            <div className="flex flex-wrap gap-x-8 gap-y-2 border-t pt-4 text-sm">
              <div>
                <p className="text-muted-foreground">Certificate ID</p>
                <p className="font-medium">{cert.certificate_code}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Issued on</p>
                <p className="font-medium">{formatDate(cert.issued_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-destructive/10 text-destructive">
              <XCircle className="size-7" />
            </span>
            <div>
              <p className="text-lg font-semibold">Certificate not found</p>
              <p className="mt-1 text-muted-foreground">
                We couldn&apos;t find a certificate with ID{" "}
                <span className="font-mono">{decodeURIComponent(code)}</span>.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/verify">Try another ID</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
