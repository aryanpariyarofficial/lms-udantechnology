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
    logo: `${SITE.url}/brand/udan-logo.png`,
    sameAs: [] as string[],
  }
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE.url}${item.path}`,
    })),
  }
}

export function videoLd(video: {
  title: string
  description: string | null
  slug: string
  basePath: string
  thumbnail: string | null
  youtubeUrl: string
  publishedAt: string | null
  durationMinutes: number
}) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.title,
    description: video.description ?? video.title,
    url: `${SITE.url}${video.basePath}/${video.slug}`,
    ...(video.thumbnail ? { thumbnailUrl: video.thumbnail } : {}),
    embedUrl: video.youtubeUrl,
    uploadDate: video.publishedAt ?? undefined,
    ...(video.durationMinutes > 0
      ? { duration: `PT${video.durationMinutes}M` }
      : {}),
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      logo: { "@type": "ImageObject", url: `${SITE.url}/brand/udan-logo.png` },
    },
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
      category: course.price > 0 ? "Paid" : "Free",
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
    mainEntityOfPage: `${SITE.url}/blog/${post.slug}`,
    ...(post.cover ? { image: post.cover } : {}),
    datePublished: post.publishedAt ?? undefined,
    dateModified: post.publishedAt ?? undefined,
    author: { "@type": "Person", name: post.author },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      logo: { "@type": "ImageObject", url: `${SITE.url}/brand/udan-logo.png` },
    },
  }
}
