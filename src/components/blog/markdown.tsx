import type { ReactNode } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import rehypeSanitize from "rehype-sanitize"

import { slugify } from "@/lib/format"
import { CodeBlock } from "@/components/blog/code-block"

/** Flatten React children to plain text (for heading slugs). */
function toText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node)
  if (Array.isArray(node)) return node.map(toText).join("")
  if (node && typeof node === "object" && "props" in node) {
    return toText((node as { props: { children?: ReactNode } }).props.children)
  }
  return ""
}

/** Renders markdown content as a styled article, with heading anchors. */
export function Markdown({ content }: { content: string }) {
  return (
    <div className="prose prose-neutral max-w-none dark:prose-invert prose-headings:scroll-mt-24 prose-headings:font-heading prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-pre:bg-foreground/[0.06] prose-pre:text-foreground prose-code:before:content-none prose-code:after:content-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        // rehypeRaw parses embedded HTML; rehypeSanitize then strips anything
        // dangerous (scripts, event handlers) — stored-XSS defense.
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={{
          h2: ({ children }) => (
            <h2 id={slugify(toText(children))}>{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 id={slugify(toText(children))}>{children}</h3>
          ),
          pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
