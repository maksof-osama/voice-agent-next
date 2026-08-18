"use client";

/** Mic recorder with voice-activity auto-stop:
 *  ~2s of silence after speech ends the recording automatically.
 *  Threshold self-calibrates to room noise during the first 600ms. */

import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { VAD } from "@/constants";
import { useAgentStore } from "@/store/useAgentStore";

const { SILENCE_MS, MIN_RECORD_MS, CALIBRATE_MS, MIN_THRESHOLD } = VAD;

interface RecorderProps {
  onRecording: (blob: Blob) => void;
}

export function Recorder({ onRecording }: RecorderProps) {
  const status = useAgentStore((s) => s.status);
  const setStatus = useAgentStore((s) => s.setStatus);
  const [recording, setRecording] = useState(false);
  const [level, setLevel] = useState(0);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const rafRef = useRef<number>(0);
  const cleanupRef = useRef<() => void>(() => {});

  const stop = useCallback(() => {
    recorderRef.current?.stop();
  }, []);

  const start = useCallback(async () => {
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      toast.error("Microphone access denied — allow the mic in your browser settings.");
      return;
    }

    const chunks: Blob[] = [];
    const recorder = new MediaRecorder(stream);
    recorderRef.current = recorder;

    // VAD: recorder wali stream par hi analyser laga do
    const ctx = new AudioContext();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    ctx.createMediaStreamSource(stream).connect(analyser);
    const data = new Float32Array(analyser.fftSize);

    const startedAt = Date.now();
    let lastVoice = Date.now();
    let spoke = false;
    let noiseSum = 0;
    let noiseSamples = 0;
    let threshold: number = MIN_THRESHOLD;

    const tick = () => {
      analyser.getFloatTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) sum += data[i] * data[i];
      const rms = Math.sqrt(sum / data.length);
      setLevel(rms);

      const now = Date.now();
      if (now - startedAt < CALIBRATE_MS) {
        noiseSum += rms;
        noiseSamples++;
      } else if (noiseSamples > 0) {
        threshold = Math.max(MIN_THRESHOLD, (noiseSum / noiseSamples) * 3);
        noiseSamples = 0;
      }

      if (rms > threshold) {
        lastVoice = now;
        spoke = true;
      }
      if (spoke && now - startedAt > MIN_RECORD_MS && now - lastVoice > SILENCE_MS) {
        stop();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    cleanupRef.current = () => {
      cancelAnimationFrame(rafRef.current);
      stream.getTracks().forEach((t) => t.stop());
      void ctx.close().catch(() => {});
    };

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    recorder.onstop = () => {
      cleanupRef.current();
      setRecording(false);
      setLevel(0);
      const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
      if (blob.size > 0) onRecording(blob);
      else setStatus("idle");
    };

    recorder.start();
    setRecording(true);
    setStatus("listening");
    tick();
  }, [onRecording, setStatus, stop]);

  useEffect(() => () => cleanupRef.current(), []);

  const busy = status === "thinking" || status === "speaking";

  return (
    <div className="flex items-center gap-3">
      {recording ? (
        <Button variant="destructive" size="lg" onClick={stop} className="gap-2">
          <Square className="size-4" /> Stop
        </Button>
      ) : (
        <Button size="lg" onClick={start} disabled={busy} className="gap-2 btn-gradient">
          <Mic className="size-4" /> Record
        </Button>
      )}
      {recording && (
        <div className="flex h-8 items-end gap-0.5" aria-hidden>
          {[0.5, 0.9, 0.7, 1, 0.6].map((m, i) => (
            <span
              key={i}
              className="w-1 rounded-full bg-primary transition-[height] duration-75"
              style={{ height: `${Math.max(15, Math.min(100, level * 900 * m))}%` }}
            />
          ))}
        </div>
      )}
      {recording && (
        <span className="text-xs text-muted-foreground">
          Listening — stops by itself when you go quiet
        </span>
      )}
    </div>
  );
}
