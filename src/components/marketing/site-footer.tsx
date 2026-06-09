import Link from "next/link"
import { Mail } from "lucide-react"

import { Logo } from "@/components/brand/logo"
import {
  FacebookIcon,
  InstagramIcon,
  YoutubeIcon,
} from "@/components/brand/social-icons"
import { SITE } from "@/lib/constants"
import { getSettings } from "@/lib/queries/settings"

const FOOTER_LINKS = {
  Learn: [
    { label: "Courses", href: "/courses" },
    { label: "Tutorials", href: "/tutorials" },
    { label: "Streams", href: "/streams" },
    { label: "Tools", href: "/tools" },
  ],
  Resources: [
    { label: "Membership", href: "/membership" },
    { label: "Blog", href: "/blog" },
    { label: "Verify Certificate", href: "/verify" },
    { label: "Contact", href: "/contact" },
  ],
  Legal: [
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Refund Policy", href: "/refund" },
  ],
}

export async function SiteFooter() {
  const settings = await getSettings()
  const socials = [
    settings.facebook && { icon: FacebookIcon, href: settings.facebook, label: "Facebook" },
    settings.instagram && { icon: InstagramIcon, href: settings.instagram, label: "Instagram" },
    settings.youtube && { icon: YoutubeIcon, href: settings.youtube, label: "YouTube" },
    { icon: Mail, href: "/contact", label: "Email" },
  ].filter(Boolean) as { icon: typeof Mail; href: string; label: string }[]

  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2 space-y-4">
            <Logo />
            <p className="max-w-xs text-sm text-muted-foreground">
              {SITE.description}
            </p>
            <div className="flex gap-3">
              {socials.map(({ icon: Icon, href, label }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className="grid size-9 place-items-center rounded-lg border bg-background text-muted-foreground transition-colors hover:text-primary"
                >
                  <Icon className="size-4" />
                </Link>
              ))}
            </div>
          </div>

          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold">{title}</h3>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Made with care in Nepal 🇳🇵
          </p>
        </div>
      </div>
    </footer>
  )
}
