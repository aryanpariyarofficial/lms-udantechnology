"use client"

import { useEffect, useState } from "react"
import QRCode from "qrcode"

import { Skeleton } from "@/components/ui/skeleton"

/** Renders a scannable QR code for a payment number / string. */
export function QrCode({ value, size = 160 }: { value: string; size?: number }) {
  const [src, setSrc] = useState<string | null>(null)

  useEffect(() => {
    if (!value) return
    QRCode.toDataURL(value, { margin: 1, width: size })
      .then(setSrc)
      .catch(() => setSrc(null))
  }, [value, size])

  if (!src) return <Skeleton style={{ width: size, height: size }} className="rounded-lg" />
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={src}
      alt="Payment QR code"
      width={size}
      height={size}
      className="rounded-lg border bg-white p-1"
    />
  )
}
