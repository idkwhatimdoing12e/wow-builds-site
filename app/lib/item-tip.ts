// What an item tooltip shows: the hover tooltip on item links and the box at
// the top of an item page. Types only here, so client components can import it
// without pulling the journal in.

/** One line of the game's tooltip, from the in-game dump (scripts/item-dump). */
export interface TooltipLine {
  l: string;
  lc?: string;
  r?: string;
  rc?: string;
  /** Sell price in copper, on the price line. */
  price?: number;
}

export interface ItemTip {
  id: number;
  name: string;
  quality: number;
  icon: string;
  /** "Back, Cloth", from the journal's loot lists. */
  slot?: string;
  /** The game's full tooltip, once /djdump has been run. */
  lines?: TooltipLine[];
  /** Tooltip lines the addon carries for some items. */
  tip?: string[];
  /** Where it comes from, in one line: "Dropped by Miner Johnson (The Deadmines)". */
  source?: string;
}
