import { unstable_cache } from "next/cache";
import { readCharacter } from "./character-store";
export const characterTag = (slug: string) => `character:${slug}`;
export function getCharacter(slug: string) {
  return unstable_cache(() => readCharacter(slug), ["character-v3", slug], {
    revalidate: 3600,
    tags: [characterTag(slug)],
  })();
}
