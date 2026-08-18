/** Groq SDK initialization (server-only singleton).
 *  A placeholder key keeps the constructor from throwing at build time (CI has no .env);
 *  real requests are guarded by assertGroqKey() in every route. */

import Groq from "groq-sdk";

export const groq = new Groq({ apiKey: process.env.GROQ_API_KEY ?? "not-configured" });

export function assertGroqKey(): string | null {
  return process.env.GROQ_API_KEY ? null : "GROQ_API_KEY is not set — see .env.example";
}
