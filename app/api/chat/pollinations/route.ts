import { ChatSettings } from "@/types"
import { StreamingTextResponse } from "ai"
import { ServerRuntime } from "next"

export const runtime: ServerRuntime = "edge"

export async function POST(request: Request) {
  const json = await request.json()
  const { chatSettings, messages } = json as {
    chatSettings: ChatSettings
    messages: any[]
  }

  try {
    // Extract the model ID from chatSettings
    const modelId = chatSettings.model
    
    // Map our model IDs to Pollinations model IDs
    const pollinationsModelMap: Record<string, string> = {
      "pollinations-openai": "openai",
      "pollinations-openai-large": "openai-large",
      "pollinations-mistral": "mistral",
      "pollinations-llama": "llama"
    }
    
    // Get the Pollinations model ID
    const pollinationsModel = pollinationsModelMap[modelId] || "openai"
    
    // Format messages for Pollinations API
    const formattedMessages = messages.map((message: any) => ({
      role: message.role,
      content: message.content
    }))
    
    // Create the API URL with the prompt from the last user message
    const lastUserMessage = formattedMessages
      .filter((msg: any) => msg.role === "user")
      .pop()
    
    if (!lastUserMessage) {
      throw new Error("No user message found")
    }
    
    // Prepare the prompt
    const prompt = encodeURIComponent(lastUserMessage.content)
    
    // Create the Pollinations API URL
    const apiUrl = `https://text.pollinations.ai/${prompt}?model=${pollinationsModel}&stream=true`
    
    // Make the request to Pollinations API
    const response = await fetch(apiUrl)
    
    if (!response.ok) {
      throw new Error(`Pollinations API returned ${response.status}: ${await response.text()}`)
    }
    
    // Return the streaming response
    return new StreamingTextResponse(response.body as ReadableStream)
  } catch (error: any) {
    let errorMessage = error.message || "An unexpected error occurred"
    const errorCode = error.status || 500
    
    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}
