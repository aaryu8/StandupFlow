import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

  const data = await req.json()
  const text = data.body;

  const prompt = `You are an expert Standup Meeting Formatter for software engineering teams.

Transform the raw developer notes below into a structured standup update.

### STRICT OUTPUT FORMAT
Return ONLY a valid JSON object. No markdown, no code fences, no explanation. Just the raw JSON.

{
  "done": ["string", "string"],
  "inProgress": ["string", "string"],
  "blockers": ["string"]
}

### RULES
1. Each item is a single clean sentence starting with a professional verb.
   - "done" items: past-tense verbs (Fixed, Implemented, Merged, Deployed, Resolved, Refactored)
   - "inProgress" items: continuous verbs (Building, Integrating, Investigating, Designing, Refactoring)
   - "blockers": describe the blocker plainly. If none, return exactly: ["None"]
2. Strip all emojis, casual language, typos, and filler words.
3. Do NOT invent tasks not mentioned in the notes.
4. Every array must have at least one item. If a section has nothing, omit bullet points but keep the key.

### INPUT
${text}`;

  try {
    const result = await model.generateContent(prompt)
    const raw = result.response.text().trim()

    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim()
    const parsed = JSON.parse(cleaned)

    return NextResponse.json({
      standup: {
        done: parsed.done ?? [],
        inProgress: parsed.inProgress ?? [],
        blockers: parsed.blockers ?? ["None"],
      }
    })

  } catch (error) {
    // Gemini SDK throws non-standard objects — stringify to safely check the status
    const errorString = JSON.stringify(error)
    const isRateLimit = errorString.includes("429") || errorString.includes("Too Many Requests")

    if (isRateLimit) {
      return NextResponse.json(
        { error: "Rate limit reached. Wait ~20 seconds and try again." },
        { status: 429 }
      )
    }

    console.error("Gemini error:", error)
    return NextResponse.json(
      { error: "Failed to generate standup. Try again." },
      { status: 500 }
    )
  }
}