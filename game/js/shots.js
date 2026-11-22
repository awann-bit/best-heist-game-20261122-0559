// Screenshot scenes behind ?shot=start|play|end&seed=1.
// Each scene plays the real rules forward from a fresh world, steered by a
// scripted autopilot that walks the gallery's own routes (entrance, west
// wing, vault, east wing, exit), so every frame is what a real game looks
// like and the same seed always gives the same frame. The cover (start)
// shows the whole heist at a glance: thief, guards, cones, cameras, loot
// and the alarm meter in one frame.
import { LOOT, SPAWN } from './levels.js';
import { watcherSees } from './guards.js';

// Waypoints through the gallery's open lanes (all clear of walls, cases
// and pillars, with room to spare around each solid — the thief's radius
// is 12, so every leg keeps at least 15px from every solid corner).
const ROUTE = [
  { x: 640, y: 668 },
  { x: 700, y: 640 },
  { x: 820, y: 640 },
  { x: 820, y: 560 },
  { x: 460, y: 560 },
  { x: 460, y: 440 },
  { x: 380, y: 440 },
  { x: 170, y: 440 },
  { x: 170, y: 330 },
  { x: 230, y: 330 },
  { x: 230, y: 190 },
  { x: 170, y: 190 }, // Jade Idol
  { x: 230, y: 190 },
  { x: 230, y: 330 },
  { x: 230, y: 440 },
  { x: 380, y: 440 },
  { x: 560, y: 440 },
  { x: 640, y: 440 },
  { x: 640, y: 380 }, // inside the vault ring, below the Sunstone
  { x: 640, y: 440 },
  { x: 810, y: 440 },
  { x: 900, y: 440 },
  { x: 1050, y: 330 },
  { x: 1050, y: 190 },
  { x: 1110, y: 190 }, // Golden Mask
  { x: 1050, y: 190 },
  { x: 1050, y: 330 },
  { x: 900, y: 460 },
  { x: 860, y: 460 },
  { x: 820, y: 460 },
  { x: 820, y: 560 },
  { x: 820, y: 640 },
  { x: 700, y: 640 },
  { x: 640, y: 668 }, // exit
];

const START_SECONDS = 6;
const PLAY_SECONDS = 24;
const END_LIMIT_SECONDS = 300;

/** Is this point watched by any guard or live camera right now? */
function pointSeen(world, x, y) {
  for (const g of world.guards) if (watcherSees(g, x, y)) return true;
  for (const c of world.cameras) {
    if (c.disabled <= 0 && watcherSees(c, x, y)) return true;
  }
  return false;
}

/** A step toward a waypoint, or null when the step would be seen. */
function stepToward(world, fromX, fromY, toX, toY) {
  const dx = toX - fromX;
  const dy = toY - fromY;
  const dist = Math.hypot(dx, dy);
  if (dist < 14) return { arrived: true, x: 0, y: 0 };
  const stepX = fromX + (dx / dist) * 8;
  const stepY = fromY + (dy / dist) * 8;
  if (pointSeen(world, stepX, stepY)) return { arrived: false, x: 0, y: 0 };
  return { arrived: false, x: dx / dist, y: dy / dist };
}

/** Steer the thief toward the next route waypoint — but never walk into a
 * cone: if the next step would be seen, wait where it is safe until the
 * patrol moves on. If the thief is already seen, duck back toward the
 * previous waypoint instead of standing in the light. A thief that reads
 * the cones is the whole game. */
function autopilot(world, routeIndex) {
  const p = world.player;
  if (pointSeen(world, p.x, p.y)) {
    const prev = ROUTE[Math.max(0, routeIndex.value - 1)];
    const back = stepToward(world, p.x, p.y, prev.x, prev.y);
    return { x: back.x, y: back.y };
  }
  const wp = ROUTE[routeIndex.value % ROUTE.length];
  const step = stepToward(world, p.x, p.y, wp.x, wp.y);
  if (step.arrived) routeIndex.value += 1;
  return { x: step.x, y: step.y };
}

/**
 * Stage the named scene on a fresh world and return the screen to draw.
 * The world keeps stepping only while the shot is being staged; the frame
 * the browser screenshots is the frozen result.
 */
export function stageShot(name, world) {
  world.reset();
  // Trace of where the autopilot went, for local play-testing.
  world.shotLog = [];
  let logTick = 0;
  let minSun = 999;
  const log = (routeIndex) => {
    logTick += 1;
    const sunD = Math.hypot(world.player.x - 640, world.player.y - 338);
    if (sunD < minSun) minSun = sunD;
    if (logTick % 60 === 0) {
      world.shotLog.push({
        t: Math.round(world.time),
        idx: routeIndex.value,
        x: Math.round(world.player.x),
        y: Math.round(world.player.y),
        alarm: Math.round(world.alarm),
        loot: world.loot.filter((l) => l.taken).map((l) => l.id).join(','),
        minSun: Math.round(minSun),
      });
    }
  };
  // Stage with the rules running: the world only steps while its screen is
  // 'play', so switch it on for the staging and restore the scene after.
  world.screen = 'play';
  if (name !== 'play' && name !== 'end') {
    // Start: a few seconds in, thief crossing the hall, everything visible.
    const routeIndex = { value: 0 };
    for (let i = 0; i < START_SECONDS * 60; i += 1) {
      const dir = autopilot(world, routeIndex);
      world.step(1 / 60, dir, null);
      log(routeIndex);
    }
    world.screen = 'title';
    return { screen: 'title', best: 0 };
  }
  const limit = name === 'end' ? END_LIMIT_SECONDS : PLAY_SECONDS;
  const routeIndex = { value: 0 };
  for (let i = 0; i < limit * 60; i += 1) {
    const dir = autopilot(world, routeIndex);
    world.step(1 / 60, dir, null);
    log(routeIndex);
    if (world.screen === 'win' || world.screen === 'caught') break;
  }
  return { screen: world.screen, best: world.score };
}

export function lootById(world, id) {
  return world.loot.find((l) => l.id === id);
}

export { LOOT, SPAWN };
