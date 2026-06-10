import { SiteHeader } from "@/components/marketing/site-header"
import { SiteFooter } from "@/components/marketing/site-footer"
import { WhatsAppButton } from "@/components/marketing/whatsapp-button"
import { LeadPopup } from "@/components/marketing/lead-popup"
import { getPublicCourseOptions } from "@/lib/queries/courses"

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const courses = await getPublicCourseOptions()

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <WhatsAppButton />
      <LeadPopup courses={courses} />
    </div>
  )
}
