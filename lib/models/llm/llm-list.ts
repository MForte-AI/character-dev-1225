import { LLM, LLMID } from "@/types"
import { ANTHROPIC_LLM_LIST } from "./anthropic-llm-list"

const FALLBACK_CLAUDE_MODEL_ID: LLMID = "claude-3-5-sonnet-20240620"

export const DEFAULT_CLAUDE_MODEL_ID: LLMID = (
  process.env.NEXT_PUBLIC_DEFAULT_CLAUDE_MODEL_ID ||
  process.env.DEFAULT_CLAUDE_MODEL_ID ||
  FALLBACK_CLAUDE_MODEL_ID
) as LLMID

export const LLM_LIST: LLM[] = [...ANTHROPIC_LLM_LIST]

export const LLM_LIST_MAP: Record<string, LLM[]> = {
  openai: [],
  anthropic: ANTHROPIC_LLM_LIST
}

export const resolveClaudeModelId = (modelId?: string | null): LLMID => {
  // First check if the provided modelId exists in our LLM list
  const match = ANTHROPIC_LLM_LIST.find(llm => llm.modelId === modelId)
  if (match) {
    return match.modelId
  }
  
  // If no match found, validate the DEFAULT_CLAUDE_MODEL_ID
  const defaultMatch = ANTHROPIC_LLM_LIST.find(llm => llm.modelId === DEFAULT_CLAUDE_MODEL_ID)
  if (defaultMatch) {
    return DEFAULT_CLAUDE_MODEL_ID
  }
  
  // Final fallback to a known working model
  return FALLBACK_CLAUDE_MODEL_ID
}
