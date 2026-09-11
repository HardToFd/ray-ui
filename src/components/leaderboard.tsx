import { useId, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';

export type LeaderboardTone = 'orange' | 'blue' | 'purple' | 'teal';
export interface LeaderboardItem {
  id: string;
  name: string;
  value: number;
  avatar?: string;
  /** Fixed to the entry, so its color survives reordering. */
  tone?: LeaderboardTone;
  /** Positive means places gained; negative means places lost. */
  change?: number;
}
export interface LeaderboardProps extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'title'> {
  items: readonly LeaderboardItem[];
  title?: string;
  valueLabel?: string;
  formatValue?: (value: number) => string;
  emptyMessage?: string;
  renderChange?: (change: number) => ReactNode;
}
const tones: LeaderboardTone[] = ['orange', 'blue', 'purple', 'teal'];
const validValue = (value: number) => Number.isFinite(value) ? Math.max(0, value) : 0;
const numberFormat = new Intl.NumberFormat('zh-CN');

/** Values are sorted descending; equal scores keep input order. Percentages are relative to the leader. */
export function Leaderboard({ items, title = '积分排行榜', valueLabel = '积分', formatValue = (value) => numberFormat.format(value), emptyMessage = '暂无排行数据', renderChange, className = '', ...props }: LeaderboardProps) {
  const headingId = useId();
  const ranked = items.map((item, index) => ({ ...item, value: validValue(item.value), tone: item.tone ?? tones[index % tones.length] }))
    .sort((a, b) => b.value - a.value);
  const max = ranked[0]?.value ?? 0;
  return <section aria-labelledby={headingId} {...props} className={`ray-leaderboard ${className}`}>
    <h3 id={headingId} className="ray-leaderboard__title">{title}</h3>
    {ranked.length === 0 ? <p className="ray-leaderboard__empty" role="status">{emptyMessage}</p> : <ol className="ray-leaderboard__list">
      {ranked.map((item, index) => {
        const percent = max > 0 ? item.value / max * 100 : 0;
        const change = Number.isFinite(item.change) ? Math.trunc(item.change!) : 0;
        const changeLabel = change > 0 ? `上升 ${change} 名` : change < 0 ? `下降 ${Math.abs(change)} 名` : '排名不变';
        return <li key={item.id} className="ray-leaderboard__row" data-tone={item.tone}>
          <span className="ray-leaderboard__rank" aria-label={`第 ${index + 1} 名`}>{String(index + 1).padStart(2, '0')}</span>
          <span className="ray-leaderboard__avatar">
            <span aria-hidden="true">{item.name.slice(0, 1)}</span>
            {item.avatar && <img key={item.avatar} src={item.avatar} alt="" onError={(event) => { event.currentTarget.style.display = 'none'; }} />}
          </span>
          <div className="ray-leaderboard__body">
            <div className="ray-leaderboard__details"><span className="ray-leaderboard__name" title={item.name}>{item.name}</span><span className="ray-leaderboard__value" aria-label={`${formatValue(item.value)} ${valueLabel}`}>{formatValue(item.value)}</span></div>
            <div className="ray-leaderboard__track" role="meter" aria-label={`${item.name}，相对榜首`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(percent)} aria-valuetext={`${Math.round(percent)}%`}>
              <span className="ray-leaderboard__fill" style={{ '--ray-leaderboard-percent': `${percent}%` } as CSSProperties} />
            </div>
          </div>
          <div className="ray-leaderboard__meta">
            <span className="ray-leaderboard__change" data-direction={change > 0 ? 'up' : change < 0 ? 'down' : 'same'} aria-label={changeLabel} title={changeLabel}><span aria-hidden="true">{renderChange ? renderChange(change) : change === 0 ? '持平' : `${change > 0 ? '升' : '降'} ${Math.abs(change)}`}</span></span>
            <span className="ray-leaderboard__percent" aria-hidden="true">{Math.round(percent)}%</span>
          </div>
        </li>;
      })}
    </ol>}
  </section>;
}
