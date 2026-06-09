import { Mail } from "lucide-react"

import {
  FacebookIcon,
  XIcon,
  LinkedinIcon,
  WhatsappIcon,
} from "@/components/brand/social-icons"

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const u = encodeURIComponent(url)
  const t = encodeURIComponent(title)

  const links = [
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
      icon: FacebookIcon,
      color: "hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2]",
    },
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?url=${u}&text=${t}`,
      icon: XIcon,
      color: "hover:bg-black hover:text-white hover:border-black",
    },
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
      icon: LinkedinIcon,
      color: "hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2]",
    },
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${t}%20${u}`,
      icon: WhatsappIcon,
      color: "hover:bg-[#25D366] hover:text-white hover:border-[#25D366]",
    },
    {
      label: "Email",
      href: `mailto:?subject=${t}&body=${u}`,
      icon: Mail,
      color: "hover:bg-foreground hover:text-background",
    },
  ]

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-sm font-medium text-muted-foreground">Share:</span>
      {links.map(({ label, href, icon: Icon, color }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noreferrer"
          aria-label={`Share on ${label}`}
          className={`flex size-9 items-center justify-center rounded-lg border bg-background text-muted-foreground transition-colors ${color}`}
        >
          <Icon className="size-4" />
        </a>
      ))}
    </div>
  )
}
