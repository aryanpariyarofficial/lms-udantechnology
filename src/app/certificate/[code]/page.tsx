import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ArrowLeft, BadgeCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { QrCode } from "@/components/payment/qr-code"
import { getCertificateByCode } from "@/lib/queries/certificates"
import { formatDate } from "@/lib/format"
import { SITE } from "@/lib/constants"
import { PrintButton } from "./print-button"

export const metadata: Metadata = { title: "Certificate" }

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params
  const cert = await getCertificateByCode(decodeURIComponent(code))
  if (!cert) notFound()

  const verifyUrl = `${SITE.url}/verify/${cert.certificate_code}`

  return (
    <div className="min-h-svh bg-muted/40 py-8">
      {/* Print rules: landscape, hide everything but the certificate */}
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 0; }
          body { background: #fff; }
          .no-print { display: none !important; }
          .cert-sheet { box-shadow: none !important; border: none !important; margin: 0 !important; width: 100% !important; max-width: none !important; }
        }
      `}</style>

      {/* Toolbar */}
      <div className="no-print mx-auto mb-6 flex max-w-4xl items-center justify-between px-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard/certificates">
            <ArrowLeft className="size-4" /> Back
          </Link>
        </Button>
        <PrintButton />
      </div>

      {/* Certificate */}
      <div className="mx-auto max-w-4xl px-4">
        <div className="cert-sheet relative overflow-hidden rounded-xl border-4 border-double border-primary/40 bg-white p-10 shadow-xl sm:p-16">
          {/* corner accents */}
          <div className="absolute left-0 top-0 size-32 -translate-x-12 -translate-y-12 rounded-full bg-primary/10" />
          <div className="absolute bottom-0 right-0 size-40 translate-x-16 translate-y-16 rounded-full bg-success/10" />

          <div className="relative space-y-8 text-center">
            {/* Brand */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/udan-logo.png"
              alt="UDAN Technology LMS"
              className="mx-auto h-16 w-auto"
            />

            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
                Certificate of Completion
              </p>
              <div className="mx-auto mt-2 h-1 w-20 rounded bg-primary" />
            </div>

            <p className="text-muted-foreground">This is proudly presented to</p>
            <h1 className="text-4xl font-bold text-primary sm:text-5xl">
              {cert.user?.full_name ?? "Student"}
            </h1>

            <p className="mx-auto max-w-xl text-muted-foreground">
              for successfully completing the course
            </p>
            <h2 className="text-2xl font-semibold">{cert.course?.title}</h2>

            {/* Footer row */}
            <div className="flex flex-col items-center justify-between gap-6 pt-8 sm:flex-row sm:items-end">
              <div className="text-center">
                <p className="text-lg font-semibold">{formatDate(cert.issued_at)}</p>
                <div className="mt-1 w-40 border-t pt-1 text-xs text-muted-foreground">
                  Date of issue
                </div>
              </div>

              <div className="flex flex-col items-center gap-1">
                <QrCode value={verifyUrl} size={96} />
                <p className="text-[10px] text-muted-foreground">Scan to verify</p>
              </div>

              <div className="text-center">
                <p className="font-[cursive] text-lg">UDAN Technology</p>
                <div className="mt-1 w-40 border-t pt-1 text-xs text-muted-foreground">
                  Authorized signature
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <BadgeCheck className="size-3.5 text-success" />
              Certificate ID: <span className="font-mono font-medium">{cert.certificate_code}</span>
            </div>
          </div>
        </div>
      </div>

      <p className="no-print mt-6 text-center text-sm text-muted-foreground">
        Verify this certificate at{" "}
        <Link href={`/verify/${cert.certificate_code}`} className="text-primary hover:underline">
          {SITE.url.replace(/^https?:\/\//, "")}/verify/{cert.certificate_code}
        </Link>
      </p>
    </div>
  )
}
