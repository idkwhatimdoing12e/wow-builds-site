import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { decodeSnapshot, MAX_CODE_BYTES } from "@/app/lib/character-code";
import {
  CharacterError,
  rateLimit,
  saveCharacter,
} from "@/app/lib/character-store";
import { characterTag } from "@/app/lib/character-cache";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    // Vercel overwrites x-vercel-forwarded-for at the trusted edge.
    const ip = process.env.VERCEL
      ? request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim()
      : "local";
    if (!ip) throw new CharacterError(400, "Unable to identify the request.");
    if (Number(request.headers.get("content-length") ?? 0) > MAX_CODE_BYTES)
      throw new CharacterError(413, "The export exceeds 50 KB.");
    await rateLimit(ip);
    const reader = request.body?.getReader();
    if (!reader) throw new CharacterError(400, "Paste a character code.");
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_CODE_BYTES) {
        await reader.cancel();
        throw new CharacterError(413, "The export exceeds 50 KB.");
      }
      chunks.push(value);
    }
    let snapshot;
    try {
      snapshot = decodeSnapshot(Buffer.concat(chunks).toString("utf8"));
    } catch (e) {
      throw new CharacterError(
        400,
        e instanceof Error ? e.message : "Invalid code.",
      );
    }
    const slug = await saveCharacter(snapshot);
    revalidateTag(characterTag(slug), { expire: 0 });
    revalidatePath(`/c/${slug}`);
    return NextResponse.json(
      { url: `/c/${encodeURIComponent(slug)}` },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    const known = e instanceof CharacterError;
    return NextResponse.json(
      {
        error: known
          ? e.message
          : "Character sharing is temporarily unavailable. Please try again.",
      },
      {
        status: known ? e.status : 503,
        headers: {
          "Cache-Control": "no-store",
          ...(known && e.status === 429 ? { "Retry-After": "600" } : {}),
        },
      },
    );
  }
}
