// A Vesper Heist: the world, the loop and the rules.
// The thief moves with WASD/arrows or a mouse click, hides behind cases and
// pillars, grabs the Sunstone and slips out the door. Guards and cameras
// raise the alarm when they see her; at 100 she is caught. Two tools, each
// at a cost: the EMP blacks out the cameras, the noisemaker lures a guard.
// The world steps at a fixed 1/60 so a screenshot seed always plays the
// same game.
import { VIEW, FLOOR, SPAWN, EXIT, LOOT, solidRects, PILLARS, circleHitsRect, pointInRect } from './levels.js';
import { createWatchers, updateWatchers, ALARM_TOOL_COST } from './guards.js';
import { Input } from './input.js';
import { SoundBank } from './audio.js';
import { stageShot } from './shots.js';
import {
  drawFloor, drawWalls, drawCover, drawVaultAndLoot, drawWatchers, drawPlayer,
  drawHud, drawTitle, drawCaught, drawWin,
} from './render.js';

const STEP = 1 / 60;
const PLAYER_SPEED = 175;
const PLAYER_RADIUS = 12;
const GRAB_RADIUS = 60;
const EMP_SECONDS = 6;
const LURE_SECONDS = 5;

/** Deterministic random: mulberry32, so a seed replays the same gallery. */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class World {
  constructor(seed = 1) {
    this.seed = seed;
    this.random = mulberry32(seed);
    this.reset();
  }

  reset() {
    this.player = { x: SPAWN.x, y: SPAWN.y, moving: false };
    this.loot = LOOT.map((l) => ({ ...l, taken: false }));
    const watchers = createWatchers();
    this.guards = watchers.guards;
    this.cameras = watchers.cameras;
    this.alarm = 0;
    this.time = 0;
    this.score = 0;
    this.screen = 'title';
    this.tools = { emp: 2, noise: 2 };
    this.seen = false;
    this.seenByGuard = false;
    this.seenByCamera = false;
    this.empFlash = 0;
    this.noiseFlash = null;
  }

  /** Move the thief, sliding along solids instead of sticking to them. */
  movePlayer(dx, dy, dt) {
    const p = this.player;
    const solids = solidRects();
    const tryMove = (nx, ny) => {
      if (nx < FLOOR.x + PLAYER_RADIUS || nx > FLOOR.x + FLOOR.w - PLAYER_RADIUS) return false;
      if (ny < FLOOR.y + PLAYER_RADIUS || ny > FLOOR.y + FLOOR.h - PLAYER_RADIUS) return false;
      for (const r of solids) if (circleHitsRect(nx, ny, PLAYER_RADIUS, r)) return false;
      for (const pil of PILLARS) {
        const ddx = nx - pil.x;
        const ddy = ny - pil.y;
        if (ddx * ddx + ddy * ddy < (PLAYER_RADIUS + pil.r) * (PLAYER_RADIUS + pil.r)) return false;
      }
      p.x = nx;
      p.y = ny;
      return true;
    };
    const len = Math.hypot(dx, dy);
    if (len < 0.001) {
      p.moving = false;
      return;
    }
    p.moving = true;
    const nx = p.x + (dx / len) * PLAYER_SPEED * dt;
    const ny = p.y + (dy / len) * PLAYER_SPEED * dt;
    if (!tryMove(nx, p.y)) tryMove(p.x, ny);
    else tryMove(nx, ny);
  }

  grabLoot() {
    for (const item of this.loot) {
      if (item.taken) continue;
      const d = Math.hypot(this.player.x - item.x, this.player.y - item.y);
      if (d < GRAB_RADIUS) {
        item.taken = true;
        this.score += item.value;
        return item;
      }
    }
    return null;
  }

  fireEmp(sounds) {
    if (this.tools.emp <= 0) return false;
    this.tools.emp -= 1;
    for (const c of this.cameras) c.disabled = EMP_SECONDS;
    this.alarm = Math.min(100, this.alarm + ALARM_TOOL_COST);
    this.empFlash = 0.5;
    sounds.emp();
    return true;
  }

  dropNoisemaker(x, y, sounds) {
    if (this.tools.noise <= 0) return false;
    this.tools.noise -= 1;
    let nearest = null;
    let best = Infinity;
    for (const g of this.guards) {
      const d = Math.hypot(g.x - x, g.y - y);
      if (d < best) {
        best = d;
        nearest = g;
      }
    }
    if (nearest) nearest.lure(x, y, LURE_SECONDS);
    this.alarm = Math.min(100, this.alarm + ALARM_TOOL_COST);
    this.noiseFlash = { x, y, t: 1 };
    sounds.noise();
    return true;
  }

  /** One fixed step of the world. `dir` is a normalized move, `action` a tool. */
  step(dt, dir, action) {
    if (this.screen !== 'play') return;
    this.time += dt;
    if (dir) this.movePlayer(dir.x, dir.y, dt);
    updateWatchers(this, dt);
    if (this.alarm >= 100) {
      this.screen = 'caught';
      return;
    }
    const got = this.grabLoot();
    if (got) this.onLoot = got;
    const sunstone = this.loot.find((l) => l.id === 'sunstone');
    if (sunstone.taken && Math.hypot(this.player.x - EXIT.x, this.player.y - EXIT.y) < EXIT.r) {
      this.screen = 'win';
      this.score += Math.max(0, 300 - Math.floor(this.time * 2));
    }
    if (this.empFlash > 0) this.empFlash -= dt;
    if (this.noiseFlash) {
      this.noiseFlash.t -= dt;
      if (this.noiseFlash.t <= 0) this.noiseFlash = null;
    }
    void action;
  }
}

// --- Bootstrap: canvas, loop, screens, and the ?shot= scenes. ---

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = VIEW.width;
canvas.height = VIEW.height;

const params = new URLSearchParams(window.location.search);
const seed = Number(params.get('seed') || 1) || 1;
const shot = params.get('shot');
const world = new World(seed);
const input = new Input(canvas);
const sounds = new SoundBank();
input.onFirstGesture = () => sounds.unlock();

let shotScreen = null;
if (shot) {
  const staged = stageShot(shot, world);
  shotScreen = staged.screen;
  world.screen = staged.screen === 'title' ? 'title' : staged.screen;
  world.best = staged.best;
}

let last = performance.now();
let acc = 0;

function frame(now) {
  const elapsed = Math.min(0.1, (now - last) / 1000);
  last = now;
  if (!shot) {
    // Title screen: the world idles behind the banner.
    if (world.screen === 'title') {
      for (const g of world.guards) g.update(STEP);
      for (const c of world.cameras) c.update(STEP);
      if (input.take('enter') || input.clickTarget) {
        world.screen = 'play';
        input.clickTarget = null;
        sounds.unlock();
      }
    } else if (world.screen === 'play') {
      const kx = input.axis('a', 'd') || input.axis('arrowleft', 'arrowright');
      const ky = input.axis('w', 's') || input.axis('arrowup', 'arrowdown');
      let dir = null;
      if (kx !== 0 || ky !== 0) {
        input.clickTarget = null;
        dir = { x: kx, y: ky };
      } else if (input.clickTarget) {
        const dx = input.clickTarget.x - world.player.x;
        const dy = input.clickTarget.y - world.player.y;
        if (Math.hypot(dx, dy) < 10) input.clickTarget = null;
        else dir = { x: dx, y: dy };
      }
      if (input.take('e')) world.fireEmp(sounds);
      if (input.take('q')) {
        const at = input.noiseAt || { x: world.player.x, y: world.player.y };
        world.dropNoisemaker(at.x, at.y, sounds);
        input.noiseAt = null;
      }
      if (input.take('m')) sounds.toggleMute();
      acc += elapsed;
      while (acc >= STEP) {
        world.step(STEP, dir, null);
        acc -= STEP;
        if (world.screen !== 'play') break;
      }
      if (world.onLoot) {
        sounds.pickup();
        world.onLoot = null;
      }
      if (world.seen) sounds.spottedTick(world.time);
      if (world.screen === 'caught') sounds.caught();
      if (world.screen === 'win') sounds.win();
    } else if (input.take('r') || input.take('enter')) {
      world.reset();
    }
    input.endFrame();
  }
  render(now / 1000);
  requestAnimationFrame(frame);

// Debug hook for local play-testing: the staged world is inspectable.
window.__vesper = { world, stageShot };
}

function render(time) {
  drawFloor(ctx, time);
  drawVaultAndLoot(ctx, world, time);
  drawWatchers(ctx, world);
  drawCover(ctx, time);
  drawWalls(ctx);
  drawPlayer(ctx, world, time);
  if (world.empFlash > 0) {
    ctx.fillStyle = `rgba(120,200,255,${world.empFlash * 0.5})`;
    ctx.fillRect(0, VIEW.hud, VIEW.width, VIEW.height - VIEW.hud);
  }
  if (world.noiseFlash) {
    ctx.strokeStyle = `rgba(255,220,100,${world.noiseFlash.t})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(world.noiseFlash.x, world.noiseFlash.y, (1 - world.noiseFlash.t) * 60 + 10, 0, Math.PI * 2);
    ctx.stroke();
  }
  drawHud(ctx, world);
  if (world.screen === 'title') drawTitle(ctx, world, shot === 'start');
  else if (world.screen === 'caught') drawCaught(ctx, world);
  else if (world.screen === 'win') drawWin(ctx, world);
  const status = document.getElementById('status');
  if (status) {
    const seen = world.seen ? 'Spotted! ' : '';
    status.textContent = `${seen}Alarm ${Math.round(world.alarm)}. Loot ${world.loot.filter((l) => l.taken).length} of 3. Score ${world.score}.`;
  }
}

requestAnimationFrame(frame);
