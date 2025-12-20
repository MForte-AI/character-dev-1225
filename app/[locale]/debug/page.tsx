"use client"

import { createClient } from "@/lib/supabase/browser-client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient()

        // Check session
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession()

        let profileInfo = null
        let workspaceInfo = null

        if (sessionData.session) {
          try {
            // Check profile
            const { data: profile, error: profileError } = await supabase
              .from("profiles")
              .select("*")
              .eq("user_id", sessionData.session.user.id)
              .single()

            profileInfo = { profile, error: profileError }

            // Check workspaces
            const { data: workspaces, error: workspacesError } = await supabase
              .from("workspaces")
              .select("*")
              .eq("user_id", sessionData.session.user.id)

            workspaceInfo = { workspaces, error: workspacesError }
          } catch (error) {
            profileInfo = { error }
          }
        }

        setDebugInfo({
          session: sessionData,
          sessionError,
          profile: profileInfo,
          workspaces: workspaceInfo,
          timestamp: new Date().toISOString()
        })
      } catch (error) {
        setDebugInfo({
          error: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString()
        })
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleManualRedirect = async () => {
    const homeWorkspace = debugInfo.workspaces?.workspaces?.find(
      (w: any) => w.is_home
    )
    if (homeWorkspace) {
      router.push(`/${homeWorkspace.id}/chat`)
    } else {
      router.push("/setup")
    }
  }

  if (loading) {
    return <div className="p-8">Loading debug info...</div>
  }

  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="mb-4 text-2xl font-bold">Authentication Debug</h1>

      <div className="space-y-4">
        <div className="rounded bg-gray-100 p-4 dark:bg-gray-800">
          <h2 className="mb-2 font-semibold">Session Info:</h2>
          <pre className="overflow-auto text-sm">
            {JSON.stringify(debugInfo.session, null, 2)}
          </pre>
          {debugInfo.sessionError && (
            <div className="mt-2 text-red-500">
              Session Error: {JSON.stringify(debugInfo.sessionError, null, 2)}
            </div>
          )}
        </div>

        {debugInfo.profile && (
          <div className="rounded bg-gray-100 p-4 dark:bg-gray-800">
            <h2 className="mb-2 font-semibold">Profile Info:</h2>
            <pre className="overflow-auto text-sm">
              {JSON.stringify(debugInfo.profile, null, 2)}
            </pre>
          </div>
        )}

        {debugInfo.workspaces && (
          <div className="rounded bg-gray-100 p-4 dark:bg-gray-800">
            <h2 className="mb-2 font-semibold">Workspaces Info:</h2>
            <pre className="overflow-auto text-sm">
              {JSON.stringify(debugInfo.workspaces, null, 2)}
            </pre>
          </div>
        )}

        {debugInfo.error && (
          <div className="rounded bg-red-100 p-4 dark:bg-red-900">
            <h2 className="mb-2 font-semibold text-red-800 dark:text-red-200">
              Error:
            </h2>
            <pre className="text-sm text-red-700 dark:text-red-300">
              {debugInfo.error}
            </pre>
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={handleManualRedirect}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Try Manual Redirect
          </button>

          <button
            onClick={() => router.push("/login")}
            className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
          >
            Go to Login
          </button>

          <button
            onClick={() => router.push("/setup")}
            className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
          >
            Go to Setup
          </button>
        </div>

        <div className="text-sm text-gray-500">
          Generated: {debugInfo.timestamp}
        </div>
      </div>
    </div>
  )
}
