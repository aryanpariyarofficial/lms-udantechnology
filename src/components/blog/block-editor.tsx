"use client"

import { useEffect, useMemo, useRef } from "react"
import { useTheme } from "next-themes"
import {
  useCreateBlockNote,
  SuggestionMenuController,
  getDefaultReactSlashMenuItems,
} from "@blocknote/react"
import { BlockNoteView } from "@blocknote/mantine"
import { filterSuggestionItems } from "@blocknote/core"
import "@blocknote/core/fonts/inter.css"
import "@blocknote/mantine/style.css"

import { compressImage } from "@/components/cloudinary/compress"
import { blogSchema, customSlashItems } from "./blocks/schema"

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseJsonBlocks(content: string): any[] | undefined {
  const t = content?.trim()
  if (t && t.startsWith("[")) {
    try {
      const parsed = JSON.parse(t)
      return Array.isArray(parsed) && parsed.length ? parsed : undefined
    } catch {
      return undefined
    }
  }
  return undefined
}

/**
 * Notion-style block editor. Type "/" for the block menu (headings, lists,
 * quote, code, image, table) plus our custom CTA blocks (Course Card, Button,
 * Contact). Content is stored as BlockNote JSON so custom blocks persist.
 */
export function BlockEditor({
  initialContent,
  onChange,
}: {
  initialContent: string
  onChange: (json: string) => void
}) {
  const { resolvedTheme } = useTheme()
  const loaded = useRef(false)
  const jsonInitial = useMemo(() => parseJsonBlocks(initialContent), [initialContent])

  const editor = useCreateBlockNote({
    schema: blogSchema,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initialContent: jsonInitial as any,
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

  // Legacy markdown posts → parse into blocks once.
  useEffect(() => {
    if (loaded.current) return
    loaded.current = true
    if (!jsonInitial && initialContent?.trim()) {
      void (async () => {
        const blocks = await editor.tryParseMarkdownToBlocks(initialContent)
        editor.replaceBlocks(editor.document, blocks)
      })()
    }
  }, [editor, initialContent, jsonInitial])

  return (
    <div className="rounded-lg border bg-background py-3">
      <BlockNoteView
        editor={editor}
        theme={resolvedTheme === "dark" ? "dark" : "light"}
        slashMenu={false}
        onChange={() => onChange(JSON.stringify(editor.document))}
      >
        <SuggestionMenuController
          triggerCharacter="/"
          getItems={async (query) =>
            filterSuggestionItems(
              [
                ...getDefaultReactSlashMenuItems(editor),
                ...customSlashItems(editor),
              ],
              query
            )
          }
        />
      </BlockNoteView>
    </div>
  )
}
