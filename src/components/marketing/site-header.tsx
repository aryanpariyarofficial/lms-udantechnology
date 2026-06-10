import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Logo } from "@/components/brand/logo"
import { MobileNav } from "@/components/marketing/mobile-nav"
import { AccountMenu } from "@/components/marketing/account-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import { MARKETING_NAV_ICONS } from "@/components/marketing/nav-icons"
import { MAIN_NAV } from "@/lib/constants"
import { getCurrentUser, isAdmin as checkIsAdmin } from "@/lib/auth"

export async function SiteHeader() {
  const current = await getCurrentUser()
  const isAuthed = !!current
  const isAdmin = checkIsAdmin(current?.profile ?? null)

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/65">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {MAIN_NAV.map((item) => {
              const Icon = MARKETING_NAV_ICONS[item.icon]
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {Icon && <Icon className="size-4" />}
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isAuthed ? (
            <AccountMenu
              name={current?.profile?.full_name ?? null}
              email={current?.user.email ?? null}
              avatar={current?.profile?.avatar_url ?? null}
              isAdmin={isAdmin}
            />
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
