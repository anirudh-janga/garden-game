import type { FlowerSpecies } from '../flowerSpecies';
import { plant } from './make';

const S = (id: string, name: string, latin: string, native: string, seasons: string, height: [number, number], colors: string[], form: FlowerSpecies['form'], spacing?: number, zone?: FlowerSpecies['zone']) => plant('south-asia', id, name, latin, native, seasons, height, colors, form, spacing, zone);

/** South and Southeast Asia: the Himalaya, India and tropical Asia (12.7). */
export const SOUTH_ASIA: FlowerSpecies[] = [
  S('blue-poppy', 'Himalayan blue poppy', 'Meconopsis betonicifolia', 'Tibet and the eastern Himalaya', 'su', [0.6, 0.9], ['#7ab0e8', '#6a9ae0'], { kind: 'radial', petals: [4, 4], length: 0.06, width: 0.045, open: 1.25, layers: 1, center: '#f2c230', centerSize: 0.02, stamens: '#f2c230', tilt: 0.6, leaves: 'rosette' }, 0.35),
  S('rhododendron', 'Rhododendron', 'Rhododendron arboreum', 'The Himalaya (Nepal’s national flower)', 'sp', [0.9, 1.2], ['#d9202a', '#f08fb4', '#fbf8f2', '#9a4ac8'], { kind: 'bush', bloom: { type: 'cluster', size: 0.03, petals: 5, florets: 8 }, blooms: 7, radius: 0.3, leaf: 'long', leafColor: '#2f5a34' }, 0.8),
  S('moth-orchid', 'Moth orchid', 'Phalaenopsis amabilis', 'Indonesia and the Philippines', 'wi sp', [0.4, 0.55], ['#fbf8f2', '#f08fb4', '#e8a0d0', '#f6e27a'], { kind: 'orchid', type: 'moth', flowers: 5, size: 0.03, lip: '#d9306a', leaves: 'rosette' }, 0.3),
  S('vanda', 'Blue vanda', 'Vanda coerulea', 'North-east India to Thailand', 'au', [0.5, 0.7], ['#8a8ae0', '#b49ae0', '#f08fb4'], { kind: 'orchid', type: 'star', flowers: 6, size: 0.026, lip: '#4a3a9a', upright: true, leaves: 'strap' }, 0.3),
  S('hibiscus', 'Hibiscus', 'Hibiscus rosa-sinensis', 'Tropical Asia', 'su au', [0.9, 1.2], ['#d9202a', '#f08fb4', '#f6c23a', '#f58a2a', '#fbf8f2'], { kind: 'bush', bloom: { type: 'trumpet', size: 0.03, petals: 5, centre: '#f2c230', column: true, open: 0.8 }, blooms: 6, radius: 0.3, leaf: 'glossy', leafColor: '#2f6a34' }, 0.7),
  S('jasmine', 'Arabian jasmine', 'Jasminum sambac', 'India and Bhutan', 'su', [0.5, 0.8], ['#fbf8f2', '#f4ecd0'], { kind: 'bush', bloom: { type: 'star', petals: 8, size: 0.013, centre: '#f2e6a0' }, blooms: 22, radius: 0.22, leaf: 'glossy', leafColor: '#3f7a40' }, 0.45),
  S('torch-ginger', 'Torch ginger', 'Etlingera elatior', 'Indonesia and Malaysia', 'su', [1.0, 1.3], ['#e8407a', '#d9202a', '#f08fb4'], { kind: 'bracts', style: 'cone', rows: 5, per: 8, length: 0.05, width: 0.022, open: 0.55, centre: { kind: 'beads', size: 0.014, color: '#f6d23a' }, leaves: 'paddle' }, 0.7),
  S('ixora', 'Ixora', 'Ixora coccinea', 'Southern India and Sri Lanka', 'su au', [0.5, 0.8], ['#d9202a', '#f58a2a', '#f08fb4', '#f6d23a'], { kind: 'bush', bloom: { type: 'cluster', size: 0.018, petals: 4, florets: 12, pointed: true }, blooms: 10, radius: 0.22, leaf: 'glossy', leafColor: '#2f6a34' }, 0.45),
  S('cockscomb', 'Cockscomb', 'Celosia argentea', 'India', 'su au', [0.3, 0.5], ['#d9202a', '#e8407a', '#f6c23a', '#f58a2a'], { kind: 'brush', style: 'flame', length: 0.09, radius: 0.034 }, 0.22),
  S('ginger-lily', 'White ginger lily', 'Hedychium coronarium', 'The Himalaya and India', 'su au', [0.9, 1.2], ['#fbf8f2', '#f6e27a', '#f5a04a'], { kind: 'spike', florets: 10, spikeLength: 0.14, floretSize: 0.02, bell: false, floret: 'butterfly', leaves: 'paddle' }, 0.5),
  S('drumstick-primula', 'Drumstick primula', 'Primula denticulata', 'The Himalaya', 'sp', [0.2, 0.3], ['#c8a0e0', '#fbf8f2', '#d9306a'], { kind: 'cluster', florets: 40, radius: 0.034, floretSize: 0.009, shape: 'globe', leaves: 'rosette' }, 0.2),
  S('cobra-lily', 'Cobra lily', 'Arisaema', 'The Himalaya', 'sp su', [0.4, 0.6], ['#7a8a4a', '#6a3a5a', '#a8b46a'], { kind: 'spathe', style: 'hood', size: 0.035, spadix: '#5a3a4a', leaves: 'heart' }, 0.3),
  S('siam-tulip', 'Siam tulip', 'Curcuma alismatifolia', 'Thailand, Laos and Cambodia', 'su', [0.5, 0.7], ['#f08fb4', '#fbf8f2', '#e8607a'], { kind: 'bracts', style: 'cone', rows: 4, per: 6, length: 0.032, width: 0.022, open: 0.6, centre: { kind: 'none', size: 0.012 }, leaves: 'paddle' }, 0.3),
  S('balsam', 'Garden balsam', 'Impatiens balsamina', 'India and Myanmar', 'su', [0.4, 0.6], ['#f08fb4', '#d9202a', '#fbf8f2', '#9a4ac8'], { kind: 'spike', florets: 12, spikeLength: 0.2, floretSize: 0.014, bell: false, floret: 'star' }, 0.25),
  S('pagoda-flower', 'Pagoda flower', 'Clerodendrum paniculatum', 'Tropical Asia', 'su', [0.9, 1.2], ['#f2602a', '#e8402a'], { kind: 'brush', style: 'plume', length: 0.13, radius: 0.055, leaves: 'paddle' }, 0.5),
];
