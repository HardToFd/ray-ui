import * as React from 'react';

export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  'aria-label': string;
}

export const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  function ScrollArea({ className, tabIndex = 0, role = 'region', ...props }, ref) {
    return <div {...props} ref={ref} role={role} tabIndex={tabIndex} className={`ray-scroll-area ray-scrollbar ${className ?? ''}`} />;
  },
);
