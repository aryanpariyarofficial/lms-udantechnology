import "server-only"

import { headers } from "next/headers"

/**
 * Lightweight in-memory rate limiter for server actions (fixed window).
 * Per-instance only — on serverless this still blunts bursts because warm
 * instances are reused (Fluid Compute). Swap for Upstash/Redis if the site
 * ever needs cluster-wide guarantees.
 */

type Bucket = { count: number; resetAt: number }
const buckets = new Map<string, Bucket>()

function sweep(now: number) {
  if (buckets.size < 5000) return
  for (const [key, b] of buckets) {
    if (b.resetAt <= now) buckets.delete(key)
  }
}

async function clientIp(): Promise<string> {
  const h = await headers()
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown"
  )
}

/**
 * Returns null if allowed, or a friendly error message when the caller has
 * exceeded `max` calls within `windowMs` for this `bucket`.
 */
export async function rateLimit(
  bucket: string,
  max: number,
  windowMs: number
): Promise<string | null> {
  const ip = await clientIp()
  const key = `${bucket}:${ip}`
  const now = Date.now()
  sweep(now)

  const entry = buckets.get(key)
  if (!entry || entry.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return null
  }
  entry.count += 1
  if (entry.count > max) {
    return "Too many requests — please wait a moment and try again."
  }
  return null
}
