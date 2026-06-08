import "server-only"

import { createClient } from "@/lib/supabase/server"

export type CertificateRecord = {
  certificate_code: string
  issued_at: string
  course: { title: string } | null
  user: { full_name: string | null } | null
}

export async function getCertificateByCode(
  code: string
): Promise<CertificateRecord | null> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("certificates")
      .select("certificate_code, issued_at, course:courses(title), user:profiles(full_name)")
      .eq("certificate_code", code)
      .maybeSingle()
    return (data as unknown as CertificateRecord) ?? null
  } catch {
    return null
  }
}
