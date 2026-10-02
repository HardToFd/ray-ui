import { forwardRef, useId, type CSSProperties, type SVGProps } from 'react';

export interface LetteringStroke {
  /** Centerline, in the artwork's SVG coordinate system. */
  path: string;
  /** Optional hand-drawn outline for variable pen pressure. */
  outline?: string;
  /** Centerline width, or reveal-mask width when an outline is supplied. */
  width?: number;
  /** Relative time spent drawing this stroke. */
  duration?: number;
}

export interface LetteringArtwork {
  label: string;
  viewBox: string;
  strokes: readonly LetteringStroke[];
}

export interface StrokeLetteringProps extends Omit<SVGProps<SVGSVGElement>, 'children' | 'viewBox' | 'color' | 'progress'> {
  artwork: LetteringArtwork;
  /** Drawing progress, 0–1. Defaults to the completed lettering. */
  progress?: number;
  color?: string;
}

/** Original vector pen strokes, with pressure outlines revealed along their centerlines. */
export const StrokeLettering = forwardRef<SVGSVGElement, StrokeLetteringProps>(function StrokeLettering(
  { artwork, progress = 1, color = 'currentColor', className = '', style, ...props }, ref,
) {
  const id = useId().replace(/:/g, '');
  const value = Number.isFinite(progress) ? Math.max(0, Math.min(1, progress)) : 1;
  const durations = artwork.strokes.map(stroke => Number.isFinite(stroke.duration) && stroke.duration! > 0 ? stroke.duration! : 1);
  const total = durations.reduce((sum, duration) => sum + duration, 0);
  let elapsed = 0;

  return <svg role="img" aria-label={artwork.label} {...props} ref={ref}
    viewBox={artwork.viewBox} className={`ray-stroke-lettering ${className}`.trim()}
    style={{ color, ...style } as CSSProperties}>
    {artwork.strokes.map((stroke, index) => {
      const linear = Math.max(0, Math.min(1, (value * total - elapsed) / durations[index]));
      const portion = linear * linear * (3 - 2 * linear);
      elapsed += durations[index];
      const maskId = `${id}-pen-${index}`;
      return <g key={index} aria-hidden="true" visibility={portion === 0 ? 'hidden' : undefined}>
        {stroke.outline ? <>
          <defs><mask id={maskId} maskUnits="userSpaceOnUse" x="-100%" y="-100%" width="300%" height="300%" style={{ maskType: 'luminance' }}>
            <path d={stroke.path} fill="none" stroke="white" strokeWidth={stroke.width ?? 24}
              strokeLinecap="round" strokeLinejoin="round" pathLength={1}
              strokeDasharray="1 1" strokeDashoffset={1 - portion} />
          </mask></defs>
          <path d={stroke.outline} fill="currentColor" mask={`url(#${maskId})`} />
        </> : <path d={stroke.path} fill="none" stroke="currentColor" strokeWidth={stroke.width ?? 3}
          strokeLinecap="round" strokeLinejoin="round" pathLength={1}
          strokeDasharray="1 1" strokeDashoffset={1 - portion} />}
      </g>;
    })}
  </svg>;
});

/** A drawn wordmark, not a font: nine original pressure-shaped strokes for 生长. */
export const growthLettering: LetteringArtwork = {
  label: '生长', viewBox: '40 35 525 225',
  strokes: [
    {
      path: 'M139 55 C135 73 119 97 98 116', duration: .65,
      outline: 'M140 53 C144 56 139 70 133 80 C123 96 109 110 96 117 C104 107 113 96 122 81 C130 68 132 57 135 54 Q138 52 140 53Z',
    },
    {
      path: 'M107 103 C137 97 185 93 224 91', duration: .75,
      outline: 'M106 103 C130 96 157 92 179 92 C195 91 213 88 223 89 Q229 89 225 93 C211 96 193 96 179 96 C151 98 128 103 110 106 Q106 107 106 103Z',
    },
    {
      path: 'M105 153 C142 147 185 143 222 144', duration: .65,
      outline: 'M104 152 C128 146 154 143 179 142 Q205 141 222 143 Q227 146 221 147 C201 148 186 146 168 148 C147 150 128 152 110 155 Q104 157 104 152Z',
    },
    {
      path: 'M168 74 C173 105 165 139 164 177 C163 190 165 206 162 216', duration: .95,
      outline: 'M165 73 Q170 70 172 78 C178 104 169 151 170 176 Q170 201 164 217 L160 218 C163 198 160 185 161 172 C162 137 169 99 165 82Z',
    },
    {
      path: 'M71 222 C116 214 167 208 207 208 C229 208 247 211 254 206', duration: 1,
      outline: 'M70 222 C94 215 119 212 144 209 C169 206 192 205 209 205 C228 205 245 210 256 204 Q257 208 249 211 C232 216 222 211 205 211 C179 211 152 213 133 216 L84 224 Q69 229 70 222Z',
    },
    {
      path: 'M414 66 C405 87 384 107 359 120', duration: .7,
      outline: 'M413 63 Q420 62 416 73 C405 93 385 112 357 122 C372 110 388 98 399 83 Q407 73 409 66Z',
    },
    {
      path: 'M330 141 C382 132 438 126 490 122', duration: .85,
      outline: 'M329 141 C359 133 386 130 411 128 L466 121 Q489 119 493 121 Q495 124 488 125 C455 127 429 131 406 132 C377 135 350 142 333 144 Q329 145 329 141Z',
    },
    {
      path: 'M361 65 C358 121 361 178 354 222 C366 215 386 202 400 193', duration: 1.15,
      outline: 'M359 64 Q364 62 365 68 C365 106 363 139 363 163 C362 185 360 205 357 217 Q379 205 402 192 C389 207 371 217 357 226 Q351 230 350 223 C355 199 355 181 356 159 L357 91 Q357 71 359 64Z',
    },
    {
      path: 'M388 145 C411 165 431 188 456 202 C482 217 515 218 532 200', duration: 1.3,
      outline: 'M388 143 C406 153 431 182 455 197 C479 214 508 220 533 198 C525 212 512 220 498 220 C473 220 452 210 434 194 C416 178 401 159 387 147Z',
    },
  ],
};
