import { NextRequest, NextResponse } from "next/server";
import { toFile } from "groq-sdk";

import { STT_MODEL } from "@/constants";
import { assertGroqKey, groq } from "@/lib/groq";

export const runtime = "nodejs";

/** POST multipart/form-data { audio: File, language: "ur" | "en" } → { text } */
export async function POST(req: NextRequest) {
  const keyError = assertGroqKey();
  if (keyError) return NextResponse.json({ error: keyError }, { status: 500 });

  const form = await req.formData();
  const audio = form.get("audio");
  const language = form.get("language") === "en" ? "en" : "ur";

  if (!(audio instanceof File)) {
    return NextResponse.json({ error: "No audio file in request" }, { status: 400 });
  }

  const file = await toFile(Buffer.from(await audio.arrayBuffer()), audio.name || "audio.webm");
  const transcription = await groq.audio.transcriptions.create({
    file,
    model: STT_MODEL,
    language,
    response_format: "text",
  });

  const text = (transcription as unknown as string).trim();
  return NextResponse.json({ text });
}
