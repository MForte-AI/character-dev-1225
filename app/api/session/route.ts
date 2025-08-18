import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { Database } from "@/supabase/types"

export async function GET() {
  const cookieStore = cookies()

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value
        }
      }
    }
  )

  const {
    data: { session },
    error
  } = await supabase.auth.getSession()

  if (error) {
    console.error("Error getting session:", error)
    return NextResponse.json(
      { session: null, error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ session })
}
