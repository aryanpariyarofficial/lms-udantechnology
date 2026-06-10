/**
 * Config-driven CMS content. Each page has sections of editable fields.
 * Defaults below match the original hard-coded copy. The admin Content Editor
 * renders forms from this config; public pages read values via getPageContent().
 */

export type ContentField = {
  key: string
  label: string
  type: "text" | "textarea"
  default: string
}
export type ContentSection = { title: string; fields: ContentField[] }
export type ContentPage = { key: string; label: string; description: string; sections: ContentSection[] }

const t = (key: string, label: string, def: string): ContentField => ({ key, label, type: "text", default: def })
const ta = (key: string, label: string, def: string): ContentField => ({ key, label, type: "textarea", default: def })

export const CONTENT_PAGES: ContentPage[] = [
  {
    key: "home",
    label: "Home page",
    description: "Hero, section headings and the final call-to-action.",
    sections: [
      {
        title: "Hero",
        fields: [
          t("hero_badge", "Badge text", "Nepal's practical learning platform"),
          t("hero_heading", "Heading", "Grow your skills, grow your future"),
          ta("hero_subheading", "Subheading", "Project-based courses in Nepali — web development, AI, design, marketing and more."),
          t("hero_cta_primary", "Primary button", "Browse Courses"),
          t("hero_cta_secondary", "Secondary button", "View Memberships"),
        ],
      },
      {
        title: "Categories section",
        fields: [
          t("categories_title", "Title", "Explore categories"),
          t("categories_subtitle", "Subtitle", "Find the right path for your goals"),
        ],
      },
      {
        title: "“Start here” banner",
        fields: [
          t("start_heading", "Heading", "New to digital skills? Start free."),
          ta("start_text", "Text", "Begin with our beginner-friendly path — learn the fundamentals of web development, design, and AI step by step, in Nepali. No experience needed."),
          t("start_button", "Button", "Start Learning"),
        ],
      },
      {
        title: "Featured courses section",
        fields: [
          t("featured_title", "Title", "Featured courses"),
          t("featured_subtitle", "Subtitle", "Hand-picked courses to kickstart your journey"),
        ],
      },
      {
        title: "Popular tutorials section",
        fields: [
          t("tutorials_title", "Title", "Popular tutorials"),
          t("tutorials_subtitle", "Subtitle", "Free single-video tutorials and crash courses for quick wins."),
        ],
      },
      {
        title: "Why-us section",
        fields: [
          t("why_title", "Title", "Why learn with UDAN Technology"),
          t("why_subtitle", "Subtitle", "Built for Nepali learners — affordable, practical, and trustworthy."),
        ],
      },
      {
        title: "Membership section",
        fields: [
          t("membership_title", "Title", "Learn everything, one membership"),
          t("membership_subtitle", "Subtitle", "Get access to membership courses and all new content during your plan."),
        ],
      },
      {
        title: "Reviews section",
        fields: [
          t("reviews_title", "Title", "Loved by students"),
          t("reviews_subtitle", "Subtitle", "Real results from real learners across Nepal."),
        ],
      },
      {
        title: "Instructors section",
        fields: [
          t("instructors_title", "Title", "Learn from experienced instructors"),
          t("instructors_subtitle", "Subtitle", "Industry professionals who've done the work."),
        ],
      },
      {
        title: "FAQ section",
        fields: [
          t("faq_title", "Title", "Frequently asked questions"),
          t("faq_subtitle", "Subtitle", "Everything you need to know to get started."),
        ],
      },
      {
        title: "Final call-to-action",
        fields: [
          t("cta_heading", "Heading", "Ready to start learning?"),
          ta("cta_text", "Text", "Join thousands of Nepali learners building real skills. Create your free account today."),
          t("cta_button_primary", "Primary button", "Create free account"),
          t("cta_button_secondary", "Secondary button", "Browse courses"),
        ],
      },
    ],
  },
  {
    key: "about",
    label: "About page",
    description: "Your story, mission and values.",
    sections: [
      {
        title: "Hero",
        fields: [
          t("hero_heading", "Heading", "About UDAN Technology"),
          ta("hero_subheading", "Subheading", "We're on a mission to make practical, job-ready skills accessible and affordable for every Nepali learner."),
        ],
      },
      {
        title: "Our story",
        fields: [
          t("story_title", "Title", "Our story"),
          ta("story_body", "Body", "UDAN Technology started with a simple belief: quality education should not be a privilege. We build project-based courses in Nepali so anyone, anywhere in Nepal, can learn in-demand digital skills and grow their career — without breaking the bank."),
        ],
      },
      {
        title: "Our mission",
        fields: [
          t("mission_title", "Title", "Our mission"),
          ta("mission_body", "Body", "To empower the youth of Nepal with practical digital skills, affordable memberships, and verifiable certificates — helping them find jobs, freelance, and build their future."),
        ],
      },
      {
        title: "Call-to-action",
        fields: [
          t("cta_heading", "Heading", "Ready to grow with us?"),
          t("cta_button", "Button", "Browse Courses"),
        ],
      },
    ],
  },
  {
    key: "contact",
    label: "Contact page",
    description: "Heading and contact details.",
    sections: [
      {
        title: "Header",
        fields: [
          t("heading", "Heading", "Get in touch"),
          ta("subtitle", "Subtitle", "Questions about courses, payments, or membership? We're here to help."),
        ],
      },
      {
        title: "Contact details",
        fields: [
          t("email", "Support email", "support@udantechnology.com"),
          t("response_time", "Response time", "Within a few hours"),
          t("location", "Based in", "Nepal 🇳🇵"),
        ],
      },
    ],
  },
]

export type PageContent = Record<string, string>

/** Default content map for a page (fieldKey → default value). */
export function pageDefaults(pageKey: string): PageContent {
  const page = CONTENT_PAGES.find((p) => p.key === pageKey)
  const out: PageContent = {}
  if (!page) return out
  for (const s of page.sections) for (const f of s.fields) out[f.key] = f.default
  return out
}
