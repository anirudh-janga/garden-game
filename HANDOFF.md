# Handoff notes — Milestones 11 and 12

Written 12 Nov 2026, updated 14 Nov after the review. Read `CLAUDE.md` and the Status section of `BACKLOG.md` first; this file is
the detail behind them. Delete it when both milestones are done.

## 1. Where things stand

Milestones 11 (the cottage, 11.1–11.7) and 12 (the flowers, 12.1–12.13) are built and live. On
13–14 Nov the player asked for a review of both ("flawless details on flowers", and a cottage that
"should work across devices and not change with pinch to zoom"); that review is row **R12** in the
backlog, live and waiting for their look on the phone. 11.8 (a cat) is optional and not started.

| What | Where |
|---|---|
| The stories (8 for the cottage, 13 for the flowers) and the review | `BACKLOG.md`, "Milestone 11", "Milestone 12", row R12 |
| The cottage's design: sizes, colours, every detail | `docs/cottage-design.md`, front view in `docs/cottage-elevation.svg` |
| The plant list, and how the new shapes are built now | `docs/flower-atlas.md` (section 3.1 is the shapes as built) |

Two rules came out of the review; keep to them:

- **The cottage has one shape at every distance.** No far form. Anything the player can watch
  while pinching must not swap to something that looks different.
- **A plant isn't done until it has been looked at.** Render it with `tools/perf/plantgrid.cjs`
  (near, then `FARFORM=1`), montage with `plantgrid.py`, and compare it with the real plant.

Next: whatever the player's review brings. Work one story at a time: build, deploy, mark it 👀,
stop for their review on the iPhone (`CLAUDE.md`). The design documents are part of the stories:
if something in them turns out wrong, change the document in the same commit and say so.

## 2. How to ship a story

1. `git checkout master && git pull origin master && git checkout -b story/11.x-short-name`
2. Do the work. Run the milestone's checks (listed at the top of each milestone in the backlog).
3. Update `BACKLOG.md`: the story's row in the status table (🔨 → 👀 with a plain-English summary
   and the measured numbers), the "Current stories" line, and the Feedback log if the player said
   something. `tools/ship/bl.py` helps (`row`, `status`, `log`).
4. Commit as the repo owner (`git config user.name "Anirudh"`,
   `git config user.email "7342625+anirudh-janga@users.noreply.github.com"`), ending the message
   with the co-author and session trailer lines the session's own instructions give.
   `tools/ship/commit.sh "Subject" "Body"` type-checks, builds, commits and pushes; it needs
   `COAUTHOR` (and optionally `SESSION_URL`) in the environment. Check `git status` afterwards.
5. Open a PR into `master` with the GitHub MCP tool (`mcp__github__create_pull_request`), then
   merge it (`mcp__github__merge_pull_request`, method `merge`). Use the owner/repo the session's
   GitHub scope lists (`asrijanga/garden-game` has worked; the repository now lives at
   `anirudh-janga/garden-game` and the old name redirects). There is no `gh` CLI.
6. Deploy: `tools/ship/deploy.sh` (pulls master, builds, pushes `master:main`, waits until
   https://anirudh-janga.github.io/garden-game/ serves the new `index-*.js`). Only `main` deploys.
7. Never force-push or rewrite history. No model names in commits, PRs or code.

## 3. Test tools (`tools/perf/`)

All run headless Chromium with software rendering. **Triangle counts, draw-call counts and "is it
identical" checks are exact. Timings are not phone timings.** The player's iPhone ran their big
garden at 60 fps at both the lowest and highest quality tier after Milestone 9, so there is
headroom, but nobody has profiled the phone.

Serve a build first, from the repo root:

```
npm run build && (npx vite preview --port 4173 --strictPort > /dev/null 2>&1 &)
```

`vite preview` serves `dist/`: don't rebuild while a test runs. Stop it with `fuser -k 4173/tcp`.
To compare two versions, build each to its own folder (`npx vite build --outDir /tmp/build-a`),
serve each on its own port, and pass `PORT=<port>` to the script.

| Script | What it tells you |
|---|---|
| `worldfp.cjs` | A fingerprint of every built instance (position, scale, colour, per shape). `GARDEN=user OUT=/tmp/a.txt node tools/perf/worldfp.cjs` (the player's garden) or `GARDEN=test`. Diff against `baselines/world-user-9.1.txt` / `world-test-9.1.txt`: identical means nothing moved, vanished or changed colour. (After 9.5 the shape keys differ from the 9.1 files but instance totals per system match: save fresh baselines at the start of 11.1 and diff against those.) |
| `shapefp.ts` | A fingerprint of every flower and leaf shape, near and far. `npx esbuild tools/perf/shapefp.ts --bundle --platform=node --outfile=/tmp/shapefp.cjs --log-level=error && node /tmp/shapefp.cjs > /tmp/shapes.txt`. Save a fresh baseline before 12.1 (three variants per species now) and after each regional story. |
| `plantgrid.cjs`, `plantgrid.py` | One close-up tile per plant (three plants, its three variants, in bloom, nothing else in the scene), montaged into labelled sheets. `OUT=dir REGION=africa NEW=1 DSF=2 WAIT=500 node tools/perf/plantgrid.cjs && python3 tools/perf/plantgrid.py dir 4 3`. `IDS=a,b` picks plants, `FARFORM=1` shows the far shapes, `PORT=` another build (for before and after). About 4 s a plant. |
| `shapebudget.ts`, `seasons.ts`, `atlascheck.ts` | Triangle budgets for every plant (a new plant over budget fails); every shape built in all four seasons with none empty or broken; the plant counts per region. Each is bundled with esbuild and run with node (the command is at the top of the file). |
| `devices.cjs`, `cottageshots.cjs` | The opening view, the whole garden and the cottage tap on phone, landscape, tablet and desktop screens (`ONLY=phone,tablet`); the cottage from every side (`VIEWS`, `SEASON`, `TIME`). |
| `farcost.ts` | Near and far triangles per species for a set of plant counts (`COUNTS=<json file>`). The starting point for 12.2's `shapebudget.ts`. |
| `meshcount.cjs` | Player's garden: non-empty garden meshes (draw calls zoomed out) and triangles drawn at two close views. |
| `overview.cjs` | Player's garden at full zoom-out: draw calls, triangles, a breakdown by system. |
| `triangles.cjs`, `cpu.cjs`, `undoprof.cjs` | Triangles at four camera positions; script time per frame; where an undo's time goes. |
| `closeshot.cjs` | Pictures of the cottage from close, at chosen quality tiers (`QS=0,7 DIST=12 OUT=dir`). Extend it in 11.2 to take all four sides and the view from above. |
| `focusbed.cjs` | Taps a bed and checks the camera glides in and pinches back out (10.1). |
| `farlook.cjs` | The player's garden at several distances with all flowers forced near, then far. |
| `patchcheck.cjs` | Erase, undo, redo and pop-in checks on the test garden. |
| `shaders-run.sh` | From an empty garden, does everything once and lists each shader built after the loading screen. About 8 minutes; redirect to a file. Expect `TOTAL built mid-play: 1`. Its script (`shaders.cjs`) restyles the cottage: remove that step in 11.1. |
| `interact.cjs` | Touch regression: pan, path, flowers, undo, redo, tap the cottage, admire, take a picture. Its "cottage panel open" line has been printing `false` (the drawer doesn't open in the test); 11.1 replaces it. |
| `cottageundo.cjs` | Cottage restyles replayed by undo. Delete in 11.1. |
| `smoke.cjs`, `probe.cjs`, `waterdens.cjs`, `garden.cjs` | Small loaders and one-off checks. |

`garden-link.txt` is the player's own shared garden (274 strokes, about 13,700 built instances).

Inside the world worker, `?debug` exposes globals for `worker.evaluate(...)`: `renderer`, `scene`,
`camera`, `rig`, `post`, `flowers`, `stones`, `fences`, `vines`, `ponds`, `cottage`, `THREE`,
`rebuildInstantly()` and more (see the `if (debug) Object.assign(globalThis, …)` lines in
`src/engine/world.ts`). The worker is `page.workers()[0]`. `?q=0…7` pins a quality tier,
`?season=` a season, `?main` runs the world on the page.

## 4. Things to know before touching the cottage

- The cottage is `src/world/cottage/` (`plan.ts` the numbers, `kit.ts` the hand-made helpers, then
  `walls.ts`, `roof.ts`, `chimney.ts`, `wing.ts`, `face.ts`, `details.ts`, `smoke.ts`, `index.ts`).
  It is built once, in one shape; there are no options and no far form.
- Two faces must never share a plane (they flicker as the camera moves): set glass, hinges,
  curtains and the like a centimetre or two proud of what is behind them.
- Many systems ask `cottage.contains(x, z, margin)` (paths, beds, fences, ponds, rocks, props,
  wildflowers, bunnies, the forest edge). The footprint grows in 11.2 (the wing and the chimney).
- The camera looks down at 34–64° from 9 m out to a furthest view that depends on the screen's
  shape (about 159 m on a portrait phone, 106 m on a tablet, 66 m on a desktop), and since 10.1
  comes as close as 1.6 m at 15°. Views that frame something should fit it to the screen
  (`distanceToFit` in `world.ts`), not stand a fixed distance off. The roof is most of what is seen; the walls matter up close.
- Shaders: anything that first appears mid-play compiles then, and that is a hitch (story 9.1).
  Seasonal dressing (snow, icicles, leaves) should share the cottage's materials or be warmed at
  load (`src/render/warm.ts`).
- Rain wetness and moss are material hooks (`addWet`, `addMoss` in `src/render/`).
- Snow: winter arrives for a northern-hemisphere player on 1 December. 11.2 must not leave the
  roof bare in winter.

## 5. Things to know before touching the flowers

- The first 85 species are data in `src/world/flowerSpecies.ts`, the 145 of the atlas in
  `src/world/species/<region>.ts`. Shapes are built in `src/world/flowers.ts` (`flowerGeometry`:
  the older kinds) and `src/world/exotic.ts` (the atlas's kinds: leaves by habit, blooms, shrubs,
  umbels, spires…), each with an `isFar()` lighter version, and
  ahead of time in `src/engine/shapes.worker.ts`. Picker and book: `src/ui/flowerPicker.ts`
  (`icon()` draws a species' icon from its form), `src/ui/flowerBook.ts`.
- `VARIANTS = 3` shapes per species; each is a mesh per 20 m patch of ground (`Patches`). Every
  species planted in view costs draw calls, which is why a mixed bed must stay a handful of
  species (story 12.2).
- A species' `seasons` are the player's own seasons. Out of season a plant stays in bud.
- Water plants have a `zone` (`deep`, `shallow`, `bank`) and are planted by painting across a
  pond.
- Roses have a colour choice in the picker (`form.kind === 'rose'`); keep that working when
  roses are filed under their regions.
- Measured near/far triangles per plant today, for scale: daisy 208/81, sunflower 264/101, tea
  rose 417/100, lily 518/164, allium 676/174, hydrangea 763/199, patio rose 890/195, red hot
  poker 1,632/1,612 (no real far shape yet: fixed in 12.2).

## 6. Environment gotchas

- `sleep N` at the start of a command is blocked. Wait with `until <condition>; do sleep 5; done`
  or `timeout 590 tail --pid=<pid> -f /dev/null`.
- Never `pkill -f <pattern>`: it matches its own shell. Use `fuser -k <port>/tcp`.
- A long test piped through `cut`/`grep` shows nothing until it ends. Redirect to a file.
- Foreground commands time out at 10 minutes.
- The container can restart mid-task: commit and push often; keep tools worth keeping in
  `tools/`.
- After a restart the GitHub tools may need loading again via tool search.
- Loading the player's garden takes 16–60 s here. Call `rebuildInstantly(); flowers.update(30)`
  in the worker before measuring. Frames are slow in the software renderer: to test camera
  motion, step it (`for (…) rig.update(1 / 60)`) rather than waiting.
- A stray `i_built.png` or `smoke.png` can appear in the repo root after running some tools:
  delete it before committing.

## 7. Things the player has said (keep to them)

- No painting or "storybook" rendering styles: tried twice, reverted both times.
- The close-up bed view, pruning, bouquets, points and the collection book were removed ("feels
  like slop"). Don't add modes, scores or collecting. The atlas is a way to browse, not a game.
- Cottage customisation is being removed at the player's request. Don't leave any of it behind.
- Tap a bed or flower to glide in close; pinch out to return. No new views.
- Soft, cloudy-day light is liked. Fewer insects. Denser water flowers by default.
- Full resolution is preferred over the low tiers.
- Smoothness beats detail: "Beauty matters, but never at the cost of stutter."
- Report numbers honestly, and say what was and wasn't checked on a real phone.
