"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import React from "react";

// =======================
// TYPES
// =======================

type SocketColor = "red" | "blue" | "yellow" | "meta"| "pearl" | "yellowpvp";
type GemColor = SocketColor | "purple" | "orange" | "green" | "pearl" | "yellowpvp";

type SocketInfo = {
  // optional socket type icon shown on the right of the gem pill
  socketColor?: SocketColor;

  // gem display
  name: string;
  note?: string;
  itemId?: number; // wowhead gem item id (tbc)
  iconName?: string; // zamimg icon override
  gemColor?: GemColor; // fallback icon mapping
};

type GearItem = {
  slot: string;
  itemName: string;
  itemId?: number; // wowhead item id (tbc)
  iconName?: string; // zamimg icon
  note?: string;
  enchant?: string;

  // OPTIONAL: if omitted or empty => nothing shows
  sockets?: SocketInfo[];
};

type CompCard = {
  name: string;
  note?: string;
};

type SeasonKey = "S1" | "S2" | "S3" | "S4";

type ClassBuildPageData = {
  title: string;
  subtitle: string;
  description?: string;

  notes: string[];

  talentsNote?: string[];
  talentsEmbedUrl?: string;

  gearBySeason: Record<SeasonKey, GearItem[]>;

  comps2v2?: CompCard[];
  comps3v3?: CompCard[];
};

// =======================
// HELPERS
// =======================

const ICON = (name?: string) =>
  `https://wow.zamimg.com/images/wow/icons/large/${name || "inv_misc_questionmark"}.jpg`;

const wowheadTbcItemUrl = (itemId: number) => `https://www.wowhead.com/tbc/item=${itemId}`;
const wowheadTbcSearchUrl = (q: string) => `https://www.wowhead.com/tbc/search?q=${encodeURIComponent(q)}`;

declare global {
  interface Window {
    whTooltips?: any;
    $WowheadPower?: { refreshLinks?: () => void };
  }
}

/**
 * Slugs must exist in DATA.
 * Aliases map incoming slugs to canonical keys.
 */
const SLUG_ALIASES: Record<string, string> = {
  "disc-priest": "disc-priest",
  "discipline-priest": "disc-priest",
  disc: "disc-priest",

  "aff-warlock": "aff-warlock",
  "affliction-warlock": "aff-warlock",
  "affli-warlock": "aff-warlock",

  "resto-druid": "resto-druid",
  "restoration-druid": "resto-druid",
  "feral-druid": "feral-druid",
  resto: "resto-druid",

  "arms-warrior": "arms-warrior",

  "sub-rogue": "sub-rogue",
  "subtlety-rogue": "sub-rogue",

  "frost-mage": "frost-mage",
  "fire-mage": "fire-mage",

  "mm-hunter": "mm-hunter",
  "marksman-hunter": "mm-hunter",
  "bm-hunter": "bm-hunter",

  "holy-paladin": "holy-paladin",
  "ret-paladin": "ret-paladin",

  "resto-shaman": "resto-shaman",
  "restoration-shaman": "resto-shaman",
};

// Fallback icons by gem color (swap anytime)
const GEM_FALLBACK_ICON: Record<GemColor, string> = {
  red: "inv_jewelcrafting_gem_02",
  blue: "inv_jewelcrafting_gem_04",
  yellow: "inv_jewelcrafting_dawnstone_03",
  meta: "inv_misc_gem_diamond_06",
  purple: "inv_jewelcrafting_gem_09",
  orange: "inv_jewelcrafting_gem_06",
  green: "inv_jewelcrafting_gem_11",
  pearl: "inv_misc_gem_pearl_07",
  yellowpvp: "inv_misc_gem_topaz_01",
};

const SOCKET_ICON: Record<SocketColor, string> = {
  red: "inv_jewelcrafting_gem_02",
  blue: "inv_jewelcrafting_gem_04",
  yellow: "inv_jewelcrafting_gem_03",
  meta: "inv_jewelcrafting_gem_01",
  yellowpvp: "inv_misc_gem_topaz_01",
  pearl: "inv_misc_gem_pearl_07",
};

const gemIconUrl = (gemColor?: GemColor, iconName?: string) => {
  const name = iconName || (gemColor ? GEM_FALLBACK_ICON[gemColor] : "inv_misc_questionmark");
  return ICON(name);
};

const socketIconUrl = (socketColor: SocketColor) => ICON(SOCKET_ICON[socketColor]);

// =======================
// WOWHEAD TOOLTIP HOOK
// =======================

function useWowheadTooltips(deps: any[] = []) {
  React.useEffect(() => {
    const SCRIPT_ID = "wowhead-powerjs";

    window.whTooltips = {
      colorLinks: false,
      iconizeLinks: false,
      renameLinks: false,
      tooltipOffsetX: 6,
      tooltipOffsetY: 6,
    };

    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (!existing) {
      const s = document.createElement("script");
      s.id = SCRIPT_ID;
      s.src = "https://wow.zamimg.com/widgets/power.js";
      s.async = true;
      s.onload = () => window.$WowheadPower?.refreshLinks?.();
      document.body.appendChild(s);
    } else {
      window.$WowheadPower?.refreshLinks?.();
    }
  }, []);

  React.useEffect(() => {
    window.$WowheadPower?.refreshLinks?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

// =======================
// GEAR LISTS (keep your data)
// =======================

const DISC_S1: GearItem[] = [
  {
    slot: "Head",
    itemName: "Light-Collar of the Incarnate",
    itemId: 29049,
    iconName: "inv_crown_01",
    note: "+22 Spell Damage, +14 Spell Hit",
    sockets: [
      {
        socketColor: "meta",
        gemColor: "meta",
        name: "Insightful Earthstorm Diamond",
        note: "+12 Intellect & Chance to restore mana on spellcast",
        itemId: 25901,
      },
      {
       socketColor: "blue",          // or remove this line entirely
gemColor: "purple",           // shadow pearl is purple in TBC
iconName: "inv_misc_gem_pearl_07", // optional: forces a pearl-looking icon,
        name: "Purified Shadow Pearl",
        note: "+9 healing +3 Spell Damage and +4 Spirit",
        itemId: 32836,
      },
     
    ],
  },
  {
    slot: "Hands",
    itemName: "Gladiator's Mooncloth Gloves",
    itemId: 31409,
    iconName: "inv_gauntlets_15",
    note: "+15 Spell Hit",
  },
  { slot: "Trinket", itemName: "Talisman of the Breaker", itemId: 29347, iconName: "ability_hunter_mastermarksman" },
    { slot: "Waist", itemName: "Marshal's Mooncloth Belt", itemId: 32976, iconName: "inv_belt_17" },
{
    slot: "Shoulders",
    itemName: "Gladiator's Mooncloth Mantle",
    itemId: 31412,
    iconName: "inv_shoulder_02",
    note: "+6 MP5, +22 Healing",
     sockets: [
       {
        socketColor: "blue",          // or remove this line entirely
gemColor: "purple",           // shadow pearl is purple in TBC
iconName: "inv_misc_gem_pearl_07",
        name: "Purified Shadow Pearl",
        note: "+9 healing +3 Spell Damage and +4 Spirit",
        itemId: 32836,
      },
      {
        socketColor: "yellow",
        gemColor: "yellow",
        name: "Mystyc Dawnstone",
        note: "+8 Resilience",
        itemId: 24053,
      },

      ],
  },
    {
    slot: "Legs",
    itemName: "Gladiator's Mooncloth Leggings",
    itemId: 31411,
    iconName: "inv_pants_cloth_05",
    note: "+66 Healing, +22 Spell Damage",
  },
  {
    slot: "Back",
    itemName: "Stainless Cloak of the Pure Hearted",
    itemId: 28765,
    iconName: "inv_misc_cape_06",
    note: "+20 Spell Penetration",
  },
   {
    slot: "Feet",
    itemName: "Boots of the Incorrupt",
    itemId: 28663,
    iconName: "inv_boots_fabric_01",
    enchant: "Minor Speed +9 Stamina",
  },
  {
    slot: "Chest",
    itemName: "Gladiator's Mooncloth Robe",
    itemId: 31413,
    iconName: "inv_chest_cloth_43",
    note: "+15 Resilience",
    sockets: [
       {
        socketColor: "blue",          // or remove this line entirely
gemColor: "purple",           // shadow pearl is purple in TBC
iconName: "inv_misc_gem_pearl_07",
        name: "Purified Shadow Pearl",
        note: "+9 healing +3 Spell Damage and +4 Spirit",
        itemId: 32836,
      },
       {
        socketColor: "yellowpvp",
        gemColor: "yellowpvp",
        name: "Sublime Mystic Dawnstone",
        note: "+10 Resilience",
        itemId: 27679,
      },
      {
        socketColor: "yellow",
        gemColor: "yellow",
        name: "Great Dawnstone",
        note: "+8 Spell Hit",
        itemId: 31861,
      },

      ],
  },
   {
    slot: "Ring",
    itemName: "Violet Signet of the Grand Restorer",
    itemId: 29290,
    iconName: "inv_jewelry_ring_62",
    note: "+20 Healing, +7 Spell Damage",
  },
  {
    slot: "Wrist",
    itemName: "Marshal's Mooncloth Cuffs",
    itemId: 32977,
    iconName: "inv_bracer_07",
    note: "+6 MP5",
     sockets: [
     
      {
        socketColor: "yellow",
        gemColor: "yellow",
        name: "Mystyc Dawnstone",
        note: "+8 Resilience",
        itemId: 24053,
      },
      ],
  },
    {
    slot: "Ring",
    itemName: "Naaru Lightwarden's Band",
    itemId: 28790,
    iconName: "inv_jewelry_ring_70",
    note: "+20 Healing, +7 Spell Damage",
  },
  { slot: "Trinket", itemName: "Pendant of the Violet Eye", itemId: 28727, iconName: "inv_trinket_naxxramas02" },
  { slot: "Trinket", itemName: "Medallion of the Alliance", itemId: 30349, iconName: "inv_jewelry_trinketpvp_01" },
  {
    slot: "Main Hand",
    itemName: "Light's Justice",
    itemId: 28771,
    iconName: "inv_mace_46",
    note: "+81 Healing, +27 Spell Damage",
  },
  {
    slot: "Off Hand",
    itemName: "Gladiator's Reprieve",
    itemId: 32452,
    iconName: "inv_misc_book_06",
    note: "",
  },

  

 
 
  
  
  
  { slot: "Ranged", itemName: "Gladiator's Touch of Defeat", itemId: 28320, iconName: "inv_wand_09" },
];

const FROST_MAGE_S1: GearItem[] = [
  { slot: "Head", itemName: "Gladiator's Silk Cowl", itemId: 25854, iconName: "inv_helmet_48", note: "+22 Spell Damage and +14 Spell Hit Rating" },
  { slot: "Neck", itemName: "Talisman of the Breaker", itemId: 29347, iconName: "inv_jewelry_necklace_21" },
  { slot: "Shoulders", itemName: "Gladiator's Silk Amice", itemId: 25855, iconName: "inv_shoulder_23", note: "+18 Spell Damage and +10 Spell Crit Rating" },
  { slot: "Back", itemName: "Ruby Drape of the Mysticant", iconName: "inv_misc_cape_17", note: "+20 Spell Penetration" },
  { slot: "Chest", itemName: "Gladiator's Silk Raiment", itemId: 25856, iconName: "inv_chest_cloth_43", note: "+15 Resilience Rating" },
  { slot: "Wrist", itemName: "General's Silk Cuffs", iconName: "inv_bracer_07", note: "+15 Spell Damage" },
  { slot: "Hands", itemName: "Gladiator's Silk Handguards", itemId: 25857, iconName: "inv_gauntlets_19", note: "+20 Spell Damage" },
  { slot: "Waist", itemName: "General's Silk Belt", iconName: "inv_belt_22" },
  { slot: "Legs", itemName: "Breeches of the Occultist", iconName: "inv_pants_cloth_05", note: "+35 Spell Damage and +20 Stamina" },
  { slot: "Feet", itemName: "General's Silk Footguards", itemId: 28410, iconName: "inv_boots_fabric_01", enchant: "Minor Speed and +9 Stamina" },
  { slot: "Ring", itemName: "Ring of Recurrence", iconName: "inv_jewelry_ring_51", note: "+12 Spell Damage" },
  { slot: "Ring", itemName: "Violet Signet of the Archmage", iconName: "inv_jewelry_ring_62", note: "+12 Spell Damage" },
  { slot: "Trinket", itemName: "Icon of the Silver Crescent", iconName: "inv_trinket_naxxramas01" },
  { slot: "Trinket", itemName: "Medallion of the Horde", iconName: "inv_jewelry_trinketpvp_02" },
  { slot: "Main Hand", itemName: "Nathrezim Mindblade", iconName: "inv_sword_53", note: "+40 Spell Damage" },
  { slot: "Off Hand", itemName: "Karaborian Talisman", iconName: "inv_offhand_outlandraid_01" },
  { slot: "Ranged", itemName: "Gladiator's Touch of Defeat", itemId: 28320, iconName: "inv_wand_09" },
];

const SUB_ROGUE_S1: GearItem[] = [
  { slot: "Head", itemName: "Gladiator's Leather Helm", itemId: 28320, iconName: "inv_helmet_41", note: "+34 Attack Power and +16 Hit Rating" },
  { slot: "Neck", itemName: "Choker of Vile Intent", iconName: "inv_jewelry_necklace_04" },
  { slot: "Shoulders", itemName: "Gladiator's Leather Spaulders", iconName: "inv_shoulder_04", note: "+30 Attack Power and +10 Crit Rating" },
  { slot: "Back", itemName: "Drape of the Dark Reavers", iconName: "inv_misc_cape_18", note: "Improved Stealth" },
  { slot: "Chest", itemName: "Gladiator's Leather Tunic", iconName: "inv_chest_leather_05", note: "+15 Resilience Rating" },
  { slot: "Wrist", itemName: "General's Leather Bracers", iconName: "inv_bracer_07", note: "+24 Attack Power" },
  { slot: "Hands", itemName: "Gladiator's Leather Gloves", iconName: "inv_gauntlets_15", note: "+15 Agility" },
  { slot: "Waist", itemName: "General's Leather Belt", iconName: "inv_belt_17" },
  { slot: "Legs", itemName: "Skulker's Greaves", iconName: "inv_pants_leather_20", note: "+50 Attack Power and +12 Crit Rating" },
  { slot: "Feet", itemName: "The Master's Treads", iconName: "inv_boots_leather_02", enchant: "Surefooted" },
  { slot: "Ring", itemName: "Ring of the Recalcitrant", iconName: "inv_jewelry_ring_60", note: "No Enchant" },
  { slot: "Ring", itemName: "Garona's Signet Ring", iconName: "inv_jewelry_ring_55", note: "No Enchant" },
  { slot: "Trinket", itemName: "Medallion of the Horde", iconName: "inv_jewelry_trinketpvp_02" },
  { slot: "Trinket", itemName: "Figurine - Nightseye Panther", iconName: "inv_jewelcrafting_nightseye_02" },
  { slot: "Main Hand", itemName: "Spiteblade", iconName: "inv_sword_12", enchant: "Mongoose" },
  { slot: "Off Hand", itemName: "Gladiator's Shiv", iconName: "inv_weapon_shortblade_63", enchant: "Mongoose" },
  { slot: "Ranged", itemName: "Gladiator's War Edge", iconName: "inv_throwingaxe_04" },
];

const TEMPLATE_GEAR: Record<SeasonKey, GearItem[]> = { S1: [], S2: [], S3: [], S4: [] };

// =======================
// DATA
// =======================

const DATA: Record<string, ClassBuildPageData> = {
  "disc-priest": {
    title: "Disc Priest",
    subtitle: "TBC — Arena (Discipline)",
    description: "",
    notes: [
      "Horde is Undead, Alliance is Dwarf",
      "Priest is strong but squishy, your partner must save you while you create distance",
      "You play off setups and move out aggressively when you have CC on the enemy",
      "Swap to a spirit weapon after 5s without casting for increased mana regen.",
      "Spam Rank1 Shadow Word Pain to proc blackout when needed ",
      "Use Rank1 Chastise while kiting to save mana",
    ],
    talentsNote: [
      "Standard talents for any comp, you can swap Divine Fury for Spell warding if you are facing a lot of mage and locks double dps.",
      "",
    ],
    talentsEmbedUrl: "https://www.wowhead.com/tbc/talent-calc/embed/priest/5050313130525102031501-230051-04",
    gearBySeason: { S1: DISC_S1, S2: [...DISC_S1], S3: [...DISC_S1], S4: [...DISC_S1] },
    comps2v2: [
      {
        name: "Disc/Warlock",
        note: "Hyper aggressive comp; dispel the kill target to keep momentum. Versus warriors especially, don’t let the pet die.",
      },
      {
        name: "Disc/Frost Mage",
        note: "Sheep/CS/Fear on healer while nuking the other target. Mage must help you live by controlling enemy DPS.",
      },
      { name: "Disc/Rogue", note: "Balanced comp; fear healer after kidney to deny heals while rogue regens energy and DRs." },
      { name: "Disc/Hunter", note: "Trap/scatter control; play around Viper Sting. Weak vs War/Sham and Druid/Warlock." },
    ],
    comps3v3: [
      { name: "Disc/Mage/Rogue", note: "RMP. Win in opener or stabilize for long games; control 2 targets while nuking 1." },
      { name: "Disc/Warlock/Rogue", note: "Aggressive. Spam dispel kill target, keep tongues on healer, finish fast." },
      { name: "Disc/RestoDruid/Hunter", note: "Control + mana drain. Once someone is OOM, deny drinks and kill. Protect pet." },
      { name: "Disc/RestoDruid/Warrior", note: "Double healer aggressive. Help warrior connect; if you aren’t offensive you fall behind." },
      { name: "Disc/Rogue/Rogue", note: "Stronger with PvE (glaives). Force cooldowns early; reset with vanish. PI + dispel." },
    ],
  },

  "frost-mage": {
    title: "Frost Mage",
    subtitle: "TBC — Arena",
    description: "",
    notes: ["Template page — edit later."],
    talentsNote: ["Template talents — edit later."],
    talentsEmbedUrl: "https://www.wowhead.com/tbc/talent-calc/embed/mage/2500050300230150330125050000000000000000",
    gearBySeason: { S1: FROST_MAGE_S1, S2: [...FROST_MAGE_S1], S3: [...FROST_MAGE_S1], S4: [...FROST_MAGE_S1] },
    comps2v2: [{ name: "Mage/DiscPriest", note: "Template — edit later." }],
    comps3v3: [{ name: "Mage/Rogue/DiscPriest", note: "Template — edit later." }],
  },

  "sub-rogue": {
    title: "Subtlety Rogue",
    subtitle: "TBC — Arena",
    description: "",
    notes: ["Template page — edit later."],
    talentsNote: ["Template talents — edit later."],
    talentsEmbedUrl: "https://www.wowhead.com/tbc/talent-calc/embed/rogue/3052031050021005221050000000000000000000",
    gearBySeason: { S1: SUB_ROGUE_S1, S2: [...SUB_ROGUE_S1], S3: [...SUB_ROGUE_S1], S4: [...SUB_ROGUE_S1] },
    comps2v2: [{ name: "Rogue/DiscPriest", note: "Template — edit later." }],
    comps3v3: [{ name: "Rogue/Mage/DiscPriest", note: "Template — edit later." }],
  },

  // placeholders to stop 404s
  "aff-warlock": {
    title: "Affliction Warlock",
    subtitle: "TBC — Arena",
    description: "",
    notes: ["Template page — edit later."],
    talentsNote: ["Template talents — edit later."],
    talentsEmbedUrl: "https://www.wowhead.com/tbc/talent-calc/embed/warlock/5500200512235105510310000000000000000000",
    gearBySeason: { ...TEMPLATE_GEAR },
    comps2v2: [{ name: "Aff/Healer", note: "Template — edit later." }],
    comps3v3: [{ name: "Shadowplay / WLD", note: "Template — edit later." }],
  },

  "resto-druid": {
    title: "Restoration Druid",
    subtitle: "TBC — Arena",
    description: "",
    notes: ["Template page — edit later."],
    talentsNote: ["Template talents — edit later."],
    talentsEmbedUrl: "https://www.wowhead.com/tbc/talent-calc/embed/druid/51002230000000000000050000331000105003",
    gearBySeason: { ...TEMPLATE_GEAR },
    comps2v2: [{ name: "Druid/Warrior", note: "Template — edit later." }],
    comps3v3: [{ name: "WLD / Druid teams", note: "Template — edit later." }],
  },

  "arms-warrior": {
    title: "Arms Warrior",
    subtitle: "TBC — Arena",
    description: "",
    notes: ["Template page — edit later."],
    talentsNote: ["Template talents — edit later."],
    talentsEmbedUrl: "https://www.wowhead.com/tbc/talent-calc/embed/warrior/3030500135201052012100000000000000000000",
    gearBySeason: { ...TEMPLATE_GEAR },
    comps2v2: [{ name: "Warrior/Druid", note: "Template — edit later." }],
    comps3v3: [{ name: "WLD / Warrior teams", note: "Template — edit later." }],
  },

  "mm-hunter": {
    title: "MM Hunter",
    subtitle: "TBC — Arena",
    description: "",
    notes: ["Template page — edit later."],
    talentsNote: ["Template talents — edit later."],
    talentsEmbedUrl: "https://www.wowhead.com/tbc/talent-calc/embed/hunter/0500320050501205310510000000000000000000",
    gearBySeason: { ...TEMPLATE_GEAR },
    comps2v2: [{ name: "Hunter/Druid", note: "Template — edit later." }],
    comps3v3: [{ name: "PHP / Hunter teams", note: "Template — edit later." }],
  },

  "holy-paladin": {
    title: "Holy Paladin",
    subtitle: "TBC — Arena",
    description: "",
    notes: ["Template page — edit later."],
    talentsNote: ["Template talents — edit later."],
    talentsEmbedUrl: "https://www.wowhead.com/tbc/talent-calc/embed/paladin/0550312252010050000000000000000000000000",
    gearBySeason: { ...TEMPLATE_GEAR },
    comps2v2: [{ name: "Warr/Hpal", note: "Template — edit later." }],
    comps3v3: [{ name: "Hpal teams", note: "Template — edit later." }],
  },

  "ret-paladin": {
    title: "Retribution Paladin",
    subtitle: "TBC — Arena",
    description: "",
    notes: ["Template page — edit later."],
    talentsNote: ["Template talents — edit later."],
    talentsEmbedUrl: "https://www.wowhead.com/tbc/talent-calc/embed/paladin/5005010020000000000000000000000000000000",
    gearBySeason: { ...TEMPLATE_GEAR },
    comps2v2: [{ name: "Ret/Healer", note: "Template — edit later." }],
    comps3v3: [{ name: "Ret teams", note: "Template — edit later." }],
  },

  "resto-shaman": {
    title: "Restoration Shaman",
    subtitle: "TBC — Arena",
    description: "",
    notes: ["Template page — edit later."],
    talentsNote: ["Template talents — edit later."],
    talentsEmbedUrl: "https://www.wowhead.com/tbc/talent-calc/embed/shaman/5002315000000000000005000033105010000000",
    gearBySeason: { ...TEMPLATE_GEAR },
    comps2v2: [{ name: "War/Sham", note: "Template — edit later." }],
    comps3v3: [{ name: "TSG variants", note: "Template — edit later." }],
  },

  "feral-druid": {
    title: "Feral Druid",
    subtitle: "TBC — Arena",
    description: "",
    notes: ["Template page — edit later."],
    talentsNote: ["Template talents — edit later."],
    talentsEmbedUrl: "https://www.wowhead.com/tbc/talent-calc/embed/druid/01400220301000000000050000331000105003",
    gearBySeason: { ...TEMPLATE_GEAR },
    comps2v2: [{ name: "Feral/Healer", note: "Template — edit later." }],
    comps3v3: [{ name: "Feral teams", note: "Template — edit later." }],
  },

  "bm-hunter": {
    title: "BM Hunter",
    subtitle: "TBC — Arena",
    description: "",
    notes: ["Template page — edit later."],
    talentsNote: ["Template talents — edit later."],
    talentsEmbedUrl: "https://www.wowhead.com/tbc/talent-calc/embed/hunter/5000020050501205310510000000000000000000",
    gearBySeason: { ...TEMPLATE_GEAR },
    comps2v2: [{ name: "BM/Healer", note: "Template — edit later." }],
    comps3v3: [{ name: "BM teams", note: "Template — edit later." }],
  },

  "fire-mage": {
    title: "Fire Mage",
    subtitle: "TBC — Arena",
    description: "",
    notes: ["Template page — edit later."],
    talentsNote: ["Template talents — edit later."],
    talentsEmbedUrl: "https://www.wowhead.com/tbc/talent-calc/embed/mage/2300050300230150330125050000000000000000",
    gearBySeason: { ...TEMPLATE_GEAR },
    comps2v2: [{ name: "Mage/Healer", note: "Template — edit later." }],
    comps3v3: [{ name: "Mage teams", note: "Template — edit later." }],
  },
};

// =======================
// UI COMPONENTS
// =======================

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      style={{
        marginTop: 22,
        borderRadius: 22,
        border: "1px solid rgba(255,255,255,0.10)",
        background: "rgba(0,0,0,0.35)",
        boxShadow: "0 18px 60px rgba(0,0,0,0.45)",
        padding: 18,
      }}
    >
      <div style={{ marginBottom: 12 }}>
        <h2 style={{ margin: 0, fontSize: 28 }}>{title}</h2>
      </div>
      {children}
    </section>
  );
}

function NotesList({ notes }: { notes: string[] }) {
  if (!notes?.length) return <div style={{ color: "rgba(255,255,255,0.6)" }}>No notes yet.</div>;

  return (
    <ul
      style={{
        margin: 0,
        paddingLeft: 22,
        display: "grid",
        gap: 10,
        color: "rgba(255,255,255,0.9)",
        fontSize: 18,
        lineHeight: 1.35,
      }}
    >
      {notes.map((n, i) => (
        <li key={i} style={{ color: "rgba(255,255,255,0.9)" }}>
          {n}
        </li>
      ))}
    </ul>
  );
}

function TalentsBlock({ lines, embedUrl }: { lines?: string[]; embedUrl?: string }) {
  return (
    <>
      {lines?.length ? (
        <ul
          style={{
            margin: "0 0 12px 0",
            paddingLeft: 18,
            display: "grid",
            gap: 8,
            color: "rgba(255,255,255,0.85)",
            fontSize: 16,
            lineHeight: 1.35,
          }}
        >
          {lines.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      ) : null}

      {embedUrl ? (
        <>
          <div className="talentsFrame">
            <iframe
              src={embedUrl}
              title="Talents"
              loading="lazy"
              scrolling="yes"
              style={{
                width: "100%",
                height: "100%",
                border: 0,
                display: "block",
                background: "transparent",
              }}
            />
          </div>

          <style jsx>{`
            .talentsFrame {
              border-radius: 16px;
              border: 1px solid rgba(255, 255, 255, 0.08);
              background: rgba(0, 0, 0, 0.35);
              overflow: hidden;
              height: 760px;
            }
            @media (max-width: 1000px) {
              .talentsFrame {
                height: 650px;
              }
            }
            @media (max-width: 700px) {
              .talentsFrame {
                height: 520px;
              }
            }
          `}</style>
        </>
      ) : (
        <div style={{ color: "rgba(255,255,255,0.70)", fontSize: 14 }}>Missing talents embed URL.</div>
      )}
    </>
  );
}

function SeasonTabs({ value, onChange }: { value: SeasonKey; onChange: (s: SeasonKey) => void }) {
  const seasons: { key: SeasonKey; label: string }[] = [
    { key: "S1", label: "Season 1" },
    { key: "S2", label: "Season 2" },
    { key: "S3", label: "Season 3" },
    { key: "S4", label: "Season 4" },
  ];

  return (
    <>
      <div className="seasonRow">
        {seasons.map((s) => {
          const active = s.key === value;
          return (
            <button
              key={s.key}
              type="button"
              className={`seasonBtn ${active ? "active" : ""}`}
              onClick={() => onChange(s.key)}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      <style jsx>{`
        .seasonRow {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
          margin: 12px 0 14px 0;
        }
        @media (max-width: 700px) {
          .seasonRow {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        .seasonBtn {
          cursor: pointer;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.88);
          padding: 10px 12px;
          font-size: 15px;
          font-weight: 800;
        }
        .seasonBtn:hover {
          border-color: rgba(255, 255, 255, 0.18);
          background: rgba(255, 255, 255, 0.07);
        }
        .seasonBtn.active {
          border-color: rgba(255, 255, 255, 0.28);
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </>
  );
}

function SocketsRow({ sockets }: { sockets?: SocketInfo[] }) {
  useWowheadTooltips([sockets?.length || 0]);
  if (!sockets?.length) return null;

  return (
    <>
      <div className="socketsRow" aria-label="Sockets">
        {sockets.map((s, i) => {
          const hasGemId = typeof s.itemId === "number" && s.itemId > 0;
          const href = hasGemId ? wowheadTbcItemUrl(s.itemId!) : wowheadTbcSearchUrl(s.name);
          const wowheadAttr = hasGemId ? `item=${s.itemId}&domain=tbc` : undefined;

          const iconSrc = gemIconUrl(s.gemColor, s.iconName);
          const title = [s.name, s.note].filter(Boolean).join(" — ");

          return (
            <a
              key={`${s.name}-${i}`}
              className="sockGem"
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              data-wowhead={wowheadAttr}
              title={title}
              onClick={(e) => e.stopPropagation()}
            >
              <img className="sockGemIcon" src={iconSrc} alt="" />

              <div className="sockGemText">
                <div className="sockGemName">{s.name}</div>
                {s.note ? <div className="sockGemNote">{s.note}</div> : null}
              </div>

              
            </a>
          );
        })}
      </div>

      <style jsx>{`
        /* KEY: no margin-left:auto, no justify to far right */
        .socketsRow {
          display: grid;
          gap: 8px;
          align-content: start;
          justify-items: stretch; /* all socket cards same width */
          width: 220px; /* keeps them compact next to the text */
        }

        .sockGem {
          text-decoration: none;
          display: grid;
          grid-template-columns: 18px minmax(0, 1fr) 14px;
          align-items: center;
          gap: 8px;

          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.04);

          padding: 6px 10px;
          color: rgba(255, 255, 255, 0.92);
          min-width: 0;
        }

        .sockGem:hover {
          border-color: rgba(255, 255, 255, 0.16);
          background: rgba(255, 255, 255, 0.06);
        }

        .sockGemIcon {
          width: 18px;
          height: 18px;
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .sockGemText {
          min-width: 0;
          display: grid;
          gap: 1px;
        }

        .sockGemName {
          font-size: 12px;
          font-weight: 850;
          line-height: 1.1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sockGemNote {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.65);
          line-height: 1.1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sockSocketIcon {
          width: 14px;
          height: 14px;
          opacity: 0.85;
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          justify-self: end;
        }

        /* Mobile: sockets go under and become a 2-col grid (no huge card height) */
        @media (max-width: 700px) {
          .socketsRow {
            width: 100%;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8px;
          }
          .sockGem {
            padding: 6px 8px;
          }
        }
      `}</style>
    </>
  );
}

function GearGrid({ gear }: { gear: GearItem[] }) {
  useWowheadTooltips([gear?.length]);

  if (!gear?.length) {
    return <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 15 }}>No gear for this season yet.</div>;
  }

  return (
    <>
      <div className="gearGrid">
        {gear.map((g, idx) => {
          const hasId = typeof g.itemId === "number" && g.itemId > 0;
          const href = hasId ? wowheadTbcItemUrl(g.itemId!) : wowheadTbcSearchUrl(g.itemName);
          const wowheadAttr = hasId ? `item=${g.itemId}&domain=tbc` : undefined;
          const subLine = g.enchant || g.note;

          return (
            <a
              key={`${g.slot}-${idx}`}
              className="gearCard"
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              data-wowhead={wowheadAttr}
            >
              <img className="gearIcon" src={ICON(g.iconName)} alt="" />

              <div className="gearText">
                <div className="gearName" title={g.itemName}>
                  {g.itemName}
                </div>
                {subLine ? (
                  <div className="gearSub" title={subLine}>
                    {subLine}
                  </div>
                ) : null}
              </div>

              {g.sockets?.length ? (
                <div className="gearSockets">
                  <SocketsRow sockets={g.sockets} />
                </div>
              ) : null}

              <div className="gearArrow">↗</div>
            </a>
          );
        })}
      </div>

      <style jsx>{`
        .gearGrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }
        @media (max-width: 700px) {
          .gearGrid {
            grid-template-columns: 1fr;
          }
        }

        /* KEY: grid layout removes "dead space" and keeps sockets tight */
        .gearCard {
          text-decoration: none;
          cursor: pointer;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(0, 0, 0, 0.35);
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.4);
          padding: 12px;
          color: rgba(255, 255, 255, 0.95);

          display: grid;
          grid-template-columns: 38px minmax(0, 1fr) auto 16px;
          align-items: center;
          column-gap: 12px;
          min-height: 76px; /* gives room for 2 stacked sockets without making it huge */
        }

        .gearCard:hover {
          border-color: rgba(255, 255, 255, 0.16);
          background: rgba(255, 255, 255, 0.04);
        }

        .gearIcon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          object-fit: cover;
          display: block;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.04);
        }

        .gearText {
          min-width: 0;
        }

        .gearName {
  font-size: 16px;
  font-weight: 800;
  line-height: 1.15;

  /* 2-line clamp instead of single-line ellipsis */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;

  overflow: hidden;
  white-space: normal;
}

       .gearSub {
  margin-top: 4px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.2;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

        /* sockets aligned to the top of the card, right after text */
        .gearSockets {
          align-self: start;
        }

        .gearArrow {
          opacity: 0.45;
          font-size: 14px;
          justify-self: end;
          align-self: start;
          padding-top: 2px;
        }

        /* Mobile: sockets go under, keep card compact */
        @media (max-width: 700px) {
          .gearCard {
            grid-template-columns: 38px minmax(0, 1fr) 16px;
            grid-template-rows: auto auto;
            row-gap: 10px;
            min-height: 0;
          }

          .gearSockets {
            grid-column: 1 / -1;
          }
        }
      `}</style>
    </>
  );
}

function CompsGrid({ comps }: { comps?: CompCard[] }) {
  if (!comps?.length) return <div style={{ color: "rgba(255,255,255,0.6)" }}>No comps added yet.</div>;

  return (
    <>
      <div className="compGrid">
        {comps.map((c, i) => (
          <div key={`${c.name}-${i}`} className="compCard">
            <div className="compTitle">{c.name}</div>
            <div className="compNote">{c.note?.trim() ? c.note : "Add notes here…"}</div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .compGrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }
        @media (max-width: 700px) {
          .compGrid {
            grid-template-columns: 1fr;
          }
        }

        .compCard {
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(0, 0, 0, 0.35);
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.35);
          padding: 14px;
          min-height: 86px;
          display: grid;
          gap: 8px;
        }

        .compTitle {
          font-size: 18px;
          font-weight: 850;
          color: rgba(255, 255, 255, 0.95);
          line-height: 1.15;
        }

        .compNote {
          font-size: 15px;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.25;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.03);
          padding: 10px 12px;
        }
      `}</style>
    </>
  );
}

// =======================
// PAGE
// =======================

export default function TbcClassPage() {
  const params = useParams() as { build?: string };
  const rawSlug = params?.build || "";
  const slug = SLUG_ALIASES[rawSlug] || rawSlug;
  const data = DATA[slug];

  const [season, setSeason] = React.useState<SeasonKey>("S1");

  React.useEffect(() => {
    setSeason("S1");
  }, [slug]);

  if (!data) {
    return (
      <main
        style={{
          minHeight: "100vh",
          padding: "56px 24px",
          background: "radial-gradient(1200px 600px at 30% 0%, #1a1a1a 0%, #0b0b0b 55%, #070707 100%)",
          color: "#fff",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Link
            href="/pvp/tbc"
            style={{
              display: "inline-block",
              marginBottom: 24,
              color: "rgba(255,255,255,0.65)",
              textDecoration: "none",
            }}
          >
            ← Back
          </Link>

          <h1 style={{ fontSize: 46, margin: 0 }}>Page not found</h1>
          <div style={{ marginTop: 10, color: "rgba(255,255,255,0.65)" }}>
            Unknown class slug: <b>{rawSlug}</b>
          </div>
        </div>
      </main>
    );
  }

  const activeGear = data.gearBySeason?.[season] ?? [];

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "56px 24px",
        background: "radial-gradient(1200px 600px at 30% 0%, #1a1a1a 0%, #0b0b0b 55%, #070707 100%)",
        color: "#fff",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Link
          href="/pvp/tbc"
          style={{
            display: "inline-block",
            marginBottom: 24,
            color: "rgba(255,255,255,0.65)",
            textDecoration: "none",
          }}
        >
          ← Back
        </Link>

        <div style={{ marginBottom: 8 }}>
          <h1 style={{ fontSize: 54, margin: 0 }}>{data.title}</h1>
          <div style={{ marginTop: 10, color: "rgba(255,255,255,0.60)" }}>{data.subtitle}</div>
          {data.description ? <div style={{ marginTop: 10, color: "rgba(255,255,255,0.70)" }}>{data.description}</div> : null}
        </div>

        <SectionCard title="Notes">
          <NotesList notes={data.notes} />
        </SectionCard>

        <SectionCard title="Talents">
          <TalentsBlock lines={data.talentsNote} embedUrl={data.talentsEmbedUrl} />
        </SectionCard>

        <SectionCard title="Gear">
          <div style={{ marginTop: -6, marginBottom: 14, fontSize: 15, color: "rgba(255,255,255,0.65)" }}>
            Feel free to replace PvE items for more PvP if you are facing a lot of double DPS comps
            <br />
            Swap weapons accordingly, if you see double DPS just switch to the Gladiator mace
            <br />
            3% Spell Hit Cap
          </div>

          <SeasonTabs value={season} onChange={setSeason} />

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: -2, marginBottom: 10, color: "rgba(255,255,255,0.55)", fontSize: 14 }}>
            Hover for Wowhead tooltip • Click to open Wowhead
          </div>

          <GearGrid gear={activeGear} />
        </SectionCard>

        <SectionCard title="2v2 Comps">
          <CompsGrid comps={data.comps2v2} />
        </SectionCard>

        <SectionCard title="3v3 Comps">
          <CompsGrid comps={data.comps3v3} />
        </SectionCard>
      </div>
    </main>
  );
}