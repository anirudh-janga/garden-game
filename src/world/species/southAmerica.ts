import type { FlowerSpecies } from '../flowerSpecies';
import { plant } from './make';

const A = (id: string, name: string, latin: string, native: string, seasons: string, height: [number, number], colors: string[], form: FlowerSpecies['form'], spacing?: number, zone?: FlowerSpecies['zone']) => plant('south-america', id, name, latin, native, seasons, height, colors, form, spacing, zone);

/** South America: the Andes, the Amazon and the south (12.9). */
export const SOUTH_AMERICA: FlowerSpecies[] = [
  A('passion-flower', 'Passion flower', 'Passiflora caerulea', 'Brazil, Argentina and Paraguay', 'su au', [0.4, 0.6], ['#fbf8f2', '#f4ecf6'], { kind: 'radial', petals: [10, 10], length: 0.04, width: 0.016, open: 1.45, layers: 1, center: '#5a3a9a', centerSize: 0.016, stamens: '#e8d84a', fringe: { color: '#3a4ab0', count: 20 } }, 0.35),
  A('alstroemeria', 'Peruvian lily', 'Alstroemeria', 'Chile and Brazil', 'su', [0.5, 0.8], ['#f08fb4', '#f58a2a', '#f6d23a', '#d9202a', '#fbf8f2', '#9a4ac8'], { kind: 'cluster', florets: 7, radius: 0.055, floretSize: 0.018, shape: 'flat', floret: 'trumpet' }, 0.25),
  A('amaryllis', 'Amaryllis', 'Hippeastrum', 'Brazil and the Andes', 'wi sp', [0.45, 0.6], ['#d9202a', '#fbf8f2', '#f08fb4', '#fbf8f2|#d9202a'], { kind: 'trumpet', length: 0.07, flare: 0.03, lobes: 6, count: 3, open: 0.62, leaves: 'strap' }, 0.35),
  A('bougainvillea', 'Bougainvillea', 'Bougainvillea', 'Brazil', 'su au', [0.9, 1.2], ['#d9308a', '#9a4ac8', '#f58a2a', '#fbf8f2', '#f2735a'], { kind: 'bush', bloom: { type: 'bracts', size: 0.021, centre: '#f6e6a0' }, blooms: 30, radius: 0.32, leaf: 'small', leafColor: '#4f7f3a' }, 0.7),
  A('angels-trumpet', 'Angel’s trumpet', 'Brugmansia', 'The Andes', 'su au', [1.0, 1.3], ['#fbf8f2', '#f6c8a0', '#f6e27a', '#f4b4c8'], { kind: 'bush', bloom: { type: 'trumpet', size: 0.03, petals: 5, open: 0.85, tube: 2.4 }, blooms: 6, radius: 0.3, leaf: 'glossy', leafColor: '#4f8244', hang: true }, 0.6),
  A('begonia', 'Tuberous begonia', 'Begonia × tuberhybrida', 'The Andes', 'su au', [0.2, 0.32], ['#d9202a', '#f58a2a', '#f6d23a', '#f08fb4', '#fbf8f2'], { kind: 'radial', petals: [10, 12], length: 0.028, width: 0.02, open: 1.0, layers: 4, center: '#f2c230', centerSize: 0.012, domed: true, leaves: 'heart' }, 0.25),
  A('anthurium', 'Anthurium', 'Anthurium andraeanum', 'Colombia and Ecuador', 'sp su au', [0.35, 0.5], ['#d9202a', '#f08fb4', '#fbf8f2', '#8ab84a'], { kind: 'spathe', style: 'flat', size: 0.04, spadix: '#f2d23a', leaves: 'heart' }, 0.3),
  A('bromeliad', 'Scarlet star', 'Guzmania lingulata', 'Central and South America', 'su', [0.3, 0.45], ['#d9202a', '#f58a2a', '#f6d23a', '#f08fb4'], { kind: 'bracts', style: 'star', rows: 3, per: 6, length: 0.05, width: 0.02, open: 0.9, centre: { kind: 'beads', size: 0.012, color: '#fbf8f2' }, leaves: 'strap' }, 0.3),
  A('slipper-flower', 'Slipper flower', 'Calceolaria', 'Chile and the Andes', 'sp su', [0.2, 0.32], ['#f6c82a', '#f58a2a', '#d9302a'], { kind: 'cluster', florets: 14, radius: 0.03, floretSize: 0.007, shape: 'dome', floret: 'pouch' }, 0.22),
  A('cantua', 'Cantua', 'Cantua buxifolia', 'Peru and Bolivia', 'sp', [0.9, 1.2], ['#d9308a|#f6c23a', '#d9202a|#f6d23a'], { kind: 'arch', florets: 9, floretSize: 0.017, shape: 'tube' }, 0.6),
  A('copihue', 'Chilean bellflower', 'Lapageria rosea', 'Chile (its national flower)', 'su au', [0.6, 0.9], ['#d9202a', '#f08fb4', '#fbf8f2'], { kind: 'arch', florets: 5, floretSize: 0.022, shape: 'bell' }, 0.45),
  A('four-oclock', 'Marvel of Peru', 'Mirabilis jalapa', 'Peru', 'su au', [0.5, 0.7], ['#d9308a', '#f6d23a', '#fbf8f2', '#f58a2a'], { kind: 'bush', bloom: { type: 'trumpet', size: 0.014, petals: 5, centre: '#f6e6a0', open: 0.6 }, blooms: 17, radius: 0.26, leaf: 'small', leafColor: '#4f7f3a' }, 0.45),
  A('scarlet-sage', 'Scarlet sage', 'Salvia splendens', 'Brazil', 'su au', [0.3, 0.45], ['#d9202a', '#9a4ac8', '#f08fb4', '#fbf8f2'], { kind: 'spike', florets: 16, spikeLength: 0.14, floretSize: 0.011, bell: false, floret: 'tube' }, 0.2),
  A('cleome', 'Spider flower', 'Cleome hassleriana', 'Argentina, Paraguay and southern Brazil', 'su au', [0.9, 1.2], ['#f08fb4', '#fbf8f2', '#b46ad0'], { kind: 'spider', heads: 8, petals: 4, length: 0.042, width: 0.014, open: 1.1, stamens: '#f4e0e8' }, 0.4),
  A('moss-rose', 'Moss rose', 'Portulaca grandiflora', 'Argentina, Brazil and Uruguay', 'su', [0.08, 0.12], ['#f08fb4', '#f6d23a', '#f58a2a', '#d9202a', '#fbf8f2'], { kind: 'radial', petals: [10, 12], length: 0.022, width: 0.014, open: 1.1, layers: 3, center: '#f2c230', centerSize: 0.008, domed: true, leaves: 'rosette' }, 0.12),
  A('victoria', 'Giant water lily', 'Victoria amazonica', 'The Amazon', 'su', [0.1, 0.16], ['#fbf8f2|#f08fb4', '#fbf8f2'], { kind: 'aquatic', type: 'victoria', size: 0.06 }, 1.0, 'deep'),
];
