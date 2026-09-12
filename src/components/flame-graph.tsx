import { useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type HTMLAttributes, type KeyboardEvent } from 'react';

export interface FlameGraphNode {
  /** Unique throughout the entire tree. */
  id: string;
  name: string;
  /** Inclusive duration, in the same unit for every node. Omit to sum children. */
  value?: number;
  children?: readonly FlameGraphNode[];
}
export interface FlameGraphProps extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'title' | 'defaultValue'> {
  data: readonly FlameGraphNode[];
  title?: string;
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (id: string | null) => void;
  formatValue?: (value: number) => string;
  showSearch?: boolean;
  showDetails?: boolean;
  emptyMessage?: string;
}

interface Frame {
  id: string;
  name: string;
  value: number;
  self: number;
  depth: number;
  x: number;
  parent: Frame | null;
  children: Frame[];
  color: number;
}
interface Profile {
  frames: Frame[];
  roots: Frame[];
  byId: Map<string, Frame>;
  total: number;
  error?: string;
}
const formatNumber = new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 2 });
const defaultFormat = (value: number) => `${formatNumber.format(value)} ms`;
const percentage = (value: number, total: number) => `${total > 0 ? (value / total * 100).toFixed(1) : '0.0'}%`;

function buildProfile(data: readonly FlameGraphNode[]): Profile {
  const frames: Frame[] = [];
  const byId = new Map<string, Frame>();
  function visit(node: FlameGraphNode, parent: Frame | null, depth: number): Frame {
    if (!node.id.trim() || byId.has(node.id)) throw new Error('每个调用节点需要非空且唯一的 id。');
    if (depth >= 100 || frames.length >= 5000) throw new Error('调用树最多支持 100 层、5000 个节点。');
    const frame: Frame = {
      id: node.id, name: node.name || node.id, parent, depth, x: 0,
      value: Number.isFinite(node.value) ? Math.max(0, node.value!) : 0,
      self: 0, children: [], color: [...(node.name || node.id)].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 0) % 6,
    };
    byId.set(frame.id, frame);
    frames.push(frame);
    frame.children = (node.children ?? []).map((child) => visit(child, frame, depth + 1));
    const childrenTotal = frame.children.reduce((sum, child) => sum + child.value, 0);
    frame.value = Math.max(frame.value, childrenTotal);
    if (!Number.isFinite(frame.value)) throw new Error('调用耗时总和超出有效数值范围。');
    frame.self = Math.max(0, frame.value - childrenTotal);
    return frame;
  }
  function position(siblings: Frame[], start: number) {
    let x = start;
    for (const frame of siblings) {
      frame.x = x;
      position(frame.children, x);
      x += frame.value;
    }
  }
  try {
    const roots = data.map((node) => visit(node, null, 0));
    const total = roots.reduce((sum, frame) => sum + frame.value, 0);
    if (!Number.isFinite(total)) throw new Error('调用耗时总和超出有效数值范围。');
    position(roots, 0);
    return { roots, frames: frames.filter((frame) => frame.value > 0), byId, total };
  } catch (error) {
    return { roots: [], frames: [], byId: new Map(), total: 0, error: (error as Error).message };
  }
}

function pathTo(frame: Frame | null) {
  const path: Frame[] = [];
  for (let current = frame; current; current = current.parent) path.unshift(current);
  return path;
}

/** Aggregated call stacks: width is inclusive cost, depth grows upward, x is not chronological time. */
export function FlameGraph({
  data, title = '调用栈火焰图', value, defaultValue = null, onValueChange,
  formatValue = defaultFormat, showSearch = true, showDetails = true,
  emptyMessage = '暂无调用数据', className = '', style, ...props
}: FlameGraphProps) {
  const id = useId();
  const [localValue, setLocalValue] = useState(defaultValue);
  const [query, setQuery] = useState('');
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const pendingFocus = useRef<string | null | undefined>(undefined);
  const profile = useMemo(() => buildProfile(data), [data]);
  const selectedId = value === undefined ? localValue : value;
  const candidate = selectedId == null ? undefined : profile.byId.get(selectedId);
  const zoom = candidate && candidate.value > 0 ? candidate : null;
  const path = pathTo(zoom);
  const visible = zoom ? profile.frames.filter((frame) => pathTo(frame).includes(zoom)) : profile.frames;
  const visibleIds = new Set(visible.map((frame) => frame.id));
  const viewTotal = zoom?.value ?? profile.total;
  const startX = zoom?.x ?? 0;
  const startDepth = zoom?.depth ?? 0;
  const maxDepth = visible.reduce((max, frame) => Math.max(max, frame.depth - startDepth), 0);
  const active = visible.find((frame) => frame.id === hoveredId) ?? visible.find((frame) => frame.id === focusedId) ?? zoom ?? visible[0];
  const tabId = focusedId && visibleIds.has(focusedId) ? focusedId : visible[0]?.id;
  const search = showSearch ? query.trim().toLocaleLowerCase() : '';
  const matches = visible.filter((frame) => frame.name.toLocaleLowerCase().includes(search));
  const rows = Array.from({ length: maxDepth + 1 }, (_, depth) => visible.filter((frame) => frame.depth - startDepth === depth));

  useLayoutEffect(() => {
    if (pendingFocus.current === undefined) return;
    const frameId = pendingFocus.current;
    // Controlled views only move focus once the owner has accepted the zoom.
    if ((zoom?.id ?? null) !== frameId) return;
    pendingFocus.current = undefined;
    const next = frameId == null ? visible[0]?.id : frameId;
    if (next) buttons.current.get(next)?.focus();
  });

  function changeZoom(next: string | null, moveFocus = false) {
    if (moveFocus) pendingFocus.current = next;
    if (value === undefined) setLocalValue(next);
    setHoveredId(null);
    if (!moveFocus) setFocusedId(next);
    onValueChange?.(next);
  }

  function navigate(event: KeyboardEvent<HTMLButtonElement>, frame: Frame) {
    if (event.altKey || event.metaKey || event.shiftKey) return;
    const row = rows[frame.depth - startDepth];
    const index = row.indexOf(frame);
    let next: Frame | undefined;
    switch (event.key) {
      case 'ArrowLeft': next = row[index - 1]; break;
      case 'ArrowRight': next = row[index + 1]; break;
      case 'ArrowUp': next = frame.children.find((child) => child.value > 0); break;
      case 'ArrowDown': next = frame.parent && visibleIds.has(frame.parent.id) ? frame.parent : undefined; break;
      case 'Home': next = event.ctrlKey ? visible[0] : row[0]; break;
      case 'End': next = event.ctrlKey ? visible[visible.length - 1] : row[row.length - 1]; break;
      case 'Escape': if (zoom) changeZoom(zoom.parent?.id ?? null, true); event.preventDefault(); return;
      default: return;
    }
    event.preventDefault();
    if (next) buttons.current.get(next.id)?.focus();
  }

  return <section {...props} className={`ray-flame-graph ${className}`} aria-label={props['aria-label'] ?? title} style={style}>
    <div className="ray-flame-graph__header"><h3>{title}</h3><span>{formatValue(profile.total)}<span aria-hidden="true"> / </span>总耗时</span></div>
    <div className="ray-flame-graph__toolbar">
      <div className="ray-flame-graph__navigation" role="group" aria-label="火焰图导航">
        <button type="button" onClick={() => changeZoom(zoom?.parent?.id ?? null)} disabled={!zoom} aria-label="返回上层">←</button>
        <button type="button" onClick={() => changeZoom(null)} disabled={!zoom}>全部调用</button>
        {zoom && <span title={path.map((frame) => frame.name).join(' → ')}>{zoom.name}</span>}
      </div>
      {showSearch && <div className="ray-flame-graph__search">
        <svg aria-hidden="true" width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="5" /><path d="m12 12 5 5" /></svg>
        <input type="search" aria-label="搜索调用函数" placeholder="查找函数…" value={query} onChange={(event) => setQuery(event.target.value)} />
      </div>}
    </div>
    <p id={`${id}-help`} className="ray-flame-graph__sr-only">调用栈从下向上展开，条块宽度表示累计耗时。左右键移动同层，上键进入子调用，下键返回父调用，Home、End 跳至同层首尾，回车或空格聚焦，Esc 返回上层。</p>
    {profile.total <= 0 ? <div className="ray-flame-graph__empty" role="status">{profile.error ?? emptyMessage}</div> : <>
      <div className="ray-flame-graph__chart" role="group" aria-label="调用栈条块" aria-describedby={`${id}-help`} onPointerLeave={() => setHoveredId(null)} style={{ '--ray-flame-levels': maxDepth + 1 } as CSSProperties}>
        {rows.map((row, depth) => <div key={depth} className="ray-flame-graph__row" role="group" aria-label={`第 ${depth + 1} 层调用`} style={{ bottom: `calc(${depth} * (var(--ray-flame-row-height) + 3px))` }}>
          {row.map((frame) => {
            const percent = frame.value / viewTotal * 100;
            const match = !search || frame.name.toLocaleLowerCase().includes(search);
            const label = `${frame.name}，总耗时 ${formatValue(frame.value)}，自身耗时 ${formatValue(frame.self)}，占全部 ${percentage(frame.value, profile.total)}`;
            return <button key={frame.id}
              ref={(element) => { if (element) buttons.current.set(frame.id, element); else buttons.current.delete(frame.id); }}
              type="button" className="ray-flame-graph__frame" tabIndex={tabId === frame.id ? 0 : -1}
              aria-label={label} aria-pressed={zoom?.id === frame.id} title={label}
              data-frame={frame.id} data-color={frame.color} data-match={match} data-active={active?.id === frame.id}
              style={{ left: `${(frame.x - startX) / viewTotal * 100}%`, width: `${percent}%` }}
              onPointerEnter={() => setHoveredId(frame.id)}
              onFocus={() => setFocusedId(frame.id)}
              onKeyDown={(event) => navigate(event, frame)}
              onClick={() => changeZoom(frame.id, true)}
            ><span className="ray-flame-graph__frame-label">{frame.name}</span>{percent >= 18 && <span className="ray-flame-graph__frame-value">{formatValue(frame.value)}</span>}</button>;
          })}
        </div>)}
      </div>
      <div className="ray-flame-graph__scale" aria-hidden="true"><span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span></div>
      <div className="ray-flame-graph__status" role="status">{search ? `${matches.length} 个匹配调用` : zoom ? `当前查看 ${zoom.name} · ${formatValue(viewTotal)}` : `${profile.frames.length} 个调用 · 从下向上展开`}</div>
      {showDetails && active && <div className="ray-flame-graph__details" role="group" aria-label="调用详情">
        <div className="ray-flame-graph__function"><span>当前调用</span><strong title={active.name}>{active.name}</strong><small title={pathTo(active).map((frame) => frame.name).join(' → ')}>{pathTo(active).map((frame) => frame.name).join(' → ')}</small></div>
        <dl><div><dt>总耗时</dt><dd>{formatValue(active.value)}</dd></div><div><dt>自身耗时</dt><dd>{formatValue(active.self)}</dd></div><div><dt>占全部</dt><dd>{percentage(active.value, profile.total)}</dd></div></dl>
      </div>}
    </>}
  </section>;
}
