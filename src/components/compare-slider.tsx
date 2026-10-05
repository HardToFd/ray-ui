import { forwardRef, useRef, useState, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';

export interface CompareSliderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'defaultValue' | 'onChange'> {
  /** Non-interactive visual content; both layers keep the full stage dimensions. */
  before: ReactNode;
  after: ReactNode;
  beforeLabel?: string;
  afterLabel?: string;
  label?: string;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  orientation?: 'horizontal' | 'vertical';
  disabled?: boolean;
}

const normalize = (value: number) => Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 50;

export const CompareSlider = forwardRef<HTMLDivElement, CompareSliderProps>(function CompareSlider({
  before, after, beforeLabel = '之前', afterLabel = '之后', label = '前后对比', value,
  defaultValue = 50, onValueChange, orientation = 'horizontal', disabled = false, className = '', style, ...props
}, ref) {
  const [local, setLocal] = useState(() => normalize(defaultValue));
  const pointer = useRef<number | null>(null);
  const current = normalize(value ?? local);
  const vertical = orientation === 'vertical';
  const change = (next: number) => {
    const normalized = normalize(next);
    if (disabled || normalized === current) return;
    if (value === undefined) setLocal(normalized);
    onValueChange?.(normalized);
  };
  const move = (element: HTMLDivElement, x: number, y: number) => {
    const rect = element.getBoundingClientRect();
    const extent = vertical ? rect.height : rect.width;
    if (extent > 0) change(Math.round(((vertical ? y - rect.top : x - rect.left) / extent) * 100));
  };
  return <div {...props} ref={ref} className={`ray-compare-slider ${className}`} data-orientation={orientation}
    data-disabled={disabled || undefined} style={{ '--ray-compare-position': `${current}%`, ...style } as CSSProperties}>
    <div className="ray-compare-slider__layer" aria-hidden="true" inert>{after}</div>
    <div className="ray-compare-slider__layer ray-compare-slider__before" aria-hidden="true" inert>{before}</div>
    <div className="ray-compare-slider__labels" aria-hidden="true"><span>{beforeLabel}</span><span>{afterLabel}</span></div>
    <div className="ray-compare-slider__control" role="slider" tabIndex={disabled ? -1 : 0}
      aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={current}
      aria-valuetext={`${beforeLabel} ${current}%，${afterLabel} ${100 - current}%`}
      aria-orientation={orientation} aria-disabled={disabled || undefined}
      onKeyDown={(event) => {
        if (disabled) return;
        const steps: Record<string, number> = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: 10, PageDown: -10 };
        if (event.key === 'Home' || event.key === 'End' || event.key in steps) {
          event.preventDefault();
          change(event.key === 'Home' ? 0 : event.key === 'End' ? 100 : current + steps[event.key]);
        }
      }}
      onPointerDown={(event) => {
        if (disabled || event.button !== 0 || pointer.current !== null) return;
        pointer.current = event.pointerId;
        event.currentTarget.focus();
        event.currentTarget.setPointerCapture(event.pointerId);
        move(event.currentTarget, event.clientX, event.clientY);
      }}
      onPointerMove={(event) => {
        if (pointer.current === event.pointerId) move(event.currentTarget, event.clientX, event.clientY);
      }}
      onPointerUp={(event) => {
        if (pointer.current !== event.pointerId) return;
        move(event.currentTarget, event.clientX, event.clientY);
        pointer.current = null;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
      }}
      onPointerCancel={() => { pointer.current = null; }}
      onLostPointerCapture={() => { pointer.current = null; }}>
      <span className="ray-compare-slider__divider" aria-hidden="true"><span className="ray-compare-slider__handle">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="m8 8-4 4 4 4m8-8 4 4-4 4M12 6v12" /></svg>
      </span></span>
    </div>
  </div>;
});
