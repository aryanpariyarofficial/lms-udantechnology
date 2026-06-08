"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { BadgeCheck, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

export default function VerifyPage() {
  const router = useRouter()
  const [code, setCode] = useState("")

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const c = code.trim()
    if (c) router.push(`/verify/${encodeURIComponent(c)}`)
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
          <BadgeCheck className="size-7" />
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight">
          Verify a certificate
        </h1>
        <p className="mt-2 text-muted-foreground">
          Enter the certificate ID (e.g. VG-XXXXXXXX) to confirm it&apos;s genuine.
        </p>
      </div>

      <Card className="mt-8">
        <CardContent className="p-6">
          <form onSubmit={submit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="VG-XXXXXXXX"
                className="pl-9"
                aria-label="Certificate ID"
              />
            </div>
            <Button type="submit">Verify</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
