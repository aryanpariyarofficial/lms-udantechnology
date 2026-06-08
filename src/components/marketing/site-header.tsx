import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Logo } from "@/components/brand/logo"
import { MobileNav } from "@/components/marketing/mobile-nav"
import { MAIN_NAV } from "@/lib/constants"
import { initials } from "@/lib/format"
import { getCurrentUser } from "@/lib/auth"

export async function SiteHeader() {
  const current = await getCurrentUser()
  const isAuthed = !!current
  const isAdmin = current?.profile?.role === "super_admin"

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {MAIN_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {isAuthed ? (
            <>
              {isAdmin && (
                <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                  <Link href="/admin">Admin</Link>
                </Button>
              )}
              <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Link href="/dashboard" aria-label="Account">
                <Avatar className="size-9">
                  <AvatarImage src={current?.profile?.avatar_url ?? undefined} />
                  <AvatarFallback>
                    {initials(current?.profile?.full_name)}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm" className="hidden sm:inline-flex">
                <Link href="/register">Get started</Link>
              </Button>
            </>
          )}
          <MobileNav isAuthed={isAuthed} />
        </div>
      </div>
    </header>
  )
}
