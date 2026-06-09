"use client"

import { useState, type ReactNode } from "react"
import { Check, Copy } from "lucide-react"

function getText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node)
  if (Array.isArray(node)) return node.map(getText).join("")
  if (node && typeof node === "object" && "props" in node) {
    return getText((node as { props: { children?: ReactNode } }).props.children)
  }
  return ""
}

export function CodeBlock({ children }: { children?: ReactNode }) {
  const [copied, setCopied] = useState(false)

  function copy() {
    const text = getText(children)
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <div className="group relative not-prose my-6">
      <button
        type="button"
        onClick={copy}
        aria-label="Copy code"
        className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-md border bg-background/80 px-2 py-1 text-xs text-muted-foreground opacity-0 backdrop-blur transition-opacity hover:text-foreground group-hover:opacity-100"
      >
        {copied ? (
          <>
            <Check className="size-3.5 text-success" /> Copied
          </>
        ) : (
          <>
            <Copy className="size-3.5" /> Copy
          </>
        )}
      </button>
      <pre className="overflow-x-auto rounded-xl bg-foreground/[0.06] p-4 text-sm leading-relaxed">
        {children}
      </pre>
    </div>
  )
}
