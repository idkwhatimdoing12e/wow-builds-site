import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { deflateRawSync } from "node:zlib";
import { S3Client } from "@aws-sdk/client-s3";
import { decodeSnapshot, adler32 } from "../app/lib/character-code";
import { decodeCharacter } from "../app/lib/character";
import { characterSlug } from "../app/lib/character-snapshot";
import {
  saveCharacter,
  readCharacter,
  rateLimit,
  expired,
} from "../app/lib/character-store";
const fixture = readFileSync(
  new URL("./fixtures/addon-fdj3.txt", import.meta.url),
  "utf8",
);
const wrap = (s: unknown) => {
  const b = Buffer.from(JSON.stringify(s));
  return `FDJ3.${deflateRawSync(b).toString("base64url")}.${adler32(b).toString(36)}`;
};
const objects = new Map<string, { body: string; etag: string }>();
let version = 0;
process.env.R2_ACCOUNT_ID = "test";
process.env.R2_ACCESS_KEY_ID = "test";
process.env.R2_SECRET_ACCESS_KEY = "test-secret";
process.env.R2_BUCKET = "test";
// Simulates atomic R2 preconditions, including competing first claims.
S3Client.prototype.send = async function (command: {
  constructor: { name: string };
  input: Record<string, string>;
}) {
  const { Key, Body, IfMatch, IfNoneMatch } = command.input;
  const old = objects.get(Key);
  if (command.constructor.name === "GetObjectCommand") {
    if (!old) throw { $metadata: { httpStatusCode: 404 } };
    return {
      ETag: old.etag,
      Body: { transformToString: async () => old.body },
    };
  }
  if (command.constructor.name === "PutObjectCommand") {
    if ((IfNoneMatch === "*" && old) || (IfMatch && old?.etag !== IfMatch))
      throw { $metadata: { httpStatusCode: 412 } };
    objects.set(Key, { body: Body, etag: `"${++version}"` });
    return {};
  }
  throw new Error("Unexpected operation");
} as typeof S3Client.prototype.send;
beforeEach(() => objects.clear());
test("actual Lua 5.1 + LibDeflate fixture decodes with every log field", () => {
  const s = decodeSnapshot(fixture);
  assert.equal(s.name, "Éxehn");
  assert.equal(s.runs.length, 100);
  assert.equal(s.runs[0].duration, 100);
  assert.deepEqual(s.lost, [2]);
  assert.equal(s.runs[0].needs[0].roll, 98);
  assert.equal(s.runs[0].exits[0].duration, 19);
  assert.deepEqual(
    s.runs[0].bosses.map((b) => b.state),
    ["killed", "not found", "not killed"],
  );
});
test("rejects checksum tampering, malformed data, oversized codes and decompression bombs", () => {
  assert.throws(() => decodeSnapshot(fixture.slice(0, -1) + "z"));
  assert.throws(() => decodeSnapshot("x".repeat(51201)));
  assert.throws(() =>
    decodeSnapshot(wrap({ ...decodeSnapshot(fixture), level: -5 })),
  );
  const b = Buffer.alloc(3 * 1024 * 1024, 65);
  assert.throws(() =>
    decodeSnapshot(
      `FDJ3.${deflateRawSync(b).toString("base64url")}.${adler32(b).toString(36)}`,
    ),
  );
});
test("legacy FDJ1 and FDJ2 remain readable", () => {
  for (const body of [
    "FDJ1|Test|Realm|WARRIOR|60|H|1,2|test-dungeon|1794240000",
    "FDJ2|Test|Realm|Orc|WARRIOR|60|H|1,2|test-dungeon|1794240000",
  ]) {
    const code = Buffer.from(
      `${body}|${adler32(Buffer.from(body)).toString(36)}`,
    ).toString("base64url");
    const result = decodeCharacter(code);
    assert.equal(result.ok, true);
    if (result.ok) assert.deepEqual([...result.character.completed], [1, 3]);
  }
});
test("Unicode names produce stable readable slugs", () => {
  assert.equal(characterSlug("Éxehn", "Forever PvP"), "éxehn-forever-pvp");
  assert.equal(
    characterSlug("E\u0301xehn", "Forever PvP"),
    "éxehn-forever-pvp",
  );
});
test("same key updates same URL; storage and public response exclude raw key", async () => {
  const s = decodeSnapshot(fixture);
  const slug = await saveCharacter(s);
  assert.equal(
    await saveCharacter({ ...s, level: 61, exportedAt: s.exportedAt + 1 }),
    slug,
  );
  const stored = objects.get(`chars/${slug}.json`)!.body;
  assert.ok(!stored.includes(s.exportKey));
  assert.equal(JSON.parse(stored).keyHash.length, 64);
  const read = await readCharacter(slug);
  assert.equal(read?.level, 61);
  assert.ok(!JSON.stringify(read).includes("keyHash"));
  assert.ok(!JSON.stringify(read).includes("exportKey"));
});
test("different key and older exports cannot overwrite the owner", async () => {
  const s = decodeSnapshot(fixture);
  await saveCharacter(s);
  await assert.rejects(
    saveCharacter({ ...s, exportKey: "wrong-key-123456789" }),
    { status: 403 },
  );
  await assert.rejects(saveCharacter({ ...s, exportedAt: s.exportedAt - 1 }), {
    status: 409,
  });
});
test("concurrent first claims have only one owner", async () => {
  const s = decodeSnapshot(fixture);
  const results = await Promise.allSettled([
    saveCharacter(s),
    saveCharacter({ ...s, exportKey: "other-key-123456789" }),
  ]);
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
  assert.equal(objects.size, 1);
});
test("distributed IP limit allows ten imports and rejects the eleventh", async () => {
  for (let i = 0; i < 10; i++) await rateLimit("192.0.2.1");
  await assert.rejects(rateLimit("192.0.2.1"), { status: 429 });
  await rateLimit("192.0.2.2");
  assert.ok(![...objects.keys()].join().includes("192.0.2"));
});
test("expired characters are hidden until R2 lifecycle removes them", async () => {
  const s = decodeSnapshot(fixture);
  const slug = await saveCharacter(s);
  const key = `chars/${slug}.json`;
  const object = objects.get(key)!;
  const record = JSON.parse(object.body);
  record.updatedAt = "2020-01-01T00:00:00Z";
  object.body = JSON.stringify(record);
  assert.equal(await readCharacter(slug), null);
  assert.equal(expired("bad date"), true);
});
