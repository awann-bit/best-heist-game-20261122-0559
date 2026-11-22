// Input: keyboard and mouse, both steering the same thief.
// WASD or arrows move; a mouse click sets a walk target; E fires the EMP,
// Q drops the noisemaker at the cursor; Enter starts, R restarts, M mutes.
export class Input {
  constructor(canvas) {
    this.keys = new Set();
    this.clickTarget = null; // {x, y} in canvas pixels, or null
    this.noiseAt = null; // {x, y} where the noisemaker should land
    this.pressed = new Set(); // edge-triggered keys, consumed each frame
    this.canvas = canvas;
    this.onFirstGesture = null;

    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
      if (!e.repeat) this.pressed.add(e.key.toLowerCase());
      this.keys.add(e.key.toLowerCase());
      this.gesture();
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.key.toLowerCase()));
    canvas.addEventListener('mousedown', (e) => {
      this.gesture();
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
      const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
      if (e.button === 2) this.noiseAt = { x, y };
      else this.clickTarget = { x, y };
    });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    window.addEventListener('blur', () => this.keys.clear());
  }

  gesture() {
    if (this.onFirstGesture) this.onFirstGesture();
  }

  /** Was this key pressed since the last frame? Consumes it. */
  take(key) {
    if (this.pressed.has(key)) {
      this.pressed.delete(key);
      return true;
    }
    return false;
  }

  /** -1/0/1 movement on one axis from the held keys. */
  axis(neg, pos) {
    const n = this.keys.has(neg) ? 1 : 0;
    const p = this.keys.has(pos) ? 1 : 0;
    return p - n;
  }

  endFrame() {
    this.pressed.clear();
  }
}
