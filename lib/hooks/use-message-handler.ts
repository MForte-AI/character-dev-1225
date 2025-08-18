import { useMessageStore } from "@/providers/message-store"

export const useMessageHandler = () => {
  const { setMessages } = useMessageStore()

  const setChatMessages = (messages: any[]) => {
    setMessages(messages)
  }

  const handleIncomingMessage = (message: any) => {
    console.log("📩 Mock handler received message:", message)
    // Add actual message handling logic here if needed
  }

  return {
    setChatMessages,
    handleIncomingMessage
  }
}
