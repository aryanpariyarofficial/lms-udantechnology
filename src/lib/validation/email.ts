/** Shared (client + server) email/phone validation for lead capture. */

// Known disposable / fake / test mail domains.
const BLOCKED_DOMAINS = new Set([
  "test.com", "testing.com", "example.com", "example.org", "example.net",
  "email.com", "mail.com", "mailinator.com", "yopmail.com", "guerrillamail.com",
  "10minutemail.com", "tempmail.com", "temp-mail.org", "throwaway.email",
  "sharklasers.com", "getnada.com", "trashmail.com", "fakeinbox.com",
  "maildrop.cc", "mailnesia.com", "dispostable.com", "mintemail.com",
  "fakemail.net", "tempmailo.com", "emailondeck.com", "mohmal.com",
  "spamgourmet.com", "discard.email", "getairmail.com", "tempr.email",
])

// Second-level domains that are obviously not real inboxes.
const BLOCKED_SLD = new Set([
  "test", "testing", "tester", "example", "fake", "demo", "sample", "temp",
  "tempmail", "throwaway", "mailinator", "trash", "trashmail", "spam",
  "invalid", "none", "noemail", "nomail", "xxx", "asdf", "qwerty", "abc",
])

/** Returns an error message if the email looks invalid/fake, else null. */
export function emailProblem(email: string): string | null {
  const e = email.trim().toLowerCase()
  if (!e) return "Email is required."
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e))
    return "Enter a valid email address (e.g. you@gmail.com)."

  const domain = e.split("@")[1]
  const parts = domain.split(".")
  const sld = parts.length >= 2 ? parts[parts.length - 2] : ""

  if (BLOCKED_DOMAINS.has(domain) || BLOCKED_SLD.has(sld))
    return "Please use a real, working email — temporary/test emails aren't allowed."

  return null
}

/** Returns an error if a (provided) phone is invalid, else null. Empty is allowed. */
export function phoneProblem(phone: string): string | null {
  const p = phone.trim()
  if (!p) return null
  const digits = p.replace(/[^\d]/g, "")
  if (digits.length < 7 || digits.length > 15)
    return "Enter a valid phone number."
  return null
}

export function nameProblem(name: string): string | null {
  const n = name.trim()
  if (!n) return "Please enter your name."
  if (n.length < 2) return "Name is too short."
  return null
}
