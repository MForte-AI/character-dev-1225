import { Database } from "@/supabase/types"
import { createClient } from "@supabase/supabase-js"

const getToken = (request: Request) => {
  const headerToken = request.headers.get("x-admin-token")
  if (headerToken) return headerToken

  const authHeader = request.headers.get("authorization")
  if (!authHeader) return null

  return authHeader.replace(/^Bearer\s+/i, "").trim()
}

export async function POST(request: Request) {
  const adminToken = process.env.ADMIN_VERIFY_TOKEN
  const requestToken = getToken(request)

  if (!adminToken || requestToken !== adminToken) {
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

  let payload: {
    collectionId?: string
    fileId?: string
    filePath?: string
  }

  try {
    payload = await request.json()
  } catch {
    return new Response(JSON.stringify({ message: "Invalid JSON payload." }), {
      status: 400
    })
  }

  const collectionId = payload.collectionId?.trim()
  const fileId = payload.fileId?.trim()
  const filePath = payload.filePath?.trim()

  if (!collectionId && !fileId && !filePath) {
    return new Response(
      JSON.stringify({ message: "Provide a collectionId, fileId, or filePath." }),
      { status: 400 }
    )
  }

  const supabaseAdmin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const getCount = async (table: string, column: string, value: string) => {
    const { count, error } = await supabaseAdmin
      .from(table)
      .select("*", { count: "exact", head: true })
      .eq(column, value)

    if (error) {
      throw new Error(`${table}: ${error.message}`)
    }

    return count ?? 0
  }

  const storageStatus = async (path: string) => {
    const parts = path.split("/")
    const fileName = parts.pop()
    const folder = parts.join("/")

    if (!fileName) {
      return { path, status: "invalid_path" }
    }

    const { data, error } = await supabaseAdmin.storage
      .from("files")
      .list(folder, { search: fileName, limit: 1 })

    if (error) {
      throw new Error(`storage: ${error.message}`)
    }

    const found = (data || []).some(item => item.name === fileName)
    return {
      path,
      status: found ? "present" : "missing"
    }
  }

  try {
    const result: Record<string, unknown> = {
      timestamp: new Date().toISOString()
    }

    if (collectionId) {
      const [
        collections,
        collectionFiles,
        collectionWorkspaces,
        assistantCollections,
        chats
      ] = await Promise.all([
        getCount("collections", "id", collectionId),
        getCount("collection_files", "collection_id", collectionId),
        getCount("collection_workspaces", "collection_id", collectionId),
        getCount("assistant_collections", "collection_id", collectionId),
        getCount("chats", "collection_id", collectionId)
      ])

      result.collection = {
        id: collectionId,
        collections,
        collection_files: collectionFiles,
        collection_workspaces: collectionWorkspaces,
        assistant_collections: assistantCollections,
        chats
      }
    }

    if (fileId) {
      const [
        files,
        fileItems,
        chatFiles,
        collectionFiles,
        assistantFiles,
        fileWorkspaces
      ] = await Promise.all([
        getCount("files", "id", fileId),
        getCount("file_items", "file_id", fileId),
        getCount("chat_files", "file_id", fileId),
        getCount("collection_files", "file_id", fileId),
        getCount("assistant_files", "file_id", fileId),
        getCount("file_workspaces", "file_id", fileId)
      ])

      result.file = {
        id: fileId,
        files,
        file_items: fileItems,
        chat_files: chatFiles,
        collection_files: collectionFiles,
        assistant_files: assistantFiles,
        file_workspaces: fileWorkspaces
      }
    }

    if (filePath) {
      result.storage = await storageStatus(filePath)
    }

    return new Response(JSON.stringify(result), { status: 200 })
  } catch (error: any) {
    return new Response(
      JSON.stringify({ message: error?.message || "Verification failed." }),
      { status: 500 }
    )
  }
}
