import type { MetadataRoute } from "next"

import { SITE } from "@/lib/constants"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: "UDAN LMS",
    description: SITE.description,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#5650EF",
    icons: [
      {
        src: "/brand/udan-logo.png",
        sizes: "any",
        type: "image/png",
      },
    ],
  }
}
