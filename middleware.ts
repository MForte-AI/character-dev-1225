import { createClient } from "@/lib/supabase/middleware"
import { i18nRouter } from "next-i18n-router"
import { NextResponse, type NextRequest } from "next/server"
import i18nConfig from "./i18nConfig"

export async function middleware(request: NextRequest) {
  const debugEnabled = process.env.NEXT_PUBLIC_ENABLE_DEBUG === "true"
  const normalizedPath = request.nextUrl.pathname.replace(/\/+$/, "")
  const isDebugPath =
    normalizedPath === "/debug" || normalizedPath.endsWith("/debug")

  if (!debugEnabled && isDebugPath) {
    return new NextResponse("Not Found", { status: 404 })
  }

  const i18nResult = i18nRouter(request, i18nConfig)
  if (i18nResult) return i18nResult

  try {
    const { supabase, response } = createClient(request)

    const session = await supabase.auth.getSession()

    const redirectToChat = session && request.nextUrl.pathname === "/"

    if (redirectToChat && session.data.session) {
      try {
        const { data: homeWorkspace, error } = await supabase
          .from("workspaces")
          .select("*")
          .eq("user_id", session.data.session.user.id)
          .eq("is_home", true)
          .single()

        if (homeWorkspace && !error) {
          return NextResponse.redirect(
            new URL(`/${homeWorkspace.id}/chat`, request.url)
          )
        } else {
          // No home workspace found, redirect to setup
          console.warn('No home workspace found for user:', session.data.session.user.id)
          return NextResponse.redirect(new URL("/setup", request.url))
        }
      } catch (workspaceError) {
        console.error('Error fetching workspace in middleware:', workspaceError)
        return NextResponse.redirect(new URL("/setup", request.url))
      }
    }

    return response
  } catch (e) {
    console.warn('Middleware error:', e)
    return NextResponse.next({
      request: {
        headers: request.headers
      }
    })
  }
}

export const config = {
  matcher: "/((?!api|static|.*\\..*|_next|auth).*)"
}
