import Link from "next/link"
import type { Metadata } from "next"
import { Plus, Pencil, Newspaper } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getAdminBlogs } from "@/lib/queries/blog"
import { formatDate } from "@/lib/format"
import { createBlog } from "./actions"

export const metadata: Metadata = { title: "Blog · Admin" }

export default async function AdminBlogPage() {
  const posts = await getAdminBlogs()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Blog</h1>
          <p className="text-muted-foreground">{posts.length} posts</p>
        </div>
        <form action={createBlog} className="flex items-center gap-2">
          <input
            name="title"
            placeholder="New post title"
            required
            className="h-9 rounded-md border bg-background px-3 text-sm"
          />
          <Button type="submit">
            <Plus className="size-4" /> Create
          </Button>
        </form>
      </div>

      {posts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Newspaper className="size-6" />
            </span>
            <p className="font-medium">No posts yet</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Edit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.title}</TableCell>
                    <TableCell>
                      <Badge variant={p.status === "published" ? "default" : "secondary"} className="capitalize">
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(p.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/blog/${p.id}`}>
                          <Pencil className="size-4" /> Edit
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
