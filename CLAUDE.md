# Notes for Claude

- The game is one file: `public/index.html`. Keep the `// ======== SIM START ========` / `// ======== SIM END ========` markers; `scripts/check.mjs` extracts that section and runs it in Node, so nothing between the markers may touch THREE, the DOM or `window`.
- Three.js is vendored at `public/vendor/three/three.module.js` (r160) and loaded through the import map. Upgrade it deliberately, not by CDN.
- Run `node scripts/check.mjs` before committing. CI runs it too and won't publish the image if it fails.
- Physics units are meters, seconds, radians; Y is up and forward is -Z. The HUD converts to feet and mph.
- Course data (rings, thermals, landings) lives in `COURSES`; ring heights are above the ground under the ring.
- Keep `docs/design-notes.md` in sync with decisions and add a line to its change log for each version.
- Deployment: GitHub Actions → `ghcr.io/brianyeckley/retrowings:latest` → nginx container on 8080 → Cloudflare Tunnel at retrowings.example.com.
