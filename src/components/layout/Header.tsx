"use client";

/** Title + the live-call pill (signature element): pulsing dot, active agent, equalizer bars. */

import { siteConfig } from "@/config/site";
import { DISPLAY_NAMES } from "@/constants";
import { useAgentStore } from "@/store/useAgentStore";

const STATUS_LABELS: Record<string, string> = {
  idle: "On the line",
  listening: "Listening",
  thinking: "Thinking",
  speaking: "Speaking",
};

export function Header() {
  const { language, voice, status } = useAgentStore();
  const name = DISPLAY_NAMES[voice] ?? "Agent";
  const langLabel = language === "en" ? "English" : "Urdu";

  return (
    <header className="mb-7 text-center">
      <h1 className="font-heading text-4xl font-bold tracking-tight">
        Sales{" "}
        <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
          Voice Agent
        </span>
      </h1>
      <p className="mt-1.5 text-sm text-muted-foreground">{siteConfig.tagline}</p>
      <div className="mt-4 inline-flex items-center gap-2.5 rounded-full border border-violet-400/25 bg-violet-500/10 px-4 py-1.5 text-xs font-medium text-violet-200">
        <span className="size-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
        {STATUS_LABELS[status]}: {name} · {langLabel}
        <span className="eq flex h-3 items-end gap-0.5" aria-hidden>
          <i />
          <i />
          <i />
          <i />
        </span>
      </div>
    </header>
  );
}
