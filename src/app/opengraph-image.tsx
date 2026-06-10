import { ImageResponse } from "next/og"

import { SITE } from "@/lib/constants"

export const alt = `${SITE.name} — online courses, tutorials and memberships`
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #5650EF 0%, #3B2FD4 60%, #241b8f 100%)",
          color: "white",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -120,
            left: -120,
            width: 420,
            height: 420,
            borderRadius: 9999,
            background: "rgba(255,255,255,0.08)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -140,
            right: -100,
            width: 460,
            height: 460,
            borderRadius: 9999,
            background: "rgba(255,255,255,0.07)",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            padding: "10px 28px",
            borderRadius: 9999,
            background: "rgba(255,255,255,0.14)",
            fontSize: 28,
            marginBottom: 36,
          }}
        >
          🚀 Nepal&apos;s practical learning platform
        </div>
        <div
          style={{
            fontSize: 84,
            fontWeight: 800,
            letterSpacing: -2,
            textAlign: "center",
            display: "flex",
          }}
        >
          UDAN Technology LMS
        </div>
        <div
          style={{
            marginTop: 26,
            fontSize: 32,
            opacity: 0.9,
            textAlign: "center",
            maxWidth: 900,
            display: "flex",
          }}
        >
          Project-based courses · Tutorials · Memberships · Certificates
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 42,
            fontSize: 26,
            opacity: 0.85,
            display: "flex",
          }}
        >
          lms.udantechnology.com
        </div>
      </div>
    ),
    size
  )
}
