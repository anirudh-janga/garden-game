# The flower atlas — design

The collection grows from 85 plants to **230**, and every plant is filed under the part of the
world it comes from. This document is the plant list and the shape plan that Milestone 12's
stories build. Each regional story takes its table from here. If a fact here is wrong, fix it
here in the same commit as the code.

Rules that hold for every plant:

- **Flowers only** (product principle): no vegetables, herbs grown for the kitchen, or crops.
- **A real plant, recognisable at a glance.** Its silhouette, its leaves and the way it carries
  its flowers must be right before its colour is. If a plant can't be told from one already in
  the collection at garden distance, give it a different habit or leave it out and say so.
- **Origin = where it grows wild.** A garden hybrid is filed under the home of its wild
  ancestors (hybrid tea roses under East Asia, the Shasta daisy under Europe).
- **Seasons are the player's own** (`seasons` already works this way): a Cape flower that blooms
  in the southern spring blooms in the player's spring.
- **Hand-made** (CLAUDE.md): no two plants alike; the existing per-plant variation applies.
- **Budgets:** near shape at most 900 triangles for an ordinary plant and 1,400 for a bush; far
  shape at most 250 (bush 400). Three shape variants per species (`VARIANTS`).

## 1. The nine regions

| Key | Name in the book | Covers |
|---|---|---|
| `europe` | Europe | Woods, meadows and mountains from Ireland to the Urals |
| `mediterranean` | Mediterranean & Western Asia | The Mediterranean shores, Turkey, the Caucasus, Persia and the Central Asian steppe |
| `east-asia` | East Asia | China, Japan and Korea |
| `south-asia` | South & Southeast Asia | The Himalaya, India, and tropical Asia to Indonesia |
| `africa` | Africa | From the Nile to the Cape, and Madagascar |
| `north-america` | North America | Prairies, woods, mountains and deserts of the USA and Canada |
| `mexico` | Mexico, Central America & the Caribbean | |
| `south-america` | South America | The Andes, the Amazon and the south |
| `oceania` | Australia, New Zealand & the Pacific | |

Totals when Milestone 12 is done:

| Region | Have today | New | Total |
|---|---|---|---|
| Europe | 32 | 14 | 46 |
| Mediterranean & Western Asia | 14 | 15 | 29 |
| East Asia | 14 | 17 | 31 |
| South & Southeast Asia | 1 | 15 | 16 |
| Africa | 3 | 19 | 22 |
| North America | 12 | 17 | 29 |
| Mexico, Central America & the Caribbean | 4 | 14 | 18 |
| South America | 5 | 16 | 21 |
| Australia, New Zealand & the Pacific | 0 | 18 | 18 |
| **All** | **85** | **145** | **230** |

## 2. Where today's 85 plants come from (story 12.1)

`id`: botanical name, native range.

**Europe (32):** `pansy` Viola × wittrockiana, Europe · `daisy` Bellis perennis, Europe ·
`poppy` Papaver rhoeas, Europe's cornfields · `foxglove` Digitalis purpurea, western Europe ·
`daffodil` Narcissus pseudonarcissus, western Europe · `bluebell` Hyacinthoides non-scripta,
Atlantic Europe · `snowdrop` Galanthus nivalis, Europe · `primrose` Primula vulgaris, western and
southern Europe · `forgetmenot` Myosotis sylvatica, Europe · `lilyofthevalley` Convallaria
majalis, Europe · `hellebore` Helleborus, central and southern Europe · `delphinium` Delphinium
elatum, Europe's mountains · `cornflower` Centaurea cyanus, Europe · `yarrow` Achillea
millefolium, Europe · `sweetwilliam` Dianthus barbatus, southern Europe's mountains · `heather`
Calluna vulgaris, Europe's heaths · `aconite` Eranthis hyemalis, southern Europe · `salvia`
Salvia nemorosa, central Europe · `shasta` Leucanthemum × superbum, bred in California from
European daisies · `rose-wild` Rosa canina, Europe · `rose-cabbage` old European roses ·
`waterlily` Nymphaea alba, Europe · `waterflag` Iris pseudacorus, Europe · `marshmarigold` Caltha
palustris, Europe · `waterforgetmenot` Myosotis scorpioides, Europe · `solomons-seal`
Polygonatum multiflorum, Europe · `babys-breath` Gypsophila paniculata, eastern Europe ·
`ladys-mantle` Alchemilla mollis, the Carpathians and Caucasus · `scabious` Scabiosa columbaria,
Europe · `globe-thistle` Echinops ritro, southern and eastern Europe · `fern` Dryopteris
filix-mas, Europe · `box-ball` Buxus sempervirens, Europe.

**Mediterranean & Western Asia (14):** `tulip` Tulipa, Central Asia to Turkey · `crocus` Crocus,
the Mediterranean to Persia · `hyacinth` Hyacinthus orientalis, Turkey and Syria · `muscari`
Muscari armeniacum, Turkey and the Caucasus · `iris` bearded iris, the Mediterranean ·
`ranunculus` Ranunculus asiaticus, the eastern Mediterranean · `sweetpea` Lathyrus odoratus,
Sicily · `snapdragon` Antirrhinum majus, the western Mediterranean · `lavender` Lavandula
angustifolia, the Mediterranean · `cyclamen` Cyclamen hederifolium, the Mediterranean ·
`calendula` Calendula officinalis, southern Europe · `hollyhock` Alcea rosea, western Asia (its
wild home is uncertain) · `allium` Allium hollandicum, Persia · `lambs-ear` Stachys byzantina,
Turkey to Persia.

**East Asia (14):** `chrysanthemum` China · `anemone` Japanese anemone (Anemone hupehensis),
China · `sedum` Hylotelephium spectabile, China and Korea · `peony` Paeonia lactiflora, China ·
`hydrangea` Hydrangea macrophylla, Japan · `lily` Asiatic and Oriental lilies, China and Japan ·
`daylily` Hemerocallis, China, Korea and Japan · `bleeding-heart` Lamprocapnos spectabilis,
northern China, Korea and Japan · `hosta` Japan, China and Korea · `grass` Miscanthus sinensis,
East Asia · `rose-tea`, `rose-floribunda`, `rose-climber`, `rose-mini`: bred from the roses of
China and Japan (Rosa chinensis, R. multiflora).

**South & Southeast Asia (1):** `lotus` Nelumbo nucifera, India to China.

**Africa (3):** `gladiolus` bred from South African species · `red-hot-poker` Kniphofia, South
Africa · `geranium` Pelargonium, the Cape.

**North America (12):** `aster` New England aster (Symphyotrichum novae-angliae) · `rudbeckia`
Rudbeckia hirta, the prairies · `echinacea` Echinacea purpurea, the prairies · `phlox` Phlox
paniculata, the eastern USA · `lupin` Lupinus polyphyllus, the Pacific north-west · `sunflower`
Helianthus annuus · `gaillardia` the Great Plains · `helenium` Helenium autumnale · `goldenrod`
Solidago · `heuchera` · `pickerelweed` Pontederia cordata · `arrowhead` Sagittaria latifolia.

**Mexico, Central America & the Caribbean (4):** `dahlia` Mexico's highlands · `cosmos` Cosmos
bipinnatus, Mexico · `zinnia` Zinnia elegans, Mexico · `marigold` Tagetes, Mexico.

**South America (5):** `petunia` Argentina and Brazil · `nasturtium` Tropaeolum majus, the Andes
· `verbena` Verbena bonariensis, Argentina and Brazil · `fuchsia` Fuchsia magellanica, Chile and
Argentina · `waterhyacinth` Pontederia crassipes, the Amazon.

## 3. New shapes

Today's shape kinds are `radial`, `cup`, `spike`, `cluster`, `arch`, `cloud`, `pincushion`,
`torch`, `rose`, `aquatic` and `foliage` (see `flowerSpecies.ts`, built in `flowers.ts`). The new
plants need these additions. Each is built in the story that first needs it and reused after.

| New shape | What it is | First needed by |
|---|---|---|
| **`bracts`** | A bowl, star or cone of stiff pointed bracts round a centre. Options: rows, bract length and width, how far they open, a domed furry centre (protea), a dome of curled styles (waratah), woolly (edelweiss, flannel flower), leaf-like and flat (poinsettia), a waxy cone on a bare stalk (torch ginger). | Africa 1 |
| **`spathe`** | One wrapped or flat sheath round a spadix: a funnel (calla), a flat glossy heart (anthurium), a striped hood (cobra lily). | Africa 1 |
| **`crane`** | Boat-shaped bracts: one beak with a fan of orange sepals and a blue tongue (bird of paradise), or a zigzag ladder of beaks (heliconia). | Africa 1 |
| **`bush` habit** | A woody mound with its own leaves that carries many blooms of another shape (as `roseBush` does for roses, made general). Fields: bloom count, leaf (`glossy`, `small`, `needle`, `long`), bare branches or leafy. | Africa 1 |
| **Cluster florets** | `cluster` gains `floret: 'star' \| 'trumpet' \| 'pouch'` (today's florets are plain). Trumpet umbels: agapanthus, clivia, alstroemeria, rhododendron trusses. | Africa 1 |
| **Leaf habits** | A species may name its leaves: `strap` (a basal clump of long arching leaves), `sword` (upright fans), `paddle` (big tropical blades), `rosette` (flat at the ground), `feathery`, `succulent`, `heart`. Without it, a plant keeps today's stem leaves. | Africa 1 |
| **`fan`** | A one-sided row of tubular flowers along the top of an arching or forked stem (freesia, crocosmia, kangaroo paw with furry split tubes). | Africa 2 |
| **`spider`** | An umbel of narrow, curled-back petals with long up-curved stamens on a bare stem (nerine, red spider lily, flame lily, cleome). | Africa 2 |
| **Aquatic `starlily`** | A star-shaped water lily held a hand above the water (the blue lily of the Nile). | Africa 2 |
| **`brush`** | A cylinder, cone, dome or one-sided comb of stiff filaments: bottlebrush, banksia candle, grevillea, pōhutukawa pom, astilbe plume, celosia, blazing star, paintbrush, foxtail lily. | Oceania |
| **`orchid`** | A two-sided bloom (three sepals, two petals, a lip), several on an arching spray. Types: `moth` (flat and round), `cattleya` (frilled lip), `star` (cymbidium, vanda, dendrobium), `slipper` (a pouch). | Oceania |
| **Arch florets** | `arch` gains shapes `tube`, `pea` and `lantern` beside `heart` and `bell`. | Oceania |
| **`trumpet`** | One flaring funnel of joined petals. Options: tube length, flare, lobes, a long staminal column (hibiscus), hanging (angel's trumpet), upright and stemless (gentian). | East Asia |
| **Radial options** | `nod` (the bloom hangs: tiger lily), `spots`, `spurs` (columbine), `fringe` (a ring of fine filaments or a ruff of threads: passion flower, love-in-a-mist), `chequer` on `cup` (snake's head fritillary). | East Asia onward |
| **`crown`** | A ring of hanging bells under a tuft of leaves, on a tall bare stem (crown imperial). | Mediterranean |
| **Aquatic `victoria`** | Giant rimmed pads (a metre and more across) with a white bloom that turns pink. | South America |

Four of today's shapes (`arch`, `cloud`, `pincushion`, `torch`) have far shapes that are nearly as
heavy as their near shapes (96–100%). Story 12.2 gives them real far shapes before the collection
grows.

## 4. New plants by region

Columns: id · name (botanical) · native to · blooms (Sp Su Au Wi, the player's seasons) · shape ·
height in metres (the game's scale: today's sunflower is 0.8–1.05) · colours and notes.

### 4.1 Africa (19) — stories 12.3 and 12.4

Part 1, the Cape's showpieces (12.3):

| id | Name | Native to | Blooms | Shape | Height | Colours and notes |
|---|---|---|---|---|---|---|
| `king-protea` | King protea (Protea cynaroides) | The Cape, South Africa (its national flower) | Sp Su | `bracts` bowl, furry dome centre; low `bush`, leathery leaves | 0.7–1.0 | Pink with silvery centre, cream, crimson |
| `pincushion-protea` | Pincushion (Leucospermum cordifolium) | The Cape | Sp Su | existing `pincushion` (no frill, long curled styles) on a `bush` | 0.6–0.9 | Orange, yellow, flame red |
| `bird-of-paradise` | Bird of paradise (Strelitzia reginae) | South Africa | Su Au | `crane`; `paddle` leaves | 0.9–1.2 | Orange sepals, blue tongue, green-and-red beak |
| `calla` | Calla lily (Zantedeschia aethiopica) | South Africa | Sp Su | `spathe` funnel; `heart` (arrow) leaves | 0.5–0.75 | White, soft yellow, pink, deep plum |
| `agapanthus` | Agapanthus (Agapanthus praecox) | South Africa | Su | `cluster` globe of trumpets on a bare stem; `strap` leaves | 0.7–1.0 | Blue, deep blue, white |
| `clivia` | Clivia (Clivia miniata) | South Africa's forests | Wi Sp | `cluster` dome of trumpets; `strap` leaves, broad and dark | 0.4–0.55 | Orange with a yellow throat, yellow |
| `aloe` | Krantz aloe (Aloe arborescens) | Southern Africa | Wi | existing `torch` above a `succulent` rosette | 0.6–0.9 | Coral red, orange |
| `plumbago` | Cape leadwort (Plumbago auriculata) | South Africa | Su Au | `bush` with small `cluster` domes of five-petalled stars | 0.7–1.0 | Sky blue, white |
| `gerbera` | Gerbera (Gerbera jamesonii) | Barberton, South Africa | Sp Su Au | `radial`, two rows of many slim petals, dark eye; `rosette` | 0.3–0.45 | Red, orange, pink, yellow, white |
| `gazania` | Gazania (Gazania rigens) | South Africa | Su Au | `radial` with a dark ring near the centre (`blotch`); low, `rosette` | 0.15–0.25 | Orange, yellow, bronze, pink; closes at night if cheap to do |
| `african-daisy` | Cape daisy (Osteospermum) | South Africa | Sp Su | `radial`, one row, blue-violet centre | 0.3–0.42 | White, purple, pink |

Part 2, bulbs and the tropics (12.4):

| id | Name | Native to | Blooms | Shape | Height | Colours and notes |
|---|---|---|---|---|---|---|
| `freesia` | Freesia | The Cape | Sp | `fan`, six to eight small trumpets | 0.3–0.4 | White, yellow, pink, purple, red |
| `crocosmia` | Crocosmia | South and East Africa | Su Au | `fan` on arching stems; `sword` leaves | 0.6–0.9 | Fiery red, orange, yellow |
| `nerine` | Nerine (Nerine bowdenii) | South Africa | Au | `spider`, mild (wavy petals, short stamens) | 0.45–0.6 | Pink, white, red |
| `flame-lily` | Flame lily (Gloriosa superba) | Tropical Africa (Zimbabwe's national flower) | Su | `spider`: petals swept right back, wavy-edged; leaning stem with tendril tips | 0.8–1.1 | Red edged in yellow |
| `african-violet` | African violet (Saintpaulia) | Tanzania's mountains | Sp Su Au | small `radial`, five petals, yellow eye; fuzzy `rosette` | 0.08–0.12 | Violet, pink, white, blue |
| `impatiens` | Busy Lizzie (Impatiens walleriana) | East Africa | Su Au | flat `radial`, five petals, mounded plant | 0.2–0.3 | Pink, red, white, orange, purple |
| `periwinkle` | Madagascar periwinkle (Catharanthus roseus) | Madagascar | Su Au | `radial` pinwheel with a darker eye; glossy leaves | 0.25–0.35 | Pink, white with a red eye |
| `blue-lily` | Blue lily of the Nile (Nymphaea caerulea) | The Nile and East Africa | Su | `aquatic` `starlily`; zone `deep` | 0.12–0.18 | Sky blue with a gold heart, pale violet |

### 4.2 Australia, New Zealand & the Pacific (18) — story 12.5

| id | Name | Native to | Blooms | Shape | Height | Colours and notes |
|---|---|---|---|---|---|---|
| `kangaroo-paw` | Kangaroo paw (Anigozanthos) | South-west Australia | Sp Su | `fan` of furry tubes split at the tip, on forked stems; `strap` leaves | 0.7–1.0 | Red with green, yellow, orange, pink |
| `waratah` | Waratah (Telopea speciosissima) | New South Wales | Sp | `bracts`: a dome of curled styles over a ring of red bracts; `bush` | 0.8–1.1 | Crimson, rarely white |
| `banksia` | Banksia (Banksia ericifolia) | Eastern Australia | Au Wi | `brush`: a fat upright candle in spiral rows; `bush`, narrow leaves | 0.8–1.1 | Orange, gold, scarlet |
| `bottlebrush` | Bottlebrush (Callistemon citrinus) | Eastern Australia | Sp Su | `brush`: a cylinder, the branch tip growing on through it; `bush`, arching | 0.8–1.1 | Crimson, pink, lemon |
| `wattle` | Golden wattle (Acacia pycnantha) | South-east Australia (the national flower) | Wi Sp | `cloud` of fluffy balls along arching branches; `bush` | 0.9–1.2 | Golden yellow |
| `desert-pea` | Sturt's desert pea (Swainsona formosa) | Australia's dry heart | Sp Su | low `arch` with `pea` florets, each with a glossy black boss; grey leaves, sprawling | 0.15–0.25 | Blood red |
| `everlasting` | Everlasting daisy (Xerochrysum bracteatum) | Australia | Su Au | `radial`, many rows of stiff papery bracts, gold centre | 0.4–0.6 | Yellow, orange, pink, white, red |
| `billy-buttons` | Billy buttons (Craspedia globosa) | Australia | Su | small `cluster` globe on a bare wiry stem; silver `strap` tuft | 0.4–0.6 | Yellow |
| `flannel-flower` | Flannel flower (Actinotus helianthi) | New South Wales | Sp Su | `bracts`: a soft woolly star, grey-green tips | 0.3–0.5 | Cream white |
| `grevillea` | Grevillea | Australia | Wi Sp Su Au | `brush`: a one-sided curled comb; `bush`, ferny leaves | 0.6–0.9 | Red, pink, orange |
| `geraldton-wax` | Geraldton wax (Chamelaucium uncinatum) | Western Australia | Wi Sp | `cloud` of small waxy five-petalled flowers; `bush`, `needle` leaves | 0.6–0.9 | Pink, white, purple |
| `cooktown-orchid` | Cooktown orchid (Dendrobium bigibbum) | Queensland | Au | `orchid` `star`, an arching spray | 0.3–0.45 | Purple-pink, white |
| `swan-river-daisy` | Swan River daisy (Brachyscome iberidifolia) | Western Australia | Sp Su | small `radial`, `feathery` leaves, a low mound | 0.15–0.25 | Blue, violet, white |
| `kowhai` | Kōwhai (Sophora microphylla) | New Zealand | Sp | `arch` with hanging `tube` florets; small `bush` (a tree at home) | 0.9–1.2 | Golden yellow |
| `mount-cook-lily` | Mount Cook lily (Ranunculus lyallii) | New Zealand's alps | Su | `radial`, white with a gold centre; big round leaves | 0.5–0.7 | White |
| `hebe` | Hebe (Veronica speciosa) | New Zealand | Su Au | short `spike`s on a neat `bush` | 0.4–0.6 | Purple, pink, white |
| `pohutukawa` | Pōhutukawa (Metrosideros excelsa) | New Zealand | Su | `brush`: a dome of stamens; `bush`, grey-backed leaves (a tree at home) | 0.9–1.2 | Crimson |
| `tiare` | Tiare (Gardenia taitensis) | The Pacific islands | Su | `radial` pinwheel of seven petals; `bush`, `glossy` | 0.6–0.9 | White |

### 4.3 East Asia (17) — story 12.6

| id | Name | Native to | Blooms | Shape | Height | Colours and notes |
|---|---|---|---|---|---|---|
| `camellia` | Camellia (Camellia japonica) | Japan, China, Korea | Wi Sp | `bush`, `glossy`, with domed `radial` blooms (formal doubles and gold-centred singles) | 0.8–1.1 | Red, pink, white, pink striped white |
| `azalea` | Azalea (Rhododendron indicum) | Japan | Sp | `bush` hidden under small `trumpet`s | 0.5–0.75 | Pink, magenta, white, coral, purple |
| `japanese-iris` | Japanese iris (Iris ensata) | Japan, China, Korea | Su | `aquatic` flag type with broad flat falls; zone `bank` | 0.6–0.85 | Purple, white, blue veined white |
| `spider-lily` | Red spider lily (Lycoris radiata) | China and Korea | Au | `spider`, bare stem, no leaves in bloom | 0.4–0.55 | Red, white, yellow |
| `balloon-flower` | Balloon flower (Platycodon grandiflorus) | East Asia | Su | `cup` opening to a five-point star; puffed balloon buds | 0.4–0.6 | Blue-violet, white, pink |
| `astilbe` | Astilbe | China and Japan | Su | `brush` plume, feathery and tapering; ferny leaves | 0.5–0.75 | Pink, white, red, lilac |
| `toad-lily` | Toad lily (Tricyrtis hirta) | Japan | Au | `arch` with small upturned `orchid`-like stars, `spots` | 0.4–0.6 | White spotted purple |
| `cymbidium` | Cymbidium (Cymbidium goeringii) | China, Japan, Korea | Wi Sp | `orchid` `star` on upright spikes; `strap` leaves | 0.4–0.6 | Green, pink, white, yellow |
| `chinese-lantern` | Chinese lantern (Physalis alkekengi) | Southern Europe to Japan | Au | `arch` hung with papery `lantern`s | 0.4–0.6 | Orange |
| `quince` | Flowering quince (Chaenomeles) | China and Japan | Wi Sp | `bush`, bare angular branches, small `cup` blossoms | 0.7–1.0 | Scarlet, coral, white |
| `tiger-lily` | Tiger lily (Lilium lancifolium) | China, Japan, Korea | Su | `radial` with `nod`, petals curled right back, `spots`, long stamens | 0.9–1.2 | Orange spotted black |
| `candelabra-primrose` | Candelabra primrose (Primula japonica) | Japan | Sp | tiers of whorls up a bare stem (`spike` in rings); `rosette`; zone `bank` | 0.35–0.5 | Magenta, pink, white |
| `fuji-cherry` | Fuji cherry (Prunus incisa 'Kojo-no-mai') | Japan | Sp | `bush`, zigzag bare twigs smothered in five-petalled blossom | 0.8–1.1 | Blush white, pale pink |
| `spider-mum` | Spider chrysanthemum | Bred in Japan and China | Au | `radial`, long quilled petals hooked at the tips, in a loose mop | 0.5–0.7 | Gold, white, bronze, pink |
| `gardenia` | Gardenia (Gardenia jasminoides) | Southern China and Japan | Su | `bush`, `glossy`, double `radial` blooms | 0.6–0.9 | White aging to cream |
| `hakone-grass` | Hakone grass (Hakonechloa macra) | Japan | (foliage) | `foliage` grass, arching all one way like a waterfall | 0.3–0.4 | Gold striped green, lime |
| `painted-fern` | Japanese painted fern (Athyrium niponicum) | East Asia | (foliage) | `foliage` fern | 0.3–0.4 | Silver with plum midribs |

### 4.4 South & Southeast Asia (15) — story 12.7

| id | Name | Native to | Blooms | Shape | Height | Colours and notes |
|---|---|---|---|---|---|---|
| `blue-poppy` | Himalayan blue poppy (Meconopsis betonicifolia) | Tibet and the eastern Himalaya | Su | `radial`, four crinkled petals, a boss of gold stamens, slightly nodding | 0.6–0.9 | Sky blue |
| `rhododendron` | Rhododendron (Rhododendron arboreum) | The Himalaya (Nepal's national flower) | Sp | `bush`, `long` dark leaves, big `cluster` trusses of trumpets | 0.9–1.2 | Red, pink, white, purple |
| `moth-orchid` | Moth orchid (Phalaenopsis amabilis) | Indonesia and the Philippines | Wi Sp | `orchid` `moth`, an arching spray; broad `rosette` | 0.4–0.55 | White, pink, pink-striped, yellow |
| `vanda` | Blue vanda (Vanda coerulea) | North-east India to Thailand | Au | `orchid` `star`, upright; `strap` leaves in a ladder | 0.5–0.7 | Blue-violet chequered, pink |
| `hibiscus` | Hibiscus (Hibiscus rosa-sinensis) | Tropical Asia (its wild home is uncertain) | Su Au | `bush`, `glossy`, big `trumpet`s with a long column | 0.9–1.2 | Red, pink, yellow, orange, white |
| `jasmine` | Arabian jasmine (Jasminum sambac) | India and Bhutan | Su | `bush`, small white stars and doubles | 0.5–0.8 | White, cream |
| `torch-ginger` | Torch ginger (Etlingera elatior) | Indonesia and Malaysia | Su | `bracts`: a waxy cone on a bare stalk; `paddle` leaves on separate canes | 1.0–1.3 | Pink, red |
| `ixora` | Ixora (Ixora coccinea) | Southern India and Sri Lanka | Su Au | `bush` with `cluster` domes of four-petalled stars | 0.5–0.8 | Scarlet, orange, pink, yellow |
| `cockscomb` | Cockscomb (Celosia argentea) | India (perhaps tropical Africa) | Su Au | `brush`: a flame plume, or a velvety crest | 0.3–0.5 | Red, magenta, gold, orange |
| `ginger-lily` | White ginger lily (Hedychium coronarium) | The Himalaya and India | Su Au | `spike` of butterfly-shaped flowers; `paddle` leaves up the stem | 0.9–1.2 | White, pale yellow, orange |
| `drumstick-primula` | Drumstick primula (Primula denticulata) | The Himalaya | Sp | `cluster` globe on a stout stem; `rosette` | 0.2–0.3 | Lilac, white, crimson |
| `cobra-lily` | Cobra lily (Arisaema) | The Himalaya | Sp Su | `spathe`: a striped hood with a whip tip | 0.4–0.6 | Green striped purple, striped white |
| `siam-tulip` | Siam tulip (Curcuma alismatifolia) | Thailand, Laos, Cambodia | Su | `bracts`, tulip-shaped on a stalk; `paddle` leaves | 0.5–0.7 | Pink, white |
| `balsam` | Garden balsam (Impatiens balsamina) | India and Myanmar | Su | `spike`: double flowers tucked along a leafy stem | 0.4–0.6 | Pink, red, white, purple |
| `pagoda-flower` | Pagoda flower (Clerodendrum paniculatum) | Tropical Asia | Su | a tiered cone of small flowers (`cluster` in a pyramid); big lobed leaves | 0.9–1.2 | Orange-red |

### 4.5 Mexico, Central America & the Caribbean (14) — story 12.8

| id | Name | Native to | Blooms | Shape | Height | Colours and notes |
|---|---|---|---|---|---|---|
| `poinsettia` | Poinsettia (Euphorbia pulcherrima) | Mexico | Au Wi | `bracts`: a flat star of leaf-like bracts round tiny yellow beads; `bush` | 0.6–0.9 | Red, cream, pink, pink marbled cream |
| `frangipani` | Frangipani (Plumeria rubra) | Mexico and Central America | Su Au | `bush`: stubby bare branches, leaves at the tips, pinwheel blooms | 0.9–1.2 | White with a yellow heart, pink, sunset |
| `tithonia` | Mexican sunflower (Tithonia rotundifolia) | Mexico | Su Au | `radial` | 0.9–1.2 | Vivid orange |
| `chocolate-cosmos` | Chocolate cosmos (Cosmos atrosanguineus) | Mexico | Su Au | `radial`, eight velvety petals | 0.4–0.6 | Dark maroon |
| `tuberose` | Tuberose (Agave amica) | Mexico | Su Au | `spike` of waxy tubular stars, buds flushed pink | 0.7–0.95 | White |
| `tiger-flower` | Tiger flower (Tigridia pavonia) | Mexico | Su | `radial`: three broad petals round a spotted cup; `sword` leaves | 0.4–0.55 | Red, yellow, pink, white, orange |
| `globe-amaranth` | Globe amaranth (Gomphrena globosa) | Central America | Su Au | small `pincushion`, clover-like, no frill | 0.3–0.45 | Magenta, purple, white, orange |
| `lantana` | Lantana (Lantana camara) | Central America and the Caribbean | Su Au | low `bush`, small flat `cluster`s that are two colours at once | 0.4–0.6 | Yellow turning pink, orange turning red |
| `bush-sage` | Mexican bush sage (Salvia leucantha) | Mexico | Au | arching velvety `spike`s | 0.7–0.95 | Purple with white |
| `heliconia` | Lobster claw (Heliconia bihai) | The Caribbean and tropical America | Su | `crane`: an upright zigzag of beaks; `paddle` leaves | 1.0–1.3 | Red edged yellow |
| `peacock-flower` | Pride of Barbados (Caesalpinia pulcherrima) | The Caribbean (Barbados' national flower) | Su Au | `bush`, `feathery` leaves, heads of crinkled flowers with long red stamens (`spider`) | 0.9–1.2 | Orange and yellow, red |
| `guaria-morada` | Guaria morada (Guarianthe skinneri) | Costa Rica (its national flower) | Wi Sp | `orchid` `cattleya` | 0.3–0.45 | Purple-pink, white |
| `ageratum` | Floss flower (Ageratum houstonianum) | Mexico and Central America | Su Au | fluffy `cluster` domes, a low mound | 0.15–0.25 | Blue, lavender, white, pink |
| `canna` | Canna (Canna indica) | Central and South America, the Caribbean | Su Au | a `spike` of ruffled blooms over tall `paddle` leaves (green or bronze) | 1.0–1.3 | Red, orange, yellow, salmon |

### 4.6 South America (16) — story 12.9

| id | Name | Native to | Blooms | Shape | Height | Colours and notes |
|---|---|---|---|---|---|---|
| `passion-flower` | Passion flower (Passiflora caerulea) | Brazil, Argentina, Paraguay | Su Au | `radial`, flat, with a banded `fringe` and raised stamens; a scrambling mound with tendrils | 0.4–0.6 | White with a blue and purple fringe |
| `alstroemeria` | Peruvian lily (Alstroemeria) | Chile and Brazil | Su | `cluster` of small streaked trumpets | 0.5–0.8 | Pink, orange, yellow, red, white, purple |
| `amaryllis` | Amaryllis (Hippeastrum) | Brazil and the Andes | Wi Sp | two to four huge `trumpet`s on a thick bare stem; `strap` leaves | 0.45–0.6 | Red, white, pink, red striped white |
| `bougainvillea` | Bougainvillea | Brazil | Su Au | `bush`, arching, smothered in papery three-part `bracts` | 0.9–1.2 | Magenta, purple, orange, white, coral |
| `angels-trumpet` | Angel's trumpet (Brugmansia) | The Andes | Su Au | `bush` with long hanging `trumpet`s | 1.0–1.3 | White, peach, yellow, pink |
| `begonia` | Tuberous begonia | The Andes | Su Au | domed `radial`, ruffled; lopsided leaves | 0.2–0.32 | Red, orange, yellow, pink, white |
| `anthurium` | Anthurium (Anthurium andraeanum) | Colombia and Ecuador | Sp Su Au | `spathe`: a flat glossy heart; `heart` leaves | 0.35–0.5 | Red, pink, white, green |
| `bromeliad` | Scarlet star (Guzmania lingulata) | Central and South America | Su | `bracts`: a star torch in a `strap` rosette | 0.3–0.45 | Red, orange, yellow, pink |
| `slipper-flower` | Slipper flower (Calceolaria) | Chile and the Andes | Sp Su | `cluster` with `pouch` florets, `spots` | 0.2–0.32 | Yellow, orange, red spotted |
| `cantua` | Cantua (Cantua buxifolia) | Peru and Bolivia (sacred flower of the Incas) | Sp | `arch`, long hanging `tube` florets; `bush`, `small` leaves | 0.9–1.2 | Magenta, red with yellow |
| `copihue` | Chilean bellflower (Lapageria rosea) | Chile (its national flower) | Su Au | `arch` with large waxy `bell`s | 0.6–0.9 | Red, pink, white |
| `four-oclock` | Marvel of Peru (Mirabilis jalapa) | Peru | Su Au | `bush` with small `trumpet`s, several colours on one plant | 0.5–0.7 | Magenta, yellow, white, splashed |
| `scarlet-sage` | Scarlet sage (Salvia splendens) | Brazil | Su Au | dense `spike`, the calyx as bright as the flower | 0.3–0.45 | Scarlet, purple, salmon, white |
| `cleome` | Spider flower (Cleome hassleriana) | Argentina, Paraguay, southern Brazil | Su Au | `spider` in a tall open globe | 0.9–1.2 | Pink, white, purple |
| `moss-rose` | Moss rose (Portulaca grandiflora) | Argentina, Brazil, Uruguay | Su | ruffled `cup`; `succulent` needle leaves, a mat | 0.08–0.12 | Pink, yellow, orange, red, white |
| `victoria` | Giant water lily (Victoria amazonica) | The Amazon | Su | `aquatic` `victoria`; zone `deep` | 0.1–0.16 | White on its first evening, pink on its second |

### 4.7 North America (17) — story 12.10

| id | Name | Native to | Blooms | Shape | Height | Colours and notes |
|---|---|---|---|---|---|---|
| `california-poppy` | California poppy (Eschscholzia californica) | California | Sp Su | silky `cup`; `feathery` blue-green leaves | 0.2–0.35 | Orange, gold, cream, pink |
| `bluebonnet` | Texas bluebonnet (Lupinus texensis) | Texas | Sp | short `spike`, white-tipped | 0.25–0.4 | Blue |
| `columbine` | Rocky Mountain columbine (Aquilegia caerulea) | The Rockies | Sp Su | `radial` with long `spurs`, nodding a little | 0.4–0.6 | Blue and white, red and yellow, pink, yellow |
| `trillium` | Trillium (Trillium grandiflorum) | Eastern woods | Sp | three petals above three broad leaves | 0.2–0.32 | White aging pink, deep red |
| `bee-balm` | Bee balm (Monarda didyma) | Eastern North America | Su | shaggy `pincushion`: a ragged crown of tubes | 0.6–0.9 | Scarlet, pink, purple |
| `blazing-star` | Blazing star (Liatris spicata) | The prairies | Su Au | `brush` spire, fluffy, opening from the top down | 0.6–0.9 | Purple, white |
| `butterfly-weed` | Butterfly weed (Asclepias tuberosa) | Eastern and southern USA | Su | flat `cluster` | 0.4–0.6 | Orange, yellow; butterflies favour it |
| `cardinal-flower` | Cardinal flower (Lobelia cardinalis) | Streamsides | Su Au | `spike`; zone `bank` | 0.7–1.0 | Scarlet; hummingbirds favour it |
| `coreopsis` | Tickseed (Coreopsis lanceolata) | The prairies and the east | Su | `radial`, notched tips | 0.35–0.5 | Yellow, gold with a maroon eye |
| `penstemon` | Penstemon | The West | Su | `spike` of tubular bells | 0.5–0.75 | Red, pink, purple, blue, white |
| `virginia-bluebells` | Virginia bluebells (Mertensia virginica) | Eastern woods | Sp | `arch` with `bell`s; pink buds, blue flowers | 0.3–0.45 | Blue with pink |
| `ladys-slipper` | Showy lady's slipper (Cypripedium reginae) | The Great Lakes and north-east | Sp Su | `orchid` `slipper`; pleated leaves | 0.3–0.45 | Pink pouch, white petals |
| `paintbrush` | Indian paintbrush (Castilleja) | The West | Sp Su | `brush`-like spike of scarlet-tipped bracts | 0.25–0.4 | Red, orange, magenta |
| `mexican-hat` | Mexican hat (Ratibida columnifera) | The Great Plains | Su | `radial`, drooping, with a tall `cone` | 0.4–0.6 | Yellow, mahogany edged yellow |
| `yucca` | Adam's needle (Yucca filamentosa) | The south-east | Su | a tall `spike` of hanging bells over a `sword` rosette | 1.0–1.3 | Cream white |
| `mountain-laurel` | Mountain laurel (Kalmia latifolia) | Eastern mountains | Sp Su | `bush`, `glossy`, `cluster` domes of little cups | 0.8–1.1 | Pale pink, white, deep pink buds |
| `american-lotus` | American lotus (Nelumbo lutea) | The Mississippi basin | Su | existing `aquatic` lotus; zone `deep` | 0.5–0.7 | Pale yellow |

### 4.8 Mediterranean & Western Asia (15) — story 12.11

| id | Name | Native to | Blooms | Shape | Height | Colours and notes |
|---|---|---|---|---|---|---|
| `crown-imperial` | Crown imperial (Fritillaria imperialis) | Turkey to Persia | Sp | `crown` | 0.8–1.05 | Orange, yellow, red |
| `oleander` | Oleander (Nerium oleander) | The Mediterranean | Su Au | `bush`, `long` grey-green leaves, loose `cluster`s of pinwheels | 0.9–1.2 | Pink, white, red, apricot |
| `nigella` | Love-in-a-mist (Nigella damascena) | The Mediterranean | Su | `radial` in a green thread `fringe`; `feathery` leaves; puffed seed pods | 0.35–0.5 | Blue, white, pink |
| `rock-rose` | Rock rose (Cistus) | The Mediterranean | Sp Su | low `bush`; crinkled five-petalled blooms with a maroon `blotch` | 0.5–0.75 | White, pink |
| `foxtail-lily` | Foxtail lily (Eremurus) | Central Asia and Persia | Su | a very tall tapering `brush` spire; `strap` leaves | 1.1–1.4 | Apricot, yellow, white, pink |
| `damask-rose` | Damask rose (Rosa × damascena) | The Middle East | Sp Su | existing `rose` (cabbage type, looser, in clusters) | 0.6–0.85 | Pink, white |
| `oriental-poppy` | Oriental poppy (Papaver orientale) | The Caucasus and Persia | Sp Su | big `radial`, crinkled, black `blotch`; hairy leaves | 0.6–0.85 | Scarlet, salmon, white, plum |
| `windflower` | Poppy anemone (Anemone coronaria) | The Mediterranean | Sp | `radial` with a black centre | 0.25–0.38 | Red, blue, violet, white, pink |
| `madonna-lily` | Madonna lily (Lilium candidum) | The eastern Mediterranean | Su | `trumpet`s facing outward up a tall stem | 0.8–1.1 | White |
| `acanthus` | Bear's breeches (Acanthus mollis) | The Mediterranean | Su | a tall `spike` of hooded flowers; big glossy lobed `rosette` | 0.9–1.2 | White under purple hoods |
| `persian-lily` | Persian lily (Fritillaria persica) | Persia and Turkey | Sp | `spike` of dusky bells | 0.7–0.95 | Plum, ivory |
| `squill` | Siberian squill (Scilla siberica) | The Caucasus and Turkey | Wi Sp | tiny nodding `spike` | 0.08–0.14 | Bright blue, white |
| `candytuft` | Candytuft (Iberis sempervirens) | Southern Europe | Sp | flat `cluster`s on a low evergreen mat | 0.15–0.25 | White |
| `stock` | Stock (Matthiola incana) | Mediterranean coasts | Sp Su | dense `spike` of doubles; grey leaves | 0.35–0.5 | Pink, purple, white, cream |
| `statice` | Statice (Limonium sinuatum) | The Mediterranean | Su Au | flat papery `cluster`s on winged stems | 0.4–0.6 | Purple, yellow, pink, white, blue |

### 4.9 Europe (14) — story 12.12

| id | Name | Native to | Blooms | Shape | Height | Colours and notes |
|---|---|---|---|---|---|---|
| `edelweiss` | Edelweiss (Leontopodium nivale) | The Alps | Su | `bracts`: a woolly star | 0.1–0.18 | White-grey |
| `gentian` | Trumpet gentian (Gentiana acaulis) | The Alps | Sp Su | upright stemless `trumpet` | 0.06–0.1 | Deep blue |
| `pasque-flower` | Pasque flower (Pulsatilla vulgaris) | Europe's chalk grassland | Sp | silky `cup`, gold boss; `feathery`, hairy; plumed seed heads | 0.15–0.25 | Purple, red, white |
| `harebell` | Harebell (Campanula rotundifolia) | Europe | Su | `arch` of `bell`s on wiry stems | 0.3–0.5 | Blue, white |
| `cowslip` | Cowslip (Primula veris) | Europe's meadows | Sp | a one-sided nodding umbel on a bare stem; `rosette` | 0.15–0.25 | Yellow |
| `snakes-head` | Snake's head fritillary (Fritillaria meleagris) | Europe's water meadows | Sp | a single hanging `cup` with `chequer` | 0.2–0.3 | Chequered purple, white |
| `thrift` | Thrift (Armeria maritima) | Europe's coasts | Sp Su | small `cluster` globes on bare stems over a grassy tuft | 0.12–0.2 | Pink, white |
| `sea-holly` | Sea holly (Eryngium alpinum) | The Alps | Su | `bracts`: a spiky steel-blue ruff round a cone | 0.5–0.75 | Steel blue, silver |
| `autumn-crocus` | Autumn crocus (Colchicum autumnale) | Europe | Au | leafless `cup` | 0.1–0.16 | Lilac, white |
| `wood-anemone` | Wood anemone (Anemone nemorosa) | Europe's woods | Sp | small `radial`, six petals, in carpets | 0.08–0.14 | White, flushed pink |
| `pinks` | Cottage pink (Dianthus plumarius) | Central and eastern Europe | Su | `radial` with fringed tips and a darker eye; grey grassy leaves | 0.2–0.32 | Pink, white, crimson laced |
| `astrantia` | Masterwort (Astrantia major) | Europe's mountains | Su | existing `pincushion` in a papery ruff | 0.45–0.65 | Pink, white, ruby |
| `lilac` | Lilac (Syringa vulgaris) | The Balkans | Sp | `bush`, heart leaves, cone-shaped `spike` panicles | 0.9–1.2 | Lilac, white, purple |
| `sweet-violet` | Sweet violet (Viola odorata) | Europe | Wi Sp | small tilted `radial`; `heart` leaves | 0.06–0.1 | Violet, white |

## 5. Left out on purpose (parking lot)

Trees (cherry, magnolia, jacaranda, wattle at full size), kitchen herbs (rosemary, saffron as a
crop), giants and oddities (titan arum, rafflesia, bat flower), and climbers that need a fence to
make sense (morning glory, jasmine vines, trumpet vine). Climbers could join the fence climbers
later as their own story.
