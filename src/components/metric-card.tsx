import * as React from "react";

function cx(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

export interface MetricCardProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  label: React.ReactNode;
  value: React.ReactNode;
  delta?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  icon?: React.ReactNode;
  data?: readonly number[];
  footer?: React.ReactNode;
  tone?: "default" | "accent" | "sage" | "amber";
  loading?: boolean;
}

function pointsFor(data: readonly number[]) {
  const points = data.filter((value) => Number.isFinite(value));
  if (points.length < 2) return "";
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  return points.map((value, index) => {
    const x = (index / (points.length - 1)) * 100;
    const y = 34 - ((value - min) / span) * 28;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(" ");
}

export const MetricCard = React.forwardRef<HTMLElement, MetricCardProps>(
  function MetricCard({ label, value, delta, trend = "neutral", trendLabel, icon, data, footer, tone = "default", loading = false, className, ...props }, ref) {
    const gradientId = `ray-metric-${React.useId().replace(/:/g, "")}`;
    const points = React.useMemo(() => pointsFor(data ?? []), [data]);
    return <article {...props} ref={ref} className={cx("ray-metric-card", `ray-metric-card--${tone}`, loading && "ray-metric-card--loading", className)}>
      <div className="ray-metric-card__top"><span className="ray-metric-card__label">{label}</span>{icon && <span className="ray-metric-card__icon" aria-hidden="true">{icon}</span>}</div>
      {loading ? <div className="ray-metric-card__skeleton" aria-label="正在加载" role="status" /> : <>
        <div className="ray-metric-card__middle"><strong className="ray-metric-card__value">{value}</strong>{points && <svg className="ray-metric-card__chart" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="currentColor" stopOpacity=".35" /><stop offset="1" stopColor="currentColor" stopOpacity=".95" /></linearGradient></defs><polyline points={points} fill="none" stroke={`url(#${gradientId})`} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}</div>
        {(delta !== undefined || trendLabel) && <div className={cx("ray-metric-card__delta", `ray-metric-card__delta--${trend}`)}><span aria-hidden="true">{trend === "up" ? "↗" : trend === "down" ? "↘" : "→"}</span><strong>{delta}</strong>{trendLabel && <span>{trendLabel}</span>}</div>}
      </>}
      {footer && <div className="ray-metric-card__footer">{footer}</div>}
    </article>;
  },
);

