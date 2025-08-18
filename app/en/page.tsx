"use client"

import { ChatbotUISVG } from "@/components/icons/chatbotui-svg"
import { IconArrowRight } from "@tabler/icons-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import Chat from "@/components/Chat" // Import your Chat component
import { useEffect } from "react"
import { supabase } from "@/lib/supabase/browser-client"

export default function HomePage() {
  const { theme } = useTheme()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const accessToken = params.get("access_token")
    const refreshToken = params.get("refresh_token")

    if (accessToken && refreshToken) {
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      })
      // Optional: remove tokens from URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div>
        <ChatbotUISVG theme={theme === "dark" ? "dark" : "light"} scale={0.3} />
      </div>

      <h1 className="mt-2 text-4xl font-bold">Chatbot UI</h1>

      {/* Chat UI inserted here */}
      <div className="mt-6 w-full max-w-3xl">
        <Chat />
      </div>

      <Link
        href="/login"
        className="mt-6 flex w-[200px] items-center justify-center rounded-md bg-blue-500 p-2 font-semibold text-white"
      >
        Start Chatting
        <IconArrowRight className="ml-1" size={20} />
      </Link>
    </div>
  )
}
