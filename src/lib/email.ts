import "server-only"

import { Resend } from "resend"

import { SITE } from "@/lib/constants"

const apiKey = process.env.RESEND_API_KEY
const from = process.env.EMAIL_FROM ?? `UDAN Technology LMS <onboarding@resend.dev>`
const replyTo = process.env.EMAIL_REPLY_TO

const resend = apiKey ? new Resend(apiKey) : null

/** Send an email. No-op (logged) if Resend isn't configured. Never throws. */
export async function sendEmail(opts: {
  to: string
  subject: string
  html: string
}) {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set — skipping:", opts.subject)
    return { ok: false as const, skipped: true as const }
  }
  try {
    const { error } = await resend.emails.send({
      from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      ...(replyTo ? { replyTo } : {}),
    })
    if (error) {
      console.error("[email] send error:", error)
      return { ok: false as const }
    }
    return { ok: true as const }
  } catch (e) {
    console.error("[email] send threw:", e)
    return { ok: false as const }
  }
}

// ---------- Branded HTML template ----------

const BRAND = "#5650EF"

function layout(opts: {
  heading: string
  body: string
  ctaLabel?: string
  ctaHref?: string
}) {
  const button =
    opts.ctaLabel && opts.ctaHref
      ? `<a href="${opts.ctaHref}" style="display:inline-block;background:${BRAND};color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:15px;margin-top:8px">${opts.ctaLabel}</a>`
      : ""

  return `<!doctype html><html><body style="margin:0;background:#f5f5f5;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0a0a0a">
  <div style="max-width:520px;margin:0 auto;padding:24px">
    <div style="padding:20px 0">
      <span style="display:inline-block;background:${BRAND};color:#fff;width:36px;height:36px;border-radius:10px;text-align:center;line-height:36px;font-weight:700">U</span>
      <span style="font-weight:700;font-size:18px;vertical-align:middle;margin-left:8px">UDAN <span style="color:#737373;font-weight:500;font-size:14px">Technology</span></span>
    </div>
    <div style="background:#fff;border-radius:14px;border:1px solid #e5e5e5;padding:32px">
      <h1 style="margin:0 0 12px;font-size:20px">${opts.heading}</h1>
      <div style="font-size:15px;line-height:1.6;color:#404040">${opts.body}</div>
      ${button}
    </div>
    <p style="text-align:center;color:#737373;font-size:12px;margin-top:24px">
      © ${new Date().getFullYear()} ${SITE.name} · Nepal
    </p>
  </div></body></html>`
}

const base = SITE.url

export function paymentApprovedEmail(name: string, itemTitle: string, isMembership: boolean) {
  return {
    subject: "✅ Your payment is approved — access unlocked",
    html: layout({
      heading: `You're in, ${name}! 🎉`,
      body: `Your payment for <strong>${itemTitle}</strong> has been verified and your ${
        isMembership ? "membership" : "course access"
      } is now active. Jump in and start learning.`,
      ctaLabel: isMembership ? "View membership" : "Start learning",
      ctaHref: `${base}${isMembership ? "/dashboard/membership" : "/dashboard/courses"}`,
    }),
  }
}

export function paymentRejectedEmail(name: string, itemTitle: string, reason: string) {
  return {
    subject: "Payment could not be verified",
    html: layout({
      heading: `Hi ${name}, we couldn't verify your payment`,
      body: `Your payment for <strong>${itemTitle}</strong> couldn't be approved.<br/><br/><strong>Reason:</strong> ${reason}<br/><br/>Please re-submit with the correct details, or contact support if you need help.`,
      ctaLabel: "View payments",
      ctaHref: `${base}/dashboard/payments`,
    }),
  }
}

export function certificateIssuedEmail(name: string, courseTitle: string, code: string) {
  return {
    subject: "🏆 Your certificate is ready",
    html: layout({
      heading: `Congratulations, ${name}!`,
      body: `You completed <strong>${courseTitle}</strong> and earned your certificate.<br/><br/>Certificate ID: <strong>${code}</strong>`,
      ctaLabel: "View certificate",
      ctaHref: `${base}/verify/${code}`,
    }),
  }
}
