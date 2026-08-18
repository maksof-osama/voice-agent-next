/** Server-only: knowledge base and prompt templates stored as editable files in data/.
 *  Files are created with defaults on first access. Edits apply to the very next reply.
 *  Note: needs a writable filesystem (local / VPS) — serverless hosts like Vercel are read-only. */

import { promises as fs } from "fs";
import path from "path";

import { DEFAULT_KNOWLEDGE, DEFAULT_PROMPTS } from "@/constants/prompts";
import type { LanguageCode } from "@/types";

const DATA_DIR = path.join(process.cwd(), "data");
const KNOWLEDGE_FILE = path.join(DATA_DIR, "knowledge.md");
const PROMPT_FILES: Record<LanguageCode, string> = {
  ur: path.join(DATA_DIR, "prompts", "urdu.md"),
  en: path.join(DATA_DIR, "prompts", "english.md"),
};

async function readOrCreate(file: string, fallback: string): Promise<string> {
  try {
    const text = await fs.readFile(file, "utf-8");
    if (text.trim()) return text;
    return fallback;
  } catch {
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, fallback, "utf-8");
    return fallback;
  }
}

export async function getKnowledge(): Promise<string> {
  return readOrCreate(KNOWLEDGE_FILE, DEFAULT_KNOWLEDGE);
}

export async function getPromptTemplate(language: LanguageCode): Promise<string> {
  return readOrCreate(PROMPT_FILES[language], DEFAULT_PROMPTS[language]);
}

export async function saveKnowledge(text: string): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(KNOWLEDGE_FILE, text ?? "", "utf-8");
}

export async function savePromptTemplate(language: LanguageCode, text: string): Promise<void> {
  await fs.mkdir(path.dirname(PROMPT_FILES[language]), { recursive: true });
  await fs.writeFile(PROMPT_FILES[language], text || DEFAULT_PROMPTS[language], "utf-8");
}
