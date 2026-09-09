import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as SelectPrimitive from "@radix-ui/react-select";
import { DayPicker, getDefaultClassNames, type ClassNames, type DropdownProps, type Labels } from "@daypicker/react";
import { zhCN } from "@daypicker/react/locale";

export interface DatePickerProps {
  value?: Date;
  defaultValue?: Date;
  onValueChange?: (date: Date | undefined) => void;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  clearable?: boolean;
  label?: string;
  hint?: string;
  error?: string;
  placeholder?: string;
  name?: string;
  id?: string;
  className?: string;
}

/** Calendar values are local dates, never UTC timestamps. */
function localDay(date: Date | undefined): Date | undefined {
  if (!(date instanceof Date) || !Number.isFinite(date.getTime())) return undefined;
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function localDateString(date: Date): string {
  return `${String(date.getFullYear()).padStart(4, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function yearMonth(year: number, month: number): Date {
  const date = new Date(0);
  date.setFullYear(year, month, 1);
  date.setHours(0, 0, 0, 0);
  return date;
}

const weekdayNames = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
const calendarLabels: Partial<Labels> = {
  labelDayButton: (date, modifiers) =>
    `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日${weekdayNames[date.getDay()]}${modifiers.today ? "，今天" : ""}${modifiers.selected ? "，已选择" : ""}`,
  labelGrid: (date) => `${date.getFullYear()}年${date.getMonth() + 1}月`,
  labelMonthDropdown: () => "选择月份",
  labelYearDropdown: () => "选择年份",
  labelPrevious: () => "上个月",
  labelNext: () => "下个月",
  labelNav: () => "切换月份",
  labelWeekday: (date) => weekdayNames[date.getDay()],
};

const calendarClassNames = Object.fromEntries(
  Object.keys(getDefaultClassNames()).map((key) => [key, `ray-calendar-${key.replaceAll("_", "-")}`]),
) as ClassNames;

const themeProperties = [
  "--ray-bg", "--ray-surface", "--ray-surface-raised", "--ray-text", "--ray-muted",
  "--ray-border", "--ray-accent", "--ray-accent-contrast", "--ray-ring", "--ray-radius",
];

const CalendarThemeContext = React.createContext<React.CSSProperties | undefined>(undefined);

/** Replace the platform select popup while keeping DayPicker's navigation contract. */
function CalendarDropdown({
  options = [], value, onChange, disabled, className, style, id, tabIndex,
  "aria-label": ariaLabel,
}: DropdownProps) {
  const theme = React.useContext(CalendarThemeContext);
  return (
    <SelectPrimitive.Root
      value={value === undefined ? "" : String(value)}
      disabled={disabled}
      onValueChange={(nextValue) => {
        // DayPicker's month/year handlers consume only target.value.
        const target = { value: nextValue } as HTMLSelectElement;
        onChange?.({ target, currentTarget: target } as React.ChangeEvent<HTMLSelectElement>);
      }}
    >
      <SelectPrimitive.Trigger
        id={id}
        aria-label={ariaLabel}
        tabIndex={tabIndex}
        className={["ray-calendar-select-trigger", className].filter(Boolean).join(" ")}
        style={style}
      >
        <SelectPrimitive.Value />
        <SelectPrimitive.Icon className="ray-calendar-select-chevron">
          <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m4 6 4 4 4-4" /></svg>
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          align="start"
          sideOffset={5}
          collisionPadding={12}
          className="ray-calendar-select-content"
          style={theme}
          aria-label={ariaLabel}
        >
          <SelectPrimitive.ScrollUpButton className="ray-calendar-select-scroll" aria-hidden="true">
            <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true"><path d="m4 10 4-4 4 4" /></svg>
          </SelectPrimitive.ScrollUpButton>
          <SelectPrimitive.Viewport className="ray-calendar-select-viewport">
            {options.map((option) => (
              <SelectPrimitive.Item key={option.value} value={String(option.value)} disabled={option.disabled} className="ray-calendar-select-option">
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="ray-calendar-select-check">
                  <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m3 8 3 3 7-7" /></svg>
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
          <SelectPrimitive.ScrollDownButton className="ray-calendar-select-scroll" aria-hidden="true">
            <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true"><path d="m4 6 4 4 4-4" /></svg>
          </SelectPrimitive.ScrollDownButton>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}

const calendarComponents = { Dropdown: CalendarDropdown };

export const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  function DatePicker(props, forwardedRef) {
    const {
      value, defaultValue, onValueChange, minDate, maxDate, disabled = false,
      clearable = true, label, hint, error, placeholder = "选择日期", name, id, className,
    } = props;
    const isControlled = Object.prototype.hasOwnProperty.call(props, "value");
    const initialDefault = React.useRef(localDay(defaultValue));
    const [internalValue, setInternalValue] = React.useState(initialDefault.current);
    const [open, setOpen] = React.useState(false);
    const [portalStyle, setPortalStyle] = React.useState<React.CSSProperties>();
    const triggerRef = React.useRef<HTMLButtonElement>(null);
    const contentRef = React.useRef<HTMLDivElement>(null);
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const hintId = `${inputId}-hint`;
    const errorId = `${inputId}-error`;
    const selected = localDay(isControlled ? value : internalValue);
    const earliest = localDay(minDate);
    const latest = localDay(maxDate);
    const today = localDay(new Date())!;
    const invalidRange = Boolean(earliest && latest && earliest > latest);
    const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(" ") || undefined;

    const isUnavailable = (date: Date) => {
      const day = localDay(date);
      return !day || invalidRange || Boolean(earliest && day < earliest) || Boolean(latest && day > latest);
    };

    // Open the selected month, or the closest available month when today is out of range.
    let initialMonth = selected ?? today;
    if (!invalidRange) {
      if (earliest && initialMonth < earliest) initialMonth = earliest;
      if (latest && initialMonth > latest) initialMonth = latest;
    }
    const firstYear = Math.min(today.getFullYear() - 100, initialMonth.getFullYear(), latest?.getFullYear() ?? Infinity);
    const lastYear = Math.max(today.getFullYear() + 100, initialMonth.getFullYear(), earliest?.getFullYear() ?? -Infinity);
    const startMonth = invalidRange ? yearMonth(initialMonth.getFullYear(), initialMonth.getMonth()) : earliest ?? yearMonth(firstYear, 0);
    const endMonth = invalidRange ? startMonth : latest ?? yearMonth(lastYear, 11);

    const assignTriggerRef = React.useCallback((node: HTMLButtonElement | null) => {
      triggerRef.current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    }, [forwardedRef]);

    React.useEffect(() => {
      if (disabled) setOpen(false);
    }, [disabled]);

    React.useEffect(() => {
      const form = triggerRef.current?.form;
      if (!form || isControlled) return;
      const handleReset = (event: Event) => {
        // Wait until every reset listener has had a chance to cancel the native reset.
        queueMicrotask(() => {
          if (event.defaultPrevented) return;
          setInternalValue(localDay(initialDefault.current));
          setOpen(false);
        });
      };
      form.addEventListener("reset", handleReset);
      return () => form.removeEventListener("reset", handleReset);
    }, [isControlled]);

    const changeOpen = (nextOpen: boolean) => {
      if (disabled) return;
      if (nextOpen && triggerRef.current) {
        // Keep scoped Ray themes and custom tokens when the calendar is portaled to body.
        const styles = getComputedStyle(triggerRef.current);
        const copied = Object.fromEntries(themeProperties.map((property) => [property, styles.getPropertyValue(property)]));
        setPortalStyle({ ...copied, fontFamily: styles.fontFamily, colorScheme: styles.colorScheme });
      }
      setOpen(nextOpen);
    };

    const selectDate = (date: Date | undefined) => {
      if (disabled || (date && isUnavailable(date))) return;
      const nextDate = localDay(date);
      if (!isControlled) setInternalValue(nextDate);
      onValueChange?.(nextDate ? new Date(nextDate) : undefined);
      setOpen(false);
    };

    return (
      <div className={["ray-field", "ray-date-picker", className].filter(Boolean).join(" ")}>
        {label && <label htmlFor={inputId} className="ray-field__label">{label}</label>}
        <PopoverPrimitive.Root open={open && !disabled} onOpenChange={changeOpen}>
          <PopoverPrimitive.Trigger asChild>
            <button
              ref={assignTriggerRef}
              id={inputId}
              type="button"
              disabled={disabled}
              className="ray-date-picker__trigger"
              data-empty={selected ? undefined : "true"}
              aria-label={label ? `${label}，${selected ? localDateString(selected) : placeholder}` : undefined}
              aria-invalid={error ? true : undefined}
              aria-describedby={describedBy}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  changeOpen(true);
                }
              }}
            >
              <svg className="ray-date-picker__icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M16 3v4M8 3v4M3 11h18" />
                <path d="M8 15h2M14 15h2" />
              </svg>
              <span className="ray-date-picker__value">{selected ? localDateString(selected) : placeholder}</span>
              <svg className="ray-date-picker__chevron" viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m4 6 4 4 4-4" /></svg>
            </button>
          </PopoverPrimitive.Trigger>
          <PopoverPrimitive.Portal>
            <PopoverPrimitive.Content
              ref={contentRef}
              className="ray-date-picker__popover"
              style={portalStyle}
              align="start"
              sideOffset={8}
              collisionPadding={12}
              aria-label={label ? `${label}日期选择器` : "日期选择器"}
              onOpenAutoFocus={(event) => {
                // DayPicker focuses the selected day, today, or its first available day.
                event.preventDefault();
                if (invalidRange) contentRef.current?.focus();
              }}
            >
              <CalendarThemeContext.Provider value={portalStyle}>
              <DayPicker
                mode="single"
                required
                selected={selected}
                onSelect={(date) => selectDate(date)}
                defaultMonth={initialMonth}
                startMonth={startMonth}
                endMonth={endMonth}
                disabled={isUnavailable}
                disableNavigation={invalidRange}
                locale={zhCN}
                weekStartsOn={1}
                captionLayout="dropdown"
                navLayout="around"
                fixedWeeks
                showOutsideDays
                autoFocus
                classNames={calendarClassNames}
                labels={calendarLabels}
                components={calendarComponents}
                formatters={{
                  formatMonthDropdown: (date) => `${date.getMonth() + 1}月`,
                  formatYearDropdown: (date) => `${date.getFullYear()}年`,
                  formatWeekdayName: (date) => ["日", "一", "二", "三", "四", "五", "六"][date.getDay()],
                }}
              />
              </CalendarThemeContext.Provider>
              {invalidRange && <p className="ray-date-picker__range-error" role="status">日期范围无效，请检查最早和最晚日期。</p>}
              <div className="ray-date-picker__footer">
                <button type="button" className="ray-date-picker__action" disabled={isUnavailable(today)} onClick={() => selectDate(today)}>今天</button>
                {clearable && <button type="button" className="ray-date-picker__action ray-date-picker__action--muted" disabled={!selected} onClick={() => selectDate(undefined)}>清除</button>}
              </div>
            </PopoverPrimitive.Content>
          </PopoverPrimitive.Portal>
        </PopoverPrimitive.Root>
        {name && <input type="hidden" name={name} value={selected ? localDateString(selected) : ""} disabled={disabled} />}
        {hint && <p id={hintId} className="ray-field__hint">{hint}</p>}
        {error && <p id={errorId} className="ray-field__error">{error}</p>}
      </div>
    );
  },
);
