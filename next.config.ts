import type { NextConfig } from "next"

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined

const nextConfig: NextConfig = {
  // Standalone build → a self-contained server bundle that runs with
  // `node server.js`. Makes deployment to cPanel / business (Node.js) hosting
  // straightforward, no Vercel lock-in.
  output: "standalone",

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
