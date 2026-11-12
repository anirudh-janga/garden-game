import type { FlowerSpecies } from '../flowerSpecies';
import { plant } from './make';

const N = (id: string, name: string, latin: string, native: string, seasons: string, height: [number, number], colors: string[], form: FlowerSpecies['form'], spacing?: number, zone?: FlowerSpecies['zone']) => plant('north-america', id, name, latin, native, seasons, height, colors, form, spacing, zone);

/** North America: prairies, woods, mountains and deserts (12.10). */
export const NORTH_AMERICA: FlowerSpecies[] = [
  N('california-poppy', 'California poppy', 'Eschscholzia californica', 'California', 'sp su', [0.2, 0.35], ['#f58a2a', '#f6c23a', '#f4ecd0', '#f08fb4'], { kind: 'radial', petals: [4, 4], length: 0.04, width: 0.034, open: 0.85, layers: 1, center: '#f2c230', centerSize: 0.01, leaves: 'feathery' }, 0.2),
  N('bluebonnet', 'Texas bluebonnet', 'Lupinus texensis', 'Texas', 'sp', [0.25, 0.4], ['#4a5ad8', '#5a6ae0'], { kind: 'spike', florets: 14, spikeLength: 0.13, floretSize: 0.012, bell: false }, 0.18),
  N('columbine', 'Rocky Mountain columbine', 'Aquilegia caerulea', 'The Rockies', 'sp su', [0.4, 0.6], ['#8aa0e8|#fbf8f2', '#d9302a|#f6d23a', '#f08fb4', '#f6d23a'], { kind: 'radial', petals: [5, 5], length: 0.04, width: 0.015, open: 1.25, layers: 1, center: '#f2d23a', centerSize: 0.012, stamens: '#f6e27a', spurs: true, tilt: 0.5, leaves: 'feathery' }, 0.25),
  N('trillium', 'Trillium', 'Trillium grandiflorum', 'Eastern woods', 'sp', [0.2, 0.32], ['#fbf8f2', '#f4c4d0', '#8a1a2a'], { kind: 'radial', petals: [3, 3], length: 0.05, width: 0.034, open: 1.1, layers: 1, center: '#f2d23a', centerSize: 0.008, leaves: 'paddle' }, 0.22),
  N('bee-balm', 'Bee balm', 'Monarda didyma', 'Eastern North America', 'su', [0.6, 0.9], ['#d9202a', '#f08fb4', '#9a4ac8'], { kind: 'brush', style: 'dome', length: 0.05, radius: 0.045, leaves: 'none' }, 0.3),
  N('blazing-star', 'Blazing star', 'Liatris spicata', 'The prairies', 'su au', [0.6, 0.9], ['#a84ac8', '#fbf8f2'], { kind: 'brush', style: 'spire', length: 0.18, radius: 0.022 }, 0.2),
  N('butterfly-weed', 'Butterfly weed', 'Asclepias tuberosa', 'Eastern and southern USA', 'su', [0.4, 0.6], ['#f2692a', '#f6a02a', '#f6d23a'], { kind: 'cluster', florets: 34, radius: 0.052, floretSize: 0.009, shape: 'flat' }, 0.3),
  N('cardinal-flower', 'Cardinal flower', 'Lobelia cardinalis', 'Streamsides', 'su au', [0.7, 1.0], ['#d9202a'], { kind: 'spike', florets: 14, spikeLength: 0.26, floretSize: 0.015, bell: false }, 0.25, 'bank'),
  N('coreopsis', 'Tickseed', 'Coreopsis lanceolata', 'The prairies and the east', 'su', [0.35, 0.5], ['#f6d23a', '#f2c230'], { kind: 'radial', petals: [8, 8], length: 0.04, width: 0.022, open: 1.35, layers: 1, center: '#7a2a1a', centerSize: 0.012, notch: true }, 0.2),
  N('penstemon', 'Penstemon', 'Penstemon', 'The West', 'su', [0.5, 0.75], ['#d9202a', '#f08fb4', '#8a5ad8', '#5a7ad8', '#fbf8f2'], { kind: 'spike', florets: 10, spikeLength: 0.22, floretSize: 0.014, bell: true }, 0.25),
  N('virginia-bluebells', 'Virginia bluebells', 'Mertensia virginica', 'Eastern woods', 'sp', [0.3, 0.45], ['#7a9ae8|#f08fb4'], { kind: 'arch', florets: 7, floretSize: 0.013, shape: 'bell' }, 0.3),
  N('ladys-slipper', 'Showy lady’s slipper', 'Cypripedium reginae', 'The Great Lakes and north-east', 'sp su', [0.3, 0.45], ['#fbf8f2'], { kind: 'orchid', type: 'slipper', flowers: 2, size: 0.04, lip: '#f08fb4', leaves: 'paddle' }, 0.3),
  N('paintbrush', 'Indian paintbrush', 'Castilleja', 'The West', 'sp su', [0.25, 0.4], ['#d9202a', '#f2692a', '#d9308a'], { kind: 'brush', style: 'spire', length: 0.12, radius: 0.024 }, 0.18),
  N('mexican-hat', 'Mexican hat', 'Ratibida columnifera', 'The Great Plains', 'su', [0.4, 0.6], ['#f6d23a', '#a8422a|#f6d23a'], { kind: 'radial', petals: [8, 8], length: 0.03, width: 0.013, open: 2.3, layers: 1, center: '#5a2a1a', centerSize: 0.013, cone: 0.05 }, 0.22),
  N('yucca', 'Adam’s needle', 'Yucca filamentosa', 'The south-east', 'su', [1.0, 1.3], ['#f6ecd0', '#fbf8f2'], { kind: 'spike', florets: 14, spikeLength: 0.34, floretSize: 0.02, bell: true }, 0.5),
  N('mountain-laurel', 'Mountain laurel', 'Kalmia latifolia', 'Eastern mountains', 'sp su', [0.8, 1.1], ['#f4c4d0', '#fbf8f2', '#e8809a'], { kind: 'bush', bloom: { type: 'cup', size: 0.016 }, blooms: 18, radius: 0.3, leaf: 'glossy', leafColor: '#2f5a34' }, 0.7),
  N('american-lotus', 'American lotus', 'Nelumbo lutea', 'The Mississippi basin', 'su', [0.5, 0.7], ['#f6ecb0', '#f6e27a'], { kind: 'aquatic', type: 'lotus', size: 0.06 }, 0.9, 'deep'),
];
