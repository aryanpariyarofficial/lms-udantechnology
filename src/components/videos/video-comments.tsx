"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, Trash2, MessageCircle } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDate, initials } from "@/lib/format"
import { addVideoComment, deleteVideoComment } from "@/lib/actions/video-public"

type Comment = {
  id: string
  body: string
  created_at: string
  user_id: string
  user: { full_name: string | null; avatar_url: string | null } | null
}

export function VideoComments({
  videoId,
  path,
  comments,
  currentUserId,
}: {
  videoId: string
  path: string
  comments: Comment[]
  currentUserId: string | null
}) {
  const router = useRouter()
  const [body, setBody] = useState("")
  const [pending, startTransition] = useTransition()

  function submit() {
    if (!body.trim()) return
    startTransition(async () => {
      const res = await addVideoComment(videoId, path, body)
      if (res.ok) {
        setBody("")
        router.refresh()
      } else toast.error(res.error ?? "Failed")
    })
  }

  return (
    <section className="space-y-5">
      <h2 className="flex items-center gap-2 text-xl font-bold">
        <MessageCircle className="size-5" /> Comments ({comments.length})
      </h2>

      {currentUserId ? (
        <div className="space-y-2">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Add a comment…"
            rows={3}
          />
          <Button onClick={submit} disabled={pending}>
            {pending && <Loader2 className="size-4 animate-spin" />} Post comment
          </Button>
        </div>
      ) : (
        <p className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>{" "}
          to join the conversation.
        </p>
      )}

      <div className="space-y-4">
        {comments.map((c) => (
          <div key={c.id} className="flex gap-3">
            <Avatar className="size-9">
              <AvatarImage src={c.user?.avatar_url ?? undefined} />
              <AvatarFallback>{initials(c.user?.full_name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{c.user?.full_name ?? "User"}</p>
                <span className="text-xs text-muted-foreground">{formatDate(c.created_at)}</span>
                {currentUserId === c.user_id && (
                  <button
                    onClick={() =>
                      startTransition(async () => {
                        await deleteVideoComment(c.id, path)
                        router.refresh()
                      })
                    }
                    className="ml-auto text-muted-foreground hover:text-destructive"
                    aria-label="Delete comment"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                )}
              </div>
              <p className="mt-0.5 whitespace-pre-line text-sm">{c.body}</p>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-sm text-muted-foreground">Be the first to comment.</p>
        )}
      </div>
    </section>
  )
}
