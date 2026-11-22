// The Marlowe Gallery: level data for "A Vesper Heist".
// One big top-down floor: a central hall, a west wing and an east wing, all
// reachable by more than one route. Walls and display cases block both
// movement and sight; velvet ropes are decoration only. Coordinates are in
// canvas pixels (1280 x 720); the HUD occupies the top 64 pixels.
export const VIEW = { width: 1280, height: 720, hud: 64 };

// Outer boundary of the playable floor (inside the outer walls).
export const FLOOR = { x: 24, y: 88, w: 1232, h: 608 };

// Solid walls (rectangles). The west and east wings are split from the hall
// by walls with two door gaps each, so every room has two ways in and out.
export const WALLS = [
  // West wing divider (x = 420), gaps at y 150-210 and y 420-480.
  { x: 420, y: 88, w: 16, h: 62 },
  { x: 420, y: 210, w: 16, h: 210 },
  { x: 420, y: 480, w: 16, h: 216 },
  // East wing divider (x = 844), gaps at y 150-210 and y 420-480.
  { x: 844, y: 88, w: 16, h: 62 },
  { x: 844, y: 210, w: 16, h: 210 },
  { x: 844, y: 480, w: 16, h: 216 },
  // Central vault plinth surround: a low wall ring with a gap at the bottom.
  { x: 560, y: 280, w: 160, h: 14 },
  { x: 560, y: 280, w: 14, h: 110 },
  { x: 706, y: 280, w: 14, h: 110 },
  // A long bench wall in the hall, leaving a lane on either side.
  { x: 480, y: 520, w: 320, h: 16 },
];

// Cover: display cases (rectangles) and pillars (circles). They block
// movement and sight, and they are what the thief hides behind.
export const CASES = [
  // West wing cases.
  { x: 90, y: 260, w: 120, h: 44, label: 'Amber Room' },
  { x: 260, y: 120, w: 120, h: 44, label: 'Silk Road' },
  { x: 90, y: 560, w: 120, h: 44, label: 'Ivory Hall' },
  { x: 260, y: 620, w: 120, h: 44, label: 'Bronze Age' },
  // East wing cases.
  { x: 1070, y: 260, w: 120, h: 44, label: 'Porcelain' },
  { x: 900, y: 120, w: 120, h: 44, label: 'Tea House' },
  { x: 1070, y: 560, w: 120, h: 44, label: 'Jade Court' },
  { x: 900, y: 620, w: 120, h: 44, label: 'Ink & Paper' },
  // Hall cases flanking the vault, leaving a centre lane and side lanes.
  { x: 480, y: 300, w: 44, h: 120, label: 'Marble' },
  { x: 756, y: 300, w: 44, h: 120, label: 'Obsidian' },
];

export const PILLARS = [
  { x: 640, y: 480, r: 22 },
  { x: 300, y: 480, r: 22 },
  { x: 980, y: 480, r: 22 },
  { x: 640, y: 620, r: 22 },
];

// The vault plinth the Sunstone sits on (solid, blocks movement).
export const VAULT = { x: 590, y: 310, w: 100, h: 56 };

// Loot: the Sunstone is the prize; the Idol and the Mask are the bonus haul.
export const LOOT = [
  { id: 'sunstone', name: 'The Sunstone', x: 640, y: 338, value: 500, color: '#ffd94d' },
  { id: 'idol', name: 'Jade Idol', x: 170, y: 190, value: 250, color: '#5fe08a' },
  { id: 'mask', name: 'Golden Mask', x: 1110, y: 190, value: 250, color: '#ffb347' },
];

export const SPAWN = { x: 640, y: 668 };
export const EXIT = { x: 640, y: 668, r: 26 };

// Guard patrol routes: each guard walks its waypoints and waits at each.
export const GUARD_ROUTES = [
  {
    name: 'Rook',
    speed: 62,
    waypoints: [
      { x: 460, y: 440 }, { x: 460, y: 180 }, { x: 820, y: 180 }, { x: 820, y: 440 },
    ],
  },
  {
    name: 'Bishop',
    speed: 54,
    waypoints: [
      { x: 120, y: 420 }, { x: 380, y: 420 }, { x: 380, y: 100 }, { x: 120, y: 100 },
    ],
  },
  {
    name: 'Knight',
    speed: 54,
    waypoints: [
      { x: 1160, y: 420 }, { x: 900, y: 420 }, { x: 900, y: 100 }, { x: 1160, y: 100 },
    ],
  },
];

// Security cameras on the walls. Each sweeps its cone back and forth.
export const CAMERAS = [
  { name: 'Cam A', x: 640, y: 100, baseAngle: Math.PI / 2, sweep: 0.9, speed: 0.55, range: 260 },
  // Cam B watches the east hall from its wall, leaving the entrance lane
  // unwatched so the thief can start the heist unseen.
  { name: 'Cam B', x: 1232, y: 400, baseAngle: Math.PI, sweep: 0.7, speed: 0.45, range: 240 },
];

// Velvet ropes: pure decoration, drawn as posts with a sagging rope.
export const ROPES = [
  { x: 560, y: 400, x2: 720, y2: 400 },
  { x: 560, y: 250, x2: 720, y2: 250 },
];

// --- Geometry helpers (shared by guards, render and the player). ---

export function pointInRect(px, py, r) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

export function circleHitsRect(cx, cy, cr, r) {
  const nx = Math.max(r.x, Math.min(cx, r.x + r.w));
  const ny = Math.max(r.y, Math.min(cy, r.y + r.h));
  const dx = cx - nx;
  const dy = cy - ny;
  return dx * dx + dy * dy < cr * cr;
}

function segmentHitsRect(x1, y1, x2, y2, r) {
  // Slab test for a segment against an axis-aligned rectangle.
  let tmin = 0;
  let tmax = 1;
  const dx = x2 - x1;
  const dy = y2 - y1;
  for (const [p, q] of [[-dx, x1 - r.x], [dx, r.x + r.w - x1], [-dy, y1 - r.y], [dy, r.y + r.h - y1]]) {
    if (p === 0) {
      if (q < 0) return true;
    } else {
      const t = q / p;
      if (p < 0) {
        if (t > tmax) return false;
        if (t > tmin) tmin = t;
      } else {
        if (t < tmin) return false;
        if (t < tmax) tmax = t;
      }
    }
  }
  return true;
}

function segmentHitsCircle(x1, y1, x2, y2, c) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  let t = len2 === 0 ? 0 : ((c.x - x1) * dx + (c.y - y1) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const px = x1 + dx * t;
  const py = y1 + dy * t;
  const ddx = px - c.x;
  const ddy = py - c.y;
  return ddx * ddx + ddy * ddy < c.r * c.r;
}

/** True when nothing solid stands between two points. */
export function hasLineOfSight(x1, y1, x2, y2) {
  for (const w of WALLS) if (segmentHitsRect(x1, y1, x2, y2, w)) return false;
  for (const c of CASES) if (segmentHitsRect(x1, y1, x2, y2, c)) return false;
  if (segmentHitsRect(x1, y1, x2, y2, VAULT)) return false;
  for (const p of PILLARS) if (segmentHitsCircle(x1, y1, x2, y2, p)) return false;
  return true;
}

/** Every solid rectangle that blocks movement (walls, cases, vault). */
export function solidRects() {
  return [...WALLS, ...CASES, VAULT];
}
