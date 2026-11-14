import type { FlowerSpecies } from '../flowerSpecies';
import { plant } from './make';

const M = (id: string, name: string, latin: string, native: string, seasons: string, height: [number, number], colors: string[], form: FlowerSpecies['form'], spacing?: number, zone?: FlowerSpecies['zone']) => plant('mediterranean', id, name, latin, native, seasons, height, colors, form, spacing, zone);

/** The Mediterranean and Western Asia (12.11). */
export const MEDITERRANEAN: FlowerSpecies[] = [
  M('crown-imperial', 'Crown imperial', 'Fritillaria imperialis', 'Turkey to Persia', 'sp', [0.8, 1.05], ['#f58a2a', '#f6c23a', '#d9302a'], { kind: 'crown', bells: 6, size: 0.03 }, 0.35),
  M('oleander', 'Oleander', 'Nerium oleander', 'The Mediterranean', 'su au', [0.9, 1.2], ['#f08fb4', '#fbf8f2', '#d9302a', '#f6c8a0'], { kind: 'bush', bloom: { type: 'single', petals: 5, size: 0.016, centre: '#f2c230' }, blooms: 16, radius: 0.3, leaf: 'long', leafColor: '#5a8a5a' }, 0.7),
  M('nigella', 'Love-in-a-mist', 'Nigella damascena', 'The Mediterranean', 'su', [0.35, 0.5], ['#6a8ae0', '#fbf8f2', '#f08fb4'], { kind: 'radial', petals: [5, 5], length: 0.028, width: 0.016, open: 1.3, layers: 1, center: '#5a7a3a', centerSize: 0.01, fringe: { color: '#8ab84a', count: 16 }, leaves: 'feathery' }, 0.22),
  M('rock-rose', 'Rock rose', 'Cistus', 'The Mediterranean', 'sp su', [0.5, 0.75], ['#fbf8f2', '#f08fb4'], { kind: 'bush', bloom: { type: 'single', petals: 5, size: 0.019, centre: '#f2c230', blotch: 0.45 }, blooms: 14, radius: 0.28, leaf: 'grey' }, 0.55),
  M('foxtail-lily', 'Foxtail lily', 'Eremurus', 'Central Asia and Persia', 'su', [1.1, 1.4], ['#f6a860', '#f6d23a', '#fbf8f2', '#f4b4c8'], { kind: 'brush', style: 'spire', length: 0.34, radius: 0.04, leaves: 'strap' }, 0.4),
  M('damask-rose', 'Damask rose', 'Rosa × damascena', 'The Middle East', 'sp su', [0.6, 0.85], ['#f08fb4', '#f4c4d0', '#fbf8f2', '#e8608a'], { kind: 'rose', type: 'cabbage', size: 0.045 }, 0.55),
  M('oriental-poppy', 'Oriental poppy', 'Papaver orientale', 'The Caucasus and Persia', 'sp su', [0.6, 0.85], ['#e8402a', '#f58a6a', '#fbf8f2', '#8a3a6a'], { kind: 'radial', petals: [4, 6], length: 0.06, width: 0.05, open: 1.0, layers: 1, center: '#2a1a1a', centerSize: 0.013, stamens: '#2a1a2a', blotch: 0.8, leaves: 'feathery' }, 0.4),
  M('windflower', 'Poppy anemone', 'Anemone coronaria', 'The Mediterranean', 'sp', [0.25, 0.38], ['#d9202a', '#5a6ad8', '#8a4ac8', '#fbf8f2', '#f08fb4'], { kind: 'radial', petals: [7, 8], length: 0.04, width: 0.024, open: 1.3, layers: 1, center: '#1a1a2a', centerSize: 0.011, stamens: '#3a3a6a', leaves: 'feathery' }, 0.22),
  M('madonna-lily', 'Madonna lily', 'Lilium candidum', 'The eastern Mediterranean', 'su', [0.8, 1.1], ['#fbf8f2'], { kind: 'trumpet', length: 0.08, flare: 0.034, lobes: 6, column: '#f2c230', count: 5, stack: true, open: 0.6 }, 0.4),
  M('acanthus', 'Bear’s breeches', 'Acanthus mollis', 'The Mediterranean', 'su', [0.9, 1.2], ['#8a4a6a|#f4ecf0'], { kind: 'spike', florets: 16, spikeLength: 0.3, floretSize: 0.015, bell: false, floret: 'tube', leaves: 'feathery' }, 0.55),
  M('persian-lily', 'Persian lily', 'Fritillaria persica', 'Persia and Turkey', 'sp', [0.7, 0.95], ['#5a2a4a', '#f4ecd0'], { kind: 'spike', florets: 14, spikeLength: 0.24, floretSize: 0.014, bell: false, floret: 'bell' }, 0.3),
  M('squill', 'Siberian squill', 'Scilla siberica', 'The Caucasus and Turkey', 'wi sp', [0.08, 0.14], ['#4a6ae8', '#fbf8f2'], { kind: 'spike', florets: 4, spikeLength: 0.05, floretSize: 0.011, bell: false, floret: 'bell', leaves: 'strap' }, 0.1),
  M('candytuft', 'Candytuft', 'Iberis sempervirens', 'Southern Europe', 'sp', [0.15, 0.25], ['#fbf8f2'], { kind: 'cluster', florets: 20, radius: 0.034, floretSize: 0.007, shape: 'dome', floret: 'star', eye: '#e8dc8a' }, 0.2),
  M('stock', 'Stock', 'Matthiola incana', 'Mediterranean coasts', 'sp su', [0.35, 0.5], ['#f08fb4', '#9a5ad0', '#fbf8f2', '#f4e8c8'], { kind: 'spike', florets: 16, spikeLength: 0.16, floretSize: 0.013, bell: false, floret: 'star', petals: 4 }, 0.2),
  M('statice', 'Statice', 'Limonium sinuatum', 'The Mediterranean', 'su au', [0.4, 0.6], ['#9a5ad0', '#f6d23a', '#f08fb4', '#fbf8f2', '#6a8ae0'], { kind: 'cluster', florets: 20, radius: 0.045, floretSize: 0.008, shape: 'flat', floret: 'star', eye: '#fbf8f2' }, 0.25),
];
