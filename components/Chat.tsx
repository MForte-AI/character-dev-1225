"use client"

import React, { useState, useEffect, useRef } from "react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleNewChat = () => {
    setMessages([])
    setInput("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(({ role, content }) => ({
            role,
            content
          }))
        })
      })

      if (!response.ok) {
        throw new Error("Failed to get response from server")
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.result || "Sorry, I didn't understand that."
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error(error)
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "There was an error. Please try again later."
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col p-4">
      <button
        onClick={handleNewChat}
        className="mb-4 rounded bg-gray-300 px-4 py-2 transition hover:bg-gray-400"
        disabled={isLoading}
      >
        New Chat
      </button>

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

      <form onSubmit={handleSubmit} className="flex">
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
          disabled={isLoading}
          className="rounded-r bg-blue-500 px-4 py-2 text-white disabled:opacity-50"
        >
          {isLoading ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  )
}
