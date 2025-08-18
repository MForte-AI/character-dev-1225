import { supabase } from "@/lib/supabase/Client"
import { Tables, TablesInsert, TablesUpdate } from "@/supabase/types"

export async function createMessages(newMessages: TablesInsert<"messages">[]) {
  const { data, error } = await supabase
    .from("messages")
    .insert(newMessages)
    .select("*")

  if (error) {
    console.error("createMessages error:", error)
    throw new Error(error.message)
  }

  return data
}

export async function updateMessage(
  messageId: string,
  updates: TablesUpdate<"messages">
) {
  const { data, error } = await supabase
    .from("messages")
    .update(updates)
    .eq("id", messageId)
    .select("*")
    .single()

  if (error) {
    console.error("updateMessage error:", error)
    throw new Error(error.message)
  }

  return data
}

export async function deleteMessagesIncludingAndAfter(
  userId: string,
  chatId: string,
  sequenceNumber: number
) {
  const { error } = await supabase
    .from("messages")
    .delete()
    .eq("chat_id", chatId)
    .eq("user_id", userId)
    .gte("sequence_number", sequenceNumber)

  if (error) {
    console.error("deleteMessagesIncludingAndAfter error:", error)
    throw new Error(error.message)
  }
}

export async function getMessagesByChat(chatId: string) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("chat_id", chatId)
    .order("sequence_number", { ascending: true })

  if (error) {
    console.error("getMessagesByChat error:", error)
    throw new Error(error.message)
  }

  return data
}
