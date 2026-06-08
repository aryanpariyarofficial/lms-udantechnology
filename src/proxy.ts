import { type NextRequest } from "next/server"

import { updateSession } from "@/lib/supabase/middleware"

/**
 * Next.js 16 Proxy (formerly "middleware"). Runs on the Node.js runtime and
 * refreshes the Supabase auth session + guards protected routes on every
 * request. Works on Vercel and self-hosted Node deployments alike.
 */
export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static, _next/image (build assets)
     * - favicon.ico and common static file extensions
     * Static files are skipped so the auth refresh only runs on real pages.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?)$).*)",
  ],
}
