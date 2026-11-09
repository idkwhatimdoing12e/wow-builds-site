import { inflateRawSync } from "node:zlib";
import { snapshotSchema, type Snapshot } from "./character-snapshot";
export const MAX_CODE_BYTES = 50 * 1024;
export function adler32(bytes: Uint8Array) {
  let a = 1,
    b = 0;
  for (const v of bytes) {
    a = (a + v) % 65521;
    b = (b + a) % 65521;
  }
  return b * 65536 + a;
}
export function decodeSnapshot(raw: string): Snapshot {
  if (Buffer.byteLength(raw) > MAX_CODE_BYTES)
    throw new Error(
      "This export exceeds 50 KB. Remove older runs in the addon and export again.",
    );
  const code = raw.trim();
  const match = /^FDJ3\.([A-Za-z0-9_-]+)\.([0-9a-z]{1,7})$/.exec(code);
  if (!match)
    throw new Error(
      "Paste a complete FDJ3 code from /dj export in the updated addon.",
    );
  const compressed = Buffer.from(match[1], "base64url");
  if (compressed.toString("base64url") !== match[1])
    throw new Error("Invalid code encoding.");
  let bytes: Buffer;
  try {
    bytes = inflateRawSync(compressed, { maxOutputLength: 2 * 1024 * 1024 });
  } catch {
    throw new Error(
      "The export is damaged or its expanded contents are too large.",
    );
  }
  if (adler32(bytes) !== parseInt(match[2], 36))
    throw new Error("The checksum does not match. Copy the whole code again.");
  let value: unknown;
  try {
    value = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  } catch {
    throw new Error("The export contains invalid data.");
  }
  const result = snapshotSchema.safeParse(value);
  if (!result.success)
    throw new Error("The export contains invalid character or run data.");
  const s = result.data;
  if (s.exportedAt > Date.now() / 1000 + 86400)
    throw new Error("The export date is in the future. Check the game clock.");
  return s;
}
