// /providers/chat-store.ts
import { create } from "zustand"
import { Chat } from "@/types"

interface ChatStore {
  chats: Chat[]
  currentChat: Chat | null
  setCurrentChat: (chat: Chat) => void
  setChats: (chats: Chat[]) => void
  selectedChatId: string | null
  setSelectedChatId: (chatId: string | null) => void
}

export const useChatStore = create<ChatStore>((set) => ({
  chats: [],
  currentChat: null,
  setCurrentChat: (chat) => set ({ currentChat: chat }),
  setChats: (chats) => set ({ chats }),
  selectedChatId: null,
  setSelectedChatId: (chatId) => set({ selectedChatId: chatId }),
}))
