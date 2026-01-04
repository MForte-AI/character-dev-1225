import { LLM } from "@/types"

const ANTHROPIC_PLATFORM_LINK =
  "https://docs.anthropic.com/claude/reference/getting-started-with-the-api"

// Anthropic Models (UPDATED 06/20/24) -----------------------------

// Claude 2 (UPDATED 12/21/23)
const CLAUDE_2: LLM = {
  modelId: "claude-2.1",
  modelName: "Claude 2",
  provider: "anthropic",
  hostedId: "claude-2.1",
  platformLink: ANTHROPIC_PLATFORM_LINK,
  imageInput: false,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 8,
    outputCost: 24
  }
}

// Claude Instant (UPDATED 12/21/23)
const CLAUDE_INSTANT: LLM = {
  modelId: "claude-instant-1.2",
  modelName: "Claude Instant",
  provider: "anthropic",
  hostedId: "claude-instant-1.2",
  platformLink: ANTHROPIC_PLATFORM_LINK,
  imageInput: false,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 0.8,
    outputCost: 2.4
  }
}

// Claude 3 Haiku (UPDATED 03/13/24)
const CLAUDE_3_HAIKU: LLM = {
  modelId: "claude-3-haiku-20240307",
  modelName: "Claude 3 Haiku",
  provider: "anthropic",
  hostedId: "claude-3-haiku-20240307",
  platformLink: ANTHROPIC_PLATFORM_LINK,
  imageInput: true,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 0.25,
    outputCost: 1.25
  }
}

// Claude 3 Sonnet (UPDATED 03/04/24)
const CLAUDE_3_SONNET: LLM = {
  modelId: "claude-3-sonnet-20240229",
  modelName: "Claude 3 Sonnet",
  provider: "anthropic",
  hostedId: "claude-3-sonnet-20240229",
  platformLink: ANTHROPIC_PLATFORM_LINK,
  imageInput: true,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 3,
    outputCost: 15
  }
}

// Claude 3 Opus (UPDATED 03/04/24)
const CLAUDE_3_OPUS: LLM = {
  modelId: "claude-3-opus-20240229",
  modelName: "Claude 3 Opus",
  provider: "anthropic",
  hostedId: "claude-3-opus-20240229",
  platformLink: ANTHROPIC_PLATFORM_LINK,
  imageInput: true,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 15,
    outputCost: 75
  }
}

// Claude 3.5 Sonnet (UPDATED 06/20/24)
const CLAUDE_3_5_SONNET: LLM = {
  modelId: "claude-3-5-sonnet-20240620",
  modelName: "Claude 3.5 Sonnet",
  provider: "anthropic",
  hostedId: "claude-3-5-sonnet-20240620",
  platformLink: ANTHROPIC_PLATFORM_LINK,
  imageInput: true,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 3,
    outputCost: 15
  }
}

// Claude 3.5 Haiku (UPDATED 10/22/24)
const CLAUDE_3_5_HAIKU: LLM = {
  modelId: "claude-3-5-haiku-20241022",
  modelName: "Claude 3.5 Haiku",
  provider: "anthropic",
  hostedId: "claude-3-5-haiku-20241022",
  platformLink: ANTHROPIC_PLATFORM_LINK,
  imageInput: true
}

// Claude 3.7 Sonnet (UPDATED 02/19/25)
const CLAUDE_3_7_SONNET: LLM = {
  modelId: "claude-3-7-sonnet-20250219",
  modelName: "Claude 3.7 Sonnet",
  provider: "anthropic",
  hostedId: "claude-3-7-sonnet-20250219",
  platformLink: ANTHROPIC_PLATFORM_LINK,
  imageInput: true
}

// Claude 4 Sonnet (UPDATED 05/14/25)
const CLAUDE_4_SONNET: LLM = {
  modelId: "claude-sonnet-4-20250514",
  modelName: "Claude 4 Sonnet",
  provider: "anthropic",
  hostedId: "claude-sonnet-4-20250514",
  platformLink: ANTHROPIC_PLATFORM_LINK,
  imageInput: true
}

// Claude 4 Opus (UPDATED 05/14/25)
const CLAUDE_4_OPUS: LLM = {
  modelId: "claude-opus-4-20250514",
  modelName: "Claude 4 Opus",
  provider: "anthropic",
  hostedId: "claude-opus-4-20250514",
  platformLink: ANTHROPIC_PLATFORM_LINK,
  imageInput: true
}

// Claude 4.1 Opus (UPDATED 08/05/25)
const CLAUDE_4_1_OPUS: LLM = {
  modelId: "claude-opus-4-1-20250805",
  modelName: "Claude 4.1 Opus",
  provider: "anthropic",
  hostedId: "claude-opus-4-1-20250805",
  platformLink: ANTHROPIC_PLATFORM_LINK,
  imageInput: true
}

// Claude 4.5 Sonnet (UPDATED 09/29/25)
const CLAUDE_4_5_SONNET: LLM = {
  modelId: "claude-sonnet-4-5-20250929",
  modelName: "Claude 4.5 Sonnet",
  provider: "anthropic",
  hostedId: "claude-sonnet-4-5-20250929",
  platformLink: ANTHROPIC_PLATFORM_LINK,
  imageInput: true
}

// Claude 4.5 Haiku (UPDATED 10/01/25)
const CLAUDE_4_5_HAIKU: LLM = {
  modelId: "claude-haiku-4-5-20251001",
  modelName: "Claude 4.5 Haiku",
  provider: "anthropic",
  hostedId: "claude-haiku-4-5-20251001",
  platformLink: ANTHROPIC_PLATFORM_LINK,
  imageInput: true
}

// Claude 4.5 Opus (UPDATED 11/01/25)
const CLAUDE_4_5_OPUS: LLM = {
  modelId: "claude-opus-4-5-20251101",
  modelName: "Claude 4.5 Opus",
  provider: "anthropic",
  hostedId: "claude-opus-4-5-20251101",
  platformLink: ANTHROPIC_PLATFORM_LINK,
  imageInput: true
}

export const ANTHROPIC_LLM_LIST: LLM[] = [
  CLAUDE_2,
  CLAUDE_INSTANT,
  CLAUDE_3_HAIKU,
  CLAUDE_3_SONNET,
  CLAUDE_3_OPUS,
  CLAUDE_3_5_SONNET,
  CLAUDE_3_5_HAIKU,
  CLAUDE_3_7_SONNET,
  CLAUDE_4_SONNET,
  CLAUDE_4_OPUS,
  CLAUDE_4_1_OPUS,
  CLAUDE_4_5_SONNET,
  CLAUDE_4_5_HAIKU,
  CLAUDE_4_5_OPUS
]
