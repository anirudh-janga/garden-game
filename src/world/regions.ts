/** The nine regions of origin the flower atlas files every plant under (see docs/flower-atlas.md). */
export type RegionKey = 'europe' | 'mediterranean' | 'east-asia' | 'south-asia' | 'africa' | 'north-america' | 'mexico' | 'south-america' | 'oceania';

export interface Region {
  key: RegionKey;
  /** Name in the book. */
  name: string;
  /** Where the label above the toolbar can say it briefly. */
  short: string;
  /** The plant whose picture stands for the region on the contents page. */
  emblem: string;
}

/** In the order the contents page lists them. */
export const REGIONS: Region[] = [
  { key: 'europe', name: 'Europe', short: 'Europe', emblem: 'foxglove' },
  { key: 'mediterranean', name: 'Mediterranean & Western Asia', short: 'Mediterranean', emblem: 'tulip' },
  { key: 'east-asia', name: 'East Asia', short: 'East Asia', emblem: 'peony' },
  { key: 'south-asia', name: 'South & Southeast Asia', short: 'South Asia', emblem: 'lotus' },
  { key: 'africa', name: 'Africa', short: 'Africa', emblem: 'gladiolus' },
  { key: 'north-america', name: 'North America', short: 'North America', emblem: 'echinacea' },
  { key: 'mexico', name: 'Mexico, Central America & the Caribbean', short: 'Mexico & Caribbean', emblem: 'dahlia' },
  { key: 'south-america', name: 'South America', short: 'South America', emblem: 'fuchsia' },
  { key: 'oceania', name: 'Australia, New Zealand & the Pacific', short: 'Australasia', emblem: 'kangaroo-paw' },
];
