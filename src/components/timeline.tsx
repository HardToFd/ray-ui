import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

export type TimelineStatus = 'complete' | 'current' | 'pending' | 'error';
export interface TimelineItem {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  time?: ReactNode;
  dateTime?: string;
  status?: TimelineStatus;
  icon?: ReactNode;
  action?: ReactNode;
}
export interface TimelineProps extends Omit<HTMLAttributes<HTMLOListElement>, 'children'> {
  /** Display order is preserved. Item IDs must be unique. */
  items: readonly TimelineItem[];
  size?: 'sm' | 'md';
  emptyMessage?: ReactNode;
  statusLabels?: Partial<Record<TimelineStatus, string>>;
}
const labels: Record<TimelineStatus, string> = { complete: '已完成', current: '进行中', pending: '待开始', error: '需要处理' };

export const Timeline = forwardRef<HTMLOListElement, TimelineProps>(function Timeline({
  items, size = 'md', emptyMessage = '暂无动态', statusLabels, className = '', ...props
}, ref) {
  return <ol {...props} ref={ref} role="list" aria-label={props['aria-label'] ?? '时间线'} data-size={size} className={`ray-timeline ${className}`}>
    {items.length === 0 && <li className="ray-timeline__empty">{emptyMessage}</li>}
    {items.map((item) => {
      const status = item.status ?? 'complete';
      return <li key={item.id} className="ray-timeline__item" data-status={status} aria-current={status === 'current' ? 'step' : undefined}>
        <span className="ray-timeline__marker" aria-hidden="true">{item.icon ?? (status === 'complete'
          ? <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="m4 8 2.5 2.5L12 5" /></svg>
          : status === 'error' ? '!' : <span />)}</span>
        <div className="ray-timeline__body">
          <div className="ray-timeline__meta"><span className="ray-timeline__status">{statusLabels?.[status] ?? labels[status]}</span>
            {item.time != null && <time dateTime={item.dateTime}>{item.time}</time>}</div>
          <h3 className="ray-timeline__title">{item.title}</h3>
          {item.description != null && <div className="ray-timeline__description">{item.description}</div>}
          {item.action != null && <div className="ray-timeline__action">{item.action}</div>}
        </div>
      </li>;
    })}
  </ol>;
});
