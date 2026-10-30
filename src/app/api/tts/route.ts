import { NextRequest, NextResponse } from "next/server";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import type { Readable } from "stream";

import { TTS_PROSODY } from "@/constants";

export const runtime = "nodejs";

/** POST { text, voice } → audio/mpeg (mp3 bytes) */
export async function POST(req: NextRequest) {
  const { text, voice } = (await req.json()) as { text: string; voice: string };

  if (!text?.trim()) {
    return NextResponse.json({ error: "No text to speak" }, { status: 400 });
  }

  const voiceName = voice || "ur-PK-UzmaNeural";
  const tts = new MsEdgeTTS();
  await tts.setMetadata(voiceName, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

  // language ke hisab se speaking style (e.g. Urdu -12% rate)
  const prosody = Object.entries(TTS_PROSODY).find(([prefix]) => voiceName.startsWith(prefix))?.[1];

  // msedge-tts versions differ: toStream returns a Readable, or { audioStream }
  const result = tts.toStream(text, prosody) as unknown as Readable | { audioStream: Readable };
  const stream: Readable = "audioStream" in result ? result.audioStream : result;

  const chunks: Buffer[] = [];
  const buffer = await new Promise<Buffer>((resolve, reject) => {
    stream.on("data", (c: Buffer) => chunks.push(c));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });

  if (buffer.length === 0) {
    return NextResponse.json({ error: "TTS produced no audio" }, { status: 502 });
  }

  return new NextResponse(new Uint8Array(buffer), {
    headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" },
  });
}
