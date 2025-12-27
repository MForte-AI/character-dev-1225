import { LLM } from "@/types"
import { ANTHROPIC_LLM_LIST } from "./anthropic-llm-list"

export const DEFAULT_CLAUDE_MODEL_ID = "claude-3-sonnet-20240229"

export const LLM_LIST: LLM[] = [...ANTHROPIC_LLM_LIST]

export const LLM_LIST_MAP: Record<string, LLM[]> = {
  openai: [],
  anthropic: ANTHROPIC_LLM_LIST
}

export const resolveClaudeModelId = (modelId?: string | null) => {
  const match = ANTHROPIC_LLM_LIST.find(llm => llm.modelId === modelId)
  return match ? match.modelId : DEFAULT_CLAUDE_MODEL_ID
}
