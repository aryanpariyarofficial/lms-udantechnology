"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, LogOut, ArrowLeft } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Logo } from "@/components/brand/logo"
import { NotificationBell } from "@/components/dashboard/notification-bell"
import { ThemeToggle } from "@/components/theme-toggle"
import { NAV_ICONS } from "@/components/dashboard/icon-map"
import { initials } from "@/lib/format"
import { signOutAction } from "@/app/(auth)/actions"

export type NavItem = { label: string; href: string; icon: string }

type ShellUser = {
  name: string | null
  email: string | null
  avatar: string | null
  role: string
}

function NavLinks({
  items,
  onNavigate,
}: {
  items: readonly NavItem[]
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const Icon = NAV_ICONS[item.icon] ?? NAV_ICONS.LayoutDashboard
        const active =
          pathname === item.href ||
          (item.href !== "/dashboard" &&
            item.href !== "/admin" &&
            pathname.startsWith(item.href))
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

function SidebarBody({
  items,
  user,
  label,
  onNavigate,
}: {
  items: readonly NavItem[]
  user: ShellUser
  label: string
  onNavigate?: () => void
}) {
  const roleLabel =
    user.role === "super_admin"
      ? "Admin"
      : user.role === "instructor"
        ? "Instructor"
        : user.role === "membership_user"
          ? "Member"
          : "Student"

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <Logo />

      {/* User card */}
      <div className="flex items-center gap-3 rounded-xl border bg-muted/40 p-3">
        <Avatar className="size-9">
          <AvatarImage src={user.avatar ?? undefined} />
          <AvatarFallback>{initials(user.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{user.name ?? "User"}</p>
          <Badge variant="secondary" className="mt-0.5 h-5 px-1.5 text-[10px]">
            {roleLabel}
          </Badge>
        </div>
      </div>

      <span className="px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="flex-1 overflow-y-auto">
        <NavLinks items={items} onNavigate={onNavigate} />
      </div>

      <div className="space-y-1 border-t pt-3">
        {label === "Admin" ? (
          <Button asChild variant="ghost" size="sm" className="w-full justify-start gap-2">
            <Link href="/dashboard">
              <ArrowLeft className="size-4" /> Student view
            </Link>
          </Button>
        ) : user.role === "super_admin" ? (
          <Button asChild variant="ghost" size="sm" className="w-full justify-start gap-2">
            <Link href="/admin">
              <NAV_ICONS.LayoutDashboard className="size-4" /> Admin panel
            </Link>
          </Button>
        ) : null}
        <form action={signOutAction}>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground">
            <LogOut className="size-4" /> Sign out
          </Button>
        </form>
      </div>
    </div>
  )
}

export function AppShell({
  items,
  user,
  label,
  children,
}: {
  items: readonly NavItem[]
  user: ShellUser
  label: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex min-h-svh bg-muted/20">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r bg-background lg:block">
        <div className="sticky top-0 h-svh">
          <SidebarBody items={items} user={user} label={label} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="flex items-center justify-between border-b bg-background p-3 lg:hidden">
          <Logo />
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <NotificationBell />
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Menu">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <SidebarBody
                  items={items}
                  user={user}
                  label={label}
                  onNavigate={() => setOpen(false)}
                />
              </SheetContent>
            </Sheet>
          </div>
        </header>

        {/* Desktop top bar */}
        <div className="hidden items-center justify-end gap-1 border-b bg-background px-6 py-2 lg:flex">
          <ThemeToggle />
          <NotificationBell />
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
