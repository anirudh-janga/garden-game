import type { FlowerSpecies } from '../flowerSpecies';
import type { RegionKey } from '../regions';
import type { Season } from '../season';

const SEASON: Record<string, Season> = { sp: 'spring', su: 'summer', au: 'autumn', wi: 'winter' };

/**
 * One plant of the atlas, written briefly: its region, id, name, botanical name, where it grows wild,
 * the seasons it blooms in (the player's own: "sp su au wi"), its height range and colours ("base|edge"
 * for bicolours), its shape, and the room it needs (metres).
 */
export function plant(region: RegionKey, id: string, name: string, latin: string, native: string, seasons: string, height: [number, number], colors: string[], form: FlowerSpecies['form'], spacing = 0.4, zone?: FlowerSpecies['zone']): FlowerSpecies {
  return { id, name, latin, native, region, seasons: seasons.split(' ').map((s) => SEASON[s]), height, colors, form, spacing, ...(zone ? { zone } : {}) };
}
