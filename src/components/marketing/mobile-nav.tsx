"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu } from "lucide-react"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/brand/logo"
import { MAIN_NAV } from "@/lib/constants"

export function MobileNav({ isAuthed }: { isAuthed: boolean }) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-72">
        <SheetHeader>
          <SheetTitle className="text-left">
            <Logo href={null} />
          </SheetTitle>
        </SheetHeader>
        <nav className="mt-2 flex flex-col gap-1 px-4">
          {MAIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-4 flex flex-col gap-2 px-4">
          {isAuthed ? (
            <Button asChild onClick={() => setOpen(false)}>
              <Link href="/dashboard">My Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="outline" onClick={() => setOpen(false)}>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild onClick={() => setOpen(false)}>
                <Link href="/register">Get started</Link>
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
