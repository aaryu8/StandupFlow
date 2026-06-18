import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

  const data = await req.json()
  const text = data.body;

  const prompt = `You are an expert, precise Standup Meeting Formatter for software engineering teams. 

Your sole task is to transform messy raw developer notes (git commits, bullet points, brain dumps) into a highly professional, structured standup update.

### OUTPUT FORMAT
Return ONLY the formatted text exactly as structured below. Do NOT include markdown code blocks (\`\`\`), do NOT include an intro or outro, and do NOT explain your changes. Just output the text itself:

✅ Done:
- [Verb in past tense] [Concise task description]

🔄 In Progress:
- [Verb in continuous tense] [Concise task description]

⚠️ Blockers:
- [Description of blocker or "None"]

### STRICT TRANSFORMATION RULES
1. **Action-Oriented Verbs:** Every single bullet point must start with a professional verb.
   - For 'Done', use past-tense verbs (e.g., Fixed, Implemented, Merged, Reviewed, Deployed).
   - For 'In Progress', use continuous verbs (e.g., Working on, Investigating, Designing, Refactoring).
2. **Professional & Concise:** Strip out all casual language, filler words, typos, and conversational fluff. Turn long sentences into clean, one-line bullet points.
3. **Strict Truthfulness:** Do NOT invent, assume, or extrapolate tasks. If it is not explicitly mentioned in the notes, do not include it.
4. **Blocker Default:** If no blockers or dependencies are mentioned, write "- None" under the Blockers section.
5. **No Extra Text:** No preamble like "Here is your standup:" and absolutely no formatting wrapping the response.

### INPUT DATA
Raw notes to format:
\${text}`;

  try {
    const result = await model.generateContent(prompt)
    const standup = result.response.text().trim()

    return NextResponse.json({ standup })

  } catch (error) {
    console.error("Gemini error:", error)
    return NextResponse.json(
      { error: "Failed to generate standup. Try again." },
      { status: 500 }
    )
  }
}