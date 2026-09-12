import { useId, useMemo, useRef, useState, type CSSProperties, type HTMLAttributes, type KeyboardEvent } from 'react';

export type HeatmapTone = 'green' | 'orange' | 'blue' | 'purple';
export interface HeatmapDatum {
  /** Calendar date in YYYY-MM-DD format, independent of the viewer's time zone. */
  date: string;
  value: number;
}
export interface HeatmapProps extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'title' | 'defaultValue'> {
  data: readonly HeatmapDatum[];
  /** Inclusive range of 1–366 calendar days. */
  startDate: string;
  endDate: string;
  title?: string;
  tone?: HeatmapTone;
  weekStartsOn?: 0 | 1;
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (date: string, day: HeatmapDatum) => void;
  /** Positive upper bound of the color scale. Defaults to the largest visible value. */
  maxValue?: number;
  formatValue?: (value: number) => string;
  emptyMessage?: string;
  showLegend?: boolean;
}

const DAY = 86_400_000;
const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
const numberFormat = new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 2 });
const defaultFormat = (value: number) => `${numberFormat.format(value)} 次活动`;

function parseDay(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return NaN;
  const time = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value ? time : NaN;
}

function buildCalendar(data: readonly HeatmapDatum[], startDate: string, endDate: string, weekStartsOn: 0 | 1) {
  const start = parseDay(startDate);
  const end = parseDay(endDate);
  const length = (end - start) / DAY + 1;
  if (!Number.isFinite(length) || length < 1 || length > 366) return null;
  const values = new Map<string, number>();
  for (const item of data) {
    const time = parseDay(item.date);
    if (time >= start && time <= end) {
      values.set(item.date, Number.isFinite(item.value) ? Math.max(0, item.value) : 0);
    }
  }
  const days = Array.from({ length }, (_, index) => {
    const date = new Date(start + index * DAY).toISOString().slice(0, 10);
    return { date, value: values.get(date) ?? 0 };
  });
  const offset = (new Date(start).getUTCDay() - weekStartsOn + 7) % 7;
  return { days, offset, weeks: Math.ceil((length + offset) / 7) };
}

/** Calendar heatmap with a single Tab stop and spatial arrow-key navigation. */
export function Heatmap({
  data, startDate, endDate, title = '活动热力图', tone = 'green', weekStartsOn = 1,
  value, defaultValue = null, onValueChange, maxValue, formatValue = defaultFormat,
  emptyMessage = '暂无活动记录', showLegend = true, className = '', style,
  onPointerLeave, onKeyDown, ...props
}: HeatmapProps) {
  const id = useId();
  const rootRef = useRef<HTMLElement>(null);
  const cellRefs = useRef(new Map<string, HTMLButtonElement>());
  const [selection, setSelection] = useState(defaultValue);
  const [focusedDate, setFocusedDate] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ date: string; range: string; x: number; y: number } | null>(null);
  const rangeKey = `${startDate}/${endDate}/${weekStartsOn}`;
  const calendar = useMemo(() => buildCalendar(data, startDate, endDate, weekStartsOn), [data, startDate, endDate, weekStartsOn]);
  const selectedDate = value === undefined ? selection : value;
  const days = calendar?.days ?? [];
  const selectedDay = days.find((day) => day.date === selectedDate);
  const tabDate = days.find((day) => day.date === focusedDate)?.date ?? selectedDay?.date ?? days[0]?.date;
  const tooltipDay = tooltip?.range === rangeKey ? days.find((day) => day.date === tooltip.date) : undefined;
  const peak = Math.max(0, ...days.map((day) => day.value));
  const scaleMax = maxValue !== undefined && Number.isFinite(maxValue) && maxValue > 0 ? maxValue : peak;
  const activeDays = days.filter((day) => day.value > 0).length;
  const levelFor = (amount: number) => amount <= 0 || scaleMax === 0 ? 0 : Math.min(4, Math.max(1, Math.ceil(amount / scaleMax * 4)));
  const labelFor = (day: HeatmapDatum) => `${day.date}，${formatValue(day.value)}`;

  function showTooltip(day: HeatmapDatum, element: HTMLButtonElement) {
    const bounds = rootRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const cell = element.getBoundingClientRect();
    const inset = Math.min(110, bounds.width / 2);
    setTooltip({
      date: day.date,
      range: rangeKey,
      x: Math.max(inset, Math.min(bounds.width - inset, cell.left - bounds.left + cell.width / 2)),
      y: cell.top - bounds.top - 7,
    });
  }

  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (!calendar || event.altKey || event.metaKey || event.shiftKey) return;
    const row = (index + calendar.offset) % 7;
    let next = index;
    switch (event.key) {
      case 'ArrowLeft': next = index - 7; break;
      case 'ArrowRight': next = index + 7; break;
      case 'ArrowUp': next = row > 0 ? index - 1 : index; break;
      case 'ArrowDown': next = row < 6 ? index + 1 : index; break;
      case 'Home': next = event.ctrlKey ? 0 : (index % 7); break;
      case 'End': next = event.ctrlKey ? days.length - 1 : index + Math.floor((days.length - 1 - index) / 7) * 7; break;
      default: return;
    }
    event.preventDefault();
    if (next >= 0 && next < days.length) cellRefs.current.get(days[next].date)?.focus();
  }

  const months: { column: number; label: string }[] = [];
  days.forEach((day, index) => {
    if (index !== 0 && !day.date.endsWith('-01')) return;
    const column = Math.floor((index + (calendar?.offset ?? 0)) / 7);
    // Leave enough horizontal room for the previous and trailing month labels.
    if (months.length && (column - months[months.length - 1].column < 2 || column > (calendar?.weeks ?? 0) - 2)) return;
    months.push({ column, label: `${Number(day.date.slice(5, 7))}月` });
  });

  return <section
    {...props}
    ref={rootRef}
    aria-label={props['aria-label'] ?? title}
    className={`ray-heatmap ${className}`}
    data-tone={tone}
    style={{ '--ray-heatmap-weeks': calendar?.weeks ?? 1, ...style } as CSSProperties}
    onPointerLeave={(event) => { onPointerLeave?.(event); if (!event.defaultPrevented) setTooltip(null); }}
    onKeyDown={(event) => { onKeyDown?.(event); if (!event.defaultPrevented && event.key === 'Escape') setTooltip(null); }}
  >
    <header className="ray-heatmap__header">
      <h3>{title}</h3>
      {calendar && <span>{activeDays > 0 ? `${activeDays} 个活跃日` : emptyMessage}</span>}
    </header>
    {!calendar ? <p className="ray-heatmap__empty" role="status">请选择有效日期范围（YYYY-MM-DD，1–366 天）</p> : <>
      <p id={`${id}-help`} className="ray-heatmap__sr-only">方向键移动日期，Home、End 跳到行首、行尾，Ctrl 加 Home、End 跳到范围起止，回车或空格选择，Esc 关闭提示。</p>
      <div key={rangeKey} className="ray-heatmap__scroll" onScroll={() => setTooltip(null)}>
        <div className="ray-heatmap__months" aria-hidden="true">
          {months.map((month) => <span key={month.column} style={{ gridColumn: month.column + 2 }}>{month.label}</span>)}
        </div>
        <div className="ray-heatmap__grid" role="grid" aria-label={`${title}，${startDate} 至 ${endDate}`} aria-describedby={`${id}-help`} aria-rowcount={7} aria-colcount={calendar.weeks + 1}>
          {Array.from({ length: 7 }, (_, row) => <div className="ray-heatmap__row" role="row" aria-rowindex={row + 1} key={row}>
            <span className="ray-heatmap__weekday" role="rowheader" aria-colindex={1} aria-label={weekdays[(row + weekStartsOn) % 7]}>
              <span aria-hidden="true">{row % 2 === 0 ? weekdays[(row + weekStartsOn) % 7] : ''}</span>
            </span>
            {Array.from({ length: calendar.weeks }, (_, column) => {
              const index = column * 7 + row - calendar.offset;
              const day = days[index];
              if (!day) return <span key={column} role="gridcell" aria-colindex={column + 2} aria-disabled="true" className="ray-heatmap__placeholder" />;
              return <button
                key={day.date}
                ref={(element) => { if (element) cellRefs.current.set(day.date, element); else cellRefs.current.delete(day.date); }}
                type="button"
                role="gridcell"
                aria-colindex={column + 2}
                aria-label={labelFor(day)}
                aria-selected={selectedDay?.date === day.date}
                aria-describedby={tooltipDay?.date === day.date ? `${id}-tooltip` : undefined}
                tabIndex={tabDate === day.date ? 0 : -1}
                className="ray-heatmap__cell"
                data-level={levelFor(day.value)}
                data-date={day.date}
                onPointerEnter={(event) => showTooltip(day, event.currentTarget)}
                onFocus={(event) => { setFocusedDate(day.date); showTooltip(day, event.currentTarget); }}
                onBlur={() => setTooltip(null)}
                onKeyDown={(event) => navigate(event, index)}
                onClick={(event) => {
                  setFocusedDate(day.date);
                  if (value === undefined) setSelection(day.date);
                  showTooltip(day, event.currentTarget);
                  onValueChange?.(day.date, { ...day });
                }}
              />;
            })}
          </div>)}
        </div>
      </div>
      <div className="ray-heatmap__footer">
        <span className="ray-heatmap__selection" role="status">{selectedDay ? labelFor(selectedDay) : '每一格，都是一天。'}</span>
        {showLegend && <div className="ray-heatmap__legend" role="group" aria-label={`颜色由浅至深，0 至 ${formatValue(scaleMax)}`}>
          <span>少</span>
          {[0, 1, 2, 3, 4].map((level) => <span className="ray-heatmap__swatch" data-level={level} key={level} aria-hidden="true" />)}
          <span>多</span>
        </div>}
      </div>
    </>}
    {tooltip && tooltipDay && <div id={`${id}-tooltip`} role="tooltip" className="ray-heatmap__tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
      <strong>{formatValue(tooltipDay.value)}</strong><span>{tooltipDay.date}</span>
    </div>}
  </section>;
}
