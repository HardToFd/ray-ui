import * as React from "react";

function cx(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

export interface SplitButtonAction {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  onSelect?: () => void;
}

export interface SplitButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onSelect"> {
  actions: SplitButtonAction[];
  onAction?: (action: SplitButtonAction) => void;
  menuLabel?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
}

export const SplitButton = React.forwardRef<HTMLButtonElement, SplitButtonProps>(
  function SplitButton({ actions, onAction, menuLabel = "打开更多操作", open: openProp, defaultOpen = false, onOpenChange, variant = "primary", size = "md", className, children, disabled, onClick, ...props }, ref) {
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
    const [activeIndex, setActiveIndex] = React.useState(0);
    const menuRef = React.useRef<HTMLDivElement>(null);
    const toggleRef = React.useRef<HTMLButtonElement>(null);
    const open = openProp ?? uncontrolledOpen;
    const enabled = actions.filter((action) => !action.disabled);
    const setOpen = (next: boolean) => {
      if (openProp === undefined) setUncontrolledOpen(next);
      onOpenChange?.(next);
    };
    const choose = (action: SplitButtonAction) => {
      if (action.disabled) return;
      action.onSelect?.();
      onAction?.(action);
      setOpen(false);
      toggleRef.current?.focus();
    };

    React.useEffect(() => {
      if (!open) return;
      const outside = (event: MouseEvent) => { if (menuRef.current && !menuRef.current.parentElement?.contains(event.target as Node)) setOpen(false); };
      const keydown = (event: KeyboardEvent) => {
        if (event.key === "Escape") { event.preventDefault(); setOpen(false); toggleRef.current?.focus(); return; }
        if (!open || !enabled.length) return;
        if (!["ArrowDown", "ArrowUp", "Home", "End", "Enter"].includes(event.key)) return;
        event.preventDefault();
        if (event.key === "Enter") { choose(enabled[activeIndex] ?? enabled[0]); return; }
        const current = Math.max(0, activeIndex);
        const next = event.key === "Home" ? 0 : event.key === "End" ? enabled.length - 1 : (current + (event.key === "ArrowDown" ? 1 : -1) + enabled.length) % enabled.length;
        setActiveIndex(next);
      };
      document.addEventListener("mousedown", outside);
      document.addEventListener("keydown", keydown);
      return () => { document.removeEventListener("mousedown", outside); document.removeEventListener("keydown", keydown); };
    }, [activeIndex, enabled, open]);

    return <div className={cx("ray-split-button", `ray-split-button--${size}`, className)}>
      <button {...props} ref={ref} type={props.type ?? "button"} className={cx("ray-split-button__main", `ray-split-button__main--${variant}`)} disabled={disabled} onClick={onClick}>{children}</button>
      <button ref={toggleRef} type="button" className={cx("ray-split-button__toggle", `ray-split-button__toggle--${variant}`)} disabled={disabled || actions.length === 0} aria-label={menuLabel} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)}><span aria-hidden="true">⌄</span></button>
      {open && <div ref={menuRef} className="ray-split-button__menu" role="menu">{actions.map((action) => { const enabledIndex = enabled.findIndex((item) => item.id === action.id); return <button key={action.id} type="button" role="menuitem" disabled={action.disabled} className={cx("ray-split-button__item", enabledIndex === activeIndex && "ray-split-button__item--active")} onMouseEnter={() => enabledIndex >= 0 && setActiveIndex(enabledIndex)} onClick={() => choose(action)}>{action.icon && <span aria-hidden="true">{action.icon}</span>}<span>{action.label}</span></button>; })}</div>}
    </div>;
  },
);

