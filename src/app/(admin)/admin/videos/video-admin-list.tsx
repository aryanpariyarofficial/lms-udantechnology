import Link from "next/link"
import { Plus, Pencil, MonitorPlay } from "lucide-react"

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
import { getAdminVideos } from "@/lib/queries/videos"
import { formatDate } from "@/lib/format"
import { createVideo } from "./actions"
import type { VideoKind } from "@/lib/supabase/types"

export async function VideoAdminList({ kind }: { kind: VideoKind }) {
  const videos = await getAdminVideos(kind)
  const base = kind === "tutorial" ? "/admin/tutorials" : "/admin/streams"
  const label = kind === "tutorial" ? "Tutorial" : "Stream"
  const create = createVideo.bind(null, kind)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{label}s</h1>
          <p className="text-muted-foreground">{videos.length} total</p>
        </div>
        <form action={create} className="flex items-center gap-2">
          <input
            name="title"
            placeholder={`New ${label.toLowerCase()} title`}
            required
            className="h-9 rounded-md border bg-background px-3 text-sm"
          />
          <Button type="submit">
            <Plus className="size-4" /> Create
          </Button>
        </form>
      </div>

      {videos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
              <MonitorPlay className="size-6" />
            </span>
            <p className="font-medium">No {label.toLowerCase()}s yet</p>
            <p className="text-sm text-muted-foreground">
              Type a title above and Create — then paste the YouTube link.
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
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Edit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {videos.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium">{v.title}</TableCell>
                    <TableCell className="text-muted-foreground">{v.category ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant={v.status === "published" ? "default" : "secondary"} className="capitalize">
                        {v.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(v.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`${base}/${v.id}`}>
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
