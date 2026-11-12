import type { FlowerSpecies } from '../flowerSpecies';
import { plant } from './make';

const E = (id: string, name: string, latin: string, native: string, seasons: string, height: [number, number], colors: string[], form: FlowerSpecies['form'], spacing?: number, zone?: FlowerSpecies['zone']) => plant('east-asia', id, name, latin, native, seasons, height, colors, form, spacing, zone);

/** East Asia: China, Japan and Korea (12.6). */
export const EAST_ASIA: FlowerSpecies[] = [
  E('camellia', 'Camellia', 'Camellia japonica', 'Japan, China and Korea', 'wi sp', [0.8, 1.1], ['#d9202a', '#f08fb4', '#fbf8f2', '#f4c4d0'], { kind: 'bush', bloom: { type: 'pom', size: 0.02 }, blooms: 12, radius: 0.28, leaf: 'glossy', leafColor: '#2f6a3a' }, 0.7),
  E('azalea', 'Azalea', 'Rhododendron indicum', 'Japan', 'sp', [0.5, 0.75], ['#e8407a', '#f08fb4', '#fbf8f2', '#f2735a', '#9a4ac8'], { kind: 'bush', bloom: { type: 'trumpet', size: 0.013 }, blooms: 26, radius: 0.24, leaf: 'small', leafColor: '#4f7f3a' }, 0.5),
  E('japanese-iris', 'Japanese iris', 'Iris ensata', 'Japan, China and Korea', 'su', [0.6, 0.85], ['#6a4ac8', '#fbf8f2', '#4a5ad0', '#b46ad0'], { kind: 'aquatic', type: 'flag', size: 0.06 }, 0.3, 'bank'),
  E('spider-lily', 'Red spider lily', 'Lycoris radiata', 'China and Korea', 'au', [0.4, 0.55], ['#d9202a', '#fbf8f2', '#f6c23a'], { kind: 'spider', heads: 5, petals: 6, length: 0.035, width: 0.005, open: 1.1, stamens: '#d9302a', wavy: true }, 0.25),
  E('balloon-flower', 'Balloon flower', 'Platycodon grandiflorus', 'East Asia', 'su', [0.4, 0.6], ['#6a5ad0', '#fbf8f2', '#f08fb4'], { kind: 'trumpet', length: 0.025, flare: 0.026, lobes: 5, leaves: 'rosette' }, 0.25),
  E('astilbe', 'Astilbe', 'Astilbe', 'China and Japan', 'su', [0.5, 0.75], ['#f08fb4', '#fbf8f2', '#d9302a', '#c8a0e0'], { kind: 'brush', style: 'plume', length: 0.13, radius: 0.04, leaves: 'feathery' }, 0.3),
  E('toad-lily', 'Toad lily', 'Tricyrtis hirta', 'Japan', 'au', [0.4, 0.6], ['#fbf8f2|#8a4a8a'], { kind: 'arch', florets: 8, floretSize: 0.012, shape: 'bell' }, 0.3),
  E('cymbidium', 'Cymbidium', 'Cymbidium goeringii', 'China, Japan and Korea', 'wi sp', [0.4, 0.6], ['#a8c86a', '#f08fb4', '#fbf8f2', '#f6d23a'], { kind: 'orchid', type: 'star', flowers: 7, size: 0.02, lip: '#8a2a4a', leaves: 'strap' }, 0.3),
  E('chinese-lantern', 'Chinese lantern', 'Physalis alkekengi', 'Southern Europe to Japan', 'au', [0.4, 0.6], ['#f2692a', '#e8532a'], { kind: 'arch', florets: 7, floretSize: 0.016, shape: 'lantern' }, 0.3),
  E('quince', 'Flowering quince', 'Chaenomeles', 'China and Japan', 'wi sp', [0.7, 1.0], ['#e8402a', '#f2735a', '#fbf8f2'], { kind: 'bush', bloom: { type: 'cup', size: 0.015 }, blooms: 22, radius: 0.28, leaf: 'bare' }, 0.6),
  E('tiger-lily', 'Tiger lily', 'Lilium lancifolium', 'China, Japan and Korea', 'su', [0.9, 1.2], ['#f2692a', '#f58a2a'], { kind: 'radial', petals: [6, 6], length: 0.075, width: 0.016, open: 2.3, layers: 1, center: '#7a3a1a', centerSize: 0.012, tilt: 2.0, pointed: true, leaves: 'none' }, 0.35),
  E('candelabra-primrose', 'Candelabra primrose', 'Primula japonica', 'Japan', 'sp', [0.35, 0.5], ['#d9306a', '#f08fb4', '#fbf8f2'], { kind: 'spike', florets: 18, spikeLength: 0.16, floretSize: 0.013, bell: false }, 0.25, 'bank'),
  E('fuji-cherry', 'Fuji cherry', 'Prunus incisa', 'Japan', 'sp', [0.8, 1.1], ['#fbf0f0', '#f4c4d0'], { kind: 'bush', bloom: { type: 'radial', petals: 5, size: 0.013, centre: '#d9708a' }, blooms: 22, radius: 0.3, leaf: 'bare' }, 0.7),
  E('spider-mum', 'Spider chrysanthemum', 'Chrysanthemum × morifolium', 'Bred in Japan and China', 'au', [0.5, 0.7], ['#f6c23a', '#fbf8f2', '#c8782a', '#f08fb4'], { kind: 'radial', petals: [30, 38], length: 0.06, width: 0.005, open: 1.25, layers: 2, center: '#c89a2a', centerSize: 0.012, pointed: true }, 0.3),
  E('gardenia', 'Gardenia', 'Gardenia jasminoides', 'Southern China and Japan', 'su', [0.6, 0.9], ['#fbf8f2', '#f4ecd0'], { kind: 'bush', bloom: { type: 'pom', size: 0.018 }, blooms: 10, radius: 0.24, leaf: 'glossy', leafColor: '#2f6a3a' }, 0.5),
  E('hakone-grass', 'Hakone grass', 'Hakonechloa macra', 'Japan', 'sp su au', [0.3, 0.4], ['#c8b84a', '#9ab84a', '#b8c85a'], { kind: 'foliage', leaf: 'grass' }, 0.4),
  E('painted-fern', 'Japanese painted fern', 'Athyrium niponicum', 'East Asia', 'sp su au', [0.3, 0.4], ['#b8c4b0', '#a8b4b8', '#c0b8c8'], { kind: 'foliage', leaf: 'fern' }, 0.4),
];
