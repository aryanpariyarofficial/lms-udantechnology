"use client"

import { createReactBlockSpec } from "@blocknote/react"

/** A styled call-to-action button block with full visual controls. */
export const ButtonBlock = createReactBlockSpec(
  {
    type: "ctabutton",
    propSchema: {
      text: { default: "Get Started" },
      url: { default: "" },
      bg: { default: "#5650EF" },
      color: { default: "#ffffff" },
      radius: { default: 10 },
      borderWidth: { default: 0 },
      borderColor: { default: "#5650EF" },
      opacity: { default: 100 },
      align: { default: "left" as const },
    },
    content: "none",
  },
  {
    render: ({ block, editor }) => {
      const p = block.props
      const update = (patch: Partial<typeof p>) =>
        editor.updateBlock(block, { props: { ...p, ...patch } })

      const buttonStyle: React.CSSProperties = {
        background: p.bg,
        color: p.color,
        borderRadius: p.radius,
        border: p.borderWidth > 0 ? `${p.borderWidth}px solid ${p.borderColor}` : "none",
        opacity: p.opacity / 100,
        padding: "10px 22px",
        fontWeight: 600,
        textDecoration: "none",
        display: "inline-block",
      }

      const Btn = (
        <a href={p.url || "#"} style={buttonStyle} target="_blank" rel="noreferrer">
          {p.text || "Button"}
        </a>
      )

      if (!editor.isEditable) {
        return (
          <div style={{ textAlign: p.align as "left" | "center" | "right", margin: "14px 0" }}>
            {Btn}
          </div>
        )
      }

      // Editor mode: preview + settings panel
      return (
        <div className="my-2 rounded-lg border border-dashed bg-muted/30 p-3">
          <div style={{ textAlign: p.align as "left" | "center" | "right" }} className="mb-3">
            {Btn}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
            <Field label="Text">
              <input className="bn-input" value={p.text} onChange={(e) => update({ text: e.target.value })} />
            </Field>
            <Field label="Link URL">
              <input className="bn-input" value={p.url} placeholder="https://…" onChange={(e) => update({ url: e.target.value })} />
            </Field>
            <Field label="Align">
              <select className="bn-input" value={p.align} onChange={(e) => update({ align: e.target.value as "left" })}>
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </Field>
            <Field label="Background">
              <input type="color" className="bn-color" value={p.bg} onChange={(e) => update({ bg: e.target.value })} />
            </Field>
            <Field label="Text color">
              <input type="color" className="bn-color" value={p.color} onChange={(e) => update({ color: e.target.value })} />
            </Field>
            <Field label={`Radius ${p.radius}px`}>
              <input type="range" min={0} max={40} value={p.radius} onChange={(e) => update({ radius: Number(e.target.value) })} />
            </Field>
            <Field label={`Border ${p.borderWidth}px`}>
              <input type="range" min={0} max={6} value={p.borderWidth} onChange={(e) => update({ borderWidth: Number(e.target.value) })} />
            </Field>
            <Field label="Border color">
              <input type="color" className="bn-color" value={p.borderColor} onChange={(e) => update({ borderColor: e.target.value })} />
            </Field>
            <Field label={`Opacity ${p.opacity}%`}>
              <input type="range" min={20} max={100} value={p.opacity} onChange={(e) => update({ opacity: Number(e.target.value) })} />
            </Field>
          </div>
        </div>
      )
    },
  }
)

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-muted-foreground">{label}</span>
      {children}
    </label>
  )
}
