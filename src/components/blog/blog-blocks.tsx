/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CSSProperties, ReactNode } from "react"

import { slugify } from "@/lib/format"
import { CodeBlock } from "@/components/blog/code-block"
import { CourseCtaServer } from "@/components/blog/blocks/course-cta-server"

type Inline = any
type Block = {
  id?: string
  type: string
  props?: Record<string, any>
  content?: Inline[]
  children?: Block[]
}

function styled(t: any, key: number): ReactNode {
  let node: ReactNode = t.text
  const s = t.styles ?? {}
  if (s.code) node = <code>{node}</code>
  if (s.bold) node = <strong>{node}</strong>
  if (s.italic) node = <em>{node}</em>
  if (s.underline) node = <u>{node}</u>
  if (s.strike) node = <s>{node}</s>
  const style: CSSProperties = {}
  if (s.textColor && s.textColor !== "default") style.color = s.textColor
  if (s.backgroundColor && s.backgroundColor !== "default")
    style.backgroundColor = s.backgroundColor
  return (
    <span key={key} style={Object.keys(style).length ? style : undefined}>
      {node}
    </span>
  )
}

function renderInline(content?: Inline[]): ReactNode {
  if (!Array.isArray(content)) return null
  return content.map((c, i) => {
    if (c?.type === "link")
      return (
        <a key={i} href={c.href} target="_blank" rel="noreferrer">
          {renderInline(c.content)}
        </a>
      )
    return styled(c, i)
  })
}

function inlineText(content?: Inline[]): string {
  if (!Array.isArray(content)) return ""
  return content
    .map((c) => (c?.type === "link" ? inlineText(c.content) : (c?.text ?? "")))
    .join("")
}

function renderBlock(block: Block, key: number): ReactNode {
  const p = block.props ?? {}
  switch (block.type) {
    case "heading": {
      const lvl = Math.min(3, Math.max(1, Number(p.level) || 2))
      const id = slugify(inlineText(block.content))
      const Tag = `h${lvl}` as "h1" | "h2" | "h3"
      return (
        <Tag key={key} id={id}>
          {renderInline(block.content)}
        </Tag>
      )
    }
    case "quote":
      return <blockquote key={key}>{renderInline(block.content)}</blockquote>
    case "codeBlock":
      return (
        <CodeBlock key={key}>
          <code>{inlineText(block.content)}</code>
        </CodeBlock>
      )
    case "image":
      return (
        <figure key={key} className="not-prose my-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={p.url}
            alt={p.name || p.caption || ""}
            className="mx-auto rounded-xl"
            style={p.previewWidth ? { width: p.previewWidth } : undefined}
          />
          {p.caption && (
            <figcaption className="mt-2 text-center text-sm text-muted-foreground">
              {p.caption}
            </figcaption>
          )}
        </figure>
      )
    case "ctabutton": {
      const style: CSSProperties = {
        background: p.bg,
        color: p.color,
        borderRadius: p.radius,
        border: p.borderWidth > 0 ? `${p.borderWidth}px solid ${p.borderColor}` : "none",
        opacity: (p.opacity ?? 100) / 100,
        padding: "10px 22px",
        fontWeight: 600,
        textDecoration: "none",
        display: "inline-block",
      }
      return (
        <div
          key={key}
          className="not-prose my-4"
          style={{ textAlign: (p.align as any) ?? "left" }}
        >
          <a href={p.url || "#"} style={style} target="_blank" rel="noreferrer">
            {p.text || "Button"}
          </a>
        </div>
      )
    }
    case "coursecard":
      return (
        <CourseCtaServer key={key} courseId={p.courseId ?? ""} heading={p.heading ?? "Start your journey with"} />
      )
    case "phonecta": {
      const href = p.mode === "call" ? `tel:${p.phone}` : `https://wa.me/${p.phone}`
      return (
        <div
          key={key}
          className="not-prose my-6 flex flex-col items-start gap-3 rounded-2xl p-5 text-white sm:flex-row sm:items-center sm:justify-between"
          style={{ background: p.bg }}
        >
          <div>
            <p className="text-lg font-bold">{p.heading}</p>
            <p className="text-sm text-white/85">{p.text}</p>
          </div>
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 no-underline"
          >
            {p.label}
          </a>
        </div>
      )
    }
    default:
      // paragraph + anything else
      if (!Array.isArray(block.content) || block.content.length === 0)
        return <p key={key}>&nbsp;</p>
      return <p key={key}>{renderInline(block.content)}</p>
  }
}

const LIST_TYPES = ["bulletListItem", "numberedListItem", "checkListItem"]

function renderListItem(block: Block, key: number): ReactNode {
  const childList =
    Array.isArray(block.children) && block.children.length > 0
      ? renderBlocks(block.children)
      : null
  return (
    <li key={key}>
      {renderInline(block.content)}
      {childList}
    </li>
  )
}

/** Render an array of BlockNote blocks to React (server-side, SEO-friendly). */
export function renderBlocks(blocks: Block[]): ReactNode {
  const out: ReactNode[] = []
  let i = 0
  while (i < blocks.length) {
    const b = blocks[i]
    if (LIST_TYPES.includes(b.type)) {
      const listType = b.type
      const items: Block[] = []
      while (i < blocks.length && blocks[i].type === listType) {
        items.push(blocks[i])
        i++
      }
      const ListTag = listType === "numberedListItem" ? "ol" : "ul"
      out.push(
        <ListTag key={`l-${i}`}>
          {items.map((it, j) => renderListItem(it, j))}
        </ListTag>
      )
      continue
    }
    out.push(renderBlock(b, i))
    i++
  }
  return out
}

export function BlogBlocks({ json }: { json: string }) {
  let blocks: Block[] = []
  try {
    blocks = JSON.parse(json)
  } catch {
    return null
  }
  return (
    <div className="prose prose-neutral max-w-none dark:prose-invert prose-headings:scroll-mt-24 prose-headings:font-heading prose-a:text-primary prose-img:rounded-xl">
      {renderBlocks(blocks)}
    </div>
  )
}
