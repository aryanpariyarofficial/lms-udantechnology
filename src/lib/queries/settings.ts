import "server-only"

import { createClient } from "@/lib/supabase/server"

export type SiteSettings = {
  tagline: string
  support_email: string
  hero_heading: string
  hero_subheading: string
  facebook: string
  instagram: string
  youtube: string
  payment_instructions: string
  primary_color: string
}

const DEFAULTS: SiteSettings = {
  tagline: "Learn skills that help you take off",
  support_email: "support@udantechnology.com",
  hero_heading: "Grow your skills, grow your future",
  hero_subheading:
    "Project-based courses in Nepali — web development, AI, design, marketing and more.",
  facebook: "",
  instagram: "",
  youtube: "",
  payment_instructions:
    "Pay using any method below, then upload your payment screenshot and transaction ID. Access is granted after admin approval.",
  primary_color: "",
}

/** Reads the settings table and flattens it into a typed object with defaults. */
export async function getSettings(): Promise<SiteSettings> {
  try {
    const supabase = await createClient()
    const { data } = await supabase.from("settings").select("key, value")
    const map = new Map(
      (data ?? []).map((r) => [
        (r as { key: string }).key,
        (r as { value: Record<string, string> }).value ?? {},
      ])
    )
    const site = map.get("site") ?? {}
    const hero = map.get("hero") ?? {}
    const socials = map.get("socials") ?? {}
    const payment = map.get("payment") ?? {}
    const theme = map.get("theme") ?? {}

    return {
      tagline: site.tagline ?? DEFAULTS.tagline,
      support_email: site.support_email ?? DEFAULTS.support_email,
      hero_heading: hero.heading ?? DEFAULTS.hero_heading,
      hero_subheading: hero.subheading ?? DEFAULTS.hero_subheading,
      facebook: socials.facebook ?? "",
      instagram: socials.instagram ?? "",
      youtube: socials.youtube ?? "",
      payment_instructions: payment.instructions ?? DEFAULTS.payment_instructions,
      primary_color: theme.primary ?? "",
    }
  } catch {
    return DEFAULTS
  }
}
