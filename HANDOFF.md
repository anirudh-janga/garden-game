# Handoff notes — Milestone 9 (smooth everywhere)

Written 10 Nov 2026, part-way through story 9.2. Read `CLAUDE.md` and the Status section of
`BACKLOG.md` first; this file is the detail behind them. Delete it once Milestone 9 is done.

## 1. Where things stand

| Story | State |
|---|---|
| 9.1 No shader hitches | Done, merged (PR #33), live. Awaiting the player's review. |
| 9.2 Draw only what's on screen | **In progress.** Code written and pushed on branch `story/9.2-draw-whats-on-screen` (one commit). Not yet measured, not merged. See section 4. |
| 9.3 Real far shapes | Not started. Plan in section 5. |
| 9.4 Faster undo | Not started. Plan in section 6. |
| 9.5 Fewer draw calls | Not started. Plan in section 7. |

The player's instruction: "add stories and implement them one by one until all are done". Earlier
standing instruction: one PR per story, merge it, deploy, don't stop to ask between stories.

Live site: https://anirudh-janga.github.io/garden-game/ (the old `asrijanga.github.io` address is
dead). The repository moved to `anirudh-janga/garden-game`; the old name still redirects.

## 2. How to ship a story

1. `git checkout master && git pull origin master && git checkout -b story/9.x-short-name`
2. Do the work. Run the checks in section 3.
3. Update `BACKLOG.md`: the story's row in the status table (🔨 → 👀 with a plain-English summary
   and the measured numbers), the "Current stories" line, and the Feedback log if the player said
   something. `tools/ship/bl.py` helps (`row`, `status`, `log`).
4. Commit as the repo owner (`git config user.name "Anirudh"`,
   `git config user.email "7342625+anirudh-janga@users.noreply.github.com"`), ending the message
   with the co-author and session trailer lines the session's instructions give.
   `tools/ship/commit.sh "Subject" "Body"` does type-check + build + commit + push; it needs
   `COAUTHOR` (and optionally `SESSION_URL`) in the environment.
5. Open a PR into `master` with the GitHub MCP tool (`mcp__github__create_pull_request`), then
   merge it (`mcp__github__merge_pull_request`, method `merge`). Use the owner/repo the session's
   GitHub scope lists (it was `asrijanga/garden-game` in the last session; a new session may list
   `anirudh-janga/garden-game`). There is no `gh` CLI.
6. Deploy: `tools/ship/deploy.sh` (pulls master, builds, pushes `master:main`, waits until the
   live site serves the new `index-*.js`). Only pushes to `main` deploy.
7. Never force-push or rewrite history. No model names in commits' subject/body, PRs or code.

## 3. Test tools (`tools/perf/`)

All run headless Chromium with software rendering (SwiftShader). **Triangle counts, draw-call
counts and "is it identical" checks are exact. Timings are not phone timings**: frame times are
dominated by the software renderer, and script times are for this VM.

Serve a build first, from the repo root:

```
npm run build && (npx vite preview --port 4173 --strictPort > /dev/null 2>&1 &)
```

`vite preview` serves `dist/`: do not rebuild while a test is running. Stop it with
`fuser -k 4173/tcp`. To compare two versions, build each into its own folder
(`npx vite build --outDir /tmp/build-a`), serve each with `python3 -m http.server <port>` from
that folder, and pass `PORT=<port>` to the script.

| Script | What it tells you |
|---|---|
| `worldfp.cjs` | A fingerprint of every built instance (position, scale, colour, per shape), independent of which mesh holds it. `GARDEN=user OUT=/tmp/a.txt node tools/perf/worldfp.cjs` (the player's garden) or `GARDEN=test` (a small garden with every kind of thing). Diff against `baselines/world-user-9.1.txt` / `world-test-9.1.txt`: identical means nothing moved, vanished or changed colour. |
| `shapefp.ts` | A fingerprint of every flower/leaf shape (near and far). `npx esbuild tools/perf/shapefp.ts --bundle --platform=node --outfile=/tmp/shapefp.cjs --log-level=error && node /tmp/shapefp.cjs > /tmp/shapes.txt`, diff against `baselines/shapes-9.1.txt` (each line: key, near hash/vertex count, far hash/vertex count). |
| `triangles.cjs` | Player's garden: draw calls and triangles per frame at four camera positions, and how much of what's built is truly in view. |
| `overview.cjs` | Player's garden at full zoom-out: draw calls, triangles, and a breakdown by system (flowers, stones, vines…). |
| `cpu.cjs` | Player's garden: script ms per frame (idle, painting flowers, panning) with the top functions, and what one undo costs (`rebuildInstantly`). |
| `shaders-run.sh` | The 9.1 test: from an empty garden, does everything once and lists each shader program built after the loading screen. Takes about 8 minutes; output is buffered, so redirect it to a file. Expected result today: `TOTAL built mid-play: 1`. |
| `interact.cjs` | Touch regression: pan, draw a path, plant flowers, undo, redo, tap the cottage, admire, take a picture. Expect `pan moved camera …`, `after path: actions 1`, `after flowers: actions 2`, `after undo: actions 1 world flowers 0`, `after redo: actions 2`, `cottage panel open true`, `admire off true`, `done`, and no `pageerror` lines. |
| `smoke.cjs` | Loads the player's garden, taps a bed, reports page errors, saves `smoke.png` in the current folder. |
| `probe.cjs` | Just loads the game and reports page errors and load time. |
| `waterdens.cjs` | Water-flower density in a test pond (from the "denser water flowers" change). |

`garden-link.txt` is the player's own shared garden (274 strokes, about 2,900 flower plants,
13,674 built instances): the garden that was "unusable and janky". Measure against it.

Inside the world worker, `?debug` exposes globals for `worker.evaluate(...)`: `renderer`, `scene`,
`camera`, `rig`, `post`, `flowers`, `stones`, `fences`, `vines`, `edgePlants`, `pondPlants`,
`boulders`, `props`, `ponds`, `cottage`, `THREE`, `rebuildInstantly()` and more (see the
`if (debug) Object.assign(globalThis, …)` lines in `src/engine/world.ts`). The worker is
`page.workers()[0]`. `?q=0…7` pins a quality tier; `?main` runs the world on the page.

### Baseline numbers (master after 9.1, player's garden)

- Full zoom-out: 468 draw calls, 2.56M triangles per frame. Flowers 906k in 163 draws; forest,
  ground and the rest 312k in 74; stones 287k in 15; vines 148k in 7; fences 117k in 28; edge
  plants 70k in 2; ponds 65k in 32; pond plants 58k in 7; wildflowers 32k in 1.
- Mid zoom (distance 20): 358 calls, 2.39M triangles. Close zoom (distance 9): 155–183 calls,
  1.61–1.63M triangles, of which only 0.14–0.25M of the built things are actually in view.
- Built things total 1.69M triangles; with every flower on its far shape 1.62M (far shapes are only
  about 4% lighter).
- Script: 6–7 ms per frame idle or panning (mostly three.js issuing draw calls).
- One undo (`rebuildInstantly`): 2.2–2.4 s.
- Shader programs at the end of loading: 51.

## 4. Story 9.2 — finish it

### What's done (branch `story/9.2-draw-whats-on-screen`)

- `src/render/patches.ts`: `Patches` keeps one kind of instanced thing as a mesh per 10 m patch of
  ground (`PATCH = 10`). `at(x, z)` returns the mesh for that patch with room for one more
  instance (a full patch gets another mesh; `reset()` empties them and keeps the meshes as spares).
  One mesh is made up front, hidden, so its shader is compiled behind the loading screen.
  `sharedGeometry(base)` makes a geometry that shares `base`'s vertex buffers but can take its own
  per-instance attributes. Never dispose one (the shared buffers would go with it).
- Converted to `Patches`: `flowers.ts` (species variants, leaf kinds, foliage clumps),
  `stones.ts`, `fences.ts`, `vines.ts`, `edgePlants.ts`, `pondPlants.ts`. Each already stored
  `{ mesh, index }` per instance (vines now does too), so only "which mesh does this go in"
  changed. Per-mesh capacities are now per patch (e.g. flowers 256, was 1500 garden-wide).
- Culling itself is the existing `GardenBounds` (`src/render/cull.ts`): it gives every instanced
  mesh under those groups a bounding sphere round its instances and turns on three's frustum
  culling. Before, each mesh spanned the garden, so it rarely culled anything.
- Flower level-of-detail (`Flowers.updateDetail`) is per mesh, so it is now per patch too.
- Not converted (small): boulders (2k triangles), props (4k), wildflowers (32k, one mesh).

### Verified so far

- `npx tsc --noEmit` passes.
- `worldfp.cjs` on both gardens is **identical** to the 9.1 baselines (13,674 and 1,938 instances):
  every plant, stone and fence piece is where it was, same colour.

### Still to do, in order

1. `git checkout story/9.2-draw-whats-on-screen && git merge origin/master` (this file and
   `tools/` landed on master after the branch was cut).
2. Re-run `worldfp.cjs` (both gardens) to confirm it's still identical after the merge.
3. Measure: `node tools/perf/triangles.cjs` and `node tools/perf/overview.cjs`, compare with the
   baseline numbers above. Expect triangles at close zoom to fall a lot (the target is "roughly
   what's in view"); expect **draw calls at full zoom-out to rise** (more, smaller meshes). Record
   both honestly in the backlog row. If draw calls at full zoom-out more than roughly double,
   consider a larger `PATCH` (15–20 m) for the sparse kinds, or leave it for 9.5 and say so.
4. `tools/perf/shaders-run.sh > /tmp/shaders.log` — must still report at most 1 program built
   mid-play. If flower or stone shaders reappear in the list, the up-front mesh in `Patches` isn't
   reaching the warm-up (check it is added to the scene group inside `make`).
5. `node tools/perf/interact.cjs` (expected output in section 3) and `node tools/perf/smoke.cjs`
   (no page errors).
6. Things `worldfp.cjs` does not cover; check them by hand with a short script or screenshots:
   - **Erasing**: erase across flowers, stones and a fence, and confirm the right pieces wilt
     (each system writes to `p.mesh` at `p.index`; a wrong mesh would shrink the wrong plant).
   - **Undo/redo several times**: `Patches.reset()` reuses spare meshes for different patches;
     after undo + redo the `worldfp` output must equal the baseline again.
   - **Edges of the screen while panning**: take screenshots at close zoom at a few camera
     positions and look for patches missing at the screen edge (pop-in). `GardenBounds` pads the
     sphere by 10% + 0.3 m; widen it if tall plants at a patch edge get clipped.
   - **Shadows**: stones, fences and reeds cast shadows; a caster that is off screen must still
     cast onto the screen (it should: the shadow pass culls against the light's own frustum).
7. Backlog row for 9.2 → 👀 with the measured before/after numbers; commit; PR; merge; deploy.

## 5. Story 9.3 — real far shapes (plan)

**Problem.** At full zoom-out every flower already uses its "far" shape and flowers still cost
906k triangles: far shapes are only about 4% lighter than near ones (the near shapes were slimmed
in an earlier fix, the far ones never caught up). Stones, vines and fences have no far shape.

**How shapes are built** (`src/world/flowers.ts`). `withFar(build)` builds each shape twice from
the same seed, the second time with the module variable `detail = 'far'`; builders test `isFar()`.
Today that only thins stems (2 segments, 3 sides) and picks the 6-triangle petal
(`lightPetals()`), which crowded heads already use near. `makeMesh` stores
`mesh.userData.lod = { near, far }`, and `updateDetail(cameraPosition)` swaps `mesh.geometry`
when the camera is further than `FAR_DETAIL` (45 m) from the mesh's bounding sphere.

**Plan.**
1. Make far shapes truly lighter (aim: at most 25–30% of the near triangles). In the `isFar()`
   paths: fewer petals per head and one layer, no sepals, at most one stem leaf, roses with far
   fewer petals and leaves, every other floret on spikes and clusters, centres as low-poly
   blobs. Keep calling `rng()` the same number of times where practical, so the far plant has the
   same height, lean and overall silhouette as the near one.
2. Pick the switch distance by looking, not by guessing: with patches (9.2) the swap is per
   patch. Take side-by-side screenshots at the distance where it switches; if you can see it pop,
   move the threshold out. `rig.minDistance` is 9; print `rig.maxDistance` for the phone
   viewport to see the range.
3. Stepping stones are the next biggest (287k): add a far stone (about a 12-point outline, no
   bevel) and give stone meshes the same `userData.lod` treatment. It is worth moving the swap
   loop out of `Flowers` into a small shared helper so stones (and later fence pickets, 117k,
   and vine leaves, 148k) can use it.
4. Checks: `shapefp.ts` — the **near** hashes must match `baselines/shapes-9.1.txt` (only far
   hashes change); `worldfp.cjs` identical; `overview.cjs` before/after; before/after pictures
   at full zoom-out sent to the player, since this one changes how things look from afar.

## 6. Story 9.4 — faster undo (plan)

**Problem.** `undo` in `src/engine/world.ts` calls `rebuildInstantly(actions)`, which resets every
system and replays every remaining stroke: 2.2–2.4 s on the player's 274-stroke garden. (Redo
just replays one stroke and is already fast.)

**Plan.**
1. **Profile before designing.** `cpu.cjs` prints the total; wrap a `Profiler.start/stop` round a
   `rebuildInstantly()` call (the script already has the CDP plumbing) to see which systems the
   time goes to: stroke replay itself, the settle loop (up to 120 steps of
   stones/fences/ponds/paint updates), pond digging, ground paint, wildflower clearing.
2. Cheapest first: fix the hot spots the profile shows. A target of a few hundred ms may be
   reachable this way with no new machinery.
3. If that isn't enough, undo by truncation for the common simple strokes: before each action,
   each system records a mark (instance counts per mesh, list lengths, its rng state); undoing the
   *last* action restores the marks. This only works for strokes with no destructive side effects
   on other things. Flower strokes and props are candidates; erase, ponds (terrain), paths
   (they lift stones and clear wildflowers) and anything that removes or repaints are not: keep
   the full rebuild for those.
4. Full checkpoints (snapshot every N strokes) are parked in the backlog's parking lot as "large":
   they need exact save/restore for about 19 systems.
5. The guarantee to keep: after an undo, the garden is exactly what it was before the stroke.
   Check with `worldfp.cjs`: (replay N strokes) must equal (replay N+1 strokes, then undo).

## 7. Story 9.5 — fewer draw calls (plan)

**Problem.** 468 draw calls per frame at full zoom-out (before 9.2; 9.2 will add more), and 6–7 ms
of script per frame, mostly three.js issuing them.

**Where they are** (before 9.2): flowers 163, forest/ground/other 74, ponds 32, fences 28,
cottage 20, stones 15, boulders 10, vines 7, pond plants 7.

**Options, cheapest first.**
1. Flower shape variants: `VARIANTS = 5` per species in `flowers.ts`. Three would cut flower
   draws by 40%. Plants keep their place and colour; some take a different one of the species'
   shapes (`variant % VARIANTS`), so `worldfp` shape keys change but instance totals must not.
2. After 9.2, sparse kinds split into many tiny patch meshes: give `Patches` a larger patch for
   kinds that are sparse, or keep one garden-wide mesh until a kind passes a threshold.
3. Ponds: 32 meshes for 65k triangles; look at how `pond.ts` chunks the basin and water and
   whether chunks can merge. Boulders: 10 shapes for 2k triangles in total.
4. Measure with `overview.cjs` (calls per frame) and `cpu.cjs` (script ms per frame).

## 8. Open question for the player

Nobody has measured the phone itself. Ask the player to open their garden twice on the iPhone,
with `?fps&q=7` and with `?fps&q=0` added before the `#` in the address, and report both numbers.
If the low-resolution one (`q=7`) is much faster, the cost is in the pixels (resolution, 4×
antialiasing on a half-float target, the glow passes) and a new story for a lighter picture
pipeline is worth more than 9.3–9.5. If both are similar, geometry is the cost and 9.2/9.3 are the
fix. Today the automatic quality control (`src/render/quality.ts`) can only lower resolution.

## 9. Environment gotchas (cost me time)

- `sleep N` at the start of a command is blocked. Wait with
  `until <condition>; do sleep 5; done`, or run long commands with `run_in_background`.
- Never `pkill -f <pattern>`: it matches its own shell. Use `fuser -k <port>/tcp`.
- A long test piped through `cut`/`grep` shows nothing until it ends (buffering). Redirect to a
  file and wait for the process to finish.
- Foreground commands time out at 10 minutes; `shaders-run.sh` and anything loading the player's
  garden several times should run in the background.
- The container can restart mid-task. Anything not committed and pushed can be lost, and the
  scratch folder goes with the container: keep tools worth keeping in `tools/`.
- After a restart the GitHub tools may need loading again via tool search
  (`select:mcp__github__create_pull_request,mcp__github__merge_pull_request`).
- Loading the player's garden takes about 16 s here and about 60 s when the machine is busy; give
  `waitForFunction` generous timeouts. Call `rebuildInstantly(); flowers.update(30)` in the
  worker before measuring, or the garden is still regrowing stroke by stroke.
- three.js 0.186: pass a `depthTexture` after creating a render target, not in its options.
  Program cache keys depend on the render target (screen vs off-screen), on `instanceColor`
  existing, on `receiveShadow`, vertex colours and so on: any of those appearing late means a
  shader compiled mid-play (that was story 9.1).

## 10. Things the player has said (keep to them)

- No painting or "storybook" styles: tried twice, reverted both times.
- The close-up bed view, pruning, bouquets and points were removed at the player's request
  ("feels like slop"); don't bring them back.
- Soft, cloudy-day light is liked. Fewer insects. Denser water flowers by default.
- Smoothness beats detail: "Beauty matters, but never at the cost of stutter" (`CLAUDE.md`).
- Report numbers honestly, say what was and wasn't checked on a real phone (so far: nothing was).
