import { forwardRef, useEffect, useRef, type HTMLAttributes } from 'react';
import { drawBreath, type BreathingTone, type BreathingVariant, type BreathingStatus } from './breathing-renderer';
export type { BreathingTone, BreathingVariant, BreathingStatus } from './breathing-renderer';

export interface BreathingIndicatorProps extends HTMLAttributes<HTMLSpanElement> {
  label?: string;
  status?: BreathingStatus;
  description?: string;
  variant?: BreathingVariant;
  tone?: BreathingTone;
  size?: 'sm' | 'md' | 'lg';
  paused?: boolean;
  /** Base motion duration in milliseconds; minimum 1600 ms. */
  duration?: number;
  hideLabel?: boolean;
}

export const BreathingIndicator = forwardRef<HTMLSpanElement, BreathingIndicatorProps>(
  function BreathingIndicator({ label, status = 'normal', description, variant = 'glow', tone = 'green', size = 'md', paused = false, duration = 6000, hideLabel = false, className = '', ...props }, ref) {
    const statusLabel = label ?? { normal: '正常运行', degraded: '系统部分出错', failed: '系统完全瘫痪' }[status];
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const phaseRef = useRef(0);
    const period = Number.isFinite(duration) ? Math.max(1600, duration) : 6000;
    useEffect(() => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;
      const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
      let frame = 0, last = 0, rendered = 0;
      let visible = true, disposed = false;
      let width = 0, height = 0, dark = false;
      const paint = () => {
        if (width && height) drawBreath(ctx, width, height, status === 'failed' ? 0 : phaseRef.current, variant, tone, dark, status);
      };
      const tick = (now: number) => {
        if (disposed) return;
        const delta = last ? Math.min(now - last, 64) : 0;
        last = now;
        const speed = status === 'degraded' ? .2 + .8 * Math.pow(Math.sin(phaseRef.current * 1.4), 2) : 1;
        phaseRef.current += delta / period * Math.PI * 2 * speed;
        if (now - rendered >= 1000 / 30) { paint(); rendered = now; }
        frame = requestAnimationFrame(tick);
      };
      const sync = () => {
        cancelAnimationFrame(frame); last = 0; paint();
        if (!paused && status !== 'failed' && !motion.matches && visible && !document.hidden) frame = requestAnimationFrame(tick);
      };
      const resize = () => {
        const rect = canvas.getBoundingClientRect();
        width = rect.width; height = rect.height;
        const density = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(width * density); canvas.height = Math.round(height * density);
        ctx.setTransform(density, 0, 0, density, 0, 0); paint();
      };
      const theme = () => { dark = getComputedStyle(canvas).getPropertyValue('--ray-breath-dark').trim() === '1'; paint(); };
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(canvas);
      const intersectionObserver = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
      intersectionObserver.observe(canvas);
      const themeObserver = new MutationObserver(theme);
      for (let parent = canvas.parentElement; parent; parent = parent.parentElement) {
        themeObserver.observe(parent, { attributes: true, attributeFilter: ['data-ray-theme', 'class', 'style'] });
      }
      motion.addEventListener('change', sync);
      document.addEventListener('visibilitychange', sync);
      theme(); resize(); sync();
      return () => {
        disposed = true; cancelAnimationFrame(frame);
        resizeObserver.disconnect(); intersectionObserver.disconnect(); themeObserver.disconnect();
        motion.removeEventListener('change', sync); document.removeEventListener('visibilitychange', sync);
      };
    }, [variant, tone, size, paused, period, status]);
    return <span role="status" {...props} ref={ref} className={`ray-breathing-indicator ${className}`} data-status={status} data-variant={variant} data-size={size} data-paused={paused || undefined}>
      <canvas ref={canvasRef} className="ray-breathing-indicator__art" aria-hidden="true" />
      <span className={hideLabel ? 'ray-breathing-indicator__hidden-label' : 'ray-breathing-indicator__copy'}>
        <span className="ray-breathing-indicator__label">{statusLabel}</span>
        {description && <span className="ray-breathing-indicator__description">{description}</span>}
      </span>
    </span>;
  },
);
