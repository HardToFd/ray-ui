import * as React from 'react';

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'defaultValue' | 'min' | 'max' | 'step' | 'size'> {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number) => void;
  formatValue?: (value: number) => string;
}

export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(function Slider(
  { label, value, min = 0, max = 100, step = 1, onValueChange, formatValue = String, onChange, id, className, style, disabled, ...props }, ref,
) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const current = Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : min;
  const progress = max > min ? (current - min) / (max - min) * 100 : 0;
  return (
    <div className={`ray-slider ${className ?? ''}`} data-disabled={disabled || undefined} style={style}>
      <div className="ray-slider__header">
        <label htmlFor={inputId}>{label}</label>
        <span className="ray-slider__value" aria-hidden="true">{formatValue(current)}</span>
      </div>
      <input {...props} ref={ref} id={inputId} type="range" min={min} max={max} step={step}
        value={current} disabled={disabled} aria-valuetext={props['aria-valuetext'] ?? formatValue(current)}
        className="ray-slider__input" style={{ '--slider-progress': `${progress}%` } as React.CSSProperties}
        onChange={(event) => { onValueChange?.(event.currentTarget.valueAsNumber); onChange?.(event); }} />
      <div className="ray-slider__bounds" aria-hidden="true"><span>{formatValue(min)}</span><span>{formatValue(max)}</span></div>
    </div>
  );
});
