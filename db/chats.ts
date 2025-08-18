import { supabase } from "@/lib/supabase/Client"
import { Tables, TablesInsert, TablesUpdate } from "@/supabase/types"

// Create a new chat
export async function createChat(newChat: TablesInsert<"chats">) {
  const { data, error } = await supabase
    .from("chats")
    .insert(newChat)
    .select("*")
    .single()

  if (error) {
    console.error("createChat error:", error)
    throw new Error(error.message)
  }

  return data
}

// Get a single chat by its ID
export async function getChatById(chatId: string) {
  const { data, error } = await supabase
    .from("chats")
    .select("*")
    .eq("id", chatId)
    .single()

  if (error) {
    console.error("getChatById error:", error)
    throw new Error(error.message)
  }

  return data
}

// Update an existing chat
export async function updateChat(
  chatId: string,
  updates: TablesUpdate<"chats">
) {
  const { data, error } = await supabase
    .from("chats")
    .update(updates)
    .eq("id", chatId)
    .select("*")
    .single()

  if (error) {
    console.error("updateChat error:", error)
    throw new Error(error.message)
  }

  return data
}

// Delete a chat
export async function deleteChat(chatId: string) {
  const { error } = await supabase.from("chats").delete().eq("id", chatId)

  if (error) {
    console.error("deleteChat error:", error)
    throw new Error(error.message)
  }
}

// ✅ Get all chats for a given workspace ID
export async function getChatsByWorkspaceId(workspaceId: string) {
  const { data, error } = await supabase
    .from("chats")
    .select("*")
    .eq("workspace_id", workspaceId) // Make sure this column exists in your table

  if (error) {
    console.error("getChatsByWorkspaceId error:", error)
    throw new Error(error.message)
  }

  return data
}
