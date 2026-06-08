"use client"

import { useState } from "react"
import { UploadCloud, Loader2, FileText, X, ExternalLink } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

/**
 * Uploads ANY file (PDF, docs, zip, etc.) to Cloudinary via the unsigned
 * preset using the `auto` endpoint, and returns the secure URL via onChange.
 * The user just picks a file from their computer — no links to paste.
 */
export function FileUpload({
  value,
  onChange,
  accept,
  className,
}: {
  value: string | null
  onChange: (url: string | null) => void
  accept?: string
  className?: string
}) {
  const [uploading, setUploading] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)

  async function handleFile(file: File) {
    if (!CLOUD || !PRESET) {
      toast.error("Cloudinary is not configured.")
      return
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.error("File must be under 50MB.")
      return
    }
    setUploading(true)
    setFileName(file.name)
    try {
      const body = new FormData()
      body.append("file", file)
      body.append("upload_preset", PRESET)
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD}/auto/upload`,
        { method: "POST", body }
      )
      const data = await res.json()
      if (data.secure_url) {
        onChange(data.secure_url as string)
        toast.success("File uploaded")
      } else {
        toast.error(data.error?.message ?? "Upload failed")
        setFileName(null)
      }
    } catch {
      toast.error("Upload failed")
      setFileName(null)
    } finally {
      setUploading(false)
    }
  }

  if (value) {
    return (
      <div className={cn("flex items-center gap-3 rounded-lg border bg-muted/30 p-3", className)}>
        <FileText className="size-5 shrink-0 text-primary" />
        <span className="flex-1 truncate text-sm">{fileName ?? "Uploaded file"}</span>
        <a href={value} target="_blank" rel="noreferrer" title="Preview">
          <Button type="button" variant="ghost" size="icon" className="size-7">
            <ExternalLink className="size-4" />
          </Button>
        </a>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 text-destructive"
          onClick={() => {
            onChange(null)
            setFileName(null)
          }}
        >
          <X className="size-4" />
        </Button>
      </div>
    )
  }

  return (
    <label
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/30 p-6 text-sm text-muted-foreground hover:bg-muted",
        className
      )}
    >
      {uploading ? (
        <Loader2 className="size-6 animate-spin" />
      ) : (
        <UploadCloud className="size-6" />
      )}
      <span>{uploading ? "Uploading…" : "Click to upload from your computer"}</span>
      <input
        type="file"
        accept={accept}
        className="hidden"
        disabled={uploading}
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) handleFile(f)
        }}
      />
    </label>
  )
}
