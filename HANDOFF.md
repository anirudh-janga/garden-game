# Handoff notes — Milestones 11 and 12

Written 12 Nov 2026. Read `CLAUDE.md` and the Status section of `BACKLOG.md` first; this file is
the detail behind them. Delete it when both milestones are done.

## 1. Where things stand

Nothing in Milestones 11 or 12 is built. The planning is done:

| What | Where |
|---|---|
| The stories (8 for the cottage, 13 for the flowers) | `BACKLOG.md`, "Milestone 11" and "Milestone 12" |
| The cottage's design: sizes, colours, every detail | `docs/cottage-design.md`, front view in `docs/cottage-elevation.svg` |
| The plant list: 145 new plants in nine regions, origins of today's 85, the new shapes | `docs/flower-atlas.md` |

The player asked for both at once and set no order. Default order: 11.1 → 11.7, then 12.1 →
12.13. If the player says "flowers first", start at 12.1. 11.8 (a cat) is optional: ask before
building it.

The player's instruction for this planning session was "create stories, don't implement". Whoever
picks this up should wait for the player to say go, then work one story at a time: build, deploy,
mark it 👀, stop for their review on the iPhone (`CLAUDE.md`).

The design documents are part of the stories. If something in them can't be built as written, or
turns out wrong (a size that looks bad, a plant fact that's off), change the document in the same
commit and say so in the status row. Don't quietly build something else.

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

- Today's cottage is `src/world/cottage.ts` (666 lines, one `build()`), styled by
  `cottageStyle.ts` and the drawer in `src/ui/cottagePanel.ts`; `main.ts` and `world.ts` hold the
  wiring (`cottageTap`, `setCottageStyle`, the `cottage` action in `garden.ts`).
- Many systems ask `cottage.contains(x, z, margin)` (paths, beds, fences, ponds, rocks, props,
  wildflowers, bunnies, the forest edge). The footprint grows in 11.2 (the wing and the chimney).
- The camera looks down at 34–64° from 9 m to 160 m, and since 10.1 comes as close as 1.6 m at
  15°. The roof is most of what is seen; the walls matter up close.
- Shaders: anything that first appears mid-play compiles then, and that is a hitch (story 9.1).
  Seasonal dressing (snow, icicles, leaves) should share the cottage's materials or be warmed at
  load (`src/render/warm.ts`).
- Rain wetness and moss are material hooks (`addWet`, `addMoss` in `src/render/`).
- Snow: winter arrives for a northern-hemisphere player on 1 December. 11.2 must not leave the
  roof bare in winter.

## 5. Things to know before touching the flowers

- Species are data in `src/world/flowerSpecies.ts`; shapes are built in `src/world/flowers.ts`
  (`flowerGeometry`, one function per shape kind, each with an `isFar()` lighter version) and
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
