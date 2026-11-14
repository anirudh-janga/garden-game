import type { FlowerSpecies } from '../flowerSpecies';
import { plant } from './make';

const O = (id: string, name: string, latin: string, native: string, seasons: string, height: [number, number], colors: string[], form: FlowerSpecies['form'], spacing?: number, zone?: FlowerSpecies['zone']) => plant('oceania', id, name, latin, native, seasons, height, colors, form, spacing, zone);

/** Australia, New Zealand and the Pacific (12.5). */
export const OCEANIA: FlowerSpecies[] = [
  O('kangaroo-paw', 'Kangaroo paw', 'Anigozanthos', 'South-west Australia', 'sp su', [0.7, 1.0], ['#d9302a', '#f6c23a', '#f08fb4', '#e8602a'], { kind: 'fan', florets: 6, size: 0.017, arch: 0.15, furry: true, leaves: 'strap' }, 0.35),
  O('waratah', 'Waratah', 'Telopea speciosissima', 'New South Wales', 'sp', [0.8, 1.1], ['#d9202a', '#e8402a'], { kind: 'bracts', style: 'bowl', rows: 2, per: 12, length: 0.05, width: 0.02, open: 0.8, centre: { kind: 'dome', size: 0.03, color: '#a01428' }, leaves: 'leathery' }, 0.6),
  O('banksia', 'Banksia', 'Banksia ericifolia', 'Eastern Australia', 'au wi', [0.8, 1.1], ['#e8a030|#f6dc8a', '#f0b84a|#f6e6a0', '#d9702a|#f2c05a'], { kind: 'brush', style: 'candle', length: 0.1, radius: 0.03, tip: '#3a2a20', leaves: 'leathery' }, 0.55),
  O('bottlebrush', 'Bottlebrush', 'Callistemon citrinus', 'Eastern Australia', 'sp su', [0.8, 1.1], ['#d9302a|#f0c84a', '#e8607a|#f6dc8a', '#e8dc5a|#f6f0a0'], { kind: 'brush', style: 'cylinder', length: 0.1, radius: 0.03, tip: '#e8c43a', leaves: 'leathery' }, 0.5),
  O('wattle', 'Golden wattle', 'Acacia pycnantha', 'South-east Australia (the national flower)', 'wi sp', [0.9, 1.2], ['#f6d23a', '#f2c230'], { kind: 'bush', bloom: { type: 'pom', size: 0.011 }, blooms: 40, radius: 0.28, leaf: 'long', leafColor: '#5f8558' }, 0.7),
  O('desert-pea', 'Sturt’s desert pea', 'Swainsona formosa', 'Australia’s dry heart', 'sp su', [0.15, 0.25], ['#d9202a', '#c8182a'], { kind: 'arch', florets: 5, floretSize: 0.017, shape: 'pea' }, 0.4),
  O('everlasting', 'Everlasting daisy', 'Xerochrysum bracteatum', 'Australia', 'su au', [0.4, 0.6], ['#f6d23a', '#f58a2a', '#f08fb4', '#fbf8f2', '#d9302a'], { kind: 'radial', petals: [12, 16], length: 0.03, width: 0.009, open: 1.1, layers: 5, center: '#f2c230', centerSize: 0.012, domed: true, pointed: true }, 0.2),
  O('billy-buttons', 'Billy buttons', 'Craspedia globosa', 'Australia', 'su', [0.4, 0.6], ['#f6d23a', '#f2c230'], { kind: 'cluster', florets: 22, radius: 0.02, floretSize: 0.0065, shape: 'globe', floret: 'pouch', leaves: 'strap' }, 0.2),
  O('flannel-flower', 'Flannel flower', 'Actinotus helianthi', 'New South Wales', 'sp su', [0.3, 0.5], ['#f4f0e0', '#fbf8f2'], { kind: 'bracts', style: 'star', rows: 2, per: 7, length: 0.04, width: 0.012, open: 1.1, centre: { kind: 'woolly', size: 0.011, color: '#dcd8c0' }, leaves: 'feathery' }, 0.25),
  O('grevillea', 'Grevillea', 'Grevillea', 'Australia', 'wi sp su au', [0.6, 0.9], ['#d9302a|#f0c84a', '#e8607a|#f6e0a0', '#f58a2a|#f6dc6a'], { kind: 'brush', style: 'comb', length: 0.06, radius: 0.035, tip: '#e8c43a', leaves: 'feathery' }, 0.5),
  O('geraldton-wax', 'Geraldton wax', 'Chamelaucium uncinatum', 'Western Australia', 'wi sp', [0.6, 0.9], ['#f08fb4', '#fbf8f2', '#b46ad0'], { kind: 'bush', bloom: { type: 'single', petals: 5, size: 0.012, centre: '#7a2a4a' }, blooms: 24, radius: 0.24, leaf: 'needle', leafColor: '#5f8a4a' }, 0.55),
  O('cooktown-orchid', 'Cooktown orchid', 'Dendrobium bigibbum', 'Queensland', 'au', [0.3, 0.45], ['#b46ad0', '#fbf8f2', '#d86aa8'], { kind: 'orchid', type: 'star', flowers: 6, size: 0.018, lip: '#7a2a8a', leaves: 'strap' }, 0.25),
  O('swan-river-daisy', 'Swan River daisy', 'Brachyscome iberidifolia', 'Western Australia', 'sp su', [0.15, 0.25], ['#6a8ae0', '#b46ad0', '#fbf8f2'], { kind: 'radial', petals: [14, 16], length: 0.026, width: 0.008, open: 1.4, layers: 1, center: '#f2c230', centerSize: 0.007, leaves: 'feathery' }, 0.16),
  O('kowhai', 'Kōwhai', 'Sophora microphylla', 'New Zealand', 'sp', [0.9, 1.2], ['#f6c82a', '#f2b82a'], { kind: 'arch', florets: 9, floretSize: 0.017, shape: 'tube' }, 0.6),
  O('mount-cook-lily', 'Mount Cook lily', 'Ranunculus lyallii', 'New Zealand’s alps', 'su', [0.5, 0.7], ['#fbf8f2'], { kind: 'radial', petals: [9, 11], length: 0.05, width: 0.025, open: 1.2, layers: 1, center: '#f2c230', centerSize: 0.016, leaves: 'heart' }, 0.3),
  O('hebe', 'Hebe', 'Veronica speciosa', 'New Zealand', 'su au', [0.4, 0.6], ['#9a4ac8', '#e86aa8', '#fbf8f2'], { kind: 'bush', bloom: { type: 'cluster', size: 0.014, petals: 4, florets: 10, tall: 1.8 }, blooms: 11, radius: 0.2, leaf: 'glossy', leafColor: '#4f7f4a' }, 0.4),
  O('pohutukawa', 'Pōhutukawa', 'Metrosideros excelsa', 'New Zealand', 'su', [0.9, 1.2], ['#d9202a|#f2c84a', '#c8182a|#f2c84a'], { kind: 'bush', bloom: { type: 'brush', size: 0.032, florets: 30 }, blooms: 14, radius: 0.28, leaf: 'glossy', leafColor: '#4a6c50' }, 0.7),
  O('tiare', 'Tiaré', 'Gardenia taitensis', 'The Pacific islands', 'su', [0.6, 0.9], ['#fbf8f2'], { kind: 'bush', bloom: { type: 'star', petals: 7, size: 0.02, centre: '#f2e6a0' }, blooms: 9, radius: 0.22, leaf: 'glossy', leafColor: '#3f7a40' }, 0.5),
];
