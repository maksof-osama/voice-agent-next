import { NextRequest, NextResponse } from "next/server";

import {
  getKnowledge,
  getPromptTemplate,
  saveKnowledge,
  savePromptTemplate,
} from "@/services/configService";

export const runtime = "nodejs";

/** GET → { knowledge, promptUr, promptEn } */
export async function GET() {
  const [knowledge, promptUr, promptEn] = await Promise.all([
    getKnowledge(),
    getPromptTemplate("ur"),
    getPromptTemplate("en"),
  ]);
  return NextResponse.json({ knowledge, promptUr, promptEn });
}

/** PUT { knowledge?, promptUr?, promptEn? } — writes only the provided fields */
export async function PUT(req: NextRequest) {
  const body = (await req.json()) as {
    knowledge?: string;
    promptUr?: string;
    promptEn?: string;
  };

  const writes: Promise<void>[] = [];
  if (typeof body.knowledge === "string") writes.push(saveKnowledge(body.knowledge));
  if (typeof body.promptUr === "string") writes.push(savePromptTemplate("ur", body.promptUr));
  if (typeof body.promptEn === "string") writes.push(savePromptTemplate("en", body.promptEn));
  await Promise.all(writes);

  return NextResponse.json({ ok: true });
}
