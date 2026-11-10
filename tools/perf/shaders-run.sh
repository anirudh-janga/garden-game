#!/bin/bash
# The "do everything once" shader test (story 9.1). Builds the game unminified, adds a hook that
# reports every shader program built after the loading screen and how it differs from the nearest
# earlier one, serves it on port 4190 and runs shaders.cjs against it.
# Usage: tools/perf/shaders-run.sh            (WAIT=4 = minutes/2 to wait for creatures at the end)
# Output is buffered until the end; redirect it to a file and expect about 8 minutes.
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
B="${BUILD_DIR:-/tmp/garden-unmin}"
fuser -k 4190/tcp >/dev/null 2>&1 || true
cd "$ROOT"
rm -rf "$B" && npx vite build --minify false --outDir "$B" 2>&1 | grep -E "error" || true
cd "$B/assets"
for f in worker-*.js world-*.js; do python3 - "$f" <<'PY'
import sys
p=sys.argv[1]; s=open(p).read()
a="        program = new WebGLProgram(renderer, cacheKey, parameters, bindingStates);\n        programs.push(program);"
if a in s:
    s=s.replace(a,"""        program = new WebGLProgram(renderer, cacheKey, parameters, bindingStates);
        { const P = {}; for (const k in parameters) { const v = parameters[k]; if (typeof v !== 'function' && k !== 'vertexShader' && k !== 'fragmentShader' && k !== 'uniforms') P[k] = (v && typeof v === 'object') ? JSON.stringify(v) : v; } P.__vs = (parameters.vertexShader || '').length; P.__fs = (parameters.fragmentShader || '').length; (globalThis.__pp = globalThis.__pp || []).push(P); if (globalThis.__ppLive) { let best = null, bd = 1e9; for (const Q of globalThis.__pp) { if (Q === P || Q.shaderType !== P.shaderType) continue; let d = []; for (const k in P) if (P[k] !== Q[k]) d.push(k + ': ' + String(Q[k]).slice(0, 30) + ' -> ' + String(P[k]).slice(0, 30)); if (d.length < bd) { bd = d.length; best = d; } } globalThis.__ppLive.push((P.shaderType || P.shaderName) + ' {' + (best ? best.join(' | ') : 'first of its type') + '}'); } }
        programs.push(program);""")
    open(p,'w').write(s)
PY
done
(cd "$B" && python3 -m http.server 4190 > /dev/null 2>&1 &)
sleep 1
cd "$HERE" && PORT=4190 WAIT="${WAIT:-2}" timeout 2400 node shaders.cjs 2>&1 | cut -c1-330
fuser -k 4190/tcp >/dev/null 2>&1 || true
