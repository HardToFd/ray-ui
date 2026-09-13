import { forwardRef, useEffect, useId, useState, type HTMLAttributes, type MouseEventHandler } from 'react';

export interface PageNavigationProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Omit to scroll the window. Pass null while a custom container is mounting. */
  scrollTarget?: HTMLElement | null;
  /** Overrides browser history navigation. An onClickCapture handler can cancel the action. */
  onBack?: MouseEventHandler<HTMLButtonElement>;
  onForward?: MouseEventHandler<HTMLButtonElement>;
  /** Called before scrolling; preventDefault cancels the scroll. */
  onBackToTop?: MouseEventHandler<HTMLButtonElement>;
  /** Supply availability from your router; browser history does not expose its current index. */
  canGoBack?: boolean;
  canGoForward?: boolean;
  disabled?: boolean;
  orientation?: 'horizontal' | 'vertical';
  position?: 'inline' | 'bottom-right' | 'bottom-left';
  size?: 'sm' | 'md';
  showLabels?: boolean;
  showProgress?: boolean;
  /** Disable back-to-top at or below this distance in px. */
  topThreshold?: number;
  behavior?: ScrollBehavior;
  backLabel?: string;
  forwardLabel?: string;
  topLabel?: string;
}

function useScrollProgress(target: PageNavigationProps['scrollTarget']) {
  const [metrics, setMetrics] = useState({ top: 0, progress: 0 });

  useEffect(() => {
    if (target === null) {
      setMetrics({ top: 0, progress: 0 });
      return;
    }
    const root = target ?? document.documentElement;
    const scrollSource = target ?? window;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const scrollingElement = target ?? document.scrollingElement ?? root;
      const top = Math.max(0, scrollingElement.scrollTop);
      const distance = Math.max(0, scrollingElement.scrollHeight - (target ? target.clientHeight : document.documentElement.clientHeight));
      const progress = distance > 0 ? Math.round(Math.min(1, top / distance) * 100) : 0;
      setMetrics((previous) => previous.top === top && previous.progress === progress ? previous : { top, progress });
    };
    const schedule = () => { if (!frame) frame = window.requestAnimationFrame(measure); };
    const resizeObserver = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(schedule);
    const observeContent = () => {
      resizeObserver?.disconnect();
      resizeObserver?.observe(root);
      // Observe content as well as the viewport: a fixed-height container may not resize.
      for (const child of root.children) resizeObserver?.observe(child);
      schedule();
    };
    const mutationObserver = typeof MutationObserver === 'undefined' ? undefined : new MutationObserver(observeContent);
    mutationObserver?.observe(root, { childList: true, subtree: true, characterData: true });
    observeContent();
    scrollSource.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    // Image/font-driven layout changes also update progress without another scroll.
    root.addEventListener('load', schedule, true);
    return () => {
      scrollSource.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      root.removeEventListener('load', schedule, true);
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [target]);

  return metrics;
}

function DirectionIcon({ direction }: { direction: 'back' | 'forward' | 'top' }) {
  return <svg className="ray-page-navigation__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {direction === 'back' ? <path d="m10 6-6 6 6 6M4 12h16" /> : direction === 'forward' ? <path d="m14 6 6 6-6 6M20 12H4" /> : <path d="M5 4h14m-7 16V9m-5 5 5-5 5 5" />}
  </svg>;
}

export const PageNavigation = forwardRef<HTMLDivElement, PageNavigationProps>(
  function PageNavigation({
    scrollTarget, onBack, onForward, onBackToTop, canGoBack = true, canGoForward = true,
    disabled = false, orientation = 'horizontal', position = 'inline', size = 'md',
    showLabels = false, showProgress = true, topThreshold = 32, behavior = 'smooth',
    backLabel = '后退', forwardLabel = '前进', topLabel = '回到顶部',
    className, 'aria-label': ariaLabel = '页面导航', ...props
  }, ref) {
    const { top, progress } = useScrollProgress(scrollTarget);
    const progressId = useId();
    const threshold = Number.isFinite(topThreshold) ? Math.max(0, topThreshold) : 32;
    const topDisabled = disabled || scrollTarget === null || top <= threshold;

    return <div {...props} ref={ref} role="group" aria-label={ariaLabel}
      className={`ray-page-navigation ray-page-navigation--${orientation} ray-page-navigation--${position} ray-page-navigation--${size}${showLabels ? ' ray-page-navigation--labeled' : ''}${className ? ` ${className}` : ''}`}>
      <button type="button" className="ray-page-navigation__button" aria-label={backLabel} title={backLabel} disabled={disabled || !canGoBack}
        onClick={(event) => { if (event.defaultPrevented) return; if (onBack) onBack(event); else window.history.back(); }}>
        <span className="ray-page-navigation__icon"><DirectionIcon direction="back" /></span>
        {showLabels && <span className="ray-page-navigation__label" aria-hidden="true">{backLabel}</span>}
      </button>
      <button type="button" className="ray-page-navigation__button" aria-label={forwardLabel} title={forwardLabel} disabled={disabled || !canGoForward}
        onClick={(event) => { if (event.defaultPrevented) return; if (onForward) onForward(event); else window.history.forward(); }}>
        <span className="ray-page-navigation__icon"><DirectionIcon direction="forward" /></span>
        {showLabels && <span className="ray-page-navigation__label" aria-hidden="true">{forwardLabel}</span>}
      </button>
      <span className="ray-page-navigation__divider" aria-hidden="true" />
      <button type="button" className="ray-page-navigation__button ray-page-navigation__top" aria-label={topLabel} title={showProgress ? `${topLabel} · 已阅读 ${progress}%` : topLabel}
        aria-describedby={showProgress ? progressId : undefined} disabled={topDisabled}
        onClick={(event) => {
          if (event.defaultPrevented) return;
          onBackToTop?.(event);
          if (event.defaultPrevented || scrollTarget === null) return;
          const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
          (scrollTarget ?? window).scrollTo({ top: 0, behavior: reducedMotion ? 'instant' : behavior });
        }}>
        <span className="ray-page-navigation__icon">
          {showProgress && <svg className="ray-page-navigation__progress" viewBox="0 0 40 40" fill="none" aria-hidden="true">
            <circle className="ray-page-navigation__track" cx="20" cy="20" r="17" strokeWidth="1.5" />
            <circle className="ray-page-navigation__fill" cx="20" cy="20" r="17" strokeWidth="1.5" pathLength="100" strokeDasharray="100" strokeDashoffset={100 - progress} strokeLinecap="round" />
          </svg>}
          <DirectionIcon direction="top" />
        </span>
        {showLabels && <span className="ray-page-navigation__label" aria-hidden="true">{topLabel}</span>}
      </button>
      {showProgress && <span className="ray-page-navigation__sr-only" id={progressId}>已阅读 {progress}%</span>}
    </div>;
  },
);
