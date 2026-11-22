# A Vesper Heist — The Marlowe Gallery

[![make.fun](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)
[![make.fun rank](https://make.fun/badge/best-heist-game-20261122-0559/awann-bit/best-heist-game-20261122-0559/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)
[![make.fun reward](https://make.fun/badge/best-heist-game-20261122-0559/awann-bit/best-heist-game-20261122-0559/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)

A complete original 2D canvas heist game for the
[make.fun "Make the best heist game" bounty](https://make.fun/bounty/best-heist-game-20261122-0559).

You are Vesper, a thief crossing the Marlowe Gallery after dark. Three
guards patrol with visible vision cones, two cameras sweep the hall, and
every glance raises the alarm. Grab the Sunstone from its vault plinth —
plus the Jade Idol and the Golden Mask if you dare — and slip out the door
before the alarm hits 100.

- **Several routes per room**: the main hall, the west and east wings, each
  with two doors, plus lanes behind the display cases.
- **Tools at a cost**: an EMP that blacks out the cameras for 6 seconds and
  a noisemaker that lures the nearest guard — each use adds to the alarm.
- **Read the cones before you move**: amber guard cones, red camera cones,
  loot that glows gold, cover in dark glass and stone.
- **Feel**: tension as cones sweep, a fair caught moment, and a getaway
  that pays off the planning.

## Play

Serve `game/` with any static server and open `index.html` in desktop
Chrome. No build step, no network requests, no libraries — vanilla canvas
and WebAudio, all drawn and synthesized in code.

- **WASD / arrows** — move; **click** — walk to a point
- **E** — EMP (2 charges); **Q** — noisemaker at the cursor (right-click, 2 charges)
- **Enter** — start; **R** — retry; **M** — mute

## Layout

- `game/index.html` — the page and canvas
- `game/css/style.css` — page styling
- `game/js/main.js` — the world, the loop and the rules
- `game/js/levels.js` — the gallery: walls, cover, loot, patrols, cameras
- `game/js/guards.js` — guards, cameras and the alarm
- `game/js/render.js` — every pixel, drawn in code
- `game/js/input.js` — keyboard and mouse
- `game/js/audio.js` — synthesized WebAudio cues
- `game/js/shots.js` — deterministic screenshot scenes (`?shot=start|play|end&seed=1`)
- `main.ts` — hands the game in: copies `game/` and `screenshots/` to
  `/output` and writes `dossier.json`
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged
