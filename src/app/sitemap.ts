import type { MetadataRoute } from "next"

import { SITE } from "@/lib/constants"
import { listCourses } from "@/lib/queries/courses"
import { getPublishedBlogs } from "@/lib/queries/blog"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/courses",
    "/membership",
    "/blog",
    "/verify",
    "/contact",
    "/login",
    "/register",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }))

  let courseRoutes: MetadataRoute.Sitemap = []
  let blogRoutes: MetadataRoute.Sitemap = []

  try {
    const courses = await listCourses()
    courseRoutes = courses.map((c) => ({
      url: `${base}/courses/${c.slug}`,
      lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }))
  } catch {
    /* ignore */
  }

  try {
    const blogs = await getPublishedBlogs()
    blogRoutes = blogs.map((b) => ({
      url: `${base}/blog/${b.slug}`,
      lastModified: b.published_at ? new Date(b.published_at) : new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    }))
  } catch {
    /* ignore */
  }

  return [...staticRoutes, ...courseRoutes, ...blogRoutes]
}
