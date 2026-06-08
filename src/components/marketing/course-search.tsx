"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useTransition } from "react"
import { Search, Loader2 } from "lucide-react"

import { Input } from "@/components/ui/input"

export function CourseSearch() {
  const router = useRouter()
  const params = useSearchParams()
  const [value, setValue] = useState(params.get("search") ?? "")
  const [pending, startTransition] = useTransition()

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const next = new URLSearchParams(params.toString())
    if (value) next.set("search", value)
    else next.delete("search")
    startTransition(() => router.push(`/courses?${next.toString()}`))
  }

  return (
    <form onSubmit={submit} className="relative w-full max-w-md">
      {pending ? (
        <Loader2 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
      ) : (
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      )}
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search courses..."
        className="pl-9"
        aria-label="Search courses"
      />
    </form>
  )
}
