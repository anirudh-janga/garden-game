import type { FlowerSpecies } from '../flowerSpecies';
import { plant } from './make';

const A = (id: string, name: string, latin: string, native: string, seasons: string, height: [number, number], colors: string[], form: FlowerSpecies['form'], spacing?: number, zone?: FlowerSpecies['zone']) => plant('africa', id, name, latin, native, seasons, height, colors, form, spacing, zone);

/** Africa: the Cape's showpieces (12.3). */
export const AFRICA: FlowerSpecies[] = [
  A('king-protea', 'King protea', 'Protea cynaroides', 'The Cape, South Africa (its national flower)', 'sp su', [0.7, 1.0], ['#e58aa6', '#f3cfd8', '#c63a5e'], { kind: 'bracts', style: 'bowl', rows: 3, per: 13, length: 0.075, width: 0.026, open: 0.95, centre: { kind: 'woolly', size: 0.028, color: '#e6dccb' }, leaves: 'leathery' }, 0.6),
  A('pincushion-protea', 'Pincushion protea', 'Leucospermum cordifolium', 'The Cape, South Africa', 'sp su', [0.6, 0.9], ['#f08a2a', '#f4c832', '#d93a22'], { kind: 'bracts', style: 'bowl', rows: 1, per: 7, length: 0.035, width: 0.02, open: 1.0, centre: { kind: 'pins', size: 0.03 }, leaves: 'leathery' }, 0.55),
  A('bird-of-paradise', 'Bird of paradise', 'Strelitzia reginae', 'South Africa', 'su au', [0.9, 1.2], ['#f28a22', '#f5a83a'], { kind: 'crane', style: 'bird', size: 0.065, leaves: 'paddle' }, 0.8),
  A('calla', 'Calla lily', 'Zantedeschia aethiopica', 'South Africa', 'sp su', [0.5, 0.75], ['#fbf8f2', '#f4e48a', '#f08fa8', '#7a2a4a'], { kind: 'spathe', style: 'funnel', size: 0.045, spadix: '#f2c230', leaves: 'heart' }, 0.35),
  A('agapanthus', 'Agapanthus', 'Agapanthus praecox', 'South Africa', 'su', [0.7, 1.0], ['#5a7ad8', '#3a56b0', '#fbf8f2'], { kind: 'cluster', florets: 30, radius: 0.065, floretSize: 0.009, shape: 'globe', floret: 'trumpet', leaves: 'strap' }, 0.4),
  A('clivia', 'Clivia', 'Clivia miniata', 'South Africa’s forests', 'wi sp', [0.4, 0.55], ['#f08a2a', '#f4b32a', '#e86a22'], { kind: 'cluster', florets: 16, radius: 0.05, floretSize: 0.011, shape: 'dome', floret: 'trumpet', leaves: 'strap' }, 0.4),
  A('aloe', 'Krantz aloe', 'Aloe arborescens', 'Southern Africa', 'wi', [0.6, 0.9], ['#f4a63a|#d9402a', '#f6c05a|#e8702a'], { kind: 'torch', length: 0.1, radius: 0.03, leaves: 'succulent' }, 0.5),
  A('plumbago', 'Cape leadwort', 'Plumbago auriculata', 'South Africa', 'su au', [0.6, 0.85], ['#8ab8e8', '#fbf8f2'], { kind: 'bush', bloom: { type: 'cluster', size: 0.016, petals: 5, florets: 7 }, blooms: 13, radius: 0.26, leaf: 'small' }, 0.6),
  A('gerbera', 'Gerbera', 'Gerbera jamesonii', 'Barberton, South Africa', 'sp su au', [0.3, 0.45], ['#e8432a', '#f58a2a', '#f08fb4', '#f6d23a', '#fbf8f2'], { kind: 'radial', petals: [24, 30], length: 0.045, width: 0.009, open: 1.5, layers: 2, center: '#3a2a1a', centerSize: 0.013, leaves: 'rosette' }, 0.28),
  A('gazania', 'Gazania', 'Gazania rigens', 'South Africa', 'su au', [0.15, 0.25], ['#f58a2a', '#f6d23a', '#c8602a', '#f08fb4'], { kind: 'radial', petals: [14, 18], length: 0.032, width: 0.011, open: 1.4, layers: 1, center: '#c8882a', centerSize: 0.01, blotch: 0.6, pointed: true, leaves: 'rosette' }, 0.22),
  A('african-daisy', 'Cape daisy', 'Osteospermum', 'South Africa', 'sp su', [0.3, 0.42], ['#fbf8f2', '#9a6ad8', '#f08fb4'], { kind: 'radial', petals: [14, 18], length: 0.04, width: 0.011, open: 1.35, layers: 1, center: '#4a3a8a', centerSize: 0.011, leaves: 'rosette' }, 0.22),
  // Part 2: bulbs and the tropics (12.4).
  A('freesia', 'Freesia', 'Freesia', 'The Cape', 'sp', [0.3, 0.4], ['#fbf8f2', '#f6d23a', '#f08fb4', '#9a6ad8', '#e8432a'], { kind: 'fan', florets: 7, size: 0.012, arch: 0.7, leaves: 'sword' }, 0.14),
  A('crocosmia', 'Crocosmia', 'Crocosmia × crocosmiiflora', 'South and East Africa', 'su au', [0.6, 0.9], ['#e8432a', '#f58a2a', '#f6c23a'], { kind: 'fan', florets: 9, size: 0.011, arch: 0.45, leaves: 'sword' }, 0.3),
  A('nerine', 'Nerine', 'Nerine bowdenii', 'South Africa', 'au', [0.45, 0.6], ['#f08fb4', '#fbf8f2', '#e8607a'], { kind: 'spider', heads: 5, petals: 6, length: 0.032, width: 0.005, open: 1.1, stamens: '#e8c4d0', wavy: true, leaves: 'strap' }, 0.3),
  A('flame-lily', 'Flame lily', 'Gloriosa superba', 'Tropical Africa (Zimbabwe’s national flower)', 'su', [0.8, 1.1], ['#e8432a|#f6c23a', '#d9302a|#f4a63a'], { kind: 'spider', heads: 1, petals: 6, length: 0.075, width: 0.016, open: 0.4, stamens: '#d98a2a', wavy: true }, 0.35),
  A('african-violet', 'African violet', 'Saintpaulia ionantha', 'Tanzania’s mountains', 'sp su au', [0.08, 0.12], ['#8a5ad8', '#f08fb4', '#fbf8f2', '#5a7ad8'], { kind: 'cluster', florets: 7, radius: 0.022, floretSize: 0.007, shape: 'dome', floret: 'star', eye: '#f2c230', leaves: 'rosette' }, 0.12),
  A('impatiens', 'Busy Lizzie', 'Impatiens walleriana', 'East Africa', 'su au', [0.2, 0.3], ['#f08fb4', '#e8432a', '#fbf8f2', '#f58a2a', '#9a6ad8'], { kind: 'bush', bloom: { type: 'single', petals: 5, size: 0.013, centre: '#f6d23a', open: 1.4 }, blooms: 12, radius: 0.14, leaf: 'small', leafColor: '#4a8a44' }, 0.2),
  A('periwinkle', 'Madagascar periwinkle', 'Catharanthus roseus', 'Madagascar', 'su au', [0.25, 0.35], ['#f08fb4', '#fbf8f2|#e8432a'], { kind: 'bush', bloom: { type: 'single', petals: 5, size: 0.013, centre: '#e8432a', open: 1.4 }, blooms: 10, radius: 0.14, leaf: 'glossy', leafColor: '#3a7a3a' }, 0.2),
  A('blue-lily', 'Blue lily of the Nile', 'Nymphaea caerulea', 'The Nile and East Africa', 'su', [0.12, 0.18], ['#8ab8e8', '#b49ae0', '#f4f0fa'], { kind: 'aquatic', type: 'starlily', size: 0.045 }, 0.5, 'deep'),
];
