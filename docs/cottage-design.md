# The cottage — design

One cottage, designed once, the same in every garden. No customisation: no drawer, no options, no
saved style. This document is the design that Milestone 11's stories build. Where a story and this
document disagree, this document wins; if something here turns out wrong when built, fix the
document in the same commit.

`docs/cottage-elevation.svg` is a front view drawn to these numbers.

## 1. What it should feel like

An old English storybook cottage that has stood in this clearing for two hundred years and is
loved: a steep, softly sagging tiled roof that is taller than the walls under it, a big stone
chimney with smoke, limewashed walls between crooked oak timbers, a porch with a rose over it,
small-paned windows glowing warm, and the things of someone's daily life by the door.

Three rules decide every detail:

1. **The roof is the face.** The camera looks down at 34–64° from 9 m to 160 m away, so most of
   what the player sees, most of the time, is roof. It gets the most care: every tile its own
   tone, a sagging ridge, eaves that kick out, a dormer, moss, the chimney.
2. **Nothing is straight, nothing repeats** (CLAUDE.md's hand-made rule). Timbers bow, the ridge
   sags, stones are all different, tiles are nudged, shutters hang a few degrees off. Subtle:
   crooked like an old house, never broken or cartoonish.
3. **It is lived in.** Smoke, lit windows, a bench, boots, a watering can. Each object is where a
   person would have left it.

Since story 10.1 the camera can come within 1.6 m at near eye level, and it turns freely, so every
side is seen and close-up detail matters (the back less than the front, but it must be finished).

## 2. Massing

Local coordinates: x along the front (right is +x), y up, z toward the garden (front is +z).
Metres, before the group's scale of 1.1 (keep `COTTAGE_SCALE`). The cottage keeps its place and
turn in the world (`cottagePos`, yaw −0.18).

| Part | Size and place |
|---|---|
| **Plinth** | Rubble stone, 0.40 high, 0.12 proud of the walls all round. |
| **Main range** | 5.2 wide (x from −2.6 to +2.6) × 3.6 deep (z from −1.8 to +1.8). Walls 2.10 high above the plinth: wall plate (eaves) at y = 2.50. |
| **Main roof** | Gabled, ridge along x. Pitch 50°: ridge 2.15 above the wall plate, at y ≈ 4.65. Overhang 0.35 at the eaves, 0.30 at the gables. The ridge **sags 0.10** at mid-span (a smooth curve, lowest a little left of centre) and each slope dishes 0.04 between gables. The bottom three courses flatten by 12° (a bell-cast kick), so the eaves flick outward. |
| **Chimney** | Outside the left gable, centred on the ridge line (z = 0). Base 1.30 (z) × 0.55 (x, projecting from the wall), with two sloped stone shoulders stepping it in at y = 1.7 and y = 3.1, to a shaft 0.70 × 0.60 that rises to y = 5.50 (0.85 above the ridge). A cap of two flat stone courses, then two clay pots (0.34 and 0.26 tall, the short one tilted 4°). Smoke comes from the tall pot. |
| **Left gable wall** | All stone, the same rubble as the chimney, which grows out of it. |
| **Other walls** | Oak frame with limewashed panels (section 4). |
| **Lean-to wing** | Against the right gable: 1.9 wide (x from +2.6 to +4.5) × 2.6 deep, its front set back 0.5 from the main front (z from −1.3 to +1.3). Its roof is a single slope (35°) falling to the right from y = 2.75 on the gable to eaves at y = 1.55. Back two thirds: a pantry, walled in weathered vertical boards with one small window. Front third: an open log store (two oak posts, logs stacked to chest height). |
| **Porch** | Open, gabled, centred on the door at x = −0.70: 1.40 wide, projecting 0.85. Two oak posts (0.14 square, on stone pads) with curved braces, a collar beam, a 45° tiled roof whose ridge meets the wall at y = 3.05. A flagstone floor one step (0.14) above the ground, and one wide worn step. |
| **Dormer** | One gabled dormer in the front slope above the parlour window (x = +1.25): 0.95 wide, its face a vertical plane at z = 1.45 (where the slope is at y ≈ 3.0), face 0.75 high, so its sill is at y ≈ 3.0 and its apex at y ≈ 4.2, timber cheeks running back into the slope, its own little 45° tiled roof with a tiny sag. (Corrected while building 11.3: the slope is too far out at y = 2.75 for a vertical face to stand on it.) |

Footprint for `contains()`: the main range plus plinth, the chimney (to x = −3.2), the wing (to
x = +4.6) and the porch with its step (to z = +3.0), each as its own rectangle rather than one big
box, so plants can grow in the corner between the wing and the front wall.

## 3. Openings

| Opening | Where | What |
|---|---|---|
| **Front door** | x = −0.70, 0.86 × 1.85, under the porch | Four planks of uneven width, a shallow arched head, two long iron strap hinges, an iron ring handle, a 0.16 square leaded light at eye height. Painted duck-egg teal, weathered paler toward the bottom. It stands 4° ajar from spring to autumn, shut in winter. |
| **Kitchen window** | Front, x = −1.85, 0.80 × 0.85, sill at y = 1.30 | Two-light casement, each light 2 × 3 small panes. |
| **Parlour window** | Front, x = +1.25, 1.45 × 0.95, sill at y = 1.20 | Three-light casement, each light 2 × 3 panes. The left light stands open 20° in summer. |
| **Dormer window** | In the dormer | Two-light casement, 2 × 2 panes each. |
| **Attic window** | Right gable, above the wing roof, y = 3.6 | Round, 0.45 across, a cross of glazing bars, a ring of oak. |
| **Back windows** | Back wall, x = −1.3 and x = +1.2 | Two small two-light casements (as the kitchen's, 0.7 × 0.75). |
| **Pantry window** | Wing, right wall | One small light, 0.4 × 0.5, four panes. |

Every window: an oak lintel that bows a little, a stone sill that sticks out 0.06, a deep reveal
(the glass sits 0.10 behind the wall face), soft-white painted frames and glazing bars, and
half-drawn cream curtains just inside the glass, tied back. The front and back casements have
plank shutters in the door's teal, each with a small heart cut out, hung open on iron pintles; no
two hang at quite the same angle (0–4° of droop), and one on the back wall is missing a plank.

Glass keeps today's behaviour: a dark warm pane by day with a faint glow, bright at night
(`setNight`), and each window throws a pool of light on the grass (`nightLights`).

## 4. Materials and colour

Everything is vertex-coloured Lambert, like the rest of the garden: no image textures. Tone
variation comes from giving each piece (each tile, stone, timber, plank) its own colour, and from
slow gradients within big surfaces.

| Material | Colours | How it's made hand-made |
|---|---|---|
| **Limewash** | `#efe2c6`, shading to `#e3d3b3`; a damp band `#d6c6a6` over the bottom 0.25; a breath of green (`#cfcfa6`) low on the back wall | Each panel between timbers is its own slightly pillowed slab (bulging 0.015 at its middle), tone varying ±4% from panel to panel and mottled within. |
| **Oak frame** | `#6f5a47`, `#7d6650`, `#5f4c3c`; sawn ends and sun-bleached tops `#8a7a68` | Corner posts, a sole plate, a wall plate, a mid rail at y = 1.55, studs about every 1.1 m (never evenly spaced), a curved brace in each top corner of the front and right walls. Each timber is 0.15–0.20 thick, split into 6 lengths with ±6 mm of wander and a slight bow, edges unevenly chamfered. Oak pegs (little dowel ends) at the joints. The right gable has a king post and two raking struts. |
| **Rubble stone** (plinth, left gable, chimney) | `#a79d8c`, `#b9ae9a`, `#94897a`, `#c4b9a4`; the gaps read as `#7f766a`; a rare lichen-gold stone `#b8b77a` | Individual stones, each a squashed, rounded block of its own size (0.12–0.40 long) and tone, laid in rough courses that wander; bigger stones low down and at the corners (quoins). A dark backing surface sits 0.03 behind their faces so the joints read as shadow. |
| **Roof tiles** | `#b5623f`, `#a85738`, `#c1704a`, `#9a4e36`, `#ca7d55` (sun-bleached), a rare dark over-fired `#7d4233`; ridge tiles `#9a4e36` | Plain clay tiles 0.26 wide with 0.20 showing, rounded bottom corners, each slightly cupped. Every tile: its own tone, ±1.5° of twist, ±5 mm of drop. Courses wander 1 cm. About one tile in 150 has slipped 3–5 cm; one is missing near the chimney (the dark batten shows). Half-round ridge tiles, each bedded slightly differently. Moss (`#7e8a55`) gathers in the lower courses of the back slope and beside the chimney and the dormer; cream lichen freckles (`#d8c79a`) on the sunny slope. |
| **Paint** (door, shutters) | Duck-egg teal `#5f8f88`, weathered `#77a39b` | Paler and slightly worn toward the bottom and on edges. |
| **Window paint** | Soft white `#f4efe4` | |
| **Wing boards** | Silvered larch `#8f8676`, `#9a917f`, `#7f7768` | Vertical boards of uneven width, gaps between, the odd one shorter at the bottom. |
| **Iron** | `#3b3a3c` | Hinges, handle, lantern, weather vane, barrel hoops. |
| **Brass / lamp glass** | `#c9a04a` / emissive `#ffbf6e` | |
| **Flagstones** | `#b3a894`, `#a59a87`, `#bfb5a2` | Porch floor, step, and an apron of five or six irregular flags in front of the step. |

## 5. Things by the door (lived-in details)

Each is a small, simple, readable shape. Front and wing side unless noted.

- **Bench** under the kitchen window: one thick oak plank on two log stumps, a folded blanket
  (mustard) at one end.
- **Lantern** on the right porch post: iron frame, glowing glass, a soft halo at night.
- **Wellington boots** beside the door, one fallen over (mustard yellow).
- **Doormat** (woven straw colour) and a **besom broom** leaning in the porch corner.
- **Watering can** (soft green enamel, chipped) beside the bench.
- **Rain barrel** at the front corner of the wing: oak staves, two iron hoops, a wooden lid half
  on, fed by a wooden spout from the wing's eave.
- **Log store**: split logs stacked in the open bay, their pale cut ends outward; a chopping
  block in front with an axe in it.
- **Hanging basket** from the left porch brace (planted in spring to autumn).
- **Bird house** under the right gable's peak, on a short bracket.
- **Wind chimes** under the porch eave: the existing `ChimeSet`, always present.
- **Weather vane** at the right end of the ridge: an iron arrow and a running hare. It turns to
  the wind's direction with a lazy lag and a tremble in gusts (same `WindField` as everything).
- **Milk bottles**: two by the step.
- **At the back**: a wheelbarrow tipped against the wall, a coil of rope on a peg.

## 6. Plants on the house

Always present (they are part of the design, not options):

- **A climbing rose over the porch**: up both posts and over the porch gable, blush pink.
- **Wisteria up the front right corner and along the right-hand rake of the roof**: a gnarled trunk, then an arm following the roof's edge up to the ridge, racemes hanging beside the wing's roof in late spring. (Planned along the front eave; moved because racemes half a metre long would have hung over the windows.)
- **Ivy on the chimney and the left gable**, kept to the lower two thirds.
- **Window boxes** on the kitchen, parlour and dormer sills, planted by season: bulbs in spring
  (yellow, white, blue), trailing geraniums and petunias in summer (red, pink, white), heather
  and small chrysanthemums in autumn (rust, gold, plum), evergreen sprigs and red berries in
  winter. The hanging basket follows the same seasons.

These use the existing `Vines` system through `vinePaths()`, with the paths re-drawn for the new
walls.

## 7. Seasons, weather, day and night

| When | What changes |
|---|---|
| **Winter** | A soft blanket of snow on every roof, thicker toward the eaves and rounded at the edge, with a bare melted patch round the chimney. Snow caps on the dormer, porch, sills, bench, barrel lid and log pile. Icicles of different lengths along the front eave. A wreath on the (shut) door. Thicker smoke. |
| **Autumn** | Fallen leaves in the season's colours scattered on the roof and caught behind the dormer and against the chimney; three pumpkins by the step; the log store full. |
| **Spring and summer** | Door ajar, the parlour light open in summer, boxes and basket in flower, the log store half empty. |
| **Rain** | Roof and stone darken and take a sheen (the existing `addWet`). |
| **Night** | Windows and lantern bright; pools of light on the grass; a faint warm glow in the tall chimney pot's smoke. |

## 8. Budgets (the phone comes first)

- **Triangles:** ≤ 32,000, in **one shape used at every distance** (as built: 18,743). An earlier
  version of this design had a plainer far shape swapped in beyond 40 m; it was dropped after the
  player's review, because the house visibly changed while pinching and looked different on
  different screens. Don't bring it back: if the house ever needs to be cheaper far off, make it
  cheaper everywhere.
- **Draw calls:** ≤ 6 for the still house (one merged vertex-coloured mesh, glass, snow in
  winter, plus smoke, weather vane, chimes). Today's cottage is 20 draw calls for 3,000 triangles.
- **Build time:** built once at load (no rebuilds now), ≤ 60 ms on the test machine; nothing
  about the cottage compiles a shader in the middle of play (`tools/perf/shaders-run.sh`).
- **Shadows:** it casts and receives; it must not force shadow redraws when nothing moves (the
  weather vane and chimes don't cast).

## 9. What other systems rely on (keep these working)

`group` (taps are tested against it), `position`, `contains(x, z, margin)`, `vinePaths()`,
`perches()` (ridge, chimney pots, porch ridge, weather vane, bench), `nightLights()`,
`setNight()`, `smokePoints`, `onChime`, `setPixelRatio()`, `update(dt, wind)`. The opening camera
move (story 6.5) starts close on the cottage's front and must still frame it well.
