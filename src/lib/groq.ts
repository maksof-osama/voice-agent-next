/** Groq SDK initialization (server-only singleton). */

import Groq from "groq-sdk";

export const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export function assertGroqKey(): string | null {
  return process.env.GROQ_API_KEY ? null : "GROQ_API_KEY is not set — see .env.example";
}
