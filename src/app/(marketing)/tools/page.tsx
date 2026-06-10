import type { Metadata } from "next"
import {
  Palette,
  Code,
  ImageIcon,
  FileText,
  QrCode,
  FileBadge,
  ArrowRight,
  type LucideIcon,
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "Free Tools & Resources",
  description:
    "Handy free tools to help you learn and build — color pickers, code playgrounds, image tools and more.",
  alternates: { canonical: "/tools" },
}

const TOOLS: {
  name: string
  desc: string
  icon: LucideIcon
  soon?: boolean
}[] = [
  { name: "Color Palette Generator", desc: "Create beautiful, accessible color schemes for your projects.", icon: Palette },
  { name: "Code Playground", desc: "Write and preview HTML, CSS & JavaScript right in your browser.", icon: Code },
  { name: "Image Compressor", desc: "Shrink images without losing quality before you upload.", icon: ImageIcon },
  { name: "Markdown Editor", desc: "Write and preview markdown live — great for notes & blogs.", icon: FileText, soon: true },
  { name: "QR Code Generator", desc: "Turn any link into a scannable QR code instantly.", icon: QrCode, soon: true },
  { name: "Resume Builder", desc: "Build a clean, professional resume in minutes.", icon: FileBadge, soon: true },
]

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Free Tools &amp; Resources
        </h1>
        <p className="mt-2 text-muted-foreground">
          Handy free tools to help you learn faster and build better — no sign-up
          required.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((tool) => (
          <Card
            key={tool.name}
            className="group h-full transition-all hover:-translate-y-1 hover:border-primary hover:shadow-md"
          >
            <CardContent className="space-y-3 p-6">
              <div className="flex items-center justify-between">
                <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <tool.icon className="size-5" />
                </span>
                {tool.soon ? (
                  <Badge variant="secondary">Coming soon</Badge>
                ) : (
                  <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                )}
              </div>
              <h3 className="font-semibold">{tool.name}</h3>
              <p className="text-sm text-muted-foreground">{tool.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="mt-10 text-center text-sm text-muted-foreground">
        More tools are on the way. Have a request?{" "}
        <a href="/contact" className="text-primary hover:underline">
          Tell us
        </a>
        .
      </p>
    </div>
  )
}
