import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

export interface CarouselItem {
  id: string;
  label: string;
  content: ReactNode;
}

export interface CarouselProps {
  items: CarouselItem[];
  value?: number;
  defaultValue?: number;
  onValueChange?: (index: number) => void;
  loop?: boolean;
  autoPlay?: boolean;
  interval?: number;
  className?: string;
  style?: CSSProperties;
  'aria-label'?: string;
}

/** A single-slide carousel. Indices are zero-based; inactive slides stay mounted but inert. */
export function Carousel({ items, value, defaultValue = 0, onValueChange, loop = true,
  autoPlay = false, interval = 5000, className, style, 'aria-label': label = '轮播图',
}: CarouselProps) {
  const [localValue, setLocalValue] = useState(defaultValue);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const raw = value ?? localValue;
  const index = Math.max(0, Math.min(items.length - 1, Number.isFinite(raw) ? Math.trunc(raw) : 0));
  const playing = autoPlay && !paused && !hovered && !focused && !reducedMotion && items.length > 1 && (loop || index < items.length - 1);
  function select(next: number) {
    if (!items.length) return;
    const target = loop ? (next + items.length) % items.length : Math.max(0, Math.min(items.length - 1, next));
    if (target === index) return;
    if (value === undefined) setLocalValue(target);
    onValueChange?.(target);
  }
  useEffect(() => {
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!media) { setReducedMotion(false); return; }
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) select(index + 1);
    }, Number.isFinite(interval) ? Math.max(1000, interval) : 5000);
    return () => window.clearInterval(timer);
  });

  return <section className={['ray-carousel', className].filter(Boolean).join(' ')} style={style}
    aria-label={label} aria-roledescription="轮播图" tabIndex={0}
    onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    onFocusCapture={() => setFocused(true)} onBlurCapture={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
    }}
    onKeyDown={(event) => {
      if (event.target !== event.currentTarget) return;
      if (event.key === 'ArrowLeft') select(index - 1);
      else if (event.key === 'ArrowRight') select(index + 1);
      else if (event.key === 'Home') select(0);
      else if (event.key === 'End') select(items.length - 1);
      else return;
      event.preventDefault();
    }}>
    <div className="ray-carousel__viewport" onTouchStart={(event) => {
      const point = event.touches[0];
      touch.current = event.touches.length === 1 ? { x: point.clientX, y: point.clientY } : null;
    }} onTouchCancel={() => { touch.current = null; }} onTouchEnd={(event) => {
      const start = touch.current;
      touch.current = null;
      const end = event.changedTouches[0];
      if (!start || !end) return;
      const dx = end.clientX - start.x;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(end.clientY - start.y)) select(index + (dx < 0 ? 1 : -1));
    }}>
      {items.length ? items.map((item, position) => <div key={item.id} className="ray-carousel__slide"
        role="group" aria-roledescription="幻灯片" aria-label={`${position + 1} / ${items.length} · ${item.label}`}
        hidden={position !== index} inert={position !== index}>{item.content}</div>) : <div className="ray-carousel__empty">暂无轮播内容</div>}
    </div>
    {items.length > 1 && <div className="ray-carousel__controls">
      <button type="button" aria-label="上一张" disabled={!loop && index === 0} onClick={() => select(index - 1)}>←</button>
      <div className="ray-carousel__dots" role="group" aria-label="选择幻灯片">
        {items.map((item, position) => <button key={item.id} type="button" aria-label={`跳转到第 ${position + 1} 张：${item.label}`}
          aria-current={position === index ? 'true' : undefined} onClick={() => select(position)}><span /></button>)}
      </div>
      <button type="button" aria-label="下一张" disabled={!loop && index === items.length - 1} onClick={() => select(index + 1)}>→</button>
      {autoPlay && <button type="button" className="ray-carousel__play" aria-label={paused ? '继续自动播放' : '暂停自动播放'} onClick={() => setPaused(!paused)}>{paused ? '播放' : '暂停'}</button>}
    </div>}
    <span className="ray-carousel__status" aria-live={playing ? 'off' : 'polite'} aria-atomic="true">{items.length ? `第 ${index + 1} 张，共 ${items.length} 张：${items[index].label}` : '暂无轮播内容'}</span>
  </section>;
}
