"use client"

import { createReactBlockSpec } from "@blocknote/react"
import { Phone, MessageCircle } from "lucide-react"

/** A contact / phone / WhatsApp call-to-action box. */
export const PhoneCtaBlock = createReactBlockSpec(
  {
    type: "phonecta",
    propSchema: {
      heading: { default: "Have questions? Talk to us" },
      text: { default: "Get personalized guidance on which course is right for you." },
      phone: { default: "9779848988463" },
      label: { default: "Chat on WhatsApp" },
      mode: { default: "whatsapp" as const },
      bg: { default: "#5650EF" },
    },
    content: "none",
  },
  {
    render: ({ block, editor }) => {
      const p = block.props
      const update = (patch: Partial<typeof p>) =>
        editor.updateBlock(block, { props: { ...p, ...patch } })

      const href =
        p.mode === "call" ? `tel:${p.phone}` : `https://wa.me/${p.phone}`
      const Icon = p.mode === "call" ? Phone : MessageCircle

      const box = (
        <div
          className="my-3 flex flex-col items-start gap-3 rounded-2xl p-5 text-white sm:flex-row sm:items-center sm:justify-between"
          style={{ background: p.bg }}
        >
          <div>
            <p className="text-lg font-bold">{p.heading}</p>
            <p className="text-sm text-white/85">{p.text}</p>
          </div>
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 no-underline hover:bg-white/90"
          >
            <Icon className="size-4" /> {p.label}
          </a>
        </div>
      )

      if (!editor.isEditable) return box

      return (
        <div className="my-2 rounded-lg border border-dashed bg-muted/30 p-3">
          {box}
          <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
            <label className="col-span-2 flex flex-col gap-1 sm:col-span-3">
              <span className="text-muted-foreground">Heading</span>
              <input className="bn-input" value={p.heading} onChange={(e) => update({ heading: e.target.value })} />
            </label>
            <label className="col-span-2 flex flex-col gap-1 sm:col-span-3">
              <span className="text-muted-foreground">Text</span>
              <input className="bn-input" value={p.text} onChange={(e) => update({ text: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-muted-foreground">Number</span>
              <input className="bn-input" value={p.phone} onChange={(e) => update({ phone: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-muted-foreground">Button label</span>
              <input className="bn-input" value={p.label} onChange={(e) => update({ label: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-muted-foreground">Mode</span>
              <select className="bn-input" value={p.mode} onChange={(e) => update({ mode: e.target.value as "whatsapp" })}>
                <option value="whatsapp">WhatsApp</option>
                <option value="call">Call</option>
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-muted-foreground">Background</span>
              <input type="color" className="bn-color" value={p.bg} onChange={(e) => update({ bg: e.target.value })} />
            </label>
          </div>
        </div>
      )
    },
  }
)
