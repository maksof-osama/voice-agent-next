"use client";

import { useState } from "react";
import { RotateCcw, Send, Settings2 } from "lucide-react";

import { Header } from "@/components/layout/Header";
import { ChatWindow } from "@/components/shared/ChatWindow";
import { Recorder } from "@/components/shared/Recorder";
import { SettingsPanel } from "@/components/shared/SettingsPanel";
import { SetupTab } from "@/components/shared/SetupTab";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useConversation } from "@/hooks/useConversation";
import { useAgentStore } from "@/store/useAgentStore";

export default function Home() {
  const { sendText, sendAudio, stopPlayback } = useConversation();
  const { status, resetConversation } = useAgentStore();
  const [draft, setDraft] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);

  const busy = status === "thinking";

  const submitText = () => {
    if (!draft.trim() || busy) return;
    void sendText(draft);
    setDraft("");
  };

  const newChat = () => {
    stopPlayback();
    resetConversation();
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <Header />

      <Tabs defaultValue="conversation">
        <TabsList className="mb-4">
          <TabsTrigger value="conversation">Conversation</TabsTrigger>
          <TabsTrigger value="setup">Agent setup</TabsTrigger>
        </TabsList>

        <TabsContent value="conversation" className="flex flex-col gap-4">
          <div className="glass-card p-4">
            <button
              className="flex w-full cursor-pointer items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
              onClick={() => setSettingsOpen((o) => !o)}
            >
              <Settings2 className="size-4" />
              Agent settings
              <span className="ml-auto text-xs">{settingsOpen ? "Hide" : "Show"}</span>
            </button>
            {settingsOpen && (
              <div className="mt-4">
                <SettingsPanel />
              </div>
            )}
          </div>

          <ChatWindow />

          <div className="flex flex-wrap items-center gap-3">
            <Recorder onRecording={(blob) => void sendAudio(blob)} />
            <div className="flex min-w-60 flex-1 gap-2">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitText()}
                placeholder="Type your message and press Enter…"
                disabled={busy}
                dir="auto"
              />
              <Button size="icon" onClick={submitText} disabled={busy || !draft.trim()} className="btn-gradient shrink-0">
                <Send className="size-4" />
              </Button>
            </div>
            <Button variant="outline" onClick={newChat} className="gap-2">
              <RotateCcw className="size-4" /> New chat
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="setup">
          <SetupTab />
        </TabsContent>
      </Tabs>
    </main>
  );
}
