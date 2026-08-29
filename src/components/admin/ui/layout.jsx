import React from "react";

/* ============================================================
   ADMIN UI KIT — layout
   The page title lives in the shell (AdminDashboard), so tabs no
   longer each render a 160px hero that repeats the breadcrumb.
   Tabs start with a Toolbar holding the actions for the data
   directly below it.
   ============================================================ */

/* ---------------------------------------------------------- PAGE HEADER */
/* Rendered once by the shell from the tab registry. */
export const PageHeader = ({ icon: Icon, title, description, meta, className = "" }) => (
  <header className={`flex flex-wrap items-start justify-between gap-4 ${className}`}>
    <div className="flex items-start gap-3.5 min-w-0">
      {Icon && (
        <span className="w-11 h-11 rounded-lg shrink-0 bg-primary/12 text-primary border border-primary/20 flex items-center justify-center text-2xl">
          <Icon />
        </span>
      )}
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl font-semibold text-ink-strong tracking-tight leading-tight">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-ink-muted mt-1.5 leading-relaxed max-w-3xl">{description}</p>
        )}
      </div>
    </div>
    {meta && <div className="flex flex-wrap items-center gap-2 shrink-0">{meta}</div>}
  </header>
);

/* ---------------------------------------------------------- TOOLBAR */
/**
 * Filters on the left, actions on the right, wrapping to stacked rows on
 * narrow screens. Sits directly above the list it controls.
 */
export const Toolbar = ({ children, actions, className = "" }) => (
  <div
    className={`flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4
      bg-surface-card border border-line-soft rounded-lg p-3.5 sm:p-4 ${className}`}
  >
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1 min-w-0">{children}</div>
    {actions && (
      <div className="flex flex-wrap items-center gap-2 lg:justify-end shrink-0">{actions}</div>
    )}
  </div>
);

/* ---------------------------------------------------------- SUB TABS */
/**
 * Horizontal section switcher inside a tab (Gallery, Site Settings, Results).
 * Scrolls sideways on mobile rather than wrapping into a ragged block.
 */
export const SubTabs = ({ tabs, value, onChange, className = "" }) => (
  <div
    role="tablist"
    className={`flex items-center gap-1.5 overflow-x-auto border-b border-line-soft
      scrollbar-none ${className}`}
  >
    {tabs.map((tab) => {
      const Icon = tab.icon;
      const active = value === tab.id;
      return (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={active}
          onClick={() => onChange(tab.id)}
          className={`relative inline-flex items-center gap-2 whitespace-nowrap cursor-pointer
            min-h-[44px] px-4 text-sm font-semibold rounded-t transition-colors duration-150
            ${
              active
                ? "text-primary bg-primary/8"
                : "text-ink-muted hover:text-ink-body hover:bg-surface-overlay/40"
            }`}
        >
          {Icon && <Icon className="text-base shrink-0" />}
          <span>{tab.label}</span>
          {tab.count != null && (
            <span
              className={`rounded-full px-1.5 py-0.5 text-[12px] font-semibold leading-none ${
                active ? "bg-primary/20 text-primary" : "bg-surface-overlay/70 text-ink-muted"
              }`}
            >
              {tab.count}
            </span>
          )}
          {/* Underline marks the active tab without moving anything */}
          <span
            aria-hidden="true"
            className={`absolute inset-x-2 -bottom-px h-0.5 rounded-full transition-colors ${
              active ? "bg-primary" : "bg-transparent"
            }`}
          />
        </button>
      );
    })}
  </div>
);

/* ---------------------------------------------------------- STAT CARD */
const STAT_TONES = {
  primary: "bg-primary/12 text-primary",
  secondary: "bg-secondary/12 text-secondary",
  tertiary: "bg-tertiary/12 text-tertiary",
  error: "bg-error/12 text-error",
};

export const StatCard = ({ icon: Icon, value, label, tone = "primary", badge, onClick, loading }) => {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`text-left bg-surface-card border border-line-soft rounded-lg p-5
        transition-colors duration-150
        ${onClick ? "cursor-pointer hover:bg-surface-overlay/50 hover:border-line-strong/50" : ""}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3.5">
        <span
          className={`w-10 h-10 rounded shrink-0 flex items-center justify-center text-xl ${
            STAT_TONES[tone] || STAT_TONES.primary
          }`}
        >
          <Icon />
        </span>
        {badge}
      </div>
      {loading ? (
        <div className="h-8 w-16 rounded bg-surface-overlay/50 animate-pulse" />
      ) : (
        <p className="text-3xl font-semibold text-ink-strong tabular-nums leading-none">{value}</p>
      )}
      <p className="text-[13px] text-ink-muted mt-2 leading-snug">{label}</p>
    </Tag>
  );
};

/* ---------------------------------------------------------- SPLIT LAYOUT */
/**
 * The editor/list pairing most tabs use. The form sticks to the viewport on
 * desktop so editing an item near the bottom of a long list does not mean
 * scrolling back up to the fields, and it comes first on mobile so the
 * primary action is reachable without a scroll.
 */
export const SplitLayout = ({ aside, children, asideWidth = "lg:col-span-5", className = "" }) => (
  <div className={`grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start ${className}`}>
    <div className={`${asideWidth} lg:sticky lg:top-[5.5rem] space-y-5`}>{aside}</div>
    <div
      className={`${
        asideWidth === "lg:col-span-5" ? "lg:col-span-7" : "lg:col-span-8"
      } space-y-4 min-w-0`}
    >
      {children}
    </div>
  </div>
);

/* ---------------------------------------------------------- TABLE SHELL */
/* Wide tables scroll inside their own box; the page body never scrolls sideways. */
export const TableWrap = ({ children, className = "" }) => (
  <div className={`overflow-x-auto rounded-lg border border-line-soft bg-surface-card ${className}`}>
    <table className="w-full min-w-[640px] text-sm border-collapse">{children}</table>
  </div>
);

export const Th = ({ children, className = "" }) => (
  <th
    className={`text-left font-semibold text-[13px] text-ink-muted uppercase tracking-wide
      px-4 py-3 border-b border-line-soft whitespace-nowrap bg-surface/60 ${className}`}
  >
    {children}
  </th>
);

export const Td = ({ children, className = "" }) => (
  <td className={`px-4 py-3 border-b border-line-soft/60 text-ink-body align-middle ${className}`}>
    {children}
  </td>
);
