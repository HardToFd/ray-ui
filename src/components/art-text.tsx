import { forwardRef, type CSSProperties, type HTMLAttributes } from 'react';

export type ArtTextVariant = 'moon-silver' | 'radiant-alloy' | 'ink-relief' | 'sugar-echo';

export interface ArtTextProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  children: string;
  variant?: ArtTextVariant;
  /** Primary ink / gradient start. Accepts any CSS color. */
  color?: string;
  /** Gradient end, shadow or glow color, depending on the variant. */
  secondaryColor?: string;
  /** Numbers use px; CSS lengths such as clamp() are also supported. */
  fontSize?: number | string;
  /** Numbers use px; pass an em string for proportional tracking. */
  letterSpacing?: number | string;
  /** Slow silver or radiant surface movement. Respects reduced motion. */
  animated?: boolean;
}

/** Selectable, accessible text with CSS finishes; wrap in a heading for heading semantics. */
export const ArtText = forwardRef<HTMLSpanElement, ArtTextProps>(function ArtText(
  { children, variant = 'moon-silver', color, secondaryColor, fontSize, letterSpacing,
    animated = false, className = '', style, ...props }, ref,
) {
  return <span {...props} ref={ref}
    className={`ray-art-text ray-art-text--${variant} ${className}`.trim()}
    data-animated={animated || undefined}
    style={{ '--ray-art-color': color, '--ray-art-secondary': secondaryColor,
      fontSize, letterSpacing, ...style } as CSSProperties}>
    <span className="ray-art-text__ink">{children}</span>
    {variant === 'moon-silver' && <span className="ray-art-text__layer ray-art-text__layer--silver-edge" aria-hidden="true">{children}</span>}
    {variant === 'ink-relief' && <span className="ray-art-text__layer ray-art-text__layer--depth" aria-hidden="true">{children}</span>}
    {variant === 'sugar-echo' && <>
      <span className="ray-art-text__layer ray-art-text__layer--a" aria-hidden="true">{children}</span>
      <span className="ray-art-text__layer ray-art-text__layer--b" aria-hidden="true">{children}</span>
      <span className="ray-art-text__layer ray-art-text__layer--signal" aria-hidden="true">{children}</span>
    </>}
  </span>;
});
