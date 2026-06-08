import type { Metadata } from "next"

import { Card, CardContent } from "@/components/ui/card"
import { requireUser } from "@/lib/auth"
import { SettingsForm } from "./settings-form"

export const metadata: Metadata = { title: "Settings" }

export default async function SettingsPage() {
  const { user, profile } = await requireUser()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your profile information.</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <SettingsForm
            defaults={{
              full_name: profile?.full_name ?? "",
              phone: profile?.phone ?? "",
              bio: profile?.bio ?? "",
              email: user.email ?? "",
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
