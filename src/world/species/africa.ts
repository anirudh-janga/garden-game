import type { FlowerSpecies } from '../flowerSpecies';
import { plant } from './make';

const A = (id: string, name: string, latin: string, native: string, seasons: string, height: [number, number], colors: string[], form: FlowerSpecies['form'], spacing?: number, zone?: FlowerSpecies['zone']) => plant('africa', id, name, latin, native, seasons, height, colors, form, spacing, zone);

/** Africa: the Cape's showpieces (12.3). */
export const AFRICA: FlowerSpecies[] = [
  A('king-protea', 'King protea', 'Protea cynaroides', 'The Cape, South Africa (its national flower)', 'sp su', [0.7, 1.0], ['#e58aa6', '#f3cfd8', '#c63a5e'], { kind: 'bracts', style: 'bowl', rows: 3, per: 13, length: 0.075, width: 0.026, open: 0.95, centre: { kind: 'woolly', size: 0.028, color: '#e6dccb' }, leaves: 'leathery' }, 0.6),
  A('pincushion-protea', 'Pincushion protea', 'Leucospermum cordifolium', 'The Cape, South Africa', 'sp su', [0.6, 0.9], ['#f08a2a', '#f4c832', '#d93a22'], { kind: 'bracts', style: 'bowl', rows: 1, per: 7, length: 0.035, width: 0.02, open: 1.0, centre: { kind: 'pins', size: 0.03 }, leaves: 'leathery' }, 0.55),
  A('bird-of-paradise', 'Bird of paradise', 'Strelitzia reginae', 'South Africa', 'su au', [0.9, 1.2], ['#f28a22', '#f5a83a'], { kind: 'crane', style: 'bird', size: 0.05, leaves: 'paddle' }, 0.8),
  A('calla', 'Calla lily', 'Zantedeschia aethiopica', 'South Africa', 'sp su', [0.5, 0.75], ['#fbf8f2', '#f4e48a', '#f08fa8', '#7a2a4a'], { kind: 'spathe', style: 'funnel', size: 0.045, spadix: '#f2c230', leaves: 'heart' }, 0.35),
  A('agapanthus', 'Agapanthus', 'Agapanthus praecox', 'South Africa', 'su', [0.7, 1.0], ['#5a7ad8', '#3a56b0', '#fbf8f2'], { kind: 'cluster', florets: 30, radius: 0.065, floretSize: 0.009, shape: 'globe', floret: 'trumpet', leaves: 'strap' }, 0.4),
  A('clivia', 'Clivia', 'Clivia miniata', 'South Africa’s forests', 'wi sp', [0.4, 0.55], ['#f08a2a', '#f4b32a', '#e86a22'], { kind: 'cluster', florets: 16, radius: 0.05, floretSize: 0.011, shape: 'dome', floret: 'trumpet', leaves: 'strap' }, 0.4),
  A('aloe', 'Krantz aloe', 'Aloe arborescens', 'Southern Africa', 'wi', [0.6, 0.9], ['#f4a63a|#d9402a', '#f6c05a|#e8702a'], { kind: 'torch', length: 0.1, radius: 0.03, leaves: 'succulent' }, 0.5),
  A('plumbago', 'Cape leadwort', 'Plumbago auriculata', 'South Africa', 'su au', [0.7, 1.0], ['#8ab8e8', '#fbf8f2'], { kind: 'bush', bloom: { type: 'radial', petals: 5, size: 0.011, centre: '#6a8ac0' }, blooms: 22, radius: 0.26, leaf: 'small' }, 0.6),
  A('gerbera', 'Gerbera', 'Gerbera jamesonii', 'Barberton, South Africa', 'sp su au', [0.3, 0.45], ['#e8432a', '#f58a2a', '#f08fb4', '#f6d23a', '#fbf8f2'], { kind: 'radial', petals: [26, 32], length: 0.07, width: 0.011, open: 1.15, layers: 2, center: '#3a2a1a', centerSize: 0.028, leaves: 'rosette' }, 0.28),
  A('gazania', 'Gazania', 'Gazania rigens', 'South Africa', 'su au', [0.15, 0.25], ['#f58a2a', '#f6d23a', '#c8602a', '#f08fb4'], { kind: 'radial', petals: [14, 18], length: 0.055, width: 0.015, open: 1.3, layers: 1, center: '#2a1a10', centerSize: 0.025, blotch: 0.6, leaves: 'rosette' }, 0.22),
  A('african-daisy', 'Cape daisy', 'Osteospermum', 'South Africa', 'sp su', [0.3, 0.42], ['#fbf8f2', '#9a6ad8', '#f08fb4'], { kind: 'radial', petals: [12, 14], length: 0.055, width: 0.013, open: 1.25, layers: 1, center: '#4a3a8a', centerSize: 0.026, leaves: 'rosette' }, 0.22),
];
