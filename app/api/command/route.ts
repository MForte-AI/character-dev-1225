import { getMaxOutputLength } from "@/lib/chat-setting-limits"
import {
  DEFAULT_CLAUDE_MODEL_ID,
  resolveClaudeModelId
} from "@/lib/models/llm/llm-list"
import { checkApiKey, getServerProfile } from "@/lib/server/server-chat-helpers"
import Anthropic from "@anthropic-ai/sdk"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const json = await request.json()
  const { input } = json as {
    input: string
  }

  try {
    let profile: Awaited<ReturnType<typeof getServerProfile>> | null = null
    try {
      profile = await getServerProfile()
    } catch (profileError) {
      console.warn("Unable to load profile for command route:", profileError)
    }

    const apiKey = process.env.ANTHROPIC_API_KEY || profile?.anthropic_api_key

    checkApiKey(apiKey || null, "Anthropic")

    const anthropic = new Anthropic({ apiKey: apiKey || "" })

    const modelId = resolveClaudeModelId(DEFAULT_CLAUDE_MODEL_ID)

    const response = await anthropic.messages.create({
      model: modelId,
      messages: [
        {
          role: "user",
          content: input
        }
      ],
      system: "Respond to the user.",
      temperature: 0,
      max_tokens: getMaxOutputLength(modelId)
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
