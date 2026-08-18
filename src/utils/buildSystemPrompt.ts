/** Pure helper: fill a prompt template with the agent name and knowledge base. */

import { EMPTY_KNOWLEDGE } from "@/constants/prompts";
import type { LanguageCode } from "@/types";

/** Uses replace (not a formatter) so stray braces in user-edited templates never crash. */
export function buildSystemPrompt(
  template: string,
  knowledge: string,
  language: LanguageCode,
  agentName: string
): string {
  const kb = knowledge.trim() || EMPTY_KNOWLEDGE[language];
  return template.replaceAll("{agent_name}", agentName).replaceAll("{knowledge}", kb);
}
