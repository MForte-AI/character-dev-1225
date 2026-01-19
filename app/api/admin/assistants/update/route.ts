import { createClient as createServerClient } from "@/lib/supabase/server"
import { Database } from "@/supabase/types"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

const ALLOWED_FIELDS = [
  "name",
  "description",
  "prompt",
  "temperature",
  "context_length",
  "include_profile_context",
  "include_workspace_instructions",
  "model",
  "image_path",
  "sharing",
  "folder_id",
  "embeddings_provider"
] as const

const pickUpdateFields = (updates: Record<string, unknown>) => {
  const payload: Record<string, unknown> = {}

  for (const key of ALLOWED_FIELDS) {
    if (key in updates) {
      payload[key] = updates[key]
    }
  }

  return payload
}

export async function POST(request: Request) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("user_role")
    .eq("user_id", user.id)
    .single()

  if (profileError || profile?.user_role !== "admin") {
    return new Response("Not Found", { status: 404 })
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return new Response(JSON.stringify({ message: "Missing Supabase config." }), {
      status: 500
    })
  }

  let payload: { assistantId?: string; updates?: Record<string, unknown> }

  try {
    payload = await request.json()
  } catch {
    return new Response(JSON.stringify({ message: "Invalid JSON payload." }), {
      status: 400
    })
  }

  const assistantId = payload.assistantId?.trim()
  const updates = payload.updates ?? {}

  if (!assistantId) {
    return new Response(JSON.stringify({ message: "assistantId is required." }), {
      status: 400
    })
  }

  if (typeof updates !== "object" || Array.isArray(updates)) {
    return new Response(JSON.stringify({ message: "updates must be an object." }), {
      status: 400
    })
  }

  const updateFields = pickUpdateFields(updates)

  if (Object.keys(updateFields).length === 0) {
    return new Response(
      JSON.stringify({ message: "No valid fields provided." }),
      { status: 400 }
    )
  }

  const supabaseAdmin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data: assistant, error } = await supabaseAdmin
    .from("assistants")
    .update(updateFields)
    .eq("id", assistantId)
    .select("*")
    .single()

  if (error) {
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500
    })
  }

  return new Response(JSON.stringify({ assistant }), { status: 200 })
}
