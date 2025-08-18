import type { NextApiRequest, NextApiResponse } from "next"
import { OpenAI } from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).end("Method Not Allowed")
  }

  const { messages } = req.body

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: messages.map((m: any) => ({
        role: m.role,
        content: m.content
      }))
    })

    const reply = completion.choices[0].message.content
    res.status(200).json({ reply })
  } catch (error) {
    console.error("AI error:", error)
    res.status(500).json({ error: "AI failed" })
  }
}
