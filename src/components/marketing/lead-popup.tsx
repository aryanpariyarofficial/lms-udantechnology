"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { User, Mail, Phone, MapPin, Loader2, CheckCircle2, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { submitLead } from "@/lib/actions/lead"

const STORAGE_KEY = "udan_lead_popup"
const COOLDOWN_DAYS = 3
const DELAY_MS = 5000

type CourseOption = { id: string; title: string }

export function LeadPopup({ courses }: { courses: CourseOption[] }) {
  const [open, setOpen] = useState(false)
  const [done, setDone] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const ts = Number(raw)
        if (Date.now() - ts < COOLDOWN_DAYS * 86400_000) return
      }
    } catch {
      /* ignore */
    }
    const timer = setTimeout(() => setOpen(true), DELAY_MS)
    return () => clearTimeout(timer)
  }, [])

  function dismiss() {
    setOpen(false)
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()))
    } catch {
      /* ignore */
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setError(null)
    const form = new FormData(e.currentTarget)
    const id = String(form.get("course_id") ?? "")
    form.set("interested_course", courses.find((c) => c.id === id)?.title ?? "")
    const res = await submitLead(form)
    setPending(false)
    if (res.ok) {
      setDone(true)
      try {
        localStorage.setItem(STORAGE_KEY, String(Date.now()))
      } catch {
        /* ignore */
      }
    } else {
      setError(res.error ?? "Failed")
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={dismiss} />

      {/* Modal */}
      <div className="relative z-10 grid w-full max-w-3xl overflow-hidden rounded-2xl bg-card shadow-2xl md:grid-cols-2">
        <button
          onClick={dismiss}
          aria-label="Close"
          className="absolute right-3 top-3 z-20 grid size-8 place-items-center rounded-full bg-black/40 text-white hover:bg-black/60"
        >
          <X className="size-4" />
        </button>

        {/* Left: image */}
        <div className="relative hidden min-h-full bg-primary md:block">
          <Image src="/popup.webp" alt="Start your journey" fill className="object-cover" sizes="384px" />
        </div>

        {/* Right: form / success */}
        <div className="p-6 sm:p-8">
          {done ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 py-10 text-center">
              <CheckCircle2 className="size-14 text-success" />
              <h3 className="text-xl font-bold">Thank you! 🎉</h3>
              <p className="text-sm text-muted-foreground">
                We&apos;ve received your details. Our team will reach out soon.
              </p>
              <Button onClick={() => setOpen(false)} className="mt-2">Close</Button>
            </div>
          ) : (
            <>
              <h3 className="text-2xl font-bold tracking-tight">Start your journey today 🚀</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Leave your details and we&apos;ll help you pick the right course.
              </p>

              <form onSubmit={onSubmit} className="mt-5 space-y-3">
                {error && (
                  <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
                )}
                <Field icon={User}>
                  <input name="full_name" required placeholder="Full Name" className="lead-input" />
                </Field>
                <Field icon={Mail}>
                  <input name="email" type="email" required placeholder="Email Address" className="lead-input" />
                </Field>
                <Field icon={Phone}>
                  <input name="phone" placeholder="Phone Number" className="lead-input" />
                </Field>
                <Field icon={MapPin}>
                  <input name="city" placeholder="City" className="lead-input" />
                </Field>
                <select name="course_id" defaultValue="" className="lead-input px-3">
                  <option value="">Interested Course</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
                <Button type="submit" size="lg" className="w-full" disabled={pending}>
                  {pending && <Loader2 className="size-4 animate-spin" />}
                  Get Started Now
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ icon: Icon, children }: { icon: typeof User; children: React.ReactNode }) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <div className="[&>input]:pl-9">{children}</div>
    </div>
  )
}
