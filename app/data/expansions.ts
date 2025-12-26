// app/data/expansions.ts

export type ExpansionNav = {
  id: string;
  name: string;
  subtitle: string;
  logoSrc: string;
  enabled: boolean;
};

export const EXPANSIONS: ExpansionNav[] = [
  {
    id: "vanilla",
    name: "Vanilla / Era",
    subtitle: "Classic Era level 1 BiS builds",
    logoSrc: "/expansion-logos/vanilla.png",
    enabled: true,
  },
  {
    id: "tbc",
    name: "The Burning Crusade",
    subtitle: "TBC level 1 twink builds",
    logoSrc: "/expansion-logos/tbc.png",
    enabled: true,
  },
  {
    id: "wotlk",
    name: "Wrath of the Lich King",
    subtitle: "WotLK level 1 builds",
    logoSrc: "/expansion-logos/wotlk.png",
    enabled: true, // <-- MUST be true to show the card
  },
  {
    id: "cata",
    name: "Cataclysm",
    subtitle: "Cata level 1 builds (coming soon)",
    logoSrc: "/expansion-logos/cata.png",
    enabled: true,
  },
  {
    id: "mop",
    name: "Mists of Pandaria",
    subtitle: "MoP level 1 builds (coming soon)",
    logoSrc: "/expansion-logos/mop.png",
    enabled: true,
  },
];