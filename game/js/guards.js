// Guards, cameras and the alarm: the eyes of the Marlowe Gallery.
// A guard walks its route and watches a cone in front of it. A camera sweeps
// its cone from a wall mount. When the thief stands inside a cone with a
// clear line of sight, the alarm climbs; out of sight it slowly falls.
// The alarm is the game's clock: at 100 the thief is caught.
import { GUARD_ROUTES, CAMERAS, hasLineOfSight } from './levels.js';

export const CONE_RANGE = 230;
export const CONE_HALF_ANGLE = 0.42; // ~48 degrees of vision
export const ALARM_RISE_GUARD = 46; // per second, while seen by a guard
export const ALARM_RISE_CAMERA = 34; // per second, while seen by a camera
export const ALARM_FALL = 9; // per second, while unseen
export const ALARM_TOOL_COST = 8; // alarm added each time a tool is used

function angleTo(ax, ay, bx, by) {
  return Math.atan2(by - ay, bx - ax);
}

function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

/** Is the thief inside this watcher's cone and visible to it? */
export function watcherSees(watcher, px, py) {
  const dx = px - watcher.x;
  const dy = py - watcher.y;
  const dist = Math.hypot(dx, dy);
  if (dist > watcher.range) return false;
  if (Math.abs(angleDiff(Math.atan2(dy, dx), watcher.angle)) > watcher.halfAngle) return false;
  return hasLineOfSight(watcher.x, watcher.y, px, py);
}

/** A patrolling guard: walks its waypoints, pauses at each, faces its walk. */
export class Guard {
  constructor(route, phase = 0) {
    this.name = route.name;
    this.speed = route.speed;
    this.waypoints = route.waypoints;
    this.index = 0;
    this.x = route.waypoints[0].x;
    this.y = route.waypoints[0].y;
    this.angle = 0;
    this.wait = phase;
    this.target = 1 % route.waypoints.length;
    this.alert = 0; // 0..1, how sure this guard is (drives its cone colour)
    this.stun = 0; // seconds left of a noisemaker lure
    this.lureX = 0;
    this.lureY = 0;
  }

  get range() {
    return CONE_RANGE;
  }

  get halfAngle() {
    return CONE_HALF_ANGLE;
  }

  /** Lure this guard toward a point for a few seconds (the noisemaker). */
  lure(x, y, seconds) {
    this.lureX = x;
    this.lureY = y;
    this.stun = seconds;
  }

  update(dt) {
    if (this.stun > 0) {
      this.stun -= dt;
      const dx = this.lureX - this.x;
      const dy = this.lureY - this.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 4) {
        const step = Math.min(dist, this.speed * 1.5 * dt);
        this.x += (dx / dist) * step;
        this.y += (dy / dist) * step;
        this.angle = Math.atan2(dy, dx);
      }
      return;
    }
    if (this.wait > 0) {
      this.wait -= dt;
      return;
    }
    const wp = this.waypoints[this.target];
    const dx = wp.x - this.x;
    const dy = wp.y - this.y;
    const dist = Math.hypot(dx, dy);
    const step = this.speed * dt;
    if (dist <= step) {
      this.x = wp.x;
      this.y = wp.y;
      this.target = (this.target + 1) % this.waypoints.length;
      this.wait = 0.9;
    } else {
      this.x += (dx / dist) * step;
      this.y += (dy / dist) * step;
      this.angle = Math.atan2(dy, dx);
    }
  }
}

/** A wall camera: its cone sweeps back and forth around its base angle. */
export class Camera {
  constructor(def) {
    this.name = def.name;
    this.x = def.x;
    this.y = def.y;
    this.baseAngle = def.baseAngle;
    this.sweep = def.sweep;
    this.speed = def.speed;
    this.range = def.range;
    this.phase = 0;
    this.disabled = 0; // seconds left of an EMP blackout
    this.angle = def.baseAngle;
  }

  get halfAngle() {
    return 0.3;
  }

  update(dt) {
    if (this.disabled > 0) this.disabled -= dt;
    this.phase += dt * this.speed;
    this.angle = this.baseAngle + Math.sin(this.phase) * this.sweep;
  }
}

/** Build the gallery's watchers from the level data. */
export function createWatchers() {
  const guards = GUARD_ROUTES.map((r, i) => new Guard(r, i * 0.6));
  const cameras = CAMERAS.map((c) => new Camera(c));
  return { guards, cameras };
}

/**
 * Advance all watchers and the alarm for one step. Returns whether the
 * thief is currently seen, and by what, so the render can show it.
 */
export function updateWatchers(world, dt) {
  const { guards, cameras } = world;
  let seenByGuard = false;
  let seenByCamera = false;
  for (const g of guards) {
    g.update(dt);
    const sees = watcherSees(g, world.player.x, world.player.y);
    g.alert = Math.max(0, Math.min(1, g.alert + (sees ? dt * 2.2 : -dt * 0.8)));
    if (sees) seenByGuard = true;
  }
  for (const c of cameras) {
    c.update(dt);
    if (c.disabled > 0) continue;
    if (watcherSees(c, world.player.x, world.player.y)) seenByCamera = true;
  }
  const rise = (seenByGuard ? ALARM_RISE_GUARD : 0) + (seenByCamera ? ALARM_RISE_CAMERA : 0);
  if (rise > 0) world.alarm = Math.min(100, world.alarm + rise * dt);
  else world.alarm = Math.max(0, world.alarm - ALARM_FALL * dt);
  world.seen = seenByGuard || seenByCamera;
  world.seenByGuard = seenByGuard;
  world.seenByCamera = seenByCamera;
  return world.seen;
}
