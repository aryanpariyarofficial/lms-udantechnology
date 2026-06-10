import type { NextConfig } from "next"

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined

// Content-Security-Policy. script-src 'unsafe-inline' is required by Next.js
// hydration; 'unsafe-eval' only in dev (React Refresh).
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.cloudinary.com",
  "frame-src https://www.youtube-nocookie.com https://www.youtube.com",
  "media-src 'self' https:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ")

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
]

const nextConfig: NextConfig = {
  // Standalone build → a self-contained server bundle that runs with
  // `node server.js`. Makes deployment to cPanel / business (Node.js) hosting
  // straightforward, no Vercel lock-in.
  output: "standalone",

  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }]
  },

  images: {
    remotePatterns: [
      // Supabase Storage (course thumbnails, payment screenshots, resources)
      ...(supabaseHost
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHost,
              pathname: "/storage/v1/object/**",
            },
          ]
        : []),
      // Cloudinary — primary image/media CDN (thumbnails, banners, blog, avatars)
      { protocol: "https" as const, hostname: "res.cloudinary.com" },
      // YouTube thumbnails (Phase 1 video hosting)
      { protocol: "https" as const, hostname: "i.ytimg.com" },
      { protocol: "https" as const, hostname: "img.youtube.com" },
    ],
  },
}

export default nextConfig
