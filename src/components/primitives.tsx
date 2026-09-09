import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as TabsPrimitive from "@radix-ui/react-tabs";

function cx(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { variant = "primary", size = "md", loading = false, disabled, className, children, type = "button", ...props },
    ref,
  ) {
    return (
      <button
        {...props}
        ref={ref}
        type={type}
        className={cx("ray-button", `ray-button--${variant}`, `ray-button--${size}`, className)}
        disabled={disabled || loading}
        aria-busy={loading || props["aria-busy"]}
      >
        {loading && <span className="ray-button__spinner" aria-hidden="true" />}
        {children}
      </button>
    );
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "neutral" | "success" | "warning" | "danger" | "info";
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  function Badge({ variant = "neutral", className, ...props }, ref) {
    return <span {...props} ref={ref} className={cx("ray-badge", `ray-badge--${variant}`, className)} />;
  },
);

interface FieldFeedbackProps {
  label?: string;
  error?: string;
  hint?: string;
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement>, FieldFeedbackProps {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input({ label, error, hint, id, className, "aria-describedby": describedBy, ...props }, ref) {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const hintId = `${inputId}-hint`;
    const errorId = `${inputId}-error`;
    const description = cx(describedBy, hint && hintId, error && errorId) || undefined;

    return (
      <div className="ray-field">
        {label && <label className="ray-field__label" htmlFor={inputId}>{label}</label>}
        <input
          {...props}
          ref={ref}
          id={inputId}
          className={cx("ray-input", error && "ray-input--invalid", className)}
          aria-invalid={error ? true : props["aria-invalid"]}
          aria-describedby={description}
        />
        {hint && <p id={hintId} className="ray-field__hint">{hint}</p>}
        {error && <p id={errorId} className="ray-field__error">{error}</p>}
      </div>
    );
  },
);

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement>, FieldFeedbackProps {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ label, error, hint, id, className, "aria-describedby": describedBy, ...props }, ref) {
    const generatedId = React.useId();
    const textareaId = id ?? generatedId;
    const hintId = `${textareaId}-hint`;
    const errorId = `${textareaId}-error`;
    const description = cx(describedBy, hint && hintId, error && errorId) || undefined;

    return (
      <div className="ray-field">
        {label && <label className="ray-field__label" htmlFor={textareaId}>{label}</label>}
        <textarea
          {...props}
          ref={ref}
          id={textareaId}
          className={cx("ray-textarea", error && "ray-input--invalid", className)}
          aria-invalid={error ? true : props["aria-invalid"]}
          aria-describedby={description}
        />
        {hint && <p id={hintId} className="ray-field__hint">{hint}</p>}
        {error && <p id={errorId} className="ray-field__error">{error}</p>}
      </div>
    );
  },
);

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size" | "onChange"> {
  label?: string;
  onCheckedChange?: (checked: boolean) => void;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  function Switch({ label, onCheckedChange, className, disabled, id, ...props }, ref) {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;

    return (
      <label htmlFor={inputId} className={cx("ray-switch", disabled && "ray-switch--disabled", className)}>
        <input
          {...props}
          ref={ref}
          id={inputId}
          className="ray-switch__input"
          type="checkbox"
          role="switch"
          disabled={disabled}
          onChange={(event) => onCheckedChange?.(event.currentTarget.checked)}
        />
        <span className="ray-switch__track" aria-hidden="true"><span className="ray-switch__thumb" /></span>
        {label && <span className="ray-switch__label">{label}</span>}
      </label>
    );
  },
);

export type CardProps = React.HTMLAttributes<HTMLDivElement>;

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  function Card({ className, ...props }, ref) {
    return <div {...props} ref={ref} className={cx("ray-card", className)} />;
  },
);

export type SeparatorProps = React.HTMLAttributes<HTMLDivElement>;

export const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  function Separator({ className, ...props }, ref) {
    return <div role="separator" aria-orientation="horizontal" {...props} ref={ref} className={cx("ray-separator", className)} />;
  },
);

export interface DialogProps {
  trigger: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export function Dialog({ trigger, title, description, children, open, onOpenChange, className }: DialogProps) {
  const descriptionId = React.useId();

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {React.isValidElement(trigger) ? (
        <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>
      ) : (
        <DialogPrimitive.Trigger className="ray-button ray-button--secondary ray-button--md">{trigger}</DialogPrimitive.Trigger>
      )}
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="ray-dialog__overlay" />
        <DialogPrimitive.Content className={cx("ray-dialog", className)} aria-describedby={description ? descriptionId : undefined}>
          <div className="ray-dialog__header">
            <DialogPrimitive.Title className="ray-dialog__title">{title}</DialogPrimitive.Title>
            {description && <DialogPrimitive.Description id={descriptionId} className="ray-dialog__description">{description}</DialogPrimitive.Description>}
          </div>
          <div className="ray-dialog__body">{children}</div>
          <DialogPrimitive.Close className="ray-dialog__close" aria-label="关闭对话框">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export interface TabItem {
  value: string;
  label: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  "aria-label"?: string;
}

export function Tabs({ items, defaultValue, value, onValueChange, className, "aria-label": label }: TabsProps) {
  return (
    <TabsPrimitive.Root className={cx("ray-tabs", className)} value={value} defaultValue={defaultValue ?? items.find((item) => !item.disabled)?.value} onValueChange={onValueChange}>
      <TabsPrimitive.List className="ray-tabs__list" aria-label={label}>
        {items.map((item) => <TabsPrimitive.Trigger key={item.value} value={item.value} disabled={item.disabled} className="ray-tabs__trigger">{item.label}</TabsPrimitive.Trigger>)}
      </TabsPrimitive.List>
      {items.map((item) => <TabsPrimitive.Content key={item.value} value={item.value} className="ray-tabs__content">{item.content}</TabsPrimitive.Content>)}
    </TabsPrimitive.Root>
  );
}
