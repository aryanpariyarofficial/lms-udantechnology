import type { Metadata } from "next"

import { getSettings } from "@/lib/queries/settings"
import { SettingsForm } from "./settings-form"

export const metadata: Metadata = { title: "Settings · Admin" }

export default async function AdminSettingsPage() {
  const settings = await getSettings()

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Site, homepage, social links, and payment text.</p>
      </div>
      <SettingsForm settings={settings} />
    </div>
  )
}
