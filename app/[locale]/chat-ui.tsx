"use client"

import React, { useState, useRef, useEffect } from "react"
import { useChatHandler } from "@/components/chat/chat-hooks/use-chat-handler"

export default function ChatUI() {
  const { messages, handleSendMessage, input, setInput, isLoading } =
    useChatHandler()
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    handleSendMessage(input)
    setInput("")
  }

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col p-4">
      <div className="mb-4 flex-1 overflow-y-auto rounded border bg-white p-4">
        {messages.length === 0 && (
          <p className="text-center text-gray-500">Start the conversation...</p>
        )}
        {messages.map(({ id, role, content }) => (
          <div
            key={id}
            className={`mb-2 flex ${role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs break-words rounded-lg px-4 py-2 ${
                role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={onSubmit} className="flex">
        <input
          type="text"
          className="flex-1 rounded-l border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Type your message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={isLoading}
          autoFocus
        />
        <button
          type="submit"
          className="rounded-r bg-blue-500 px-4 py-2 text-white disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  )
}
