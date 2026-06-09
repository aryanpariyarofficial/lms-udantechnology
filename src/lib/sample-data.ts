/**
 * Fallback/sample content used to render marketing pages beautifully before a
 * Supabase project is connected (or while it has no data yet). Once real data
 * exists, queries return it and this is ignored.
 */

export type SampleCourse = {
  id: string
  slug: string
  title: string
  subtitle: string
  category: string
  level: string
  price: number
  discount_price: number | null
  thumbnail_url: string | null
  rating: number
  reviews: number
  students: number
  duration_minutes: number
  instructor: string
}

export const SAMPLE_COURSES: SampleCourse[] = [
  {
    id: "s1",
    slug: "complete-web-development",
    title: "Complete Web Development Bootcamp",
    subtitle: "HTML, CSS, JavaScript, React & Next.js — build real projects",
    category: "Web Development",
    level: "all_levels",
    price: 4999,
    discount_price: 2999,
    thumbnail_url: null,
    rating: 4.9,
    reviews: 312,
    students: 1840,
    duration_minutes: 1820,
    instructor: "Aakash Sharma",
  },
  {
    id: "s2",
    slug: "ai-for-everyone",
    title: "AI & ChatGPT for Productivity",
    subtitle: "Use AI tools to work faster and smarter in any field",
    category: "AI",
    level: "beginner",
    price: 2999,
    discount_price: null,
    thumbnail_url: null,
    rating: 4.8,
    reviews: 189,
    students: 1210,
    duration_minutes: 640,
    instructor: "Prerana Joshi",
  },
  {
    id: "s3",
    slug: "graphic-design-masterclass",
    title: "Graphic Design Masterclass",
    subtitle: "Photoshop, Illustrator & Canva for stunning visuals",
    category: "Graphic Design",
    level: "intermediate",
    price: 3499,
    discount_price: 1999,
    thumbnail_url: null,
    rating: 4.7,
    reviews: 142,
    students: 980,
    duration_minutes: 920,
    instructor: "Bishal Thapa",
  },
  {
    id: "s4",
    slug: "digital-marketing-pro",
    title: "Digital Marketing Pro",
    subtitle: "SEO, social media, ads & analytics for the Nepali market",
    category: "Digital Marketing",
    level: "all_levels",
    price: 3999,
    discount_price: 2499,
    thumbnail_url: null,
    rating: 4.9,
    reviews: 256,
    students: 1520,
    duration_minutes: 1100,
    instructor: "Sneha Karki",
  },
  {
    id: "s5",
    slug: "video-editing-premiere",
    title: "Video Editing with Premiere Pro",
    subtitle: "Edit professional videos for YouTube & clients",
    category: "Video Editing",
    level: "beginner",
    price: 2999,
    discount_price: null,
    thumbnail_url: null,
    rating: 4.6,
    reviews: 98,
    students: 720,
    duration_minutes: 760,
    instructor: "Rojan Maharjan",
  },
  {
    id: "s6",
    slug: "python-programming",
    title: "Python Programming from Zero",
    subtitle: "Learn to code with Python — projects & automation",
    category: "Programming",
    level: "beginner",
    price: 3499,
    discount_price: 1999,
    thumbnail_url: null,
    rating: 4.8,
    reviews: 203,
    students: 1340,
    duration_minutes: 1460,
    instructor: "Aakash Sharma",
  },
]

export function sampleCourseDetail(c: SampleCourse) {
  return {
    what_you_learn: [
      `Master the fundamentals of ${c.category}`,
      "Build real-world projects from scratch",
      "Industry best practices and workflows",
      "Tips to find jobs and freelance clients",
      "Lifetime access to all course materials",
      "A verifiable certificate of completion",
    ],
    requirements: [
      "A computer with an internet connection",
      "No prior experience required — we start from basics",
      "Willingness to practice and build projects",
    ],
    curriculum: [
      {
        module_title: "Getting Started",
        lessons: [
          { title: "Welcome & course overview", type: "video", duration_seconds: 320, is_preview: true },
          { title: "Setting up your tools", type: "video", duration_seconds: 540, is_preview: true },
          { title: "How to get the most out of this course", type: "text", duration_seconds: 180, is_preview: false },
        ],
      },
      {
        module_title: "Core Concepts",
        lessons: [
          { title: "Understanding the fundamentals", type: "video", duration_seconds: 920, is_preview: false },
          { title: "Hands-on practice", type: "video", duration_seconds: 1100, is_preview: false },
          { title: "Module quiz", type: "quiz", duration_seconds: 0, is_preview: false },
          { title: "Resources & cheatsheet", type: "pdf", duration_seconds: 0, is_preview: false },
        ],
      },
      {
        module_title: "Building Real Projects",
        lessons: [
          { title: "Project 1: Plan & setup", type: "video", duration_seconds: 860, is_preview: false },
          { title: "Project 1: Build", type: "video", duration_seconds: 1640, is_preview: false },
          { title: "Assignment: Build your own", type: "assignment", duration_seconds: 0, is_preview: false },
        ],
      },
      {
        module_title: "Going Pro",
        lessons: [
          { title: "Advanced techniques", type: "video", duration_seconds: 1280, is_preview: false },
          { title: "Finding work & next steps", type: "video", duration_seconds: 760, is_preview: false },
          { title: "Final project & certificate", type: "assignment", duration_seconds: 0, is_preview: false },
        ],
      },
    ],
  }
}

export const SAMPLE_REVIEWS = [
  {
    name: "Sandip Gurung",
    role: "Web Development student",
    rating: 5,
    comment:
      "Courses are practical and in Nepali — I built my first website within a month and landed freelance work.",
  },
  {
    name: "Pratima Shrestha",
    role: "Digital Marketing student",
    rating: 5,
    comment:
      "The manual payment with eSewa was so easy. Got access within hours. Content quality is excellent.",
  },
  {
    name: "Bibek Rai",
    role: "Membership member",
    rating: 5,
    comment:
      "Membership is worth every rupee. I can learn web dev, design and marketing all in one place.",
  },
  {
    name: "Anjali Tamang",
    role: "Graphic Design student",
    rating: 4,
    comment:
      "Loved the project-based approach. The certificate helped me showcase my skills to clients.",
  },
]

export const SAMPLE_INSTRUCTORS = [
  { name: "Aakash Sharma", headline: "Full-Stack Developer · 8 yrs", courses: 6, students: 3200 },
  { name: "Sneha Karki", headline: "Digital Marketing Lead", courses: 4, students: 2100 },
  { name: "Bishal Thapa", headline: "Senior Graphic Designer", courses: 5, students: 1800 },
  { name: "Prerana Joshi", headline: "AI & Data Specialist", courses: 3, students: 1500 },
]

export const HOME_STATS = [
  { label: "Students", value: "12,400+", icon: "Users" },
  { label: "Courses", value: "45+", icon: "BookOpen" },
  { label: "Tutorials", value: "120+", icon: "MonitorPlay" },
  { label: "Certificates", value: "8,600+", icon: "Award" },
  { label: "Rating", value: "4.8", icon: "Star" },
]

export type SampleTutorial = {
  title: string
  category: string
  level: string
  duration: string
  date: string
}

export const SAMPLE_TUTORIALS: SampleTutorial[] = [
  {
    title: "Build a Portfolio Website with HTML & CSS",
    category: "Web Development",
    level: "Beginner",
    duration: "1h 12m",
    date: "Jun 2, 2026",
  },
  {
    title: "Master ChatGPT for Everyday Productivity",
    category: "AI",
    level: "All Levels",
    duration: "48m",
    date: "May 28, 2026",
  },
  {
    title: "Design a Logo in Canva — Step by Step",
    category: "Graphic Design",
    level: "Beginner",
    duration: "35m",
    date: "May 20, 2026",
  },
  {
    title: "Edit Reels & Shorts in CapCut",
    category: "Video Editing",
    level: "Beginner",
    duration: "42m",
    date: "May 14, 2026",
  },
  {
    title: "Run Your First Facebook Ad Campaign",
    category: "Digital Marketing",
    level: "All Levels",
    duration: "1h 05m",
    date: "May 6, 2026",
  },
  {
    title: "Python Basics — Variables & Loops",
    category: "Programming",
    level: "Beginner",
    duration: "58m",
    date: "Apr 30, 2026",
  },
]

export type SampleStream = {
  title: string
  host: string
  duration: string
  date: string
  tag: string
}

export const SAMPLE_STREAMS: SampleStream[] = [
  { title: "Build a Full Website with AI — Live", host: "Aakash Sharma", duration: "1h 30m", date: "Jan 18, 2026", tag: "Web Dev" },
  { title: "Freelancing in Nepal — Live Q&A", host: "Sneha Karki", duration: "55m", date: "Jan 10, 2026", tag: "Career" },
  { title: "Design Trends 2026 — Live Talk", host: "Bishal Thapa", duration: "1h 12m", date: "Dec 28, 2025", tag: "Design" },
  { title: "AI Tools Every Student Should Know", host: "Prerana Joshi", duration: "1h 02m", date: "Dec 20, 2025", tag: "AI" },
  { title: "How I Got My First Client — Podcast", host: "Rojan Maharjan", duration: "48m", date: "Dec 12, 2025", tag: "Podcast" },
  { title: "Web Development Roadmap 2026", host: "Aakash Sharma", duration: "1h 20m", date: "Dec 5, 2025", tag: "Web Dev" },
]

export const HOME_FAQS = [
  {
    q: "How do I pay for a course?",
    a: "We support manual payment via eSewa, Khalti, and bank transfer. After paying, upload your payment screenshot and transaction ID. Our team verifies and grants access — usually within a few hours.",
  },
  {
    q: "What is the membership plan?",
    a: "Membership gives you access to a curated set of courses (plus new courses added during your plan) for a fixed period — 1 month, 3 months, 6 months, or 1 year. It's the most affordable way to learn everything.",
  },
  {
    q: "Do I get a certificate?",
    a: "Yes. When you complete 100% of a course, a certificate is generated automatically with a unique ID and QR code for verification.",
  },
  {
    q: "Is the course content in Nepali?",
    a: "Most courses are taught in Nepali with practical, project-based lessons designed for the local market and job opportunities.",
  },
  {
    q: "Do I get lifetime access?",
    a: "Courses you purchase individually come with lifetime access. Membership courses are available while your membership is active.",
  },
  {
    q: "Can I learn on mobile?",
    a: "Absolutely. The platform is fully responsive, so you can learn on your phone, tablet, or computer anytime.",
  },
]
