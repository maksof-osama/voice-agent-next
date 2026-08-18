import { NextRequest, NextResponse } from "next/server";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import type { Readable } from "stream";

export const runtime = "nodejs";

/** POST { text, voice } → audio/mpeg (mp3 bytes) */
export async function POST(req: NextRequest) {
  const { text, voice } = (await req.json()) as { text: string; voice: string };

  if (!text?.trim()) {
    return NextResponse.json({ error: "No text to speak" }, { status: 400 });
  }

  const tts = new MsEdgeTTS();
  await tts.setMetadata(voice || "ur-PK-UzmaNeural", OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

  // msedge-tts versions differ: toStream returns a Readable, or { audioStream }
  const result = tts.toStream(text) as unknown as Readable | { audioStream: Readable };
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
