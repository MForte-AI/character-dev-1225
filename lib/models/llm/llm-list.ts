import { LLM } from "@/types"
import { ANTHROPIC_LLM_LIST } from "./anthropic-llm-list"
import { OPENAI_LLM_LIST } from "./openai-llm-list"

// Only use Claude models - removing OpenAI models from the list
export const LLM_LIST: LLM[] = [...ANTHROPIC_LLM_LIST]

export const LLM_LIST_MAP: Record<string, LLM[]> = {
  openai: [], // Disabled OpenAI models
  anthropic: ANTHROPIC_LLM_LIST
}
