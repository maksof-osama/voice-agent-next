# Sales Voice Agent (Next.js) 🎙️

A voice-based AI sales agent that speaks **Urdu** or **English** — built with Next.js. It listens through your microphone, transcribes with Groq's Whisper, replies using an LLM, and speaks back with a natural neural voice. The agent acts as a company sales representative: it answers questions about your products (from an editable knowledge base) and tries to book appointments.

> Python/Gradio version of this project: [voice-agent](https://github.com/maksof-osama/voice-agent)

## Stack

| Piece | Tech |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| UI | Tailwind CSS + shadcn/ui + lucide icons |
| State | zustand |
| Speech-to-text | Groq — `whisper-large-v3-turbo` (`groq-sdk`) |
| LLM | Groq — `openai/gpt-oss-20b` |
| Text-to-speech | `msedge-tts` (Microsoft Edge neural voices, e.g. `ur-PK-UzmaNeural`) |

## Features

- 🗣️ Full voice loop: mic → transcribe → LLM → spoken reply (autoplay)
- 🤫 **Auto-stop on silence (VAD):** recording ends by itself ~2s after you stop speaking, with a self-calibrating noise threshold
- 🌐 Language + voice picker: Urdu (4 voices) or English (8 voices) — applied to STT, LLM prompt, and TTS together
- 📚 **Agent setup tab:** edit the company knowledge base and both system prompts right in the UI; changes apply to the very next reply
- 🔐 API key stays server-side (Next.js API routes) — never shipped to the browser
- 💬 Conversation history, typing indicator, live status pill (listening / thinking / speaking)
- 📞 Phone-call style replies: short, spoken-friendly, numbers written out in words

## Setup

```bash
git clone <your-repo-url>
cd voice-agent-next
npm install
```

Create a `.env` file (see `.env.example`) with your key from [console.groq.com/keys](https://console.groq.com/keys):

```
GROQ_API_KEY=your_groq_api_key_here
```

## Run

```bash
npm run dev
```

Open http://localhost:3000, allow microphone access, and start talking.

For production:

```bash
npm run build
npm start
```

## How it works

```
Mic (MediaRecorder + VAD auto-stop)
  → POST /api/stt      Groq Whisper transcription (in the selected language)
  → POST /api/chat     system prompt (from data/prompts/*.md) + knowledge (data/knowledge.md)
                       + conversation history → Groq LLM
  → POST /api/tts      Edge neural voice → mp3 → autoplay in the browser
```

- `data/knowledge.md` and `data/prompts/{urdu,english}.md` are created with defaults on first run and are editable from the **Agent setup** tab (or any editor). They are gitignored — your company data stays out of the repo.
- The agent only states facts present in the knowledge base; prices/numbers are written in words so the voice output sounds natural.

## Deploy note

The Agent-setup editors write files to `data/`, so the app needs a **writable filesystem** — a VPS, Docker container, or your own machine. On serverless hosts (e.g. Vercel) the chat itself works, but saving knowledge/prompt edits will fail; move that storage to a database or KV store if you deploy serverless.

## Project structure

```
voice-agent-next/
├── .github/workflows/       # CI (lint + build on push/PR)
├── data/                    # Editable knowledge + prompts (auto-created, gitignored)
├── src/
│   ├── app/                 # App Router pages + API route handlers
│   │   └── api/             # /api/stt, /api/chat, /api/tts, /api/config
│   ├── components/
│   │   ├── ui/              # shadcn/ui atomic components
│   │   ├── layout/          # Structural components (Header)
│   │   └── shared/          # Feature components (ChatWindow, Recorder, SettingsPanel, SetupTab)
│   ├── config/              # Site config (name, tagline, links)
│   ├── constants/           # Languages, voices, models, API endpoints, VAD tuning, default prompts
│   ├── hooks/               # useConversation (the STT → LLM → TTS pipeline)
│   ├── lib/                 # Third-party init (Groq client) + shadcn cn()
│   ├── providers/           # Root providers wrapper (toasts)
│   ├── services/            # agentService (client API calls), configService (server file storage)
│   ├── store/               # zustand store (settings, messages, status)
│   ├── types/               # Shared TypeScript types
│   └── utils/               # Pure helpers (buildSystemPrompt)
├── .env.example
└── README.md
```

## Customize

- **Voices:** `src/lib/voices.ts` — any [Edge TTS voice](https://github.com/rany2/edge-tts) works.
- **Default prompts:** `src/lib/prompts.ts` (used to seed `data/prompts/`).
- **Models:** `src/app/api/stt/route.ts` and `src/app/api/chat/route.ts`.
- **VAD tuning:** `src/components/Recorder.tsx` (`SILENCE_MS`, `MIN_RECORD_MS`, threshold).
