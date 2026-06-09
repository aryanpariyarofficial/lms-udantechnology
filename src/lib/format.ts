/** Formatting helpers. */

/** Format an amount as Nepali Rupees, e.g. 1999 → "Rs 1,999". */
export function formatPrice(amount: number, currency = "NPR"): string {
  if (amount === 0) return "Free"
  const formatted = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(amount)
  return currency === "NPR" ? `Rs ${formatted}` : `${currency} ${formatted}`
}

/** Format a date like "Jun 8, 2026". */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date))
}

/** Convert seconds to a human duration, e.g. 3725 → "1h 2m". */
export function formatDuration(seconds: number): string {
  if (!seconds) return "0m"
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m`
  return `${seconds}s`
}

/** Convert total minutes to "Xh Ym" for course length. */
export function formatMinutes(minutes: number): string {
  if (!minutes) return "0m"
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h > 0) return m > 0 ? `${h}h ${m}m` : `${h}h`
  return `${m}m`
}

/** Extract a YouTube video id from a full URL or return the id as-is. */
export function youtubeId(input: string | null | undefined): string | null {
  if (!input) return null
  const trimmed = input.trim()
  // Already an id
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ]
  for (const p of patterns) {
    const m = trimmed.match(p)
    if (m) return m[1]
  }
  return null
}

/** Privacy-enhanced YouTube embed URL with direct-link controls reduced. */
export function youtubeEmbedUrl(input: string | null | undefined): string | null {
  const id = youtubeId(input)
  if (!id) return null
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
  })
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`
}

/** Build a slug from a title. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

/** Estimated reading time in minutes (~200 words/min). */
export function readingTime(text: string | null | undefined): number {
  if (!text) return 1
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

/** Initials for an avatar fallback. */
export function initials(name: string | null | undefined): string {
  if (!name) return "U"
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}
