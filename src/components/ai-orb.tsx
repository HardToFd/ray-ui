import { forwardRef, useEffect, useRef, useState, type CSSProperties, type HTMLAttributes } from 'react';
import { createOrbRenderer, type AIOrbState } from './ai-orb-renderer';

export type { AIOrbState } from './ai-orb-renderer';
export interface AIOrbProps extends HTMLAttributes<HTMLSpanElement> {
  state?: AIOrbState;
  /** Normalized audio amplitude (0–1). The component never accesses the microphone. */
  audioLevel?: number;
  /** Canvas size in CSS pixels (32–512), including the surrounding glow. */
  size?: 'sm' | 'md' | 'lg' | number;
  paused?: boolean;
  label?: string;
  hideLabel?: boolean;
}

const labels: Record<AIOrbState, string> = { idle: '随时倾听', listening: '正在聆听', thinking: '正在思考', speaking: '正在回应', error: '连接中断' };
const activity: Record<AIOrbState, number> = { idle: 0, listening: 0.4, thinking: 1, speaking: 0.7, error: 0 };
const speed: Record<AIOrbState, number> = { idle: 0.35, listening: 0.65, thinking: 1.55, speaking: 0.85, error: 0.2 };
const sizes = { sm: 64, md: 144, lg: 256 };

export const AIOrb = forwardRef<HTMLSpanElement, AIOrbProps>(function AIOrb({
  state = 'idle', audioLevel = 0, size = 'md', paused = false, label, hideLabel = false, className = '', style, ...props
}, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const settings = useRef({ state, audioLevel, paused });
  const phase = useRef(0);
  const syncRef = useRef<(() => void) | null>(null);
  const dimension = typeof size === 'number' ? (Number.isFinite(size) ? Math.min(512, Math.max(32, size)) : sizes.md) : sizes[size];

  useEffect(() => {
    settings.current = { state, audioLevel, paused };
    syncRef.current?.();
  }, [state, audioLevel, paused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let renderer: ReturnType<typeof createOrbRenderer> = null;
    let frame = 0, last = 0, lastPaint = 0, visible = true, disposed = false;
    let energy = 0, currentActivity = activity[settings.current.state], currentSpeed = speed[settings.current.state];
    let currentError = settings.current.state === 'error' ? 1 : 0;
    const motion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const paint = () => renderer?.draw({ time: phase.current, energy, activity: currentActivity, error: currentError });
    const canAnimate = () => renderer && !settings.current.paused && !motion?.matches && visible && !document.hidden;
    const tick = (now: number) => {
      frame = 0;
      if (disposed || !canAnimate()) return;
      const delta = last ? Math.min(now - last, 64) / 1000 : 0;
      last = now;
      const { state: mode, audioLevel: level } = settings.current;
      const target = mode === 'listening' || mode === 'speaking' ? (Number.isFinite(level) ? Math.max(0, Math.min(1, level)) : 0) : 0;
      const blend = 1 - Math.exp(-delta * 7);
      energy += (target - energy) * blend;
      currentActivity += (activity[mode] - currentActivity) * blend;
      currentSpeed += (speed[mode] - currentSpeed) * blend;
      currentError += ((mode === 'error' ? 1 : 0) - currentError) * blend;
      phase.current += delta * (currentSpeed + energy * 0.55);
      if (now - lastPaint >= 1000 / 30) { paint(); lastPaint = now; }
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      if (canAnimate()) {
        if (!frame) { last = 0; frame = requestAnimationFrame(tick); }
      } else {
        cancelAnimationFrame(frame); frame = 0; last = 0;
        currentError = settings.current.state === 'error' ? 1 : 0;
        currentActivity = activity[settings.current.state];
        paint();
      }
    };
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      paint();
    };
    const initialize = () => {
      renderer = createOrbRenderer(canvas);
      setReady(Boolean(renderer));
      resize(); sync();
    };
    const lost = (event: Event) => {
      event.preventDefault();
      cancelAnimationFrame(frame); frame = 0;
      renderer?.dispose(); renderer = null; setReady(false);
    };
    canvas.addEventListener('webglcontextlost', lost);
    canvas.addEventListener('webglcontextrestored', initialize);
    const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(resize);
    resizeObserver?.observe(canvas);
    const intersection = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting; sync();
    });
    intersection?.observe(canvas);
    motion?.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    syncRef.current = sync;
    initialize();
    return () => {
      disposed = true; syncRef.current = null; cancelAnimationFrame(frame);
      resizeObserver?.disconnect(); intersection?.disconnect(); renderer?.dispose();
      motion?.removeEventListener('change', sync); document.removeEventListener('visibilitychange', sync);
      canvas.removeEventListener('webglcontextlost', lost); canvas.removeEventListener('webglcontextrestored', initialize);
    };
  }, []);

  return <span {...props} ref={ref} className={`ray-ai-orb ${className}`} data-state={state} data-paused={paused || undefined}
    style={{ '--ray-orb-size': `${dimension}px`, ...style } as CSSProperties}>
    <span className="ray-ai-orb__visual" data-rendered={ready} aria-hidden="true">
      <span className="ray-ai-orb__fallback" />
      <canvas ref={canvasRef} className="ray-ai-orb__canvas" />
    </span>
    <span role="status" aria-atomic="true" className={hideLabel ? 'ray-ai-orb__sr-label' : 'ray-ai-orb__label'}>{label ?? labels[state]}</span>
  </span>;
});
