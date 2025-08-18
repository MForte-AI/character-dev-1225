// src/providers/message-store.ts

import { create } from "zustand"
import { ChatMessage } from "@/types"

interface MessageState {
messages: ChatMessage[]
setMessages: (messages: ChatMessage[]) => void
}

export const useMessageStore = create<MessageState>((set) => ({
messages: [],
setMessages: (messages) => set({ messages }),
}))