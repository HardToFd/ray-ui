import { useId, useRef, useState, type CSSProperties, type ReactNode } from 'react';

export interface StackedCardItem {
  id: string;
  title: string;
  icon?: ReactNode;
  meta?: ReactNode;
  content: ReactNode;
  tone?: 'neutral' | 'sage' | 'sand' | 'clay';
}

export interface StackedCardsProps {
  items: StackedCardItem[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (id: string | null) => void;
  className?: string;
  'aria-label'?: string;
}

/** An inline list of overlapping cards; one item can be expanded at a time. */
export function StackedCards({
  items, value, defaultValue, onValueChange, className, 'aria-label': label = '堆叠卡片列表',
}: StackedCardsProps) {
  const groupId = useId();
  const triggers = useRef<Array<HTMLButtonElement | null>>([]);
  const [localValue, setLocalValue] = useState<string | null>(() =>
    defaultValue === undefined ? items[0]?.id ?? null : defaultValue,
  );
  const activeId = value === undefined ? localValue : value;

  return (
    <ul className={['ray-stacked-cards', className].filter(Boolean).join(' ')} aria-label={label} role="list">
      {items.map((item, index) => {
        const active = item.id === activeId;
        const titleId = `${groupId}-title-${index}`;
        const panelId = `${groupId}-panel-${index}`;
        return (
          <li key={item.id} className="ray-stacked-cards__card" data-active={active} data-tone={item.tone ?? 'neutral'} style={{ zIndex: index + 1, '--ray-card-inset': `${Math.min(items.length - index - 1, 4) * 6}px` } as CSSProperties}>
            <button
              ref={(element) => { triggers.current[index] = element; }}
              type="button"
              className="ray-stacked-cards__trigger"
              aria-expanded={active}
              aria-controls={panelId}
              aria-labelledby={titleId}
              onClick={() => {
                const next = active ? null : item.id;
                if (value === undefined) setLocalValue(next);
                onValueChange?.(next);
              }}
              onKeyDown={(event) => {
                let next = index;
                if (event.key === 'ArrowDown') next = (index + 1) % items.length;
                else if (event.key === 'ArrowUp') next = (index - 1 + items.length) % items.length;
                else if (event.key === 'Home') next = 0;
                else if (event.key === 'End') next = items.length - 1;
                else return;
                event.preventDefault();
                triggers.current[next]?.focus();
              }}
            >
              <span className="ray-stacked-cards__icon" aria-hidden="true">{item.icon ?? String(index + 1).padStart(2, '0')}</span>
              <span id={titleId} className="ray-stacked-cards__title">{item.title}</span>
              {item.meta && <span className="ray-stacked-cards__meta">{item.meta}</span>}
              <svg className="ray-stacked-cards__chevron" viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 8 4 4 4-4" /></svg>
            </button>
            <div className="ray-stacked-cards__panel" id={panelId} role="region" aria-labelledby={titleId} aria-hidden={!active} inert={!active}>
              <div className="ray-stacked-cards__panel-inner"><div className="ray-stacked-cards__content">{item.content}</div></div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
