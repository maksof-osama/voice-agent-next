"use client";

/** Message list. Urdu text renders RTL automatically via dir="auto" on each bubble. */

import { useEffect, useRef } from "react";
import { Mic } from "lucide-react";

import { cn } from "@/lib/utils";
import { useAgentStore } from "@/store/useAgentStore";

export function ChatWindow() {
  const messages = useAgentStore((s) => s.messages);
  const status = useAgentStore((s) => s.status);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  return (
    <div className="glass-card h-[420px] overflow-y-auto p-4">
      {messages.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
          <Mic className="size-6 opacity-50" />
          <p>
            Press <span className="font-semibold text-foreground">Record</span> and speak — or type
            a message below.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
            >
              <div
                dir="auto"
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-2.5 text-[0.95rem] leading-relaxed",
                  m.role === "user"
                    ? "bg-gradient-to-br from-violet-600 to-violet-500 text-white"
                    : "bg-secondary text-secondary-foreground"
                )}
              >
                {m.content}
              </div>
            </div>
          ))}
          {status === "thinking" && (
            <div className="flex justify-start">
              <div className="flex items-center gap-1.5 rounded-2xl bg-secondary px-4 py-3">
                <span className="typing-dot" />
                <span className="typing-dot [animation-delay:150ms]" />
                <span className="typing-dot [animation-delay:300ms]" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}
