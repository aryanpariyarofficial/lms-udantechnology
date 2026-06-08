import { AppShell } from "@/components/dashboard/app-shell"
import { ADMIN_NAV } from "@/lib/constants"
import { requireAdmin } from "@/lib/auth"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, profile } = await requireAdmin()

  return (
    <AppShell
      items={ADMIN_NAV}
      label="Admin"
      user={{
        name: profile?.full_name ?? null,
        email: user.email ?? null,
        avatar: profile?.avatar_url ?? null,
        role: profile?.role ?? "super_admin",
      }}
    >
      {children}
    </AppShell>
  )
}
