import {
  BlockNoteSchema,
  defaultBlockSpecs,
  insertOrUpdateBlockForSlashMenu,
} from "@blocknote/core"

import { ButtonBlock } from "./button-block"
import { CourseCardBlock } from "./course-card-block"
import { PhoneCtaBlock } from "./phone-cta-block"

export const blogSchema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    ctabutton: ButtonBlock(),
    coursecard: CourseCardBlock(),
    phonecta: PhoneCtaBlock(),
  },
})

export type BlogEditor = typeof blogSchema.BlockNoteEditor

/** Extra slash-menu items for our custom CTA blocks. */
export function customSlashItems(editor: BlogEditor) {
  return [
    {
      title: "Course Card",
      subtext: "Promote a course (live data)",
      aliases: ["course", "cta", "promo", "card"],
      group: "Promotion",
      onItemClick: () =>
        insertOrUpdateBlockForSlashMenu(editor, { type: "coursecard" }),
    },
    {
      title: "Button",
      subtext: "Custom call-to-action button",
      aliases: ["button", "link", "cta"],
      group: "Promotion",
      onItemClick: () =>
        insertOrUpdateBlockForSlashMenu(editor, { type: "ctabutton" }),
    },
    {
      title: "Contact / WhatsApp CTA",
      subtext: "Phone or WhatsApp promo box",
      aliases: ["phone", "whatsapp", "contact", "call", "cta"],
      group: "Promotion",
      onItemClick: () =>
        insertOrUpdateBlockForSlashMenu(editor, { type: "phonecta" }),
    },
  ]
}
