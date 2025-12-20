import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next")

  if (code) {
    try {
      const cookieStore = await cookies()
      const supabase = createClient(cookieStore)
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("Auth exchange error:", error)
        return NextResponse.redirect(
          `${requestUrl.origin}/login?message=${encodeURIComponent(error.message)}`
        )
      }

      if (data.session) {
        // Get user's home workspace
        const { data: homeWorkspace, error: workspaceError } = await supabase
          .from("workspaces")
          .select("*")
          .eq("user_id", data.session.user.id)
          .eq("is_home", true)
          .single()

        if (homeWorkspace && !workspaceError) {
          // Redirect to home workspace chat if no specific next parameter
          const redirectPath = next || `/${homeWorkspace.id}/chat`
          return NextResponse.redirect(requestUrl.origin + redirectPath)
        } else {
          console.error("Workspace not found:", workspaceError)
          // Redirect to setup if no home workspace exists
          return NextResponse.redirect(`${requestUrl.origin}/setup`)
        }
      }
    } catch (error) {
      console.error("Unexpected auth callback error:", error)
      return NextResponse.redirect(
        `${requestUrl.origin}/login?message=${encodeURIComponent("Authentication failed. Please try again.")}`
      )
    }
  }

  // Fallback redirect
  if (next) {
    return NextResponse.redirect(requestUrl.origin + next)
  } else {
    return NextResponse.redirect(requestUrl.origin)
  }
}
