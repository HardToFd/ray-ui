import { forwardRef, type CSSProperties, type HTMLAttributes } from 'react';

export interface ProgressRingProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  value?: number | null;
  max?: number;
  size?: 'sm' | 'md' | 'lg' | number;
  strokeWidth?: number;
  label?: string;
  showValue?: boolean;
  formatValue?: (value: number, max: number) => string;
  tone?: 'accent' | 'success' | 'warning' | 'danger';
}

function finite(value: number, fallback: number) { return Number.isFinite(value) ? value : fallback; }

export const ProgressRing = forwardRef<HTMLDivElement, ProgressRingProps>(
  function ProgressRing({ value = 0, max = 100, size = 'md', strokeWidth = 8, label = '进度', showValue = true, formatValue = (current, limit) => `${Math.round(current / limit * 100)}%`, tone = 'accent', className = '', style, ...props }, ref) {
    const limit = Math.max(Number.EPSILON, finite(max, 100));
    const determinate = value !== null;
    const current = Math.min(limit, Math.max(0, finite(value ?? 0, 0)));
    const percent = current / limit;
    const stroke = Math.min(18, Math.max(2, finite(strokeWidth, 8)));
    const radius = 50 - stroke / 2;
    const cssSize = typeof size === 'number' ? `${Math.max(24, Math.min(512, finite(size, 96)))}px` : undefined;
    const mergedStyle = { '--ray-progress-size': cssSize, '--ray-progress-value': `${percent * 100}%` , ...style } as CSSProperties;
    return <div {...props} ref={ref} role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={limit} aria-valuenow={determinate ? current : undefined} data-tone={tone} data-indeterminate={!determinate || undefined} data-size={typeof size === 'number' ? 'custom' : size} className={`ray-progress-ring${className ? ` ${className}` : ''}`} style={mergedStyle}>
      <svg className="ray-progress-ring__svg" viewBox="0 0 100 100" aria-hidden="true">
        <circle className="ray-progress-ring__track" cx="50" cy="50" r={radius} pathLength="100" strokeWidth={stroke} />
        <circle className="ray-progress-ring__bar" cx="50" cy="50" r={radius} pathLength="100" strokeWidth={stroke} strokeDasharray="100" strokeDashoffset={determinate ? 100 - percent * 100 : undefined} />
      </svg>
      {showValue && <span className="ray-progress-ring__value">{determinate ? formatValue(current, limit) : '…'}</span>}
    </div>;
  },
);
