import Link from "next/link"

import { cn } from "@/lib/utils"
import { SITE } from "@/lib/constants"

export function Logo({
  className,
  href = "/",
}: {
  className?: string
  href?: string | null
}) {
  const inner = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/udan-logo.png"
      alt={SITE.name}
      className={cn("h-10 w-auto", className)}
    />
  )

  if (href === null) return inner
  return (
    <Link href={href} aria-label={SITE.name} className="inline-flex">
      {inner}
    </Link>
  )
}
