import React from "react";

/* ============================================================
   ADMIN UI KIT — layout
   Modern, authoritative and polished design system for the
   KishorKantho Medabritti Admin Control Panel.
   ============================================================ */

/* ---------------------------------------------------------- PAGE HEADER */
export const PageHeader = ({ icon: Icon, title, description, meta, className = "" }) => (
  <header
    className={`relative flex flex-wrap items-start justify-between gap-4 pb-2 ${className}`}
  >
    <div className="flex items-start gap-4 min-w-0">
      {Icon && (
        <div className="relative shrink-0">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent text-primary border border-primary/30 flex items-center justify-center text-2xl shadow-sm shadow-primary/10">
            <Icon />
          </div>
          <span className="absolute -inset-1 rounded-xl bg-primary/10 blur-sm -z-10" />
        </div>
      )}
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-ink-strong tracking-tight leading-tight">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-ink-muted mt-1.5 leading-relaxed max-w-3xl font-normal">
            {description}
          </p>
        )}
      </div>
    </div>
    {meta && (
      <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start sm:self-center">
        {meta}
      </div>
    )}
  </header>
);

/* ---------------------------------------------------------- TOOLBAR */
/**
 * Filters on the left, actions on the right, wrapping gracefully.
 * Elevated glassmorphic container directly above the list it controls.
 */
export const Toolbar = ({ children, actions, className = "" }) => (
  <div
    className={`flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4
      bg-surface-card/90 backdrop-blur-md border border-line-soft/80 rounded-xl p-3.5 sm:p-4
      shadow-sm hover:border-line-soft transition-colors ${className}`}
  >
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1 min-w-0">
      {children}
    </div>
    {actions && (
      <div className="flex flex-wrap items-center gap-2 lg:justify-end shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-line-soft/50">
        {actions}
      </div>
    )}
  </div>
);

/* ---------------------------------------------------------- SUB TABS */
/**
 * Horizontal section switcher inside tabs with refined pill styling.
 */
export const SubTabs = ({ tabs, value, onChange, className = "" }) => (
  <div
    role="tablist"
    className={`flex items-center gap-1.5 overflow-x-auto p-1 bg-surface-low/80 border border-line-soft/80 rounded-xl scrollbar-none ${className}`}
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
            min-h-[40px] px-4 text-sm font-semibold rounded-lg transition-all duration-200
            ${
              active
                ? "text-primary bg-surface-card border border-primary/30 shadow-sm shadow-primary/5"
                : "text-ink-muted hover:text-ink-strong hover:bg-surface-overlay/50 border border-transparent"
            }`}
        >
          {Icon && <Icon className={`text-base shrink-0 ${active ? "text-primary" : "text-ink-muted"}`} />}
          <span>{tab.label}</span>
          {tab.count != null && (
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-bold leading-none font-bangla-number ${
                active
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "bg-surface-overlay text-ink-muted"
              }`}
            >
              {tab.count}
            </span>
          )}
        </button>
      );
    })}
  </div>
);

/* ---------------------------------------------------------- STAT CARD */
const STAT_TONES = {
  primary: {
    bg: "bg-gradient-to-br from-primary/20 via-primary/10 to-transparent",
    text: "text-primary",
    border: "border-primary/25",
    glow: "shadow-primary/10",
    topLine: "from-primary/80 to-transparent",
  },
  secondary: {
    bg: "bg-gradient-to-br from-secondary/20 via-secondary/10 to-transparent",
    text: "text-secondary",
    border: "border-secondary/25",
    glow: "shadow-secondary/10",
    topLine: "from-secondary/80 to-transparent",
  },
  tertiary: {
    bg: "bg-gradient-to-br from-tertiary/20 via-tertiary/10 to-transparent",
    text: "text-tertiary",
    border: "border-tertiary/25",
    glow: "shadow-tertiary/10",
    topLine: "from-tertiary/80 to-transparent",
  },
  error: {
    bg: "bg-gradient-to-br from-error/20 via-error/10 to-transparent",
    text: "text-error",
    border: "border-error/25",
    glow: "shadow-error/10",
    topLine: "from-error/80 to-transparent",
  },
};

export const StatCard = ({ icon: Icon, value, label, tone = "primary", badge, onClick, loading }) => {
  const Tag = onClick ? "button" : "div";
  const currentTone = STAT_TONES[tone] || STAT_TONES.primary;

  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`group relative text-left bg-surface-card/90 backdrop-blur-sm border border-line-soft/80 rounded-xl p-5 sm:p-6
        transition-all duration-200 overflow-hidden shadow-sm
        ${
          onClick
            ? "cursor-pointer hover:bg-surface-card hover:border-line-strong/60 hover:-translate-y-0.5 hover:shadow-lg"
            : ""
        }`}
    >
      {/* Top accent glow line */}
      <div
        className={`absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r ${currentTone.topLine} opacity-80 group-hover:opacity-100 transition-opacity`}
        aria-hidden="true"
      />

      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="relative">
          <span
            className={`w-11 h-11 rounded-xl shrink-0 flex items-center justify-center text-xl border ${currentTone.bg} ${currentTone.text} ${currentTone.border} shadow-sm ${currentTone.glow}`}
          >
            <Icon />
          </span>
        </div>
        {badge}
      </div>

      {loading ? (
        <div className="h-9 w-20 rounded-md bg-surface-overlay/60 animate-pulse my-1" />
      ) : (
        <p className="text-3xl sm:text-4xl font-bold text-ink-strong tabular-nums font-bangla-number tracking-tight leading-none">
          {value}
        </p>
      )}
      <p className="text-[13px] sm:text-sm font-medium text-ink-muted mt-2.5 leading-snug">
        {label}
      </p>
    </Tag>
  );
};

/* ---------------------------------------------------------- SPLIT LAYOUT */
export const SplitLayout = ({ aside, children, asideWidth = "lg:col-span-5", className = "" }) => (
  <div className={`grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start ${className}`}>
    <div className={`${asideWidth} lg:sticky lg:top-[5.5rem] space-y-5`}>{aside}</div>
    <div
      className={`${
        asideWidth === "lg:col-span-5" ? "lg:col-span-7" : "lg:col-span-8"
      } space-y-5 min-w-0`}
    >
      {children}
    </div>
  </div>
);

/* ---------------------------------------------------------- TABLE SHELL */
export const TableWrap = ({ children, className = "" }) => (
  <div
    className={`overflow-x-auto rounded-xl border border-line-soft/80 bg-surface-card/90 backdrop-blur-sm shadow-sm ${className}`}
  >
    <table className="w-full min-w-[640px] text-sm border-collapse">{children}</table>
  </div>
);

export const Th = ({ children, className = "" }) => (
  <th
    className={`text-left font-semibold text-[12px] sm:text-[13px] text-ink-muted uppercase tracking-wider
      px-4 py-3.5 border-b border-line-soft bg-surface-low/90 whitespace-nowrap ${className}`}
  >
    {children}
  </th>
);

export const Td = ({ children, className = "" }) => (
  <td
    className={`px-4 py-3.5 border-b border-line-soft/50 text-ink-body align-middle transition-colors ${className}`}
  >
    {children}
  </td>
);

