import { NextResponse } from "next/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Phone numbers aren't a Supabase Auth identifier — logging in "by mobile
// number" means resolving phone -> email first, then a normal password
// sign-in on the client. That lookup has to run server-side with the
// service-role key so the `profiles` table's phone column never needs a
// public read policy.
export async function POST(request: Request) {
  const { phone } = await request.json()
  if (!phone || typeof phone !== "string") {
    return NextResponse.json({ error: "Phone number required" }, { status: 400 })
  }

  const admin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data } = await admin.from("profiles").select("email").eq("phone", phone.trim()).maybeSingle()

  if (!data?.email) {
    return NextResponse.json({ error: "No account found for this number" }, { status: 404 })
  }

  return NextResponse.json({ email: data.email })
}
