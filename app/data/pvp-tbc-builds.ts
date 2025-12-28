export type PvpBuild = {
  slug: string; // must match the URL exactly, e.g. /pvp/tbc/disc-priest
  title: string;
  tier: "S" | "A";
  className: string;
  spec: string;
  role: string;

  // optional later
  overview?: string;
  comps?: string[];
  notes?: string[];
};

export const PVP_TBC_BUILDS: PvpBuild[] = [
  // S Tier
  { slug: "disc-priest", title: "Disc Priest", tier: "S", className: "Priest", spec: "Discipline", role: "Healer" },
  { slug: "resto-druid", title: "Restoration Druid", tier: "S", className: "Druid", spec: "Restoration", role: "Healer" },
  { slug: "arms-warrior", title: "Arms Warrior", tier: "S", className: "Warrior", spec: "Arms", role: "Melee DPS" },
  { slug: "sub-rogue", title: "Subtlety Rogue", tier: "S", className: "Rogue", spec: "Subtlety", role: "Melee DPS" },
  { slug: "frost-mage", title: "Frost Mage", tier: "S", className: "Mage", spec: "Frost", role: "Caster DPS" },
  { slug: "aff-warlock", title: "Affliction Warlock", tier: "S", className: "Warlock", spec: "Affliction / Demonology", role: "Caster DPS" },
  { slug: "mm-hunter", title: "MM Hunter", tier: "S", className: "Hunter", spec: "Marksmanship", role: "Ranged DPS" },

  // A Tier
  { slug: "holy-paladin", title: "Holy Paladin", tier: "A", className: "Paladin", spec: "Holy", role: "Healer" },
  { slug: "ret-paladin", title: "Ret Paladin", tier: "A", className: "Paladin", spec: "Retribution", role: "Melee DPS" },
  { slug: "resto-shaman", title: "Restoration Shaman", tier: "A", className: "Shaman", spec: "Restoration", role: "Healer" },
  { slug: "feral-druid", title: "Feral Druid", tier: "A", className: "Druid", spec: "Feral", role: "Melee DPS" },
  { slug: "bm-hunter", title: "BM Hunter", tier: "A", className: "Hunter", spec: "Beast Mastery", role: "Ranged DPS" },
  { slug: "fire-mage", title: "Fire Mage", tier: "A", className: "Mage", spec: "Fire / Arcane", role: "Caster DPS" },
];