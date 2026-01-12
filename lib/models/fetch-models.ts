import { Tables } from "@/supabase/types"
import { LLM, LLMID } from "@/types"
import { LLM_LIST_MAP } from "./llm/llm-list"

export const fetchHostedModels = async (profile: Tables<"profiles">) => {
  try {
    const providers = ["openai", "anthropic"]

    const response = await fetch("/api/keys")

    if (!response.ok) {
      throw new Error(`Server is not responding.`)
    }

    const data = await response.json()

    const isUsingEnvKeyMap = data.isUsingEnvKeyMap || {}
    let modelsToAdd: LLM[] = []

    for (const provider of providers) {
      const providerKey = `${provider}_api_key` as keyof typeof profile

      if (profile?.[providerKey] || isUsingEnvKeyMap[provider]) {
        const models = LLM_LIST_MAP[provider]

        if (Array.isArray(models)) {
          modelsToAdd.push(...models)
        }
      }
    }

    return {
      envKeyMap: isUsingEnvKeyMap,
      hostedModels: modelsToAdd
    }
  } catch (error) {
    console.warn("Error fetching hosted models: " + error)
  }
}

export const fetchOllamaModels = async () => {
  try {
    const response = await fetch(
      process.env.NEXT_PUBLIC_OLLAMA_URL + "/api/tags"
    )

    if (!response.ok) {
      throw new Error(`Ollama server is not responding.`)
    }

    const data = await response.json()

    const localModels: LLM[] = data.models.map((model: any) => ({
      modelId: model.name as LLMID,
      modelName: model.name,
      provider: "ollama",
      hostedId: model.name,
      platformLink: "https://ollama.ai/",
      imageInput: false
    }))

    return localModels
  } catch (error) {
    console.warn("Error fetching Ollama models: " + error)
  }
}
