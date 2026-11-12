import type { FlowerSpecies } from '../flowerSpecies';
import { plant } from './make';

const E = (id: string, name: string, latin: string, native: string, seasons: string, height: [number, number], colors: string[], form: FlowerSpecies['form'], spacing?: number, zone?: FlowerSpecies['zone']) => plant('europe', id, name, latin, native, seasons, height, colors, form, spacing, zone);

/** Europe: woods, meadows and mountains (12.12). */
export const EUROPE: FlowerSpecies[] = [
  E('edelweiss', 'Edelweiss', 'Leontopodium nivale', 'The Alps', 'su', [0.1, 0.18], ['#e8e6d8', '#f4f2e8'], { kind: 'bracts', style: 'star', rows: 2, per: 7, length: 0.032, width: 0.012, open: 1.15, centre: { kind: 'woolly', size: 0.01, color: '#d6d4c0' } }, 0.14),
  E('gentian', 'Trumpet gentian', 'Gentiana acaulis', 'The Alps', 'sp su', [0.06, 0.1], ['#1a4ad0', '#2a5ae0'], { kind: 'trumpet', length: 0.035, flare: 0.022, lobes: 5 }, 0.12),
  E('pasque-flower', 'Pasque flower', 'Pulsatilla vulgaris', 'Europe’s chalk grassland', 'sp', [0.15, 0.25], ['#8a4ac8', '#d9308a', '#fbf8f2'], { kind: 'cup', petals: 6, length: 0.04, width: 0.022, open: 0.65 }, 0.18),
  E('harebell', 'Harebell', 'Campanula rotundifolia', 'Europe', 'su', [0.3, 0.5], ['#7a9ae8', '#fbf8f2'], { kind: 'arch', florets: 5, floretSize: 0.011, shape: 'bell' }, 0.25),
  E('cowslip', 'Cowslip', 'Primula veris', 'Europe’s meadows', 'sp', [0.15, 0.25], ['#f6d23a'], { kind: 'spike', florets: 8, spikeLength: 0.05, floretSize: 0.012, bell: true }, 0.15),
  E('snakes-head', 'Snake’s head fritillary', 'Fritillaria meleagris', 'Europe’s water meadows', 'sp', [0.2, 0.3], ['#7a3a6a|#f4ecf0', '#fbf8f2'], { kind: 'arch', florets: 2, floretSize: 0.022, shape: 'bell' }, 0.15),
  E('thrift', 'Thrift', 'Armeria maritima', 'Europe’s coasts', 'sp su', [0.12, 0.2], ['#f08fb4', '#fbf8f2'], { kind: 'cluster', florets: 24, radius: 0.026, floretSize: 0.008, shape: 'globe', leaves: 'strap' }, 0.14),
  E('sea-holly', 'Sea holly', 'Eryngium alpinum', 'The Alps', 'su', [0.5, 0.75], ['#6a8ab0', '#8aa0c0'], { kind: 'bracts', style: 'ruff', rows: 2, per: 9, length: 0.055, width: 0.009, open: 1.1, centre: { kind: 'cone', size: 0.014, color: '#5a7aa0' } }, 0.25),
  E('autumn-crocus', 'Autumn crocus', 'Colchicum autumnale', 'Europe', 'au', [0.1, 0.16], ['#c8a0e0', '#fbf8f2'], { kind: 'cup', petals: 6, length: 0.055, width: 0.024, open: 0.55 }, 0.12),
  E('wood-anemone', 'Wood anemone', 'Anemone nemorosa', 'Europe’s woods', 'sp', [0.08, 0.14], ['#fbf8f2', '#f6e4ec'], { kind: 'radial', petals: [6, 6], length: 0.025, width: 0.014, open: 1.35, layers: 1, center: '#f2c230', centerSize: 0.007 }, 0.1),
  E('pinks', 'Cottage pink', 'Dianthus plumarius', 'Central and eastern Europe', 'su', [0.2, 0.32], ['#f08fb4', '#fbf8f2', '#c8203a|#fbf8f2'], { kind: 'radial', petals: [5, 5], length: 0.03, width: 0.02, open: 1.3, layers: 1, center: '#8a2a4a', centerSize: 0.007, notch: true, leaves: 'strap' }, 0.16),
  E('astrantia', 'Masterwort', 'Astrantia major', 'Europe’s mountains', 'su', [0.45, 0.65], ['#e8a0b4', '#fbf8f2', '#a8203a'], { kind: 'pincushion', size: 0.03, spiky: false }, 0.25),
  E('lilac', 'Lilac', 'Syringa vulgaris', 'The Balkans', 'sp', [0.9, 1.2], ['#c8a0e0', '#fbf8f2', '#9a5ac0'], { kind: 'spike', florets: 24, spikeLength: 0.22, floretSize: 0.014, bell: false }, 0.6),
  E('sweet-violet', 'Sweet violet', 'Viola odorata', 'Europe', 'wi sp', [0.06, 0.1], ['#6a3ac0', '#fbf8f2'], { kind: 'radial', petals: [5, 5], length: 0.02, width: 0.012, open: 1.3, layers: 1, center: '#f2d23a', centerSize: 0.005, tilt: 0.5, leaves: 'heart' }, 0.1),
];
