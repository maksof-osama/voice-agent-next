/** Global constants: languages, voices, models, API endpoints, VAD tuning. */

import type { LanguageCode, VoiceOption } from "@/types";

export const LANGUAGES: { label: string; value: LanguageCode }[] = [
  { label: "Urdu", value: "ur" },
  { label: "English", value: "en" },
];

export const VOICES: Record<LanguageCode, VoiceOption[]> = {
  ur: [
    { label: "Uzma — female, Pakistan", value: "ur-PK-UzmaNeural" },
    { label: "Gul — female, India", value: "ur-IN-GulNeural" },
    { label: "Asad — male, Pakistan", value: "ur-PK-AsadNeural" },
    { label: "Salman — male, India", value: "ur-IN-SalmanNeural" },
  ],
  en: [
    { label: "Ava — female, US", value: "en-US-AvaNeural" },
    { label: "Emma — female, US", value: "en-US-EmmaNeural" },
    { label: "Jenny — female, US", value: "en-US-JennyNeural" },
    { label: "Neerja — female, India", value: "en-IN-NeerjaExpressiveNeural" },
    { label: "Sonia — female, UK", value: "en-GB-SoniaNeural" },
    { label: "Andrew — male, US", value: "en-US-AndrewNeural" },
    { label: "Brian — male, US", value: "en-US-BrianNeural" },
    { label: "Prabhat — male, India", value: "en-IN-PrabhatNeural" },
  ],
};

/** Names the agent uses for itself inside the system prompt (Urdu script for Urdu voices). */
export const AGENT_NAMES: Record<string, string> = {
  "ur-PK-UzmaNeural": "عظمیٰ",
  "ur-IN-GulNeural": "گل",
  "ur-PK-AsadNeural": "اسد",
  "ur-IN-SalmanNeural": "سلمان",
  "en-US-AvaNeural": "Ava",
  "en-US-EmmaNeural": "Emma",
  "en-US-JennyNeural": "Jenny",
  "en-IN-NeerjaExpressiveNeural": "Neerja",
  "en-GB-SoniaNeural": "Sonia",
  "en-US-AndrewNeural": "Andrew",
  "en-US-BrianNeural": "Brian",
  "en-IN-PrabhatNeural": "Prabhat",
};

/** English display names for the UI (e.g. the live-call pill). */
export const DISPLAY_NAMES: Record<string, string> = Object.fromEntries(
  Object.values(VOICES)
    .flat()
    .map((v) => [v.value, v.label.split(" —")[0]])
);

export const DEFAULT_SETTINGS = {
  language: "ur" as LanguageCode,
  voice: "ur-PK-UzmaNeural",
};

/** Groq model ids. */
export const STT_MODEL = "whisper-large-v3-turbo";
export const LLM_MODEL = "openai/gpt-oss-20b";

/** Internal API endpoints. */
export const API_ROUTES = {
  stt: "/api/stt",
  chat: "/api/chat",
  tts: "/api/tts",
  config: "/api/config",
} as const;

/** Reply used when the model returns empty content. */
export const FALLBACK_REPLIES: Record<LanguageCode, string> = {
  ur: "معذرت، آواز صاف نہیں آئی۔ کیا آپ دوبارہ فرما سکتے ہیں؟",
  en: "Sorry, I did not catch that. Could you please say it again?",
};

/** Voice-activity-detection tuning for the recorder. */
export const VAD = {
  /** itni khamoshi ke baad auto-stop */
  SILENCE_MS: 2000,
  /** is se pehle kabhi auto-stop nahi */
  MIN_RECORD_MS: 1200,
  /** shuru mein kamre ke shor ka level napo */
  CALIBRATE_MS: 600,
  /** threshold kabhi is se neeche na ho */
  MIN_THRESHOLD: 0.012,
} as const;
