"use client"

import { useState } from "react"
import Image from "next/image"
import { UploadCloud, Loader2, X } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { compressImage } from "@/components/cloudinary/compress"

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

/**
 * Reusable image uploader → Cloudinary (unsigned preset).
 * Stores and returns the resulting secure_url via `onChange`.
 */
export function ImageUpload({
  value,
  onChange,
  className,
  aspect = "aspect-video",
}: {
  value: string | null
  onChange: (url: string | null) => void
  className?: string
  aspect?: string
}) {
  const [uploading, setUploading] = useState(false)

  async function handleFile(file: File) {
    if (!CLOUD || !PRESET) {
      toast.error("Cloudinary is not configured.")
      return
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image must be under 8MB.")
      return
    }
    setUploading(true)
    try {
      const optimized = await compressImage(file)
      const body = new FormData()
      body.append("file", optimized)
      body.append("upload_preset", PRESET)
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`,
        { method: "POST", body }
      )
      const data = await res.json()
      if (data.secure_url) {
        onChange(data.secure_url as string)
        toast.success("Image uploaded")
      } else {
        toast.error(data.error?.message ?? "Upload failed")
      }
    } catch {
      toast.error("Upload failed")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className={cn("relative w-full overflow-hidden rounded-lg border", aspect, className)}>
      {value ? (
        <>
          <Image src={value} alt="Upload" fill className="object-cover" sizes="400px" />
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="absolute right-2 top-2 size-7"
            onClick={() => onChange(null)}
          >
            <X className="size-4" />
          </Button>
        </>
      ) : (
        <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-2 bg-muted/40 text-muted-foreground hover:bg-muted">
          {uploading ? (
            <Loader2 className="size-6 animate-spin" />
          ) : (
            <UploadCloud className="size-6" />
          )}
          <span className="text-sm">
            {uploading ? "Uploading…" : "Click to upload image"}
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleFile(f)
            }}
          />
        </label>
      )}
    </div>
  )
}
