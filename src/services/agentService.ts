/** Client-side service: all calls to the internal API routes live here. */

import { API_ROUTES } from "@/constants";
import type { ChatMessage, ConfigData, LanguageCode } from "@/types";

async function jsonOrThrow<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error || `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

/** Audio recording → transcribed text (Groq Whisper, in the selected language). */
export async function transcribeAudio(blob: Blob, language: LanguageCode): Promise<string> {
  const form = new FormData();
  form.append("audio", new File([blob], "recording.webm", { type: blob.type }));
  form.append("language", language);

  const { text } = await jsonOrThrow<{ text: string }>(
    await fetch(API_ROUTES.stt, { method: "POST", body: form })
  );
  return text;
}

/** Conversation history → agent reply (Groq LLM with knowledge + prompt). */
export async function getChatReply(
  messages: ChatMessage[],
  language: LanguageCode,
  voice: string
): Promise<string> {
  const { reply } = await jsonOrThrow<{ reply: string }>(
    await fetch(API_ROUTES.chat, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, language, voice }),
    })
  );
  return reply;
}

/** Text → spoken mp3 (Edge neural voice). Returns null if synthesis failed. */
export async function synthesizeSpeech(text: string, voice: string): Promise<Blob | null> {
  const res = await fetch(API_ROUTES.tts, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, voice }),
  });
  return res.ok ? res.blob() : null;
}

/** Load the editable knowledge base and prompt templates. */
export async function fetchAgentConfig(): Promise<ConfigData> {
  return jsonOrThrow<ConfigData>(await fetch(API_ROUTES.config));
}

/** Save any subset of the editable files. */
export async function saveAgentConfig(fields: Partial<ConfigData>): Promise<void> {
  await jsonOrThrow<{ ok: boolean }>(
    await fetch(API_ROUTES.config, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    })
  );
}
