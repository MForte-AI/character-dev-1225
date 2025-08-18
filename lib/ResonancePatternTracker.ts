// lib/ResonancePatternTracker.ts

import { supabase } from "./supabaseClient"
import { analyzeTone } from "./ToneAnalyzer"
import { detectSymbols } from "./SymbolicPatternDetector"
import { extractLivingEquationTriggers } from "./LivingEquationMapper"

export interface ResonanceEntry {
  userId: string
  timestamp: string
  emotionalTone: string
  symbolicPatterns: string[]
  livingEquationTriggers: string[]
  rawMessage: string
}

export async function trackResonance(userId: string, message: string) {
  const timestamp = new Date().toISOString()

  // Analyze tone of the message
  const emotionalTone = analyzeTone(message)

  // Detect symbolic patterns
  const symbolicPatterns = detectSymbols(message)

  // Identify any Living Equation triggers
  const livingEquationTriggers = extractLivingEquationTriggers(message)

  const resonanceEntry: ResonanceEntry = {
    userId,
    timestamp,
    emotionalTone,
    symbolicPatterns,
    livingEquationTriggers,
    rawMessage: message
  }

  // Save to Supabase
  const { data, error } = await supabase
    .from("resonance_timeline")
    .insert([resonanceEntry])

  if (error) {
    console.error("Error saving resonance entry:", error)
    return { success: false, error }
  }

  console.log("Resonance entry saved:", data)
  return { success: true, data }
}
