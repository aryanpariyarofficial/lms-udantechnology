import { SITE } from "@/lib/constants"

/** Renders a JSON-LD <script> block for SEO structured data. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    sameAs: [] as string[],
  }
}

export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE.url}/courses?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  }
}

export function courseLd(course: {
  title: string
  description: string | null
  slug: string
  thumbnail: string | null
  price: number
  rating: number
  reviewCount: number
  instructor: string
}) {
  const base: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.description ?? course.title,
    url: `${SITE.url}/courses/${course.slug}`,
    provider: {
      "@type": "Organization",
      name: SITE.name,
      sameAs: SITE.url,
    },
    ...(course.thumbnail ? { image: course.thumbnail } : {}),
    offers: {
      "@type": "Offer",
      category: "Paid",
      price: course.price,
      priceCurrency: "NPR",
      availability: "https://schema.org/InStock",
      url: `${SITE.url}/courses/${course.slug}`,
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      instructor: { "@type": "Person", name: course.instructor },
    },
  }
  if (course.reviewCount > 0 && course.rating > 0) {
    base.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: course.rating.toFixed(1),
      reviewCount: course.reviewCount,
    }
  }
  return base
}

export function articleLd(post: {
  title: string
  excerpt: string | null
  slug: string
  cover: string | null
  publishedAt: string | null
  author: string
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt ?? post.title,
    url: `${SITE.url}/blog/${post.slug}`,
    ...(post.cover ? { image: post.cover } : {}),
    datePublished: post.publishedAt ?? undefined,
    author: { "@type": "Person", name: post.author },
    publisher: { "@type": "Organization", name: SITE.name },
  }
}
