"use client"

import { useEffect, useRef } from "react"
import { useTheme } from "next-themes"
import { useCreateBlockNote } from "@blocknote/react"
import { BlockNoteView } from "@blocknote/mantine"
import "@blocknote/core/fonts/inter.css"
import "@blocknote/mantine/style.css"

import { compressImage } from "@/components/cloudinary/compress"

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

/**
 * Notion-style block editor for writing blog posts. Type "/" to open the
 * block menu (headings, lists, quote, code, image, table, …). Content is
 * stored as Markdown so it stays portable and renders on the public site.
 */
export function BlockEditor({
  initialMarkdown,
  onChange,
}: {
  initialMarkdown: string
  onChange: (markdown: string) => void
}) {
  const { resolvedTheme } = useTheme()
  const loaded = useRef(false)

  const editor = useCreateBlockNote({
    uploadFile: async (file: File) => {
      if (!CLOUD || !PRESET) return ""
      const optimized = await compressImage(file)
      const body = new FormData()
      body.append("file", optimized)
      body.append("upload_preset", PRESET)
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD}/auto/upload`,
        { method: "POST", body }
      )
      const data = await res.json()
      return (data.secure_url as string) ?? ""
    },
  })

  // Load existing markdown into the editor once.
  useEffect(() => {
    if (loaded.current) return
    loaded.current = true
    if (initialMarkdown?.trim()) {
      void (async () => {
        const blocks = await editor.tryParseMarkdownToBlocks(initialMarkdown)
        editor.replaceBlocks(editor.document, blocks)
      })()
    }
  }, [editor, initialMarkdown])

  return (
    <div className="rounded-lg border bg-background py-3">
      <BlockNoteView
        editor={editor}
        theme={resolvedTheme === "dark" ? "dark" : "light"}
        onChange={() => {
          void (async () => {
            const md = await editor.blocksToMarkdownLossy(editor.document)
            onChange(md)
          })()
        }}
      />
    </div>
  )
}
