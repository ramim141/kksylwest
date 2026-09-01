import React from "react";
import {
  HiArrowTrendingUp,
  HiArrowTrendingDown,
  HiCheckCircle,
  HiExclamationTriangle,
  HiMinusSmall,
} from "react-icons/hi2";

import { toBn } from "./useOverviewData";

/* ============================================================
   OVERVIEW CHART PRIMITIVES
   Small, dependency-free pieces. Everything is plain layout and
   theme tokens — a charting library for four shapes would cost
   more than it returns, and these have to read correctly in both
   the light and dark palettes.

   Every chart also states its numbers in text. A bar the admin
   cannot measure by eye is decoration, not information.
   ============================================================ */

const TONE_BAR = {
  primary: "bg-primary",
  secondary: "bg-secondary",
  tertiary: "bg-tertiary",
  error: "bg-error",
  neutral: "bg-ink-muted/50",
};

/* Written out rather than interpolated: Tailwind only ships classes it can
   find as complete strings in the source. */
const TONE_RING = {
  primary: "ring-primary/40",
  secondary: "ring-secondary/40",
  tertiary: "ring-tertiary/40",
  error: "ring-error/40",
  neutral: "ring-ink-muted/40",
};

const TONE_TEXT = {
  primary: "text-primary",
  secondary: "text-secondary",
  tertiary: "text-tertiary",
  error: "text-error",
  neutral: "text-ink-muted",
};

/* ---------------------------------------------------------- TREND PILL */
/** Week-on-week change. Null means there was no previous week to compare. */
export const TrendPill = ({ value, label = "গত সপ্তাহের তুলনায়" }) => {
  if (value === null || value === undefined) {
    return (
      <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-ink-faint">
        <HiMinusSmall className="text-sm" />
        তুলনার তথ্য নেই
      </span>
    );
  }

  const up = value > 0;
  const flat = value === 0;
  const Icon = flat ? HiMinusSmall : up ? HiArrowTrendingUp : HiArrowTrendingDown;

  return (
    <span
      title={label}
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11.5px] font-bold leading-none ${
        flat
          ? "bg-surface-overlay/70 text-ink-muted"
          : up
          ? "bg-primary/15 text-primary"
          : "bg-error/15 text-error"
      }`}
    >
      <Icon className="text-sm shrink-0" />
      {flat ? "অপরিবর্তিত" : `${toBn(Math.abs(value))}%`}
    </span>
  );
};

/* ---------------------------------------------------------- BAR LIST */
/**
 * Ranked horizontal bars. Bars are scaled against the largest row, not
 * the total, so a long tail stays readable instead of collapsing to
 * slivers — the share is spelled out in the percentage beside it.
 */
export const BarList = ({ items, total, tone = "primary", emptyLabel = "কোনো তথ্য নেই" }) => {
  if (!items || items.length === 0) {
    return <p className="text-[13px] text-ink-faint py-6 text-center">{emptyLabel}</p>;
  }

  const max = Math.max(...items.map((i) => i.value), 1);
  const sum = total || items.reduce((acc, i) => acc + i.value, 0) || 1;

  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const pct = Math.round((item.value / sum) * 100);
        return (
          <li key={item.label}>
            <div className="flex items-baseline justify-between gap-3 mb-1.5">
              <span
                className={`text-[13px] font-medium truncate ${
                  item.isRest ? "text-ink-muted italic" : "text-ink-body"
                }`}
                title={item.label}
              >
                {item.label}
              </span>
              <span className="shrink-0 text-[12.5px] font-bold text-ink-strong font-bangla-number tabular-nums">
                {toBn(item.value)}
                <span className="ml-1.5 font-medium text-ink-faint">{toBn(pct)}%</span>
              </span>
            </div>
            <div className="h-2 rounded-full bg-surface-overlay/70 overflow-hidden">
              <div
                className={`h-full rounded-full transition-[width] duration-500 ease-out ${
                  item.isRest ? TONE_BAR.neutral : TONE_BAR[tone] || TONE_BAR.primary
                }`}
                style={{ width: `${Math.max((item.value / max) * 100, 3)}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
};

/* ---------------------------------------------------------- STACKED BAR */
/** One bar split by status, with a legend that carries the real counts. */
export const StackedBar = ({ segments, total }) => {
  const sum = total || segments.reduce((acc, s) => acc + s.value, 0);

  return (
    <div className="space-y-3.5">
      <div className="flex h-3 w-full rounded-full overflow-hidden bg-surface-overlay/70">
        {sum > 0 &&
          segments.map((s) =>
            s.value > 0 ? (
              <div
                key={s.label}
                title={`${s.label}: ${toBn(s.value)}`}
                style={{ width: `${(s.value / sum) * 100}%` }}
                className={`${TONE_BAR[s.tone] || TONE_BAR.neutral} transition-[width] duration-500`}
              />
            ) : null
          )}
      </div>

      <ul className="flex flex-wrap gap-x-5 gap-y-2">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2 min-w-0">
            <span
              aria-hidden="true"
              className={`w-2.5 h-2.5 rounded-full shrink-0 ${TONE_BAR[s.tone] || TONE_BAR.neutral}`}
            />
            <span className="text-[12.5px] text-ink-muted truncate">{s.label}</span>
            <span
              className={`text-[13px] font-bold font-bangla-number tabular-nums ${
                TONE_TEXT[s.tone] || TONE_TEXT.neutral
              }`}
            >
              {toBn(s.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

/* ---------------------------------------------------------- COLUMN CHART */
/**
 * Daily volume over a short window. An all-zero window still renders the
 * baseline row rather than an empty box, because "nothing came in" is
 * itself the answer the admin is looking for.
 */
export const ColumnChart = ({ series, tone = "primary", unit = "টি" }) => {
  const max = Math.max(...series.map((d) => d.value), 1);
  const totalInWindow = series.reduce((acc, d) => acc + d.value, 0);

  return (
    <div>
      <div className="flex items-end gap-[3px] sm:gap-1.5 h-28" role="img"
        aria-label={`গত ${toBn(series.length)} দিনে মোট ${toBn(totalInWindow)} ${unit}`}>
        {series.map((d, i) => {
          const isToday = i === series.length - 1;
          return (
            <div key={d.date.toISOString()} className="flex-1 min-w-0 h-full flex flex-col justify-end group relative">
              <span
                className="pointer-events-none absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full z-10
                  hidden group-hover:block whitespace-nowrap rounded-lg border border-line-soft bg-surface-overlay
                  px-2 py-1 text-[11px] font-semibold text-ink-strong shadow-overlay"
              >
                {d.label} — {toBn(d.value)} {unit}
              </span>
              <div
                style={{ height: `${d.value === 0 ? 2 : Math.max((d.value / max) * 100, 6)}%` }}
                className={`w-full rounded-t-md transition-all duration-300 ${
                  d.value === 0
                    ? "bg-line-soft"
                    : isToday
                    ? `${TONE_BAR[tone]} ring-2 ring-offset-2 ring-offset-surface-card ${
                        TONE_RING[tone] || TONE_RING.primary
                      }`
                    : `${TONE_BAR[tone]} opacity-70 group-hover:opacity-100`
                }`}
              />
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-2.5 text-[11.5px] text-ink-faint font-medium">
        <span>{series[0]?.label}</span>
        <span className="text-ink-muted">
          সর্বোচ্চ <span className="font-bold font-bangla-number text-ink-body">{toBn(max)}</span>
        </span>
        <span>আজ</span>
      </div>
    </div>
  );
};

/* ---------------------------------------------------------- ISSUE ROW */
/**
 * One data-quality check. A clean check still renders, in green — an admin
 * needs to see that the check ran and passed, not just an absence of rows.
 */
export const IssueRow = ({ label, count, detail, tone = "secondary", onClick }) => {
  const clean = !count;
  const Tag = onClick && !clean ? "button" : "div";

  return (
    <Tag
      type={onClick && !clean ? "button" : undefined}
      onClick={!clean ? onClick : undefined}
      className={`w-full flex items-start gap-3 rounded-lg border px-3.5 py-2.5 text-left transition-all
        ${
          clean
            ? "border-line-soft/60 bg-surface-low/40"
            : tone === "error"
            ? "border-error/35 bg-error/[0.07]"
            : "border-secondary/35 bg-secondary/[0.07]"
        }
        ${onClick && !clean ? "cursor-pointer hover:shadow-md" : ""}`}
    >
      <span
        className={`w-6 h-6 rounded-md shrink-0 flex items-center justify-center text-[13px] font-bold mt-px ${
          clean
            ? "bg-primary/15 text-primary"
            : tone === "error"
            ? "bg-error/20 text-error"
            : "bg-secondary/20 text-secondary"
        }`}
      >
        {clean ? <HiCheckCircle className="text-base" /> : <HiExclamationTriangle className="text-base" />}
      </span>

      <span className="flex-1 min-w-0">
        <span className="block text-[13px] font-semibold text-ink-strong leading-snug">{label}</span>
        {detail && <span className="block text-[11.5px] text-ink-muted mt-0.5 break-words">{detail}</span>}
      </span>

      <span
        className={`shrink-0 rounded-full px-2 py-0.5 text-[11.5px] font-bold font-bangla-number ${
          clean
            ? "bg-primary/15 text-primary"
            : tone === "error"
            ? "bg-error/20 text-error"
            : "bg-secondary/20 text-secondary"
        }`}
      >
        {clean ? "ঠিক আছে" : toBn(count)}
      </span>
    </Tag>
  );
};

/* ---------------------------------------------------------- MONEY TILE */
export const MoneyTile = ({ label, amount, hint, tone = "primary" }) => (
  <div className="rounded-xl border border-line-soft/70 bg-surface-low/60 px-3.5 py-3 min-w-0">
    <p className="text-[11.5px] font-semibold text-ink-muted uppercase tracking-wider truncate">
      {label}
    </p>
    <p
      className={`text-lg sm:text-xl font-bold font-bangla-number tabular-nums mt-1 leading-none ${
        TONE_TEXT[tone] || TONE_TEXT.neutral
      }`}
    >
      ৳ {amount}
    </p>
    {hint && <p className="text-[11.5px] text-ink-faint mt-1.5 truncate">{hint}</p>}
  </div>
);

/* ---------------------------------------------------------- METRIC ROW */
/** Label / value pair for the compact status readouts. */
export const MetricRow = ({ label, value, tone = "neutral", hint }) => (
  <div className="flex items-center justify-between gap-3 py-2 border-b border-line-soft/50 last:border-0">
    <div className="min-w-0">
      <p className="text-[13px] text-ink-body truncate">{label}</p>
      {hint && <p className="text-[11.5px] text-ink-faint truncate mt-0.5">{hint}</p>}
    </div>
    <span
      className={`shrink-0 text-[13px] font-bold font-bangla-number tabular-nums ${
        TONE_TEXT[tone] || TONE_TEXT.neutral
      }`}
    >
      {value}
    </span>
  </div>
);
