"use client"

import { ChatMessage, Chat } from "@/types"
import { useState } from "react"
import { v4 as uuidv4 } from "uuid"
import { useChatStore } from "@/providers/chat-store"
import { useMessageHandler } from "@/lib/hooks/use-message-handler"
import { useMessages } from "@/lib/hooks/use-messages"

export const useChatHandler = () => {
  const { currentChat, setCurrentChat, setChats } = useChatStore()
  const { setChatMessages } = useMessageHandler()
  const { handleCreateMessages } = useMessages()
  const [isTyping, setIsTyping] = useState(false)

  const handleCreateChat = (initialMessage?: string): Chat => {
    const newChat: Chat = {
      id: uuidv4(),
      title: initialMessage ? initialMessage.slice(0, 20) : "New Chat",
      messages: []
    }

    setChats(prev => [newChat, ...prev])
    setCurrentChat(newChat)
    return newChat
  }

  const handleFocusChatInput = () => {
    const inputElement = document.querySelector("input")
    if (inputElement) {
      inputElement.focus()
    }
  }

  const handleSendMessage = async (
    messageContent: string,
    chatMessages: ChatMessage[],
    isRegeneration: boolean
  ) => {
    console.log("🚀 handleSendMessage triggered:", {
      messageContent,
      chatMessages,
      isRegeneration
    })

    let activeChat = currentChat

    if (!activeChat) {
      activeChat = handleCreateChat(messageContent)
    }

    const userMessage: ChatMessage = {
      id: uuidv4(),
      chat_id: activeChat.id,
      content: messageContent,
      role: "user",
      created_at: new Date().toISOString()
    }

    const updatedMessages = [...chatMessages, userMessage]

    console.log(
      "🧠 Setting chat messages (before generation):",
      updatedMessages
    )

    setChatMessages(updatedMessages)
    setIsTyping(true)

    let generatedText = ""

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ messages: updatedMessages })
      })

      const data = await response.json()
      generatedText = data.reply
    } catch (error) {
      console.error("Failed to get AI response:", error)
      generatedText = "⚠️ Sorry, I couldn't get a response from the AI."
    }

    const assistantMessage: ChatMessage = {
      id: uuidv4(),
      chat_id: activeChat.id,
      content: generatedText,
      role: "assistant",
      created_at: new Date().toISOString()
    }

    const finalMessages = [...updatedMessages, assistantMessage]

    console.log("🧠 Setting chat messages (final):", finalMessages)

    setChatMessages(finalMessages)
    setIsTyping(false)

    console.log("📨 Creating messages with:", {
      activeChat,
      messageContent,
      generatedText,
      chatMessagesLength: chatMessages.length
    })

    await handleCreateMessages([userMessage, assistantMessage])
  }

  return {
    handleCreateChat,
    handleFocusChatInput,
    handleSendMessage,
    isTyping
  }
}
