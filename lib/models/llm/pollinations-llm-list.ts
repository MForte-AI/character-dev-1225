import { LLM } from "@/types"

const POLLINATIONS_PLATFORM_LINK = "https://pollinations.ai"

// Pollinations Text Models
const PollinationsOpenAI: LLM = {
  modelId: "pollinations-openai",
  modelName: "Pollinations OpenAI",
  provider: "pollinations",
  hostedId: "openai",
  platformLink: POLLINATIONS_PLATFORM_LINK,
  imageInput: true,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 0, // Free
    outputCost: 0 // Free
  }
}

const PollinationsOpenAILarge: LLM = {
  modelId: "pollinations-openai-large",
  modelName: "Pollinations OpenAI Large",
  provider: "pollinations",
  hostedId: "openai-large",
  platformLink: POLLINATIONS_PLATFORM_LINK,
  imageInput: true,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 0, // Free
    outputCost: 0 // Free
  }
}

const PollinationsMistral: LLM = {
  modelId: "pollinations-mistral",
  modelName: "Pollinations Mistral",
  provider: "pollinations",
  hostedId: "mistral",
  platformLink: POLLINATIONS_PLATFORM_LINK,
  imageInput: true,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 0, // Free
    outputCost: 0 // Free
  }
}

const PollinationsLlama: LLM = {
  modelId: "pollinations-llama",
  modelName: "Pollinations Llama 3.3",
  provider: "pollinations",
  hostedId: "llama",
  platformLink: POLLINATIONS_PLATFORM_LINK,
  imageInput: false,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 0, // Free
    outputCost: 0 // Free
  }
}

export const POLLINATIONS_LLM_LIST: LLM[] = [
  PollinationsOpenAI,
  PollinationsOpenAILarge,
  PollinationsMistral,
  PollinationsLlama
]
