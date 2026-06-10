import type { Metadata } from "next"
import { VideoAdminList } from "../videos/video-admin-list"

export const metadata: Metadata = { title: "Tutorials · Admin" }

export default function AdminTutorialsPage() {
  return <VideoAdminList kind="tutorial" />
}
