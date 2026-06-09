/** Site-wide constants and configuration. */

export const SITE = {
  name: process.env.NEXT_PUBLIC_SITE_NAME ?? "UDAN Technology LMS",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  description:
    "Nepal's practical online learning platform — project-based courses, memberships, and verifiable certificates.",
} as const

/** WhatsApp support number in international format (no +). */
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "9779848988463"

/** Default brand color (matches globals.css --primary, in hex). */
export const DEFAULT_PRIMARY = "#5650EF"

/** Manual payment account details (public, shown on the payment page). */
export const PAYMENT_INFO = {
  esewa: process.env.NEXT_PUBLIC_ESEWA_NUMBER ?? "",
  khalti: process.env.NEXT_PUBLIC_KHALTI_NUMBER ?? "",
  bankName: process.env.NEXT_PUBLIC_BANK_NAME ?? "",
  bankBranch: process.env.NEXT_PUBLIC_BANK_BRANCH_NAME ?? "",
  bankAccountNumber: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER ?? "",
  bankAccountHolder: process.env.NEXT_PUBLIC_BANK_ACCOUNT_HOLDER ?? "",
} as const

/** Primary marketing navigation (less-important links live in the footer). */
export const MAIN_NAV = [
  { label: "Courses", href: "/courses", icon: "LayoutGrid" },
  { label: "Tutorials", href: "/tutorials", icon: "MonitorPlay" },
  { label: "Streams", href: "/streams", icon: "Radio" },
  { label: "Blog", href: "/blog", icon: "Newspaper" },
  { label: "Tools", href: "/tools", icon: "Wrench" },
] as const

/** Student dashboard navigation. */
export const DASHBOARD_NAV = [
  { label: "Overview", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "My Courses", href: "/dashboard/courses", icon: "BookOpen" },
  { label: "Certificates", href: "/dashboard/certificates", icon: "Award" },
  { label: "Notifications", href: "/dashboard/notifications", icon: "Bell" },
  { label: "Membership", href: "/dashboard/membership", icon: "Crown" },
  { label: "Payments", href: "/dashboard/payments", icon: "Receipt" },
  { label: "Wishlist", href: "/dashboard/wishlist", icon: "Heart" },
  { label: "Settings", href: "/dashboard/settings", icon: "Settings" },
] as const

/** Admin dashboard navigation. */
export const ADMIN_NAV = [
  { label: "Overview", href: "/admin", icon: "LayoutDashboard" },
  { label: "Courses", href: "/admin/courses", icon: "BookOpen" },
  { label: "Categories", href: "/admin/categories", icon: "Tags" },
  { label: "Students", href: "/admin/students", icon: "Users" },
  { label: "Payments", href: "/admin/payments", icon: "CreditCard" },
  { label: "Memberships", href: "/admin/memberships", icon: "Crown" },
  { label: "Coupons", href: "/admin/coupons", icon: "Ticket" },
  { label: "Reviews", href: "/admin/reviews", icon: "Star" },
  { label: "Blog", href: "/admin/blog", icon: "Newspaper" },
  { label: "Messages", href: "/admin/messages", icon: "Mail" },
  { label: "Settings", href: "/admin/settings", icon: "Settings" },
] as const

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  esewa: "eSewa",
  khalti: "Khalti",
  bank_transfer: "Bank Transfer",
}

export const COURSE_LEVEL_LABELS: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  all_levels: "All Levels",
}
