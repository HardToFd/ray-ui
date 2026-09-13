import { forwardRef, useEffect, useId, useState, type ComponentPropsWithoutRef, type CSSProperties } from 'react';
import * as Select from '@radix-ui/react-select';

export interface PaginationProps extends Omit<ComponentPropsWithoutRef<'nav'>, 'children' | 'onChange'> {
  total: number;
  /** Pages are one-based. */
  page?: number;
  defaultPage?: number;
  pageSize?: number;
  defaultPageSize?: number;
  onPageChange?: (page: number, pageSize: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  variant?: 'default' | 'compact';
  size?: 'sm' | 'md';
  disabled?: boolean;
  showTotal?: boolean;
  showSizeChanger?: boolean;
  pageSizeOptions?: number[];
  showQuickJumper?: boolean;
}

function integer(value: number, fallback: number, minimum: number) {
  return Number.isFinite(value) ? Math.min(Number.MAX_SAFE_INTEGER, Math.max(minimum, Math.floor(value))) : fallback;
}

/** Constant-size window, including both ends; never allocate an array of all pages. */
function pageItems(page: number, count: number): Array<number | 'start-gap' | 'end-gap'> {
  if (count <= 7) return Array.from({ length: count }, (_, index) => index + 1);
  if (page <= 4) return [1, 2, 3, 4, 5, 'end-gap', count];
  if (page >= count - 3) return [1, 'start-gap', count - 4, count - 3, count - 2, count - 1, count];
  return [1, 'start-gap', page - 1, page, page + 1, 'end-gap', count];
}

const themeProperties = ['--ray-bg', '--ray-surface', '--ray-surface-raised', '--ray-text', '--ray-muted', '--ray-border', '--ray-accent', '--ray-accent-contrast', '--ray-ring'];

function Chevron({ direction }: { direction: 'left' | 'right' | 'down' }) {
  return <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={direction === 'left' ? 'm12 5-5 5 5 5' : direction === 'right' ? 'm8 5 5 5-5 5' : 'm5 8 5 5 5-5'} /></svg>;
}

export const Pagination = forwardRef<HTMLElement, PaginationProps>(
  function Pagination({
    total, page, defaultPage = 1, pageSize, defaultPageSize = 10,
    onPageChange, onPageSizeChange, variant = 'default', size = 'md', disabled = false,
    showTotal = false, showSizeChanger = false, pageSizeOptions = [10, 20, 50, 100], showQuickJumper = false,
    className, 'aria-label': ariaLabel = '分页导航', ...props
  }, ref) {
    const [localPage, setLocalPage] = useState(() => integer(defaultPage, 1, 1));
    const [localSize, setLocalSize] = useState(() => integer(defaultPageSize, 10, 1));
    const [draft, setDraft] = useState('');
    const [error, setError] = useState('');
    const [popupTheme, setPopupTheme] = useState<CSSProperties>();
    const id = useId();
    const count = integer(total, 0, 0);
    const limit = integer(pageSize ?? localSize, 10, 1);
    const pages = Math.ceil(count / limit);
    const current = Math.min(Math.max(1, pages), integer(page ?? localPage, 1, 1));
    const unavailable = disabled || pages === 0;
    const first = count === 0 ? 0 : (current - 1) * limit + 1;
    const last = count === 0 ? 0 : Math.min(current * limit, count);
    const options = Array.from(new Set([...pageSizeOptions.filter((value) => Number.isSafeInteger(value) && value > 0), limit])).sort((a, b) => a - b);

    useEffect(() => {
      if (page === undefined) setLocalPage(current);
      setDraft('');
      setError('');
    }, [current, limit, pages, page]);

    const changePage = (next: number) => {
      if (unavailable || next === current || next < 1 || next > pages) return;
      if (page === undefined) setLocalPage(next);
      onPageChange?.(next, limit);
    };
    const jump = () => {
      if (unavailable) return;
      const value = draft.trim();
      const next = Number(value);
      if (!/^\d+$/.test(value) || !Number.isSafeInteger(next) || next < 1 || next > pages) {
        setError(`请输入 1–${pages} 之间的整数页码`);
        return;
      }
      setError('');
      setDraft('');
      changePage(next);
    };

    return <nav {...props} ref={ref} aria-label={ariaLabel} className={`ray-pagination ray-pagination--${variant} ray-pagination--${size}${className ? ` ${className}` : ''}`}>
      {(showTotal || showSizeChanger) && <div className="ray-pagination__meta">
        {showTotal && <span className="ray-pagination__total">{count === 0 ? '共 0 条' : <>第 <b>{first}–{last}</b> 条，共 <b>{count}</b> 条</>}</span>}
        {showSizeChanger && <Select.Root value={String(limit)} disabled={disabled} onValueChange={(value) => {
          const next = Number(value);
          if (disabled || next === limit) return;
          if (pageSize === undefined) setLocalSize(next);
          if (page === undefined) setLocalPage(1);
          setDraft(''); setError('');
          onPageSizeChange?.(next);
          onPageChange?.(1, next);
        }}>
          <Select.Trigger className="ray-pagination__select" aria-label="每页条数" onPointerDown={(event) => {
            const computed = getComputedStyle(event.currentTarget);
            setPopupTheme(Object.fromEntries(themeProperties.map((name) => [name, computed.getPropertyValue(name)])) as CSSProperties);
          }} onKeyDown={(event) => {
            const computed = getComputedStyle(event.currentTarget);
            setPopupTheme(Object.fromEntries(themeProperties.map((name) => [name, computed.getPropertyValue(name)])) as CSSProperties);
          }}><Select.Value /><Select.Icon><Chevron direction="down" /></Select.Icon></Select.Trigger>
          <Select.Portal><Select.Content className="ray-pagination__select-content" style={popupTheme} position="popper" sideOffset={6} collisionPadding={12} aria-label="每页条数选项">
            <Select.ScrollUpButton className="ray-pagination__select-scroll">↑</Select.ScrollUpButton>
            <Select.Viewport>{options.map((option) => <Select.Item key={option} value={String(option)} className="ray-pagination__select-option"><Select.ItemText>{option} 条 / 页</Select.ItemText><Select.ItemIndicator aria-hidden="true">✓</Select.ItemIndicator></Select.Item>)}</Select.Viewport>
            <Select.ScrollDownButton className="ray-pagination__select-scroll">↓</Select.ScrollDownButton>
          </Select.Content></Select.Portal>
        </Select.Root>}
      </div>}
      <div className="ray-pagination__body">
        <div className="ray-pagination__controls">
          <button className="ray-pagination__button ray-pagination__direction" type="button" disabled={unavailable || current === 1} aria-label="上一页" title="上一页" onClick={(event) => { if (!event.defaultPrevented) changePage(current - 1); }}><Chevron direction="left" /></button>
          <div className="ray-pagination__pages">
            {pageItems(current, pages).map((item) => typeof item === 'number' ? <button key={item} type="button" className="ray-pagination__button" disabled={disabled} aria-label={`第 ${item} 页`} aria-current={item === current ? 'page' : undefined} onClick={(event) => { if (!event.defaultPrevented) changePage(item); }}>{item}</button> : <span key={item} className="ray-pagination__ellipsis" aria-hidden="true">…</span>)}
          </div>
          <span className={`ray-pagination__compact${pages === 0 ? ' ray-pagination__compact--empty' : ''}`} aria-hidden="true"><b>{pages === 0 ? 0 : current}</b><span>/</span>{pages}</span>
          <button className="ray-pagination__button ray-pagination__direction" type="button" disabled={unavailable || current === pages} aria-label="下一页" title="下一页" onClick={(event) => { if (!event.defaultPrevented) changePage(current + 1); }}><Chevron direction="right" /></button>
        </div>
        {showQuickJumper && <div className="ray-pagination__jump">
          <label htmlFor={`${id}-jump`}>跳至</label>
          <input id={`${id}-jump`} className="ray-pagination__input" type="text" inputMode="numeric" autoComplete="off" aria-label="跳转页码" aria-invalid={!!error || undefined} aria-describedby={error ? `${id}-error` : undefined} value={draft} disabled={unavailable} onChange={(event) => { setDraft(event.target.value); setError(''); }} onKeyDown={(event) => {
            if (event.key === 'Enter') {
              if (event.nativeEvent.isComposing) return;
              event.preventDefault(); jump();
            }
          }} />
          <span>页</span><button type="button" className="ray-pagination__go" disabled={unavailable || !draft.trim()} onClick={(event) => { if (!event.defaultPrevented) jump(); }}>跳转</button>
        </div>}
      </div>
      {error && <span className="ray-pagination__error" id={`${id}-error`} role="alert">{error}</span>}
      <span className="ray-pagination__sr-only" aria-live="polite" aria-atomic="true">{pages === 0 ? '暂无分页数据' : `第 ${current} 页，共 ${pages} 页`}</span>
    </nav>;
  },
);
