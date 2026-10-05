import * as React from "react";

function cx(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

export interface CommandItem {
  id: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  shortcut?: string | string[];
  keywords?: string[];
  disabled?: boolean;
}

export interface CommandGroup {
  id?: string;
  heading?: React.ReactNode;
  items: CommandItem[];
}

export interface CommandPaletteProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  groups: CommandGroup[];
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onSelect?: (item: CommandItem) => void;
  placeholder?: string;
  emptyMessage?: React.ReactNode;
  title?: string;
  description?: string;
  closeOnSelect?: boolean;
  loop?: boolean;
  hotkey?: string | false;
}

function textValue(value: React.ReactNode) {
  if (typeof value === "string" || typeof value === "number") return String(value);
  return "";
}

function matches(item: CommandItem, query: string) {
  if (!query.trim()) return true;
  const haystack = [textValue(item.label), textValue(item.description), ...(item.keywords ?? [])]
    .join(" ")
    .toLocaleLowerCase();
  return haystack.includes(query.trim().toLocaleLowerCase());
}

export const CommandPalette = React.forwardRef<HTMLDivElement, CommandPaletteProps>(
  function CommandPalette(
    {
      groups,
      open: openProp,
      defaultOpen = false,
      onOpenChange,
      value: valueProp,
      defaultValue = "",
      onValueChange,
      onSelect,
      placeholder = "搜索命令…",
      emptyMessage = "没有找到匹配的命令。",
      title = "命令面板",
      description = "使用方向键选择，Enter 执行。",
      closeOnSelect = true,
      loop = true,
      hotkey = false,
      className,
      ...props
    },
    forwardedRef,
  ) {
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
    const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
    const [activeId, setActiveId] = React.useState<string | null>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const itemRefs = React.useRef(new Map<string, HTMLButtonElement>());
    const titleId = React.useId();
    const descriptionId = `${titleId}-description`;
    const open = openProp ?? uncontrolledOpen;
    const query = valueProp ?? uncontrolledValue;

    const setOpen = React.useCallback((next: boolean) => {
      if (openProp === undefined) setUncontrolledOpen(next);
      onOpenChange?.(next);
    }, [onOpenChange, openProp]);

    const setQuery = React.useCallback((next: string) => {
      if (valueProp === undefined) setUncontrolledValue(next);
      onValueChange?.(next);
    }, [onValueChange, valueProp]);

    const visibleGroups = React.useMemo(() => groups.map((group) => ({
      ...group,
      items: group.items.filter((item) => matches(item, query)),
    })).filter((group) => group.items.length > 0), [groups, query]);
    const visibleItems = React.useMemo(
      () => visibleGroups.flatMap((group) => group.items),
      [visibleGroups],
    );

    React.useEffect(() => {
      if (hotkey === false || open) return;
      const handleShortcut = (event: KeyboardEvent) => {
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === hotkey.toLowerCase()) {
          event.preventDefault();
          setOpen(true);
        }
      };
      document.addEventListener("keydown", handleShortcut);
      return () => document.removeEventListener("keydown", handleShortcut);
    }, [hotkey, open, setOpen]);

    React.useEffect(() => {
      if (!open) return;
      const first = visibleItems.find((item) => !item.disabled);
      setActiveId((current) => current && visibleItems.some((item) => item.id === current && !item.disabled) ? current : first?.id ?? null);
      const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
      return () => window.cancelAnimationFrame(frame);
    }, [open, query, visibleItems]);

    React.useEffect(() => {
      if (!open) return;
      const handleKeyDown = (event: KeyboardEvent) => {
        if (hotkey !== false && (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === hotkey.toLowerCase()) {
          event.preventDefault();
          setOpen(false);
          return;
        }
        if (event.key === "Escape") {
          event.preventDefault();
          setOpen(false);
          return;
        }
        if (event.key !== "ArrowDown" && event.key !== "ArrowUp" && event.key !== "Home" && event.key !== "End" && event.key !== "Enter") return;
        event.preventDefault();
        const enabled = visibleItems.filter((item) => !item.disabled);
        if (event.key === "Enter") {
          const item = enabled.find((candidate) => candidate.id === activeId);
          if (!item) return;
          onSelect?.(item);
          if (closeOnSelect) setOpen(false);
          return;
        }
        if (!enabled.length) return;
        const currentIndex = Math.max(0, enabled.findIndex((item) => item.id === activeId));
        let nextIndex = currentIndex;
        if (event.key === "Home") nextIndex = 0;
        else if (event.key === "End") nextIndex = enabled.length - 1;
        else if (event.key === "ArrowDown") nextIndex = currentIndex + 1;
        else nextIndex = currentIndex - 1;
        if (loop) nextIndex = (nextIndex + enabled.length) % enabled.length;
        else nextIndex = Math.max(0, Math.min(enabled.length - 1, nextIndex));
        const next = enabled[nextIndex];
        setActiveId(next.id);
        itemRefs.current.get(next.id)?.scrollIntoView?.({ block: "nearest" });
      };
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [activeId, closeOnSelect, loop, onSelect, open, setOpen, visibleItems]);

    if (!open) return null;

    return (
      <div className="ray-command-palette__portal" role="presentation">
        <button className="ray-command-palette__scrim" aria-label="关闭命令面板" onClick={() => setOpen(false)} />
        <div
          {...props}
          ref={forwardedRef}
          className={cx("ray-command-palette", className)}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={description ? descriptionId : undefined}
        >
          <div className="ray-command-palette__header">
            <div>
              <h2 id={titleId}>{title}</h2>
              {description && <p id={descriptionId}>{description}</p>}
            </div>
            <kbd>ESC</kbd>
          </div>
          <div className="ray-command-palette__search-wrap">
            <span aria-hidden="true">⌕</span>
            <input
              ref={inputRef}
              className="ray-command-palette__search"
              value={query}
              onChange={(event) => setQuery(event.currentTarget.value)}
              placeholder={placeholder}
              aria-label={placeholder}
              role="searchbox"
              autoComplete="off"
            />
            <kbd>⌘ K</kbd>
          </div>
          <div className="ray-command-palette__list" role="listbox" aria-label={title}>
            {visibleGroups.length ? visibleGroups.map((group, groupIndex) => (
              <section key={group.id ?? `group-${groupIndex}`} className="ray-command-palette__group">
                {group.heading && <h3>{group.heading}</h3>}
                {group.items.map((item) => {
                  const selected = item.id === activeId;
                  const shortcut = Array.isArray(item.shortcut) ? item.shortcut : item.shortcut ? [item.shortcut] : [];
                  return <button
                    key={item.id}
                    ref={(node) => { if (node) itemRefs.current.set(item.id, node); else itemRefs.current.delete(item.id); }}
                    type="button"
                    className={cx("ray-command-palette__item", selected && "ray-command-palette__item--active")}
                    role="option"
                    aria-selected={selected}
                    disabled={item.disabled}
                    onMouseEnter={() => !item.disabled && setActiveId(item.id)}
                    onClick={() => { if (item.disabled) return; onSelect?.(item); if (closeOnSelect) setOpen(false); }}
                  >
                    <span className="ray-command-palette__item-icon" aria-hidden="true">{item.icon ?? "✦"}</span>
                    <span className="ray-command-palette__item-copy"><strong>{item.label}</strong>{item.description && <small>{item.description}</small>}</span>
                    {shortcut.length > 0 && <span className="ray-command-palette__shortcut">{shortcut.map((key) => <kbd key={key}>{key}</kbd>)}</span>}
                  </button>;
                })}
              </section>
            )) : <div className="ray-command-palette__empty" role="status">{emptyMessage}</div>}
          </div>
          <footer className="ray-command-palette__footer"><span><kbd>↑</kbd><kbd>↓</kbd> 选择</span><span><kbd>↵</kbd> 执行</span><span><kbd>ESC</kbd> 关闭</span></footer>
        </div>
      </div>
    );
  },
);
