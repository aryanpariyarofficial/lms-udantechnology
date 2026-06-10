import "server-only"

import { resolveMx } from "node:dns/promises"

import { emailProblem } from "@/lib/validation/email"

/** True if the email domain has mail servers. Lenient on transient DNS errors. */
export async function domainHasMail(domain: string): Promise<boolean> {
  try {
    const records = await resolveMx(domain)
    return Array.isArray(records) && records.length > 0
  } catch (err) {
    const code = (err as { code?: string })?.code
    if (code === "ENOTFOUND" || code === "ENODATA") return false
    return true // network/timeout — don't block a possibly-valid user
  }
}

/**
 * Full server-side email validation used by EVERY form that accepts an email:
 * format + disposable/test-domain block + (optional) live MX-record check.
 * Returns an error message, or null if the email is acceptable.
 */
export async function validateEmail(
  email: string,
  opts: { checkMx?: boolean } = {}
): Promise<string | null> {
  const problem = emailProblem(email)
  if (problem) return problem
  if (opts.checkMx !== false) {
    const domain = email.trim().toLowerCase().split("@")[1]
    if (!(await domainHasMail(domain))) {
      return "That email domain can't receive mail — please use a real email."
    }
  }
  return null
}
