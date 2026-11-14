import type { FlowerSpecies } from '../flowerSpecies';
import { plant } from './make';

const M = (id: string, name: string, latin: string, native: string, seasons: string, height: [number, number], colors: string[], form: FlowerSpecies['form'], spacing?: number, zone?: FlowerSpecies['zone']) => plant('mexico', id, name, latin, native, seasons, height, colors, form, spacing, zone);

/** Mexico, Central America and the Caribbean (12.8). */
export const MEXICO: FlowerSpecies[] = [
  M('poinsettia', 'Poinsettia', 'Euphorbia pulcherrima', 'Mexico', 'au wi', [0.6, 0.9], ['#d9202a', '#f4ecd0', '#f08fb4'], { kind: 'bracts', style: 'star', rows: 2, per: 8, length: 0.07, width: 0.032, open: 1.35, centre: { kind: 'beads', size: 0.014, color: '#e8c43a' }, leaves: 'leathery' }, 0.45),
  M('frangipani', 'Frangipani', 'Plumeria rubra', 'Mexico and Central America', 'su au', [0.9, 1.2], ['#fbf8f2', '#f08fb4', '#f6a04a', '#f6d23a'], { kind: 'bush', bloom: { type: 'single', petals: 5, size: 0.026, centre: '#f2c230', open: 1.25 }, blooms: 12, radius: 0.28, leaf: 'long', leafColor: '#3f7a3a' }, 0.7),
  M('tithonia', 'Mexican sunflower', 'Tithonia rotundifolia', 'Mexico', 'su au', [0.9, 1.2], ['#f2602a', '#f58a2a'], { kind: 'radial', petals: [12, 14], length: 0.05, width: 0.02, open: 1.3, layers: 1, center: '#c8782a', centerSize: 0.025 }, 0.45),
  M('chocolate-cosmos', 'Chocolate cosmos', 'Cosmos atrosanguineus', 'Mexico', 'su au', [0.4, 0.6], ['#5a1a22', '#6a2230'], { kind: 'radial', petals: [8, 8], length: 0.05, width: 0.03, open: 1.4, layers: 1, center: '#3a1a10', centerSize: 0.014 }, 0.3),
  M('tuberose', 'Tuberose', 'Agave amica', 'Mexico', 'su au', [0.7, 0.95], ['#fbf8f2', '#f6ecec'], { kind: 'spike', florets: 14, spikeLength: 0.2, floretSize: 0.014, bell: false, floret: 'star', petals: 6, leaves: 'strap' }, 0.25),
  M('tiger-flower', 'Tiger flower', 'Tigridia pavonia', 'Mexico', 'su', [0.4, 0.55], ['#d9202a|#f6c23a', '#f58a2a|#f6d23a', '#f08fb4|#fbf8f2'], { kind: 'radial', petals: [6, 6], length: 0.05, width: 0.032, open: 0.95, layers: 1, center: '#8a3a2a', centerSize: 0.016, blotch: 0.8, leaves: 'sword' }, 0.25),
  M('globe-amaranth', 'Globe amaranth', 'Gomphrena globosa', 'Central America', 'su au', [0.3, 0.45], ['#c8308a', '#9a4ac8', '#fbf8f2', '#f58a2a'], { kind: 'cluster', florets: 20, radius: 0.018, floretSize: 0.0065, shape: 'globe', floret: 'pouch' }, 0.18),
  M('lantana', 'Lantana', 'Lantana camara', 'Central America and the Caribbean', 'su au', [0.4, 0.6], ['#e8407a|#f6d23a', '#f58a2a|#f6d23a', '#f6d23a', '#f4b4d8|#f6ecb0'], { kind: 'bush', bloom: { type: 'cluster', size: 0.014, petals: 4, florets: 10 }, blooms: 10, radius: 0.22, leaf: 'small', leafColor: '#4f7f3a' }, 0.4),
  M('bush-sage', 'Mexican bush sage', 'Salvia leucantha', 'Mexico', 'au', [0.7, 0.95], ['#7a3ab8|#fbf8f2', '#9a5ad0'], { kind: 'spike', florets: 20, spikeLength: 0.24, floretSize: 0.014, bell: false, floret: 'tube' }, 0.4),
  M('heliconia', 'Lobster claw', 'Heliconia bihai', 'The Caribbean and tropical America', 'su', [1.0, 1.3], ['#d9202a|#f6d23a', '#f58a2a|#f6d23a'], { kind: 'crane', style: 'zigzag', size: 0.05, leaves: 'paddle' }, 0.6),
  M('peacock-flower', 'Pride of Barbados', 'Caesalpinia pulcherrima', 'The Caribbean (Barbados’ national flower)', 'su au', [0.9, 1.2], ['#f58a2a|#f6d23a', '#f6c23a', '#d9302a|#f6c23a'], { kind: 'bush', bloom: { type: 'single', petals: 5, size: 0.017, centre: '#d9302a', open: 1.15, cup: 0.12 }, blooms: 18, radius: 0.3, leaf: 'small', leafColor: '#4f8a44' }, 0.5),
  M('guaria-morada', 'Guaria morada', 'Guarianthe skinneri', 'Costa Rica (its national flower)', 'wi sp', [0.3, 0.45], ['#c860b8', '#fbf8f2', '#e8a0d0'], { kind: 'orchid', type: 'cattleya', flowers: 3, size: 0.036, lip: '#8a1a7a', leaves: 'strap' }, 0.3),
  M('ageratum', 'Floss flower', 'Ageratum houstonianum', 'Mexico and Central America', 'su au', [0.15, 0.25], ['#8a9ae0', '#b49ae0', '#fbf8f2', '#f08fb4'], { kind: 'cluster', florets: 14, radius: 0.028, floretSize: 0.007, shape: 'dome', floret: 'pouch' }, 0.18),
  M('canna', 'Canna', 'Canna indica', 'Central and South America, the Caribbean', 'su au', [1.0, 1.3], ['#d9202a', '#f58a2a', '#f6d23a', '#f08a6a'], { kind: 'spike', florets: 8, spikeLength: 0.12, floretSize: 0.024, bell: false, floret: 'butterfly', leaves: 'paddle' }, 0.5),
];
