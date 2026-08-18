"use client";

/** The full conversation pipeline: (audio → STT) → LLM → TTS → playback. */

import { useCallback, useRef } from "react";
import { toast } from "sonner";

import { getChatReply, synthesizeSpeech, transcribeAudio } from "@/services/agentService";
import { useAgentStore } from "@/store/useAgentStore";

export function useConversation() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { language, voice, messages, addMessage, setStatus } = useAgentStore();

  /** LLM reply + spoken audio for a user message that's already text. */
  const sendText = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      const history = [...messages, { role: "user" as const, content: trimmed }];
      addMessage({ role: "user", content: trimmed });
      setStatus("thinking");

      try {
        const reply = await getChatReply(history, language, voice);
        addMessage({ role: "assistant", content: reply });

        setStatus("speaking");
        const audioBlob = await synthesizeSpeech(reply, voice);
        if (!audioBlob) {
          setStatus("idle");
          return;
        }
        const url = URL.createObjectURL(audioBlob);
        audioRef.current?.pause();
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => {
          URL.revokeObjectURL(url);
          setStatus("idle");
        };
        await audio.play().catch(() => setStatus("idle"));
      } catch (err) {
        setStatus("idle");
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    },
    [messages, language, voice, addMessage, setStatus]
  );

  /** Transcribe a recording, then run the same text pipeline. */
  const sendAudio = useCallback(
    async (blob: Blob) => {
      setStatus("thinking");
      try {
        const text = await transcribeAudio(blob, language);
        if (!text) {
          setStatus("idle");
          toast.warning("Could not hear anything — please try again.");
          return;
        }
        await sendText(text);
      } catch (err) {
        setStatus("idle");
        toast.error(err instanceof Error ? err.message : "Transcription failed");
      }
    },
    [language, sendText, setStatus]
  );

  /** Stop any agent audio that is currently playing. */
  const stopPlayback = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;
  }, []);

  return { sendText, sendAudio, stopPlayback };
}
