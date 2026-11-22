// Render: every pixel of the Marlowe Gallery, drawn in code.
// The look is deliberate: deep teal marble, a red carpet runner down the
// hall, gold trim on the cases, amber guard cones and red camera cones, and
// loot that glows gold. At a glance you can tell safe cover (dark glass
// cases, stone pillars), danger (warm cones) and loot (gold pulse) apart.
import { VIEW, FLOOR, WALLS, CASES, PILLARS, VAULT, ROPES, LOOT } from './levels.js';

const FLOOR_A = '#17323a';
const FLOOR_B = '#1d3d46';
const CARPET = '#7a2430';
const GOLD = '#c9a227';
const WALL_FILL = '#0e1e26';
const WALL_TOP = '#2b4a56';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function drawFloor(ctx, time) {
  const { x, y, w, h } = FLOOR;
  // Marble checker.
  const tile = 44;
  for (let ty = y; ty < y + h; ty += tile) {
    for (let tx = x; tx < x + w; tx += tile) {
      const odd = (Math.floor((tx - x) / tile) + Math.floor((ty - y) / tile)) % 2 === 0;
      ctx.fillStyle = odd ? FLOOR_A : FLOOR_B;
      ctx.fillRect(tx, ty, Math.min(tile, x + w - tx), Math.min(tile, y + h - ty));
    }
  }
  // Red carpet runner down the centre of the hall.
  ctx.fillStyle = CARPET;
  ctx.fillRect(596, y, 88, h);
  ctx.fillStyle = 'rgba(201,162,39,0.55)';
  ctx.fillRect(596, y, 3, h);
  ctx.fillRect(681, y, 3, h);
  // Gold trim around the floor edge.
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
  // Velvet ropes.
  for (const rope of ROPES) {
    ctx.strokeStyle = '#8a1f2d';
    ctx.lineWidth = 4;
    ctx.beginPath();
    const mx = (rope.x + rope.x2) / 2;
    const my = Math.max(rope.y, rope.y2) + 14;
    ctx.moveTo(rope.x, rope.y);
    ctx.quadraticCurveTo(mx, my, rope.x2, rope.y2);
    ctx.stroke();
    ctx.fillStyle = GOLD;
    ctx.beginPath();
    ctx.arc(rope.x, rope.y, 5, 0, Math.PI * 2);
    ctx.arc(rope.x2, rope.y2, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  void time;
}

export function drawWalls(ctx) {
  for (const w of WALLS) {
    ctx.fillStyle = WALL_FILL;
    ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.fillStyle = WALL_TOP;
    ctx.fillRect(w.x, w.y, w.w, 4);
  }
  // Outer walls.
  ctx.fillStyle = WALL_FILL;
  ctx.fillRect(0, FLOOR.y - 24, VIEW.width, 24);
  ctx.fillRect(0, FLOOR.y + FLOOR.h, VIEW.width, 24);
  ctx.fillRect(0, FLOOR.y - 24, 24, FLOOR.h + 48);
  ctx.fillRect(VIEW.width - 24, FLOOR.y - 24, 24, FLOOR.h + 48);
  ctx.fillStyle = WALL_TOP;
  ctx.fillRect(0, FLOOR.y - 24, VIEW.width, 4);
  // The entrance door at the bottom centre.
  ctx.fillStyle = '#3a2c14';
  ctx.fillRect(596, FLOOR.y + FLOOR.h - 6, 88, 30);
  ctx.fillStyle = GOLD;
  ctx.font = 'bold 13px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('EXIT', 640, FLOOR.y + FLOOR.h + 15);
}

export function drawCover(ctx, time) {
  for (const c of CASES) {
    ctx.fillStyle = '#0a1418';
    ctx.fillRect(c.x - 3, c.y - 3, c.w + 6, c.h + 6);
    ctx.fillStyle = '#274b57';
    ctx.fillRect(c.x, c.y, c.w, c.h);
    // Glass glint sweeping across the case.
    const glint = ((time * 0.12 + c.x * 0.01) % 1) * (c.w + 40) - 20;
    ctx.fillStyle = 'rgba(255,255,255,0.14)';
    ctx.beginPath();
    ctx.moveTo(c.x + glint, c.y);
    ctx.lineTo(c.x + glint + 18, c.y);
    ctx.lineTo(c.x + glint + 6, c.y + c.h);
    ctx.lineTo(c.x + glint - 12, c.y + c.h);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 2;
    ctx.strokeRect(c.x, c.y, c.w, c.h);
    ctx.fillStyle = '#d8c690';
    ctx.font = '11px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(c.label, c.x + c.w / 2, c.y + c.h / 2 + 4);
  }
  for (const p of PILLARS) {
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(p.x + 4, p.y + 5, p.r + 2, p.r + 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#33525e';
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r - 2, 0, Math.PI * 2);
    ctx.stroke();
  }
}

export function drawVaultAndLoot(ctx, world, time) {
  // Vault plinth.
  ctx.fillStyle = '#1c1210';
  ctx.fillRect(VAULT.x - 4, VAULT.y - 4, VAULT.w + 8, VAULT.h + 8);
  ctx.fillStyle = '#4a2f1d';
  ctx.fillRect(VAULT.x, VAULT.y, VAULT.w, VAULT.h);
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;
  ctx.strokeRect(VAULT.x, VAULT.y, VAULT.w, VAULT.h);
  for (const item of world.loot) {
    if (item.taken) continue;
    const pulse = 0.6 + 0.4 * Math.sin(time * 3 + item.x);
    // Gold halo so loot reads at a glance.
    const glow = ctx.createRadialGradient(item.x, item.y, 2, item.x, item.y, 34);
    glow.addColorStop(0, `rgba(255,217,77,${0.55 * pulse})`);
    glow.addColorStop(1, 'rgba(255,217,77,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(item.x, item.y, 34, 0, Math.PI * 2);
    ctx.fill();
    // The piece itself: a cut gem.
    ctx.save();
    ctx.translate(item.x, item.y);
    ctx.rotate(Math.sin(time * 1.4 + item.x) * 0.15);
    ctx.fillStyle = item.color;
    ctx.beginPath();
    ctx.moveTo(0, -13);
    ctx.lineTo(10, 0);
    ctx.lineTo(0, 13);
    ctx.lineTo(-10, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#fff8d6';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = '#ffeeb0';
    ctx.font = 'bold 11px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(item.name, item.x, item.y - 24);
  }
}

function drawCone(ctx, watcher, color, disabled) {
  if (disabled) return;
  ctx.save();
  ctx.translate(watcher.x, watcher.y);
  ctx.rotate(watcher.angle);
  const grad = ctx.createRadialGradient(0, 0, 10, 0, 0, watcher.range);
  grad.addColorStop(0, color.replace('A', '0.34'));
  grad.addColorStop(1, color.replace('A', '0'));
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, watcher.range, -watcher.halfAngle, watcher.halfAngle);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function drawWatchers(ctx, world) {
  for (const g of world.guards) {
    const hot = g.alert > 0.25;
    drawCone(ctx, g, hot ? 'rgba(255,64,32,A)' : 'rgba(255,176,32,A)', false);
  }
  for (const c of world.cameras) {
    drawCone(ctx, c, 'rgba(255,64,64,A)', c.disabled > 0);
    // Camera body on the wall.
    ctx.fillStyle = c.disabled > 0 ? '#3a3a3a' : '#20242a';
    ctx.beginPath();
    ctx.arc(c.x, c.y, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = c.disabled > 0 ? '#555' : '#ff4040';
    ctx.beginPath();
    ctx.arc(c.x, c.y, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const g of world.guards) {
    // Guard: navy body, cap, facing tick.
    ctx.fillStyle = '#1d2f6e';
    ctx.beginPath();
    ctx.arc(g.x, g.y, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#8fa3e8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(g.x, g.y, 13, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#dfe6ff';
    ctx.beginPath();
    ctx.arc(g.x + Math.cos(g.angle) * 8, g.y + Math.sin(g.angle) * 8, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#cfe0ff';
    ctx.font = 'bold 10px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(g.name, g.x, g.y - 18);
    if (g.alert > 0.25) {
      ctx.fillStyle = g.alert > 0.7 ? '#ff4030' : '#ffb020';
      ctx.font = 'bold 16px Georgia, serif';
      ctx.fillText('!', g.x, g.y - 30);
    }
  }
}

export function drawPlayer(ctx, world, time) {
  const p = world.player;
  // Soft shadow and a dark cloak body.
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath();
  ctx.ellipse(p.x + 3, p.y + 4, 13, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  const bob = Math.sin(time * 10) * (p.moving ? 1.5 : 0);
  ctx.fillStyle = '#14100c';
  ctx.beginPath();
  ctx.arc(p.x, p.y + bob * 0.4, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(p.x, p.y + bob * 0.4, 12, 0, Math.PI * 2);
  ctx.stroke();
  // Domino mask and hat brim.
  ctx.fillStyle = '#e8e4d8';
  ctx.fillRect(p.x - 8, p.y - 3 + bob * 0.4, 16, 5);
  ctx.fillStyle = '#14100c';
  ctx.fillRect(p.x - 5, p.y - 2 + bob * 0.4, 3, 3);
  ctx.fillRect(p.x + 2, p.y - 2 + bob * 0.4, 3, 3);
  ctx.fillStyle = '#14100c';
  ctx.beginPath();
  ctx.ellipse(p.x, p.y - 8 + bob * 0.4, 13, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffe9a8';
  ctx.font = 'bold 11px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('VESPER', p.x, p.y - 20);
}

export function drawHud(ctx, world) {
  const { width } = VIEW;
  ctx.fillStyle = '#0b161b';
  ctx.fillRect(0, 0, width, VIEW.hud);
  ctx.fillStyle = GOLD;
  ctx.fillRect(0, VIEW.hud - 2, width, 2);
  ctx.fillStyle = '#f2e6c0';
  ctx.font = 'bold 20px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.fillText('THE MARLOWE GALLERY', 20, 26);
  ctx.font = '13px Georgia, serif';
  ctx.fillStyle = '#9fb8bd';
  ctx.fillText('A Vesper Heist — grab the Sunstone, slip out the door', 20, 48);
  // Alarm meter.
  const ax = 470;
  const ay = 18;
  const aw = 300;
  ctx.fillStyle = '#20242a';
  roundRect(ctx, ax, ay, aw, 22, 6);
  ctx.fill();
  const alarmFrac = world.alarm / 100;
  const alarmColor = world.alarm > 70 ? '#ff4030' : world.alarm > 35 ? '#ffb020' : '#5fe08a';
  ctx.fillStyle = alarmColor;
  if (alarmFrac > 0) {
    roundRect(ctx, ax + 2, ay + 2, Math.max(8, (aw - 4) * alarmFrac), 18, 5);
    ctx.fill();
  }
  ctx.strokeStyle = '#f2e6c0';
  ctx.lineWidth = 1.5;
  roundRect(ctx, ax, ay, aw, 22, 6);
  ctx.stroke();
  ctx.fillStyle = '#f2e6c0';
  ctx.font = 'bold 13px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.fillText(world.seen ? 'SPOTTED!' : 'ALARM', ax, ay - 4);
  // Loot tally.
  const got = world.loot.filter((l) => l.taken).length;
  ctx.fillStyle = '#ffe9a8';
  ctx.font = 'bold 16px Georgia, serif';
  ctx.fillText(`LOOT ${got}/3   ★ ${world.score}`, 800, 30);
  ctx.font = '13px Georgia, serif';
  ctx.fillStyle = '#9fb8bd';
  ctx.fillText(`EMP ×${world.tools.emp}  [E]    Noisemaker ×${world.tools.noise}  [Q]`, 800, 50);
  // Timer.
  ctx.fillStyle = '#f2e6c0';
  ctx.font = 'bold 16px Georgia, serif';
  ctx.textAlign = 'right';
  ctx.fillText(formatTime(world.time), width - 20, 30);
  ctx.textAlign = 'left';
}

function formatTime(t) {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function banner(ctx, title, lines, color) {
  const { width } = VIEW;
  ctx.fillStyle = 'rgba(6,12,15,0.82)';
  ctx.fillRect(0, 250, width, 220);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 260, width - 20, 200);
  ctx.fillStyle = color;
  ctx.font = 'bold 44px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, width / 2, 320);
  ctx.fillStyle = '#f2e6c0';
  ctx.font = '18px Georgia, serif';
  lines.forEach((line, i) => ctx.fillText(line, width / 2, 360 + i * 28));
  ctx.textAlign = 'left';
}

export function drawTitle(ctx, world, compact = false) {
  if (compact) {
    // Slim ribbon along the bottom for the cover shot: the title reads,
    // but the vault, the cones, the cameras and the loot stay visible.
    ctx.fillStyle = 'rgba(6,12,15,0.85)';
    ctx.fillRect(0, 600, VIEW.width, 96);
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 608, VIEW.width - 20, 80);
    ctx.fillStyle = GOLD;
    ctx.font = 'bold 40px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('A VESPER HEIST', VIEW.width / 2, 648);
    ctx.fillStyle = '#f2e6c0';
    ctx.font = '16px Georgia, serif';
    ctx.fillText('Dodge the cones, grab the Sunstone, and slip out the door.', VIEW.width / 2, 676);
    ctx.textAlign = 'left';
    return;
  }
  banner(
    ctx,
    'A VESPER HEIST',
    [
      'WASD / arrows to move — click to walk — E for EMP, Q for the noisemaker',
      'Dodge the cones, grab the Sunstone, and slip out the door.',
      'Press ENTER or click to begin',
    ],
    GOLD,
  );
  void world;
}

export function drawCaught(ctx, world) {
  banner(
    ctx,
    'CAUGHT!',
    [
      `The alarm hit 100 — the guards closed in after ${formatTime(world.time)}.`,
      `Loot secured: ${world.loot.filter((l) => l.taken).length}/3   Score: ${world.score}`,
      'Press R to try the gallery again',
    ],
    '#ff4030',
  );
}

export function drawWin(ctx, world) {
  banner(
    ctx,
    'CLEAN GETAWAY',
    [
      `Vesper slips into the night with the Sunstone — ${formatTime(world.time)}.`,
      `Loot secured: ${world.loot.filter((l) => l.taken).length}/3   Score: ${world.score}`,
      'Press R to plan the next heist',
    ],
    '#5fe08a',
  );
}
