# Retrowings — design notes

## Decisions so far
- Platform: browser first (static site), structured for a later move to Godot.
- Pitch: stick forward = nose down (flight-sim style).
- Camera: chase cam behind each vehicle; right stick looks around and springs back on release.
- Scoring (all lessons): 10 per ring, +5 for a perfect pass (through the white inner circle, 35% of the ring radius), up to 50 for landing, up to 20 time bonus vs par. Medals: gold ≥85%, silver ≥70%, bronze ≥55% of max. Crash = no landing or time points, no medal.
- Units shown in the HUD: feet and mph.
- Look: 3D view rendered at a low resolution and scaled up with hard pixel edges; resolution is a player setting (default 360 lines, original 270) while the final value is being decided.
- Controller selection: prefers Sony / standard-mapped gamepads and ignores keyboard and mouse receivers (e.g. Keychron Link) that also report as gamepads; the pad you press becomes active.

## Controls
- Biplane: left stick pitch/bank · L1/R1 rudder · ✕/□ throttle up/down (gauge on screen).
- Hang glider: left stick pitch/bank · ✕ flare. Thermals (rising sparkles) give strong lift and gently draw you toward their core.
- Jetpack: R2 analog thrust (about half pull hovers) · left stick up/down leans (full forward ≈ 80°, jets pointing back, SNES-style flat-out flight) · left stick left/right turns · fuel gauge.
- Skydiving: stick half forward = track (fastest forward travel), full forward = dive, back = spread flat (slow), sideways turns · ✕ pulls chute · under canopy forward = dive (fast, steep), back = brake (slow forward, faster sink), pull back just before touchdown to flare. A ground ring shows where the glide lands. HUD cross shows where you'll pass the next ring's height (green = inside the ring).

## Level (one map, all four lessons)
- Airfield + runway in the middle, river running north–south, lake to the east, mountains north, hills west, farmland and forests.
- Biplane: 10 rings around the valley; approach from the south over the last ring. Runway is 740 m; touchdown markers sit 330 m in, leaving ~400 m to roll out.
- Hang glider: 3 thermals (70 m core, 11.5–13 m/s), 4 rings up to ~470 m, bullseye landing, par 3:30.
- Jetpack: 6 low rings over the lake, bullseye landing.
- Skydiving: drop at 1300 m, 4 freefall rings ~190 m apart vertically, canopy to bullseye.

## Change log
- v10: replays. Every run is recorded at 30 Hz (vehicle state, stick inputs, ring/landing/crash events) and can be watched from the results screen (△ / R). Playback drives a ghost sim, so models, pilot animation, particles and sound replay as flown. An auto director cuts between chase, flyby, trackside, orbit and sky-cam shots, a ring cam waiting on the far side of upcoming rings, and a landing cam at the touchdown spot for the finish. Letterboxed overlay with a timeline marking rings (white = perfect), landing and crash. Controls: □ cycle camera (Auto/Chase/Flyby/Orbit/Sky), hold R1 3× fast, hold L1 slow-mo, ✕/○ exit.
- v9: results screen explains the score: each line shows earned/possible with a ✓ or the points missed and why (missed rings, perfect passes, landing distance zones, hard-landing speed, runway softness/centerline, seconds over par), the total shows points left on the table, and medal cutoffs (gold 85%, silver 70%, bronze 55%) appear with how many more points the next medal needs. Rings now show the perfect-pass zone as a small white circle (35% of the radius).
- v8: Pixels setting in the pause menu (◀ ▶): the 3D view renders at 180 (Chunky), 216, 270 (Classic, the original), 324, 360 (Crisp, new default), 432, 540 (Sharp) or 720 (Smooth) lines and is scaled up with hard pixel edges. Saved per browser. HUD always draws at 540 lines; particle and sparkle sizes scale with the setting.
- v7: canopy rework. Default glide 40 mph forward / 12 mph down (was 25); stick forward dives to 63 mph (steep, risky to land); stick back brakes to 13 mph but sinks faster (19 mph). Slowing down quickly turns forward speed into lift: pulling back ~3–5 m up (5–8 m when diving in) gives a soft landing. Landing limits: soft under 5.5 m/s down and 30 mph forward; crash over 9 m/s down or 47 mph forward. HUD adds a ground ring where the glide will land (green over the bullseye), forward/sink readout, and a flare prompt. CI checks glide speed, brake behavior and the flare.
- v6: rebuilt biplane: faceted tapered fuselage, radial engine with cylinder heads and exhaust stubs (puffs that thicken with throttle), wooden prop that blurs into a disc at high revs, ribbed wings with rounded tips, N-struts and bracing wires, swept fin with striped rudder, spoked wheels that roll, roundels, open cockpit with a leather-helmeted pilot whose scarf streams in the wind and who glances into turns. Ailerons, elevator and rudder move with the stick and L1/R1. Drop plane uses the same model in blue. Plane ground contact raised to match the scaled model.
- v5: faster thermals (core lift 11.5–13 m/s across a 70 m core, plus inflow that draws a circling glider to the center; a typical 300 m climb now takes ~30 s instead of 1.5–3+ min), glider par 3:30. New jointed pilot (helmet, goggles, shaped torso, elbows, gloves, knees, boots) shared by the glider, jetpack and skydiving lessons, with two-bone IK for hands on bars, grips and toggles. Animation: glider pilot hangs prone and weight-shifts into turns, swings upright to land and runs it out; jetpack legs dangle, brace for landing and stream back in flat-out flight, head looks into turns; skydiver arches in a box position, sweeps arms back to dive, spreads wide to slow, legs flutter in the wind, hands work the toggles under canopy.
- v4: sound. All synthesized with Web Audio (no files): three original tracks (title “Heartland Lesson”, flight “Blue Skies Takeoff” for biplane/jetpack, glide “Thermals” for glider/skydiving) with FM e-piano, bass, lead, pad, drums and SNES-style echo; biplane engine that follows throttle, jetpack roar on R2, speed-based wind, glider variometer beeps (faster/higher as you climb), stall horn, low-fuel beeps, chute opening, touchdown chirp, ring chimes, crash/splash, medal jingles, menu blips. Music and effects volume in the pause menu (saved per browser).
- v3.1: nginx config warning fixed (duplicate gzip MIME type); README explains adding the tunnel's Public Hostname (which also creates the DNS record).
- v3: controller picker ignores keyboard dongles; repo, Docker image and Cloudflare Tunnel deployment.
- v2: runway lengthened and touchdown marker moved mid-runway; skydive tracking faster and quicker to respond, rings spaced further apart vertically, aim cross added; jetpack turns with the left stick, can lean to ~80°, carves turns at speed; detailed rocket-belt model.
- v1: first playable prototype with all four lessons.

## Ideas for next iterations
- Save a best-run replay per lesson (ghost to race against).
- Wind for glider/skydive, more levels, replay camera, invert-look option, rumble/adaptive triggers (Godot can reach DualSense features the browser can't).
