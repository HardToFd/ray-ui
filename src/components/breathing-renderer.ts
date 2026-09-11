export type BreathingVariant = 'glow' | 'orbit' | 'wave';
export type BreathingStatus = 'normal' | 'degraded' | 'failed';
type Point = [number, number];
const TAU = Math.PI * 2;
const palettes = { green: [153, 172], blue: [210, 181], orange: [22, 44], purple: [271, 310] } as const;
export type BreathingTone = keyof typeof palettes;

/** Normalized artwork coordinates keep motion independent of resolution. */
export function drawBreath(ctx: CanvasRenderingContext2D, width: number, height: number, phase: number, variant: BreathingVariant, tone: BreathingTone, dark: boolean, status: BreathingStatus = 'normal') {
  const [hue, accent] = status === 'failed' ? [2, 8] : status === 'degraded' ? [35, 44] : palettes[tone];
  const color = (alpha: number, light = 48, h: number = hue) => `hsla(${h}, 62%, ${dark ? light + 12 : light}%, ${alpha})`;
  const radial = (x: number, y: number, r: number, alpha: number, h: number = hue) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color(alpha, 62, h)); g.addColorStop(.42, color(alpha * .5, 60, h)); g.addColorStop(1, color(0, 60, h));
    ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  };
  const path = (points: Point[], close = false) => {
    ctx.beginPath(); points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); if (close) ctx.closePath();
  };
  ctx.clearRect(0, 0, width, height); ctx.save();
  ctx.scale(width / (variant === 'wave' ? 320 : 160), height / 160);
  if (status === 'failed' && variant !== 'orbit') {
    ctx.translate(0, 80); ctx.scale(1, variant === 'wave' ? .15 : .65); ctx.translate(0, -80);
  }
  if (variant === 'glow') {
    // Feathered volumes merge into one cloud; no closed polygon edges.
    const mist = (x: number, y: number, rx: number, ry: number, alpha: number, light: number, saturation = 38, h: number = hue) => {
      ctx.save(); ctx.translate(x, y); ctx.scale(rx, ry);
      const g = ctx.createRadialGradient(-.12, -.18, 0, 0, 0, 1);
      const ink = (a: number) => `hsla(${h}, ${saturation}%, ${light}%, ${a})`;
      g.addColorStop(0, ink(alpha));
      g.addColorStop(.28, ink(alpha * .94));
      g.addColorStop(.55, ink(alpha * .78));
      g.addColorStop(.78, ink(alpha * .26));
      g.addColorStop(1, ink(0));
      ctx.fillStyle = g; ctx.fillRect(-1, -1, 2, 2); ctx.restore();
    };
    const t = phase * .62;
    const driftX = Math.sin(t * .7) * 3, driftY = Math.cos(t * .53) * 2;
    ctx.save(); ctx.translate(driftX, driftY);
    // Diffuse atmosphere beneath the softly lit lobes.
    mist(80, 86, 69, 43, .22, dark ? 68 : 72, 46);
    const lobes = [
      [53, 87, 33, 27], [68, 69, 31, 34], [91, 63, 30, 31],
      [111, 79, 30, 28], [94, 95, 37, 26], [70, 98, 35, 23],
    ];
    lobes.forEach(([x, y, rx, ry], i) => {
      const p = t + i * 1.37;
      const cx = x + Math.sin(p * .83) * 10 + Math.cos(t * .71 + i * .6) * 3;
      const cy = y + Math.cos(p * .67) * 7;
      const swell = 1 + Math.sin(p * .77) * .16;
      const lift = 1 + Math.cos(p * .63) * .12;
      mist(cx, cy + 5, rx * swell, ry * lift, .49, dark ? 65 : 60, 52);
      mist(cx - 3, cy - 6, rx * swell * .92, ry * lift * .88, .43, dark ? 83 : 86, 35);
    });
    // Subsurface color and high, pearly light drift independently.
    mist(82 + Math.sin(t * .91) * 18, 92 + Math.cos(t * .74) * 6, 40, 20, .32, dark ? 63 : 52, 52, accent);
    mist(82 + Math.cos(t * .87) * 16, 64 + Math.sin(t * .68) * 7, 32, 23, .46, 98, 17);
    mist(57 + Math.sin(t * .7) * 6, 80 + Math.sin(t) * 5, 24, 21, .3, 96, 22);
    mist(112 + Math.cos(t * .8) * 7, 91 + Math.sin(t * .6) * 4, 30, 16, .2, 90, 26);
    // Thin wisps soften the outer silhouette without rotating the cloud.
    mist(42 + Math.sin(t * .4) * 5, 98, 28, 10, .17, 85, 32);
    mist(109 + Math.cos(t * .6) * 5, 104, 33, 9, .16, 87, 30);
    ctx.restore();
  } else if (variant === 'orbit') {
    const breath = .5 + .5 * Math.sin(phase * .85);
    const compact = width <= 60;
    const point = (a: number, layer: number): Point => {
      const r = 48 + Math.sin(a * 3 + phase * .5 + layer * .32) * 4 + Math.cos(a * 2 - phase * .38) * 3;
      return [80 + Math.cos(a) * r * 1.04, 80 + Math.sin(a) * r * .94];
    };
    for (let layer = 0; layer < 5; layer++) {
      const points: Point[] = [];
      for (let i = 0; i <= 144; i++) points.push(point(i / 144 * TAU, layer));
      path(points, true);
      const g = ctx.createLinearGradient(35, 30, 130, 130);
      g.addColorStop(0, color(layer === 0 ? .55 + breath * .2 : .16, 43));
      g.addColorStop(.35, color(layer === 0 ? .95 : .24, 38));
      g.addColorStop(.7, color(layer === 0 ? .85 : .22, 45, accent));
      g.addColorStop(1, color(layer === 0 ? .6 + breath * .2 : .12, 48));
      ctx.strokeStyle = g;
      ctx.lineWidth = layer === 0 ? (compact ? 5.5 : 3.2) + breath * 1.2 : 4;
      if (layer === 0) { ctx.shadowColor = color(.35 + breath * .25, 55, accent); ctx.shadowBlur = (compact ? 3 : 6) + breath * 4; }
      ctx.stroke(); ctx.shadowBlur = 0;
    }
    // A broken ring is a structural failure cue, independent of color.
    if (status === 'failed') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillRect(117, 57, 40, 18);
      ctx.globalCompositeOperation = 'source-over';
      ctx.restore();
      return;
    }
    const head = phase * .56 - Math.PI / 2;
    for (let i = 0; i < 32; i++) {
      path([point(head - (i + 1) * .026, 0), point(head - i * .026, 0)]);
      ctx.strokeStyle = color((1 - i / 32) * .95, 65, accent); ctx.lineWidth = compact ? 6 : 4; ctx.stroke();
    }
    const [x, y] = point(head, 0); radial(x, y, compact ? 20 : 17, .95, accent);
    ctx.beginPath(); ctx.arc(x, y, compact ? 5.2 : 3.8, 0, TAU);
    ctx.fillStyle = dark ? '#eefff9' : color(1, 38, accent); ctx.fill();
    ctx.beginPath(); ctx.arc(x - .7, y - .7, compact ? 2 : 1.5, 0, TAU);
    ctx.fillStyle = '#eefff9'; ctx.fill();
  } else {
    for (let layer = 0; layer < 3; layer++) {
      const top: Point[] = [], bottom: Point[] = [];
      for (let i = 0; i <= 128; i++) {
        const u = i / 128, envelope = Math.pow(Math.sin(u * Math.PI), 1.7);
        const travel = u * TAU * 1.2 - phase * .64 + layer * .65;
        const y = 80 + Math.sin(travel) * envelope * 18;
        const thickness = (8 + Math.sin(travel + .7) * 6) * envelope;
        top.push([u * 320, y - thickness * .5]); bottom.push([u * 320, y + thickness * .5]);
      }
      // Keep the changing ribbon silhouette centered within its canvas.
      const minY = Math.min(...top.map((point) => point[1]));
      const maxY = Math.max(...bottom.map((point) => point[1]));
      const offsetY = 80 - (minY + maxY) / 2;
      top.forEach((point) => { point[1] += offsetY; });
      bottom.forEach((point) => { point[1] += offsetY; });
      path([...top, ...bottom.reverse()], true);
      const g = ctx.createLinearGradient(0, 0, 320, 0);
      g.addColorStop(0, color(0)); g.addColorStop(.22, color(.14)); g.addColorStop(.5, color(layer === 0 ? .54 : .26, 42));
      g.addColorStop(.78, color(.24, 55, accent)); g.addColorStop(1, color(0)); ctx.fillStyle = g; ctx.fill();
      path(top); ctx.strokeStyle = g; ctx.lineWidth = layer === 0 ? 1.1 : .6; ctx.stroke();
    }
  }
  ctx.restore();
}
