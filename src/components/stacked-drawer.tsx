import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';

const DrawerStack = React.createContext<{
  level: number;
  setBranchDepth: (id: string, depth: number) => void;
} | null>(null);

export interface StackedDrawerProps {
  trigger: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

/** Nest drawers inside their parent's content to keep earlier cards in the stack. */
export function StackedDrawer({
  trigger, title, description, children, footer, open: controlledOpen,
  defaultOpen = false, onOpenChange, className,
}: StackedDrawerProps) {
  const parent = React.useContext(DrawerStack);
  const id = React.useId();
  const titleRef = React.useRef<HTMLHeadingElement>(null);
  const [localOpen, setLocalOpen] = React.useState(defaultOpen);
  const [branches, setBranches] = React.useState<Record<string, number>>({});
  const open = controlledOpen ?? localOpen;
  const level = parent ? parent.level + 1 : 0;
  const depth = Math.max(0, ...Object.values(branches));
  const setParentDepth = parent?.setBranchDepth;
  const setBranchDepth = React.useCallback((branchId: string, branchDepth: number) => {
    setBranches((previous) => {
      if ((previous[branchId] ?? 0) === branchDepth) return previous;
      const next = { ...previous };
      if (branchDepth) next[branchId] = branchDepth;
      else delete next[branchId];
      return next;
    });
  }, []);

  React.useEffect(() => {
    setParentDepth?.(id, open ? depth + 1 : 0);
    return () => setParentDepth?.(id, 0);
  }, [id, open, depth, setParentDepth]);

  const style = {
    '--ray-drawer-depth': Math.min(depth, 2),
    zIndex: 1001 + level * 2,
  } as React.CSSProperties;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(next) => {
      if (controlledOpen === undefined) setLocalOpen(next);
      onOpenChange?.(next);
    }}>
      {React.isValidElement(trigger) ? (
        <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>
      ) : (
        <DialogPrimitive.Trigger className="ray-button ray-button--secondary ray-button--md">{trigger}</DialogPrimitive.Trigger>
      )}
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className="ray-stacked-drawer__overlay"
          data-nested={level > 0}
          style={{ zIndex: 1000 + level * 2 }}
        />
        <DialogPrimitive.Content
          className={['ray-stacked-drawer', className].filter(Boolean).join(' ')}
          style={style}
          data-covered={depth > 0}
          inert={depth > 0}
          aria-describedby={description ? `${id}-description` : undefined}
          onOpenAutoFocus={(event) => { event.preventDefault(); titleRef.current?.focus(); }}
        >
          <div className="ray-stacked-drawer__toolbar">
            {level > 0 ? (
              <DialogPrimitive.Close className="ray-stacked-drawer__back">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m12 5-7 7 7 7M5 12h14" /></svg>
                返回上一层
              </DialogPrimitive.Close>
            ) : <span className="ray-stacked-drawer__eyebrow">详情</span>}
            <span className="ray-stacked-drawer__level">{String(level + 1).padStart(2, '0')}</span>
            <DialogPrimitive.Close className="ray-stacked-drawer__close" aria-label="关闭当前抽屉">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
            </DialogPrimitive.Close>
          </div>
          <div className="ray-stacked-drawer__header">
            <DialogPrimitive.Title ref={titleRef} tabIndex={-1} className="ray-stacked-drawer__title">{title}</DialogPrimitive.Title>
            {description && <DialogPrimitive.Description id={`${id}-description`} className="ray-stacked-drawer__description">{description}</DialogPrimitive.Description>}
          </div>
          <DrawerStack.Provider value={{ level, setBranchDepth }}>
            <div className="ray-stacked-drawer__body">{children}</div>
            {footer && <div className="ray-stacked-drawer__footer">{footer}</div>}
          </DrawerStack.Provider>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
