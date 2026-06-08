"use client"

import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PrintButton() {
  return (
    <Button onClick={() => window.print()} size="lg">
      <Download className="size-4" /> Download / Print PDF
    </Button>
  )
}
