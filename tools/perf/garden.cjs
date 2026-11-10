// A big garden, like a player's after a few sessions, as a save string.
function enc(pts) { const out = []; let px = 0, pz = 0; for (const [x, z] of pts) { const X = Math.round(x * 100), Z = Math.round(z * 100); out.push(X - px, Z - pz); px = X; pz = Z; } return out.join(','); }
const curve = (fn, n) => Array.from({ length: n + 1 }, (_, i) => fn(i / n));
const a = [];
// Winding paths
a.push(['p', enc(curve((t) => [-12 + t * 24, 4 + Math.sin(t * 6) * 2], 60))]);
a.push(['p', enc(curve((t) => [2 + Math.sin(t * 5) * 2, -12 + t * 16], 50))]);
a.push(['p', enc(curve((t) => [-12 + Math.cos(t * 3) * 3, -8 + t * 10], 40))]);
a.push(['p', enc(curve((t) => [6 + t * 8, 10 - t * 3 + Math.sin(t * 7)], 40))]);
// Beds
const flowers = ['mix', 'lavender', 'salvia', 'cosmos', 'dahlia', 'aster', 'rudbeckia', 'sedum'];
flowers.forEach((sp, k) => a.push(['f', sp, enc(curve((t) => [-14 + (k % 4) * 6 + t * 4, -2 + Math.floor(k / 4) * 13 + Math.sin(t * 4) * 0.6], 20))]));
// Pond (a loop)
a.push(['o', enc(curve((t) => [8 + Math.cos(t * Math.PI * 2) * 3, -4 + Math.sin(t * Math.PI * 2) * 2.4], 40))]);
// Fences of each kind
a.push(['n', 'picket', enc(curve((t) => [-14 + t * 6, -8], 12))]);
a.push(['n', 'rustic', enc(curve((t) => [-14 + t * 6, 9], 12))]);
a.push(['n', 'hedge', enc(curve((t) => [10, 4 + t * 6], 10))]);
a.push(['n', 'wall', enc(curve((t) => [-5 + t * 5, 14], 10))]);
// Rocks and decor
a.push(['r', enc(curve((t) => [12, -10 + t * 3], 6))]);
for (const [item, x, z] of [['bench', -6, 6], ['lantern', 0, 6.5], ['birdhouse', -9, 1], ['flag', 6, 7], ['chimes', -2, -10], ['gazebo', 11, 12]]) a.push(['d', item, enc([[x, z]])]);
module.exports = JSON.stringify({ v: 1, a });
