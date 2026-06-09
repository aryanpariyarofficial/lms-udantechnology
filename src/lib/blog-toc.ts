import { slugify } from "@/lib/format"

export type TocItem = { level: number; text: string; slug: string }

/** Extract h2/h3 headings from markdown to build a table of contents. */
export function extractToc(markdown: string | null | undefined): TocItem[] {
  if (!markdown) return []
  const items: TocItem[] = []
  let inCode = false
  for (const raw of markdown.split("\n")) {
    const line = raw.trimEnd()
    if (line.trim().startsWith("```")) {
      inCode = !inCode
      continue
    }
    if (inCode) continue
    const m = line.match(/^(#{2,3})\s+(.+?)\s*#*$/)
    if (m) {
      const text = m[2].replace(/[*_`[\]()]/g, "").trim()
      if (text) items.push({ level: m[1].length, text, slug: slugify(text) })
    }
  }
  return items
}
