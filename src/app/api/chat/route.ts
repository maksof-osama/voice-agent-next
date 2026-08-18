import { NextRequest, NextResponse } from "next/server";

import { AGENT_NAMES, FALLBACK_REPLIES, LLM_MODEL } from "@/constants";
import { assertGroqKey, groq } from "@/lib/groq";
import { getKnowledge, getPromptTemplate } from "@/services/configService";
import type { ChatMessage, LanguageCode } from "@/types";
import { buildSystemPrompt } from "@/utils/buildSystemPrompt";

export const runtime = "nodejs";

interface ChatBody {
  messages: ChatMessage[];
  language: LanguageCode;
  voice: string;
}

/** POST { messages, language, voice } → { reply } */
export async function POST(req: NextRequest) {
  const keyError = assertGroqKey();
  if (keyError) return NextResponse.json({ error: keyError }, { status: 500 });

  const body = (await req.json()) as ChatBody;
  const language: LanguageCode = body.language === "en" ? "en" : "ur";
  const agentName = AGENT_NAMES[body.voice] ?? "عظمیٰ";

  const [template, knowledge] = await Promise.all([getPromptTemplate(language), getKnowledge()]);
  const system = buildSystemPrompt(template, knowledge, language, agentName);

  const completion = await groq.chat.completions.create({
    model: LLM_MODEL,
    messages: [{ role: "system", content: system }, ...body.messages],
    temperature: 0.7,
    max_completion_tokens: 1024,
    // phone call — jawab tez chahiye, lambi soch nahi (gpt-oss reasoning model hai)
    reasoning_effort: "low",
  } as Parameters<typeof groq.chat.completions.create>[0]);

  const reply =
    ("choices" in completion ? completion.choices[0]?.message?.content : "")?.trim() ||
    FALLBACK_REPLIES[language];

  return NextResponse.json({ reply });
}
