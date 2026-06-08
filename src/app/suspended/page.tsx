import Link from "next/link"
import { ShieldAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import { signOutAction } from "@/app/(auth)/actions"
import { SITE } from "@/lib/constants"

export const metadata = { title: "Account suspended" }

export default function SuspendedPage() {
  return (
    <div className="grid min-h-svh place-items-center p-6">
      <div className="max-w-md space-y-5 text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-destructive/10 text-destructive">
          <ShieldAlert className="size-7" />
        </div>
        <h1 className="text-2xl font-bold">Your account is suspended</h1>
        <p className="text-muted-foreground">
          Access to your account has been temporarily restricted. If you believe
          this is a mistake, please contact {SITE.name} support.
        </p>
        <div className="flex justify-center gap-3">
          <Button asChild variant="outline">
            <Link href="/contact">Contact support</Link>
          </Button>
          <form action={signOutAction}>
            <Button type="submit">Sign out</Button>
          </form>
        </div>
      </div>
    </div>
  )
}
