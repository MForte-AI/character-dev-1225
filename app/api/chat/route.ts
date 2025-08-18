import { NextResponse } from "next/server"

export async function POST(req: Request) {
  console.log("OPENAI_API_KEY:", process.env.OPENAI_API_KEY)

  const body = await req.json()
  const { messages } = body

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo", // or gpt-4 if your key supports it
      messages,
      temperature: 0.7
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    return NextResponse.json({ error: errorText }, { status: response.status })
  }

  const data = await response.json()
  return NextResponse.json({ result: data.choices[0].message.content })
}
