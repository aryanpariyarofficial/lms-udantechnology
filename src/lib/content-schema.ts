/**
 * Config-driven CMS content. Each page has sections of editable fields.
 * Defaults below match the original hard-coded copy. The admin Content Editor
 * renders forms from this config; public pages read values via getPageContent().
 */

export type ContentField = {
  key: string
  label: string
  type: "text" | "textarea" | "image"
  default: string
}
export type ContentSection = { title: string; fields: ContentField[] }
export type ContentPage = { key: string; label: string; description: string; sections: ContentSection[] }

const t = (key: string, label: string, def: string): ContentField => ({ key, label, type: "text", default: def })
const ta = (key: string, label: string, def: string): ContentField => ({ key, label, type: "textarea", default: def })
const img = (key: string, label: string): ContentField => ({ key, label, type: "image", default: "" })

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
    description: "Hero, story, mission, CTA card and founders.",
    sections: [
      {
        title: "Hero",
        fields: [
          t("hero_heading", "Heading", "About UDAN Technology"),
          ta("hero_subheading", "Subheading", "UDAN Technology helps people in many ways — from short video tutorials to complete courses. Learn in-demand skills, build real projects, and change your future."),
          img("hero_bg", "Background image (optional)"),
        ],
      },
      {
        title: "Our story",
        fields: [
          t("story_title", "Title", "Our Story"),
          ta("story_body", "Body (one paragraph per line)", "Our story begins with the end in mind. At UDAN Technology we wanted to build a platform where there is enough for all — whether you're an absolute beginner or an experienced enthusiast who wants to explore, design and build.\nWe are here to offer you an opportunity to learn web development, AI, design, marketing and more — everything you want to learn, in Nepali.\nWe've spent endless hours preparing courses that make self-paced learning easy and focus on delivering the content in the simplest way possible.\nLet your fingers do the walking through UDAN Technology — and yes, many resources are completely free!"),
        ],
      },
      {
        title: "Our mission",
        fields: [
          t("mission_title", "Title", "Our Mission"),
          ta("mission_body", "Body (one paragraph per line)", "We built this platform with one mission: to empower our youth with the skills they can use to start their career in web design, development, AI and marketing — as an employee at a firm or as a freelancer working from home.\nLet's join hands, contribute, and give back to society."),
          t("mission_quote", "Highlight quote", "Freedom to learn and grow — this is it!"),
        ],
      },
      {
        title: "CTA card (middle)",
        fields: [
          t("cta_heading", "Heading", "Ready to start your journey?"),
          ta("cta_text", "Text", "Join thousands of Nepali learners building real, job-ready skills. Start free today."),
          t("cta_button", "Button label", "Browse Courses"),
          t("cta_link", "Button link", "/courses"),
        ],
      },
      {
        title: "Founders — section header",
        fields: [
          t("founders_title", "Title", "Founders"),
          ta("founders_intro", "Intro", "UDAN Technology is an idea and dream of passionate youngsters from Nepal who worked day and night to bring this dream into reality."),
        ],
      },
      {
        title: "Founder 1",
        fields: [
          img("founder1_image", "Photo"),
          t("founder1_name", "Name", "Founder Name"),
          t("founder1_role", "Role", "Founder & CEO"),
          ta("founder1_bio", "Bio", "A full-stack developer and lifelong learner. With years of experience building websites and digital products, leading UDAN Technology's vision to make quality education accessible to all."),
          t("founder1_facebook", "Facebook URL", ""),
          t("founder1_twitter", "Twitter / X URL", ""),
          t("founder1_linkedin", "LinkedIn URL", ""),
          t("founder1_website", "Website URL", ""),
        ],
      },
      {
        title: "Founder 2",
        fields: [
          img("founder2_image", "Photo"),
          t("founder2_name", "Name", "Co-Founder Name"),
          t("founder2_role", "Role", "Co-Founder & CMO"),
          ta("founder2_bio", "Bio", "A digital marketer by passion and an SEO specialist with years of experience serving top brands. Wearing multiple hats to grow UDAN Technology and the community around it."),
          t("founder2_facebook", "Facebook URL", ""),
          t("founder2_twitter", "Twitter / X URL", ""),
          t("founder2_linkedin", "LinkedIn URL", ""),
          t("founder2_website", "Website URL", ""),
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
