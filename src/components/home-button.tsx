import { forwardRef, type AnchorHTMLAttributes } from 'react';

export interface HomeButtonProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> {
  /** Home URL; use your application's base path when it is not hosted at /. */
  href?: string;
  label?: string;
  variant?: 'surface' | 'solid' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  iconOnly?: boolean;
  disabled?: boolean;
  loading?: boolean;
  loadingLabel?: string;
  position?: 'inline' | 'bottom-left' | 'bottom-right';
  /** Handles ordinary same-tab clicks. Modified clicks keep native link behavior. */
  onNavigate?: (href: string) => void;
}

export const HomeButton = forwardRef<HTMLAnchorElement, HomeButtonProps>(
  function HomeButton({
    href = '/', label = '回到首页', variant = 'surface', size = 'md', iconOnly = false,
    disabled = false, loading = false, loadingLabel = '正在返回', position = 'inline',
    onNavigate, onClick, onAuxClick, target, download, rel, tabIndex, className,
    'aria-label': ariaLabel, title, ...props
  }, ref) {
    const unavailable = disabled || loading;
    const accessibleLabel = loading ? loadingLabel : (ariaLabel ?? label);
    const safeRel = target?.toLowerCase() === '_blank' ? Array.from(new Set(`${rel ?? ''} noopener`.trim().split(/\s+/))).join(' ') : rel;

    return <a {...props} ref={ref} href={unavailable ? undefined : href}
      role="link" target={target} download={download} rel={safeRel}
      aria-label={accessibleLabel} title={title ?? accessibleLabel}
      aria-disabled={unavailable || undefined} aria-busy={loading || props['aria-busy']}
      tabIndex={unavailable ? -1 : tabIndex}
      className={`ray-home-button ray-home-button--${variant} ray-home-button--${size} ray-home-button--${position}${iconOnly ? ' ray-home-button--icon-only' : ''}${loading ? ' ray-home-button--loading' : ''}${className ? ` ${className}` : ''}`}
      onClick={(event) => {
        if (unavailable) { event.preventDefault(); return; }
        if (event.defaultPrevented) return;
        onClick?.(event);
        if (event.defaultPrevented || !onNavigate || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if ((target && target.toLowerCase() !== '_self') || (download !== undefined && download !== false)) return;
        event.preventDefault();
        onNavigate(href);
      }}
      onAuxClick={(event) => {
        if (unavailable) { event.preventDefault(); return; }
        onAuxClick?.(event);
      }}>
      <span className="ray-home-button__icon" aria-hidden="true">
        <svg className="ray-home-button__house" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round">
          <path className="ray-home-button__door" d="M10 20v-6h4v6" />
          <path d="m3 10 9-7 9 7M5 9v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9" />
        </svg>
        {loading && <span className="ray-home-button__spinner" />}
      </span>
      {!iconOnly && <>
        <span className="ray-home-button__label" aria-hidden="true">{loading ? loadingLabel : label}</span>
        <svg className="ray-home-button__return" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 5v5a3 3 0 0 1-3 3H5m3-3-3 3 3 3" /></svg>
      </>}
    </a>;
  },
);
