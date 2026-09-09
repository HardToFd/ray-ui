import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
} from 'react';

export interface SpotlightCardProps extends HTMLAttributes<HTMLDivElement> {}

/** A card whose subtle highlight follows the pointer. */
export const SpotlightCard = forwardRef<HTMLDivElement, SpotlightCardProps>(
  function SpotlightCard({ className, onPointerMove, children, ...props }, ref) {
    return (
      <div
        {...props}
        ref={ref}
        className={['ray-spotlight-card', className].filter(Boolean).join(' ')}
        onPointerMove={(event) => {
          const bounds = event.currentTarget.getBoundingClientRect();
          event.currentTarget.style.setProperty('--ray-spotlight-x', `${event.clientX - bounds.left}px`);
          event.currentTarget.style.setProperty('--ray-spotlight-y', `${event.clientY - bounds.top}px`);
          onPointerMove?.(event);
        }}
      >
        {children}
      </div>
    );
  },
);

export interface RevealProps extends HTMLAttributes<HTMLDivElement> {
  /** Animation delay in milliseconds. */
  delay?: number;
  /** Keep the content revealed after its first intersection. Defaults to true. */
  once?: boolean;
}

export const Reveal = forwardRef<HTMLDivElement, RevealProps>(function Reveal(
  { delay = 0, once = true, className, style, children, ...props },
  forwardedRef,
) {
  const elementRef = useRef<HTMLDivElement | null>(null);
  // Content remains readable before hydration and when JavaScript is unavailable.
  const [visible, setVisible] = useState(true);
  const hasRevealed = useRef(false);
  const setRef = useCallback(
    (element: HTMLDivElement | null) => {
      elementRef.current = element;
      if (typeof forwardedRef === 'function') return forwardedRef(element);
      if (forwardedRef) forwardedRef.current = element;
    },
    [forwardedRef],
  );

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const preference = typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : null;

    let observer: IntersectionObserver | undefined;
    const disconnect = () => {
      observer?.disconnect();
      observer = undefined;
    };

    const configureObserver = (reducedMotion: boolean) => {
      disconnect();
      if (reducedMotion || typeof IntersectionObserver === 'undefined' || (once && hasRevealed.current)) {
        setVisible(true);
        return;
      }

      const nextObserver = new IntersectionObserver(
        ([entry]) => {
          // A disconnected observer can still have queued notifications.
          if (!entry || observer !== nextObserver) return;
          if (entry.isIntersecting) {
            hasRevealed.current = true;
            setVisible(true);
            if (once) disconnect();
          } else if (!once) {
            setVisible(false);
          }
        },
        { threshold: 0, rootMargin: '0px 0px -16px 0px' },
      );
      observer = nextObserver;
      setVisible(false);
      nextObserver.observe(element);
    };

    const handlePreferenceChange = (event: MediaQueryListEvent) => configureObserver(event.matches);
    configureObserver(preference?.matches ?? false);
    preference?.addEventListener('change', handlePreferenceChange);
    return () => {
      disconnect();
      preference?.removeEventListener('change', handlePreferenceChange);
    };
  }, [once]);

  const revealStyle = {
    '--ray-reveal-delay': `${Number.isFinite(delay) ? Math.max(0, delay) : 0}ms`,
    ...style,
  } as CSSProperties;

  return (
    <div
      {...props}
      ref={setRef}
      className={['ray-reveal', className].filter(Boolean).join(' ')}
      data-visible={visible}
      style={revealStyle}
    >
      {children}
    </div>
  );
});

export interface AnimatedNumberProps {
  value: number;
  /** Animation duration in milliseconds. */
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

const numberFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });

export function AnimatedNumber({
  value,
  duration = 900,
  prefix = '',
  suffix = '',
  className,
}: AnimatedNumberProps) {
  const target = Number.isFinite(value) ? value : 0;
  const milliseconds = Number.isFinite(duration) ? Math.max(0, duration) : 900;
  const [displayValue, setDisplayValue] = useState(target);
  const currentValue = useRef(0);

  useEffect(() => {
    const preference = typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : null;
    let frame = 0;
    let stopped = false;
    const finish = () => {
      stopped = true;
      cancelAnimationFrame(frame);
      currentValue.current = target;
      setDisplayValue(target);
    };

    if (preference?.matches || milliseconds === 0 || typeof requestAnimationFrame === 'undefined') {
      currentValue.current = target;
      setDisplayValue(target);
      return;
    }

    const from = currentValue.current;
    let startedAt: number | undefined;
    setDisplayValue(from);
    const animate = (timestamp: number) => {
      if (stopped) return;
      startedAt ??= timestamp;
      const progress = Math.min(1, Math.max(0, (timestamp - startedAt) / milliseconds));
      const eased = 1 - (1 - progress) ** 3;
      // The weighted sum also avoids overflowing target - from for large values.
      const next = progress === 1 ? target : from * (1 - eased) + target * eased;
      currentValue.current = Number.isFinite(next) ? next : target;
      setDisplayValue(currentValue.current);
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);

    const handlePreferenceChange = (event: MediaQueryListEvent) => {
      if (event.matches) finish();
    };
    preference?.addEventListener('change', handlePreferenceChange);
    return () => {
      stopped = true;
      cancelAnimationFrame(frame);
      preference?.removeEventListener('change', handlePreferenceChange);
    };
  }, [target, milliseconds]);

  return (
    <span className={['ray-animated-number', className].filter(Boolean).join(' ')}>
      {prefix}{numberFormatter.format(displayValue)}{suffix}
    </span>
  );
}
