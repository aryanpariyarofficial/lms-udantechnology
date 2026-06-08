import Link from "next/link"
import type { Metadata } from "next"
import { Plus, BookOpen, Pencil } from "lucide-react"

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
import { getAdminCourses } from "@/lib/queries/admin-courses"
import { formatPrice } from "@/lib/format"
import { createCourse } from "./actions"

export const metadata: Metadata = { title: "Courses · Admin" }

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  published: "default",
  draft: "secondary",
  archived: "outline",
}

export default async function AdminCoursesPage() {
  const courses = await getAdminCourses()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Courses</h1>
          <p className="text-muted-foreground">{courses.length} total</p>
        </div>
        <form action={createCourse} className="flex items-center gap-2">
          <input
            name="title"
            placeholder="New course title"
            required
            className="h-9 rounded-md border bg-background px-3 text-sm"
          />
          <Button type="submit">
            <Plus className="size-4" /> Create
          </Button>
        </form>
      </div>

      {courses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
              <BookOpen className="size-6" />
            </span>
            <p className="font-medium">No courses yet</p>
            <p className="text-sm text-muted-foreground">
              Type a title above and click Create to start building your first course.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead className="text-right">Edit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <p className="font-medium">{c.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.category?.name ?? "Uncategorized"}
                      </p>
                    </TableCell>
                    <TableCell>{formatPrice(c.discount_price ?? c.price)}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[c.status] ?? "secondary"} className="capitalize">
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{c.is_featured ? "★" : "—"}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/courses/${c.id}`}>
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
