import { CHAT_SETTING_LIMITS } from "@/lib/chat-setting-limits"
import { DEFAULT_CLAUDE_MODEL_ID } from "@/lib/models/llm/llm-list"
import { checkApiKey, getServerProfile } from "@/lib/server/server-chat-helpers"
import Anthropic from "@anthropic-ai/sdk"

export const runtime = "edge"

export async function POST(request: Request) {
  const json = await request.json()
  const { input } = json as {
    input: string
  }

  try {
    const profile = await getServerProfile()

    const apiKey = process.env.ANTHROPIC_API_KEY || profile.anthropic_api_key

    checkApiKey(apiKey, "Anthropic")

    const anthropic = new Anthropic({ apiKey: apiKey || "" })

    const response = await anthropic.messages.create({
      model: DEFAULT_CLAUDE_MODEL_ID,
      messages: [
        {
          role: "user",
          content: input
        }
      ],
      system: "Respond to the user.",
      temperature: 0,
      max_tokens:
        CHAT_SETTING_LIMITS[DEFAULT_CLAUDE_MODEL_ID]
          ?.MAX_TOKEN_OUTPUT_LENGTH || 4096
    })

    const content = response.content[0]?.text || ""

    return new Response(JSON.stringify({ content }), {
      status: 200
    })
  } catch (error: any) {
    const errorMessage = error.error?.message || "An unexpected error occurred"
    const errorCode = error.status || 500
    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}
