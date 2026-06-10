import type { MetadataRoute } from "next"

import { SITE } from "@/lib/constants"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/dashboard",
        "/checkout",
        "/learn",
        "/auth",
        "/certificate",
        "/suspended",
        "/forgot-password",
        "/reset-password",
      ],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  }
}
