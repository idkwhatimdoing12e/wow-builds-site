export type TalentLink = {
  label: string;
  url: string; // wowhead / calc / etc.
};

export type ArenaBuild = {
  id: string;          // must match the URL param
  title: string;       // big title on detail page
  subtitle: string;    // small subtitle
  role: string;        // e.g. "Melee DPS"
  notes?: string[];
  talents: TalentLink[];
};

export const arenaBuildsByExpansion: Record<string, ArenaBuild[]> = {
  tbc: [
    {
      id: "disc-priest",
      title: "Discipline Priest",
      subtitle: "TBC Arena",
      role: "Healer",
      notes: ["Add notes later."],
      talents: [
        { label: "2v2 Standard", url: "https://www.wowhead.com/tbc/talent-calc" }
      ]
    },
    {
      id: "resto-druid",
      title: "Restoration Druid",
      subtitle: "TBC Arena",
      role: "Healer",
      talents: [
        { label: "2v2 Standard", url: "https://www.wowhead.com/tbc/talent-calc" }
      ]
    },
    {
      id: "arms-warrior",
      title: "Arms Warrior",
      subtitle: "TBC Arena",
      role: "Melee DPS",
      talents: [
        { label: "2v2 Standard", url: "https://www.wowhead.com/tbc/talent-calc" }
      ]
    },
    {
      id: "sub-rogue",
      title: "Subtlety Rogue",
      subtitle: "TBC Arena",
      role: "Melee DPS",
      talents: [
        { label: "2v2 Standard", url: "https://www.wowhead.com/tbc/talent-calc" }
      ]
    },
    {
      id: "frost-mage",
      title: "Frost Mage",
      subtitle: "TBC Arena",
      role: "Caster DPS",
      talents: [
        { label: "2v2 Standard", url: "https://www.wowhead.com/tbc/talent-calc" }
      ]
    },
    {
      id: "affli-lock",
      title: "Affliction Warlock",
      subtitle: "TBC Arena",
      role: "Caster DPS",
      talents: [
        { label: "2v2 Standard", url: "https://www.wowhead.com/tbc/talent-calc" }
      ]
    },
    {
      id: "mm-hunter",
      title: "MM Hunter",
      subtitle: "TBC Arena",
      role: "Ranged DPS",
      talents: [
        { label: "2v2 Standard", url: "https://www.wowhead.com/tbc/talent-calc" }
      ]
    }
  ]
};