/** Global TypeScript types and interfaces. */

export type LanguageCode = "ur" | "en";

export interface VoiceOption {
  label: string;
  value: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/** What the agent is doing right now — drives the status pill and disables inputs. */
export type AgentStatus = "idle" | "listening" | "thinking" | "speaking";

/** Editable configuration files exposed by /api/config. */
export interface ConfigData {
  knowledge: string;
  promptUr: string;
  promptEn: string;
}
