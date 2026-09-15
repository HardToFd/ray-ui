import { forwardRef, type HTMLAttributes } from 'react';

export interface NotificationHotspotProps extends HTMLAttributes<HTMLSpanElement> {
  /** Omit for a dot; invalid or negative counts are treated as zero. */
  count?: number;
  max?: number;
  showZero?: boolean;
  active?: boolean;
  pulse?: boolean;
  tone?: 'danger' | 'warning' | 'info' | 'success';
  placement?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  /** Accessible notification text; does not replace the child's name. */
  label?: string;
  announce?: boolean;
}

/** A non-interactive notification marker; child controls retain their own semantics. */
export const NotificationHotspot = forwardRef<HTMLSpanElement, NotificationHotspotProps>(
  function NotificationHotspot({ children, count, max = 99, showZero = false, active = true,
    pulse = false, tone = 'danger', placement = 'top-right', label, announce = false,
    className, ...props }, ref) {
    const value = typeof count === 'number' && Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
    const limit = Number.isFinite(max) ? Math.max(1, Math.floor(max)) : 99;
    const dot = count === undefined;
    const visible = active && (dot || value > 0 || showZero);
    const text = label ?? (dot ? '有新通知' : `${value} 条未读通知`);
    const displayValue = dot ? 'dot' : value > limit ? `${limit}+` : value;
    return (
      <span {...props} ref={ref} className={['ray-notification-hotspot', className].filter(Boolean).join(' ')}
        data-placement={placement} data-tone={tone} data-standalone={children == null || undefined}>
        {children}
        {visible && <span key={displayValue} className="ray-notification-hotspot__marker" data-dot={dot || undefined}
          data-pulse={pulse || undefined} aria-hidden="true">
          {!dot && (value > limit ? `${limit}+` : value)}
        </span>}
        <span className="ray-notification-hotspot__label" role={announce ? 'status' : undefined}
          aria-atomic={announce || undefined}>{visible ? text : ''}</span>
      </span>
    );
  },
);
