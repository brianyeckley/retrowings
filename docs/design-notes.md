# Retrowings — design notes

## Decisions so far
- Platform: browser first (static site), structured for a later move to Godot.
- Pitch: stick forward = nose down (flight-sim style).
- Camera: chase cam behind each vehicle; right stick looks around and springs back on release.
- Scoring (all lessons): 10 per ring, +5 for a perfect center pass, up to 50 for landing, up to 20 time bonus vs par. Medals: gold ≥85%, silver ≥70%, bronze ≥55% of max. Crash = no landing or time points, no medal.
- Units shown in the HUD: feet and mph.
- Controller selection: prefers Sony / standard-mapped gamepads and ignores keyboard and mouse receivers (e.g. Keychron Link) that also report as gamepads; the pad you press becomes active.

## Controls
- Biplane: left stick pitch/bank · L1/R1 rudder · ✕/□ throttle up/down (gauge on screen).
- Hang glider: left stick pitch/bank · ✕ flare. Thermals (rising sparkles) give lift.
- Jetpack: R2 analog thrust (about half pull hovers) · left stick up/down leans (full forward ≈ 80°, jets pointing back, SNES-style flat-out flight) · left stick left/right turns · fuel gauge.
- Skydiving: stick half forward = track (fastest forward travel), full forward = dive, back = spread flat (slow), sideways turns · ✕ pulls chute · under canopy forward = faster, back = brake. HUD cross shows where you'll pass the next ring's height (green = inside the ring).

## Level (one map, all four lessons)
- Airfield + runway in the middle, river running north–south, lake to the east, mountains north, hills west, farmland and forests.
- Biplane: 10 rings around the valley; approach from the south over the last ring. Runway is 740 m; touchdown markers sit 330 m in, leaving ~400 m to roll out.
- Hang glider: 3 thermals, 4 rings up to ~470 m, bullseye landing.
- Jetpack: 6 low rings over the lake, bullseye landing.
- Skydiving: drop at 1300 m, 4 freefall rings ~190 m apart vertically, canopy to bullseye.

## Change log
- v3: controller picker ignores keyboard dongles; repo, Docker image and Cloudflare Tunnel deployment.
- v2: runway lengthened and touchdown marker moved mid-runway; skydive tracking faster and quicker to respond, rings spaced further apart vertically, aim cross added; jetpack turns with the left stick, can lean to ~80°, carves turns at speed; detailed rocket-belt model.
- v1: first playable prototype with all four lessons.

## Ideas for next iterations
- Sound (engine, wind, ring chime), wind for glider/skydive, more levels, replay camera, invert-look option, rumble/adaptive triggers (Godot can reach DualSense features the browser can't).
