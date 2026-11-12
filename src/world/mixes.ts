import { MIX_ID, SPECIES, WATER_MIX_ID, type FlowerSpecies } from './flowerSpecies';
import { ORIGINS } from './flowerOrigins';
import type { RegionKey } from './regions';

/**
 * The mixes. Gardens saved before the atlas grew used "mix" and "water-mix" (the first 85 plants
 * only); those ids keep drawing from exactly those plants, so an old garden rebuilds as it was.
 * New strokes use the world mixes: "mix-world" (the seasonal mix, giving each region a turn) and
 * "mix-water" (every water plant), and a mix for each region ("mix-<region>"). No colons: the stroke
 * format keeps a colour after one.
 */
export const WORLD_MIX_ID = 'mix-world';
export const WORLD_WATER_ID = 'mix-water';

export const REGION_MIXES: Record<RegionKey, { name: string; note: string }> = {
  europe: { name: 'Meadow & woodland', note: 'Europe, in bloom now' },
  mediterranean: { name: 'Sunny slope', note: 'Mediterranean, in bloom now' },
  'east-asia': { name: 'Japanese garden', note: 'East Asia, in bloom now' },
  'south-asia': { name: 'Himalaya & tropics', note: 'South Asia, in bloom now' },
  africa: { name: 'Cape hillside', note: 'Africa, in bloom now' },
  'north-america': { name: 'Prairie', note: 'North America, in bloom now' },
  mexico: { name: 'Tropical bright', note: 'Mexico & Caribbean, in bloom now' },
  'south-america': { name: 'Andes & Amazon', note: 'South America, in bloom now' },
  oceania: { name: 'Bush garden', note: 'Australasia, in bloom now' },
};

export const regionMixId = (r: RegionKey) => `mix-${r}`;
const REGION_OF_MIX = new Map<string, RegionKey>((Object.keys(REGION_MIXES) as RegionKey[]).map((r) => [regionMixId(r), r]));

/** Is this selection a mix of flowers (a bed of several species)? */
export const isFlowerMix = (id: string) => id === MIX_ID || id === WORLD_MIX_ID || REGION_OF_MIX.has(id);
/** Is it a mix of water plants? */
export const isWaterMix = (id: string) => id === WATER_MIX_ID || id === WORLD_WATER_ID;
export const isAnyMix = (id: string) => isFlowerMix(id) || isWaterMix(id);

const legacy = (s: FlowerSpecies) => !!ORIGINS[s.id];

/** The plants a mix may draw from (before the season and the bed's own choices). `region` is given for a region mix or a world mix's chosen region. */
export function mixSource(id: string): FlowerSpecies[] {
  if (id === MIX_ID || id === WATER_MIX_ID) return SPECIES.filter(legacy);
  const r = REGION_OF_MIX.get(id);
  if (r) return SPECIES.filter((s) => s.region === r);
  return SPECIES;
}

/** The region a region mix is for, if it is one. */
export const mixRegion = (id: string): RegionKey | null => REGION_OF_MIX.get(id) ?? null;

/** Name (and whether it is a water mix) for the label and the chip. */
export function mixName(id: string): string {
  if (isWaterMix(id)) return 'Water mix';
  const r = REGION_OF_MIX.get(id);
  return r ? REGION_MIXES[r].name : 'Seasonal mix';
}
