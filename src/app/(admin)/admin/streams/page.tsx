import type { Metadata } from "next"
import { VideoAdminList } from "../videos/video-admin-list"

export const metadata: Metadata = { title: "Streams · Admin" }

export default function AdminStreamsPage() {
  return <VideoAdminList kind="stream" />
}
