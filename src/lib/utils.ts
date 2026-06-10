import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Sanitize a user-supplied redirect target to prevent open redirects.
 * Only same-site absolute paths ("/foo") are allowed — protocol-relative
 * ("//evil.com"), absolute URLs, and backslash tricks fall back.
 */
export function safePath(
  next: string | null | undefined,
  fallback = "/dashboard"
): string {
  if (!next) return fallback
  if (!next.startsWith("/") || next.startsWith("//") || next.includes("\\")) {
    return fallback
  }
  return next
}
