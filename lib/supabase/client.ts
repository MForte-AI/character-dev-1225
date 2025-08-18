console.log("Supabase URL =", process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log(
  "Supabase Key present:",
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

import { createClient } from "@supabase/supabase-js"

console.log("✅ Debug: SUPABASE URL =", process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log(
  "✅ Debug: SUPABASE KEY =",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

if (
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
) {
  throw new Error(
    "❌ Supabase URL and Key are required to create a Supabase client!"
  )
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)
