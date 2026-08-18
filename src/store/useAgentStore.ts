import { create } from "zustand";

import { DEFAULT_SETTINGS } from "@/constants";
import type { AgentStatus, ChatMessage, LanguageCode } from "@/types";

interface AgentState {
  language: LanguageCode;
  voice: string;
  messages: ChatMessage[];
  status: AgentStatus;

  applySettings: (language: LanguageCode, voice: string) => void;
  addMessage: (message: ChatMessage) => void;
  setStatus: (status: AgentStatus) => void;
  resetConversation: () => void;
}

export const useAgentStore = create<AgentState>((set) => ({
  language: DEFAULT_SETTINGS.language,
  voice: DEFAULT_SETTINGS.voice,
  messages: [],
  status: "idle",

  // language/voice badalne par conversation reset — purani history mix na ho
  applySettings: (language, voice) => set({ language, voice, messages: [], status: "idle" }),
  addMessage: (message) => set((s) => ({ messages: [...s.messages, message] })),
  setStatus: (status) => set({ status }),
  resetConversation: () => set({ messages: [], status: "idle" }),
}));
