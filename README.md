# Retrowings

A Pilotwings-inspired flight game with chunky pixel-3D graphics and full analog controls, built for a PS5 DualSense on PC. One map of American countryside, four lessons:

| Lesson | Goal |
| --- | --- |
| Biplane | Take off, fly 10 rings around the valley, land near the runway touchdown markers |
| Hang glider | Ride thermals up to the high rings, flare and land on the bullseye |
| Jetpack | Weave through low rings over the lake on analog R2 thrust, land on the bullseye |
| Skydiving | Freefall through the rings, pull the chute, steer onto the bullseye |

Scoring: 10 per ring, +5 for a perfect center pass, up to 50 for the landing, up to 20 time bonus. Gold, silver and bronze medals. Best scores are saved in each player's browser.

Play in Chrome or Edge. Plug the controller in and press any button once the page loads. Keyboard works too (controls are listed on each lesson's briefing screen).

## Project layout

```
public/index.html          the whole game (HTML, CSS, JS)
public/vendor/three/       Three.js r160 (MIT), served locally so the game has no CDN dependency
scripts/check.mjs          syntax + physics sanity checks, run in CI
Dockerfile, nginx.conf     static nginx image, listens on 8080
docker-compose.yml         web + Cloudflare Tunnel (+ optional Watchtower)
docs/design-notes.md       decisions, controls, level layout, change log
```

Inside `index.html` the script is split into sections that map onto a future Godot port:

- **SIM**: pure math, no rendering. Each vehicle has `reset(spawn)` and `update(dt, input)` (Godot node scripts).
- **COURSES**: plain data for rings, landings and thermals (Godot Resources or JSON).
- **INPUT**: action-style input like a Godot InputMap.
- **RENDERING / HUD / MENUS**: Three.js scene, canvas HUD and DOM menus (Godot scenes and Control nodes).

## Run locally

```bash
python3 -m http.server 8000 -d public
# open http://localhost:8000
node scripts/check.mjs     # sanity checks
```

A page opened straight from disk (`file://`) can't load the local Three.js module, so use a local server.

## Deploy (Docker + Cloudflare Tunnel)

Pushing to `main` runs the checks, then GitHub Actions builds the image and publishes it to `ghcr.io/brianyeckley/retrowings:latest` (amd64 and arm64).

On the server:

```bash
mkdir retrowings && cd retrowings
# copy docker-compose.yml and .env.example from this repo
cp .env.example .env        # set TUNNEL_TOKEN
docker compose up -d
```

**Image visibility.** The repo is public. GHCR can still create a new package as private, so if the server's `docker compose pull` says *denied*, set it public once: GitHub → your profile → Packages → retrowings → Package settings → Change visibility → Public. After that no login is needed, and a Watchtower already running on the server (like movie-night's) updates this container automatically. On a server with no Watchtower, start this project's own with `docker compose --profile watchtower up -d`.

**Tunnel routing** for `retrowings.example.com`:
- *Tunnel created in the dashboard (you were given a token)*: the tunnel connecting is not enough. In the Cloudflare dashboard → Networking → Tunnels → your tunnel → **Routes → Add route** (called *Public Hostname* in the older Zero Trust UI), add a published application: subdomain `retrowings`, domain `example.com`, service `http://web:8080`. Saving it also creates the DNS record; without it the browser shows `DNS_PROBE_FINISHED_NXDOMAIN`.
- *Locally-managed tunnel (cloudflared CLI with credentials file)*: `docker-compose.yml` already passes `--url http://web:8080`; create the DNS route with `cloudflared tunnel route dns <tunnel> retrowings.example.com`.
- *Reusing the movie-night tunnel instead*: skip the `tunnel` service here and add the public hostname to that tunnel, pointing at `http://<server-lan-ip>:4100` (the host port from `.env`).

Health check: `https://retrowings.example.com/healthz` returns `ok`.
