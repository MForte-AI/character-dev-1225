import { CHAT_SETTING_LIMITS } from "@/lib/chat-setting-limits"
import { checkApiKey, getServerProfile } from "@/lib/server/server-chat-helpers"
import { ChatSettings } from "@/types"
import { OpenAIStream, StreamingTextResponse } from "ai"
import OpenAI from "openai"

export const runtime = "edge"

export async function POST(request: Request) {
  const json = await request.json()
  const { chatSettings, messages } = json as {
    chatSettings: ChatSettings
    messages: any[]
  }

  try {
    const profile = await getServerProfile()

    checkApiKey(profile.mistral_api_key, "Mistral")

    // Mistral is compatible the OpenAI SDK
    const mistral = new OpenAI({
      apiKey: profile.mistral_api_key || "",
      baseURL: "https://api.mistral.ai/v1"
    })

    // Implement RAG (Retrieval-Augmented Generation)
    const retrievedData = await fetch("/api/retrieval/retrieve", {
      method: "POST",
      body: JSON.stringify({
        userInput: messages[messages.length - 1].content,
        fileIds: [], // Add appropriate file IDs if needed
        embeddingsProvider: "openai", // or "local" based on your setup
        sourceCount: 5 // Adjust the source count as needed
      })
    })

    const { results } = await retrievedData.json()

    // Append retrieved data to the messages
    const augmentedMessages = [
      ...messages,
      {
        role: "system",
        content: `Retrieved data: ${results.map(result => result.content).join("\n")}`
      }
    ]

    const response = await mistral.chat.completions.create({
      model: "mistral:7b-instruct-v0.3-q4_K_M",
      messages: augmentedMessages,
      max_tokens:
        CHAT_SETTING_LIMITS[chatSettings.model].MAX_TOKEN_OUTPUT_LENGTH,
      stream: true
    })

    // Convert the response into a friendly text-stream.
    const stream = OpenAIStream(response)

    // Respond with the stream
    return new StreamingTextResponse(stream)
  } catch (error: any) {
    let errorMessage = error.message || "An unexpected error occurred"
    const errorCode = error.status || 500

    if (errorMessage.toLowerCase().includes("api key not found")) {
      errorMessage =
        "Mistral API Key not found. Please set it in your profile settings."
    } else if (errorCode === 401) {
      errorMessage =
        "Mistral API Key is incorrect. Please fix it in your profile settings."
    }

    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}
