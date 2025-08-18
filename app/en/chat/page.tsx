import Chat from "@/components/Chat"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { Database } from "@/supabase/types"
import { redirect } from "next/navigation"

export default async function ChatPage() {
  const cookieStore = cookies()

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        }
      }
    }
  )

  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (!session) {
    // Not logged in — redirect to login page
    return redirect("/login")
  }

  return (
    <main className="flex h-screen flex-col">
      <header className="bg-white p-4 shadow">
        <h1 className="text-xl font-semibold">SourceField Chat</h1>
      </header>
      <div className="flex-1 overflow-hidden">
        <Chat />
      </div>
    </main>
  )
}
