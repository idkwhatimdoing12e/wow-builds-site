export type ExpansionMeta = {
  id: string;
  name: string;
  subtitle: string;
  logoSrc: string;
};

export const EXPANSIONS: ExpansionMeta[] = [
  {
    id: "vanilla",
    name: "Vanilla / Era",
    subtitle: "Classic Era level 1 BiS builds",
    logoSrc: "/expansion-logos/vanilla.png",
  },
  {
    id: "tbc",
    name: "The Burning Crusade",
    subtitle: "TBC level 1 twink builds",
    logoSrc: "/expansion-logos/tbc.png",
  },
  {
    id: "wotlk",
    name: "Wrath of the Lich King",
    subtitle: "WotLK level 1 builds (coming soon)",
    logoSrc: "/expansion-logos/wotlk.png",
  },
  {
    id: "cata",
    name: "Cataclysm",
    subtitle: "Cata level 1 builds (coming soon)",
    logoSrc: "/expansion-logos/cata.png",
  },
  {
    id: "mop",
    name: "Mists of Pandaria",
    subtitle: "MoP level 1 builds (coming soon)",
    logoSrc: "/expansion-logos/mop.png",
  },
];
