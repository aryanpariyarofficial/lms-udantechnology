import { slugify } from "@/lib/format"

export type TocItem = { level: number; text: string; slug: string }

/** Concatenate all readable text from BlockNote JSON (for reading time). */
export function blocksPlainText(json: string | null | undefined): string {
  if (!json) return ""
  try {
    const collect = (nodes: unknown[]): string =>
      nodes
        .map((n) => {
          const b = n as { content?: unknown; children?: unknown[] }
          let text = ""
          if (Array.isArray(b.content)) {
            text += (b.content as { text?: string }[])
              .map((c) => c?.text ?? "")
              .join(" ")
          }
          if (Array.isArray(b.children)) text += " " + collect(b.children)
          return text
        })
        .join(" ")
    const blocks = JSON.parse(json)
    return Array.isArray(blocks) ? collect(blocks) : ""
  } catch {
    return ""
  }
}

/** Extract h1–h3 headings from BlockNote JSON content. */
export function extractTocFromBlocks(json: string | null | undefined): TocItem[] {
  if (!json) return []
  try {
    const blocks = JSON.parse(json)
    if (!Array.isArray(blocks)) return []
    const items: TocItem[] = []
    for (const b of blocks) {
      if (b?.type === "heading" && Array.isArray(b.content)) {
        const text = b.content
          .map((c: { type?: string; text?: string }) => c?.text ?? "")
          .join("")
          .trim()
        if (text) {
          items.push({
            level: Math.min(3, Math.max(1, Number(b.props?.level) || 2)),
            text,
            slug: slugify(text),
          })
        }
      }
    }
    return items
  } catch {
    return []
  }
}

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
