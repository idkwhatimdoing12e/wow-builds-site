import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { createHash, createHmac } from "node:crypto";
import {
  characterSlug,
  type Snapshot,
  type PublicSnapshot,
} from "./character-snapshot";

type Stored = { keyHash: string; updatedAt: string; snapshot: PublicSnapshot };
export class CharacterError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
let client: S3Client;
function config() {
  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET } =
    process.env;
  if (
    !R2_ACCOUNT_ID ||
    !R2_ACCESS_KEY_ID ||
    !R2_SECRET_ACCESS_KEY ||
    !R2_BUCKET
  )
    throw new CharacterError(503, "Character sharing is not configured yet.");
  client ??= new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
    maxAttempts: 3,
  });
  return { client, bucket: R2_BUCKET, secret: R2_SECRET_ACCESS_KEY };
}
function status(e: unknown) {
  return (e as { $metadata?: { httpStatusCode?: number } })?.$metadata
    ?.httpStatusCode;
}
export function expired(updatedAt: string, now = new Date()) {
  const cutoff = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
  return (
    !Number.isFinite(Date.parse(updatedAt)) ||
    Date.parse(updatedAt) <= cutoff.getTime()
  );
}
async function read<T>(key: string): Promise<{ data: T; etag: string } | null> {
  const { client, bucket } = config();
  try {
    const r = await client.send(
      new GetObjectCommand({ Bucket: bucket, Key: key }),
    );
    if (!r.Body || !r.ETag) throw new Error("Empty object");
    return { data: JSON.parse(await r.Body.transformToString()), etag: r.ETag };
  } catch (e) {
    if (status(e) === 404) return null;
    throw e;
  }
}
export async function readCharacter(
  slug: string,
): Promise<PublicSnapshot | null> {
  const r = await read<Stored>(`chars/${slug}.json`);
  if (!r || expired(r.data.updatedAt)) return null;
  return r.data.snapshot;
}
// Conditional writes prevent first-claim and update races across serverless instances.
export async function saveCharacter(snapshot: Snapshot) {
  const slug = characterSlug(snapshot.name, snapshot.realm),
    key = `chars/${slug}.json`;
  const { exportKey, ...publicSnapshot } = snapshot;
  const keyHash = createHash("sha256").update(exportKey).digest("hex");
  const { client, bucket } = config();
  for (let attempt = 0; attempt < 4; attempt++) {
    const previous = await read<Stored>(key);
    if (previous) {
      if (previous.data.keyHash !== keyHash)
        throw new CharacterError(
          403,
          "This name and realm already belong to another export key. Use the original character’s saved data.",
        );
      if (previous.data.snapshot.exportedAt > snapshot.exportedAt)
        throw new CharacterError(
          409,
          "A newer export is already published. Export again in game.",
        );
    }
    const record: Stored = {
      keyHash,
      updatedAt: new Date().toISOString(),
      snapshot: publicSnapshot,
    };
    try {
      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: JSON.stringify(record),
          ContentType: "application/json",
          ...(previous ? { IfMatch: previous.etag } : { IfNoneMatch: "*" }),
        }),
      );
      return slug;
    } catch (e) {
      if (status(e) !== 412 && status(e) !== 409) throw e;
    }
  }
  throw new CharacterError(
    409,
    "Another update is in progress. Please try again.",
  );
}
// A shared R2 counter, not an instance-local Map. IPs are HMACed; raw IPs are never stored.
export async function rateLimit(ip: string) {
  const { client, bucket, secret } = config();
  const window = Math.floor(Date.now() / 600000);
  const hash = createHmac("sha256", secret).update(ip).digest("hex");
  const key = `limits/${window}/${hash}.json`;
  for (let i = 0; i < 5; i++) {
    const old = await read<{ count: number }>(key);
    if (old && old.data.count >= 10)
      throw new CharacterError(
        429,
        "Too many imports. Try again in 10 minutes.",
      );
    try {
      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: JSON.stringify({ count: (old?.data.count ?? 0) + 1 }),
          ContentType: "application/json",
          ...(old ? { IfMatch: old.etag } : { IfNoneMatch: "*" }),
        }),
      );
      return;
    } catch (e) {
      if (status(e) !== 409 && status(e) !== 412) throw e;
    }
  }
  throw new CharacterError(
    429,
    "Too many simultaneous imports. Try again shortly.",
  );
}
