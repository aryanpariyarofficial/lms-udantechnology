import type { Metadata } from "next"
import { Inter, Poppins, Geist_Mono } from "next/font/google"

import { SITE } from "@/lib/constants"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

// Body / UI font — clean, highly legible
const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
})

// Heading / display font — modern and professional
const poppins = Poppins({
  variable: "--font-heading",
  weight: ["500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — Learn skills that grow your future`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [
    "online courses Nepal",
    "LMS Nepal",
    "web development course",
    "digital marketing",
    "UDAN Technology",
    "Nepali courses",
  ],
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: SITE.name,
    description: SITE.description,
    url: SITE.url,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.name,
    description: SITE.description,
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${poppins.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}
