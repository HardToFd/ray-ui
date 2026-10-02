import { forwardRef, useId, type HTMLAttributes, type ReactNode } from 'react';

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  size?: 'sm' | 'md';
  tone?: 'neutral' | 'accent';
}

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  function EmptyState({ title, description, icon, action, size = 'md', tone = 'neutral', className = '', ...props }, ref) {
    const titleId = useId();
    return <div {...props} ref={ref} role="region" aria-labelledby={titleId} data-size={size} data-tone={tone} className={`ray-empty-state${className ? ` ${className}` : ''}`}>
      {icon && <div className="ray-empty-state__icon" aria-hidden="true">{icon}</div>}
      <h3 id={titleId} className="ray-empty-state__title">{title}</h3>
      {description && <p className="ray-empty-state__description">{description}</p>}
      {action && <div className="ray-empty-state__action">{action}</div>}
    </div>;
  },
);
