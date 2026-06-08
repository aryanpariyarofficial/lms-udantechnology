import { AppShell } from "@/components/dashboard/app-shell"
import { DASHBOARD_NAV } from "@/lib/constants"
import { requireUser } from "@/lib/auth"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, profile } = await requireUser("/dashboard")

  return (
    <AppShell
      items={DASHBOARD_NAV}
      label="My Learning"
      user={{
        name: profile?.full_name ?? null,
        email: user.email ?? null,
        avatar: profile?.avatar_url ?? null,
        role: profile?.role ?? "student",
      }}
    >
      {children}
    </AppShell>
  )
}
