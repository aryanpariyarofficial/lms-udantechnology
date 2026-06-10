import { NextResponse, type NextRequest } from "next/server"

import { createClient } from "@/lib/supabase/server"
import { safePath } from "@/lib/utils"

/**
 * OAuth (Google) + password-reset callback.
 * Exchanges the `code` for a session, then redirects to `next`.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = safePath(searchParams.get("next"))
  const error = searchParams.get("error_description") ?? searchParams.get("error")

  if (error) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error)}`
    )
  }

  if (code) {
    const supabase = await createClient()
    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code)
    if (!exchangeError) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(exchangeError.message)}`
    )
  }

  return NextResponse.redirect(`${origin}/login`)
}
