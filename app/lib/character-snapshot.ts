import { z } from "zod";

const text = z.string().min(1).max(160);
const num = z.number().finite().nonnegative().max(1e13);
const stamp = z.number().int().min(0).max(1e11);
const id = z.number().int().min(-1000000).max(10000000);
const list = <T extends z.ZodType>(schema: T, max = 1000) =>
  z.array(schema).max(max);
const boss = z.object({
  name: text,
  label: text,
  npcID: id.optional(),
  rare: z.boolean(),
});
const quest = z.object({
  id,
  name: text,
  done: z.boolean(),
  lost: z.boolean(),
  inLog: z.boolean(),
  locked: z.boolean(),
});
export const snapshotSchema = z.object({
  v: z.literal(3),
  name: z
    .string()
    .min(1)
    .max(32)
    .regex(/^[\p{L}\p{M}]+$/u),
  realm: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[\p{L}\p{M}\p{N} '\u2019-]+$/u),
  raceToken: z.string().max(32),
  classToken: z
    .string()
    .min(1)
    .max(32)
    .regex(/^[A-Z]+$/),
  level: z.number().int().min(1).max(255),
  faction: z.enum(["Alliance", "Horde", "Unknown"]),
  version: z.string().min(1).max(32),
  exportedAt: stamp,
  exportKey: z
    .string()
    .min(16)
    .max(128)
    .regex(/^[A-Za-z0-9_-]+$/),
  rpg: z.boolean(),
  completed: list(id, 10000),
  lost: list(id, 10000),
  inLog: list(id, 10000),
  dungeons: list(
    z.object({
      name: text,
      label: text,
      slug: z
        .string()
        .min(1)
        .max(120)
        .regex(/^[a-z0-9-]+$/),
      level: z.string().max(40),
      cleared: z.boolean(),
      locked: z.boolean(),
      previewOnly: z.boolean(),
      done: num,
      total: num,
      quests: list(quest),
      bosses: list(boss.extend({ locked: z.boolean() }), 200),
    }),
    200,
  ),
  runs: list(
    z.object({
      dungeon: text,
      created: stamp,
      start: stamp.optional(),
      ended: stamp.optional(),
      completed: z.boolean(),
      closed: z.boolean(),
      duration: num.optional(),
      capped: z.boolean(),
      money: num,
      deaths: num,
      xp: num,
      trashKilled: num,
      trashTotal: num,
      deathTimes: list(stamp, 1000),
      bosses: list(
        boss.extend({
          state: z.enum(["killed", "not found", "not killed"]),
          at: stamp.optional(),
          xp: num.optional(),
        }),
        200,
      ),
      trash: list(z.object({ name: text, count: num, xp: num }), 1000),
      needs: list(
        z.object({
          id: z.number().int().positive().max(10000000),
          name: text.optional(),
          quality: z.number().int().min(0).max(8).optional(),
          result: z.enum(["won", "lost", "rolling"]),
          roll: z.number().int().min(1).max(100).optional(),
          at: stamp.optional(),
        }),
        500,
      ),
      exits: list(
        z.object({
          at: stamp,
          why: z.enum(["released", "stepped"]),
          duration: num.optional(),
          open: z.boolean(),
        }),
        500,
      ),
    }),
    100,
  ),
});
export type Snapshot = z.infer<typeof snapshotSchema>;
export type PublicSnapshot = Omit<Snapshot, "exportKey">;
export function characterSlug(name: string, realm: string) {
  return `${name}-${realm}`
    .normalize("NFC")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "");
}
export function validSlug(slug: string) {
  return (
    slug.length <= 120 &&
    /^[\p{L}\p{M}\p{N}]+(?:-[\p{L}\p{M}\p{N}]+)*$/u.test(slug)
  );
}
