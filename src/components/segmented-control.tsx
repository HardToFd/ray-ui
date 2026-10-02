import { forwardRef, useId, useState, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react';

export interface SegmentedOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
  'aria-label'?: string;
}

export interface SegmentedControlProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'children'> {
  options: SegmentedOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  /** Optional name for forms and test hooks; the control itself uses a radiogroup. */
  name?: string;
}

function firstEnabled(options: SegmentedOption[], preferred?: string) {
  const match = preferred ? options.find((option) => option.value === preferred && !option.disabled) : undefined;
  return match?.value ?? options.find((option) => !option.disabled)?.value ?? '';
}

const keys: Record<string, 1 | -1 | 'first' | 'last'> = {
  ArrowLeft: -1,
  ArrowUp: -1,
  ArrowRight: 1,
  ArrowDown: 1,
  Home: 'first',
  End: 'last',
};

export const SegmentedControl = forwardRef<HTMLDivElement, SegmentedControlProps>(
  function SegmentedControl({ options, value, defaultValue, onValueChange, size = 'md', fullWidth = false, disabled = false, name, className = '', ...props }, ref) {
    const id = useId();
    const [localValue, setLocalValue] = useState(() => firstEnabled(options, defaultValue));
    const selected = firstEnabled(options, value ?? localValue);
    const enabled = options.filter((option) => !option.disabled);
    const change = (next: string) => {
      if (disabled || !options.some((option) => option.value === next && !option.disabled)) return;
      if (value === undefined) setLocalValue(next);
      onValueChange?.(next);
    };
    const move = (current: string, direction: 1 | -1 | 'first' | 'last') => {
      if (!enabled.length) return;
      if (direction === 'first') return enabled[0].value;
      if (direction === 'last') return enabled[enabled.length - 1].value;
      const index = Math.max(0, enabled.findIndex((option) => option.value === current));
      return enabled[(index + direction + enabled.length) % enabled.length].value;
    };
    return <div {...props} ref={ref} role="radiogroup" aria-label={props['aria-label'] ?? '选项'} data-name={name} data-size={size} data-full-width={fullWidth || undefined} aria-disabled={disabled || undefined} className={`ray-segmented-control ray-segmented-control--${size}${fullWidth ? ' ray-segmented-control--full' : ''}${className ? ` ${className}` : ''}`}>
      {options.map((option) => {
        const checked = option.value === selected;
        const optionDisabled = disabled || option.disabled;
        const buttonProps: ButtonHTMLAttributes<HTMLButtonElement> = {
          type: 'button',
          role: 'radio',
          'aria-checked': checked,
          'aria-label': option['aria-label'],
          disabled: optionDisabled,
          tabIndex: checked || (!selected && option === enabled[0]) ? 0 : -1,
          onClick: () => change(option.value),
          onKeyDown: (event) => {
            const direction = keys[event.key];
            if (!direction || optionDisabled) return;
            event.preventDefault();
            const next = move(option.value, direction);
            if (!next) return;
            change(next);
            document.getElementById(`${id}-${next}`)?.focus();
          },
        };
        return <button {...buttonProps} id={`${id}-${option.value}`} key={option.value} className="ray-segmented-control__option">{option.label}</button>;
      })}
    </div>;
  },
);
