import React, { forwardRef, useId } from "react";

/* ============================================================
   ADMIN UI KIT — primitives
   Authoritative, luminous, and tactile control primitives.
   ============================================================ */

/* ---------------------------------------------------------- BUTTON */
const BTN_TONES = {
  primary:
    "bg-gradient-to-r from-primary-container via-primary to-primary-container text-primary-on hover:brightness-110 shadow-sm shadow-primary/20 border border-primary/40 active:scale-[0.98]",
  secondary:
    "bg-gradient-to-r from-secondary-container via-secondary to-secondary-container text-secondary-on hover:brightness-110 shadow-sm shadow-secondary/20 border border-secondary/40 active:scale-[0.98]",
  neutral:
    "bg-surface-card/90 text-ink-body hover:bg-surface-overlay hover:text-ink-strong border border-line-soft hover:border-line-strong/60 active:scale-[0.98]",
  outline:
    "bg-transparent text-primary hover:bg-primary/10 border border-primary/50 hover:border-primary active:scale-[0.98]",
  danger:
    "bg-gradient-to-r from-error/15 to-error/25 text-error hover:bg-error/30 border border-error/40 hover:border-error/60 active:scale-[0.98]",
  ghost:
    "bg-transparent text-ink-muted hover:bg-surface-overlay/70 hover:text-ink-strong border border-transparent active:scale-[0.98]",
};

const BTN_SIZES = {
  sm: "min-h-[36px] px-3.5 text-[13px] gap-1.5 rounded-lg",
  md: "min-h-[42px] px-4 text-sm gap-2 rounded-lg",
  lg: "min-h-[46px] px-5 text-[15px] gap-2.5 rounded-xl",
};

export const Button = forwardRef(function Button(
  {
    as: Tag = "button",
    tone = "neutral",
    size = "md",
    icon: Icon,
    iconRight: IconRight,
    loading = false,
    block = false,
    className = "",
    children,
    disabled,
    ...rest
  },
  ref
) {
  return (
    <Tag
      ref={ref}
      disabled={Tag === "button" ? disabled || loading : undefined}
      className={`inline-flex items-center justify-center font-semibold leading-none
        transition-all duration-150 cursor-pointer whitespace-nowrap select-none
        disabled:opacity-45 disabled:cursor-not-allowed disabled:pointer-events-none
        ${BTN_TONES[tone] || BTN_TONES.neutral} ${BTN_SIZES[size] || BTN_SIZES.md}
        ${block ? "w-full" : ""} ${className}`}
      {...rest}
    >
      {loading ? (
        <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin shrink-0" />
      ) : (
        Icon && <Icon className="text-[1.15em] shrink-0" />
      )}
      {children}
      {!loading && IconRight && <IconRight className="text-[1.15em] shrink-0" />}
    </Tag>
  );
});

/* Icon-only button */
export const IconButton = forwardRef(function IconButton(
  { icon: Icon, label, tone = "ghost", size = "md", className = "", ...rest },
  ref
) {
  const box = size === "sm" ? "w-9 h-9 text-base rounded-lg" : "w-10 h-10 text-lg rounded-lg";
  return (
    <button
      ref={ref}
      type="button"
      title={label}
      aria-label={label}
      className={`inline-flex items-center justify-center shrink-0
        transition-all duration-150 cursor-pointer select-none
        disabled:opacity-45 disabled:cursor-not-allowed
        ${BTN_TONES[tone] || BTN_TONES.ghost} ${box} ${className}`}
      {...rest}
    >
      <Icon />
    </button>
  );
});

/* ---------------------------------------------------------- CHIP */
const CHIP_TONES = {
  primary: "bg-primary/15 text-primary border-primary/35 shadow-sm shadow-primary/5",
  secondary: "bg-secondary/15 text-secondary border-secondary/35 shadow-sm shadow-secondary/5",
  tertiary: "bg-tertiary/15 text-tertiary border-tertiary/35 shadow-sm shadow-tertiary/5",
  error: "bg-error/15 text-error border-error/35 shadow-sm shadow-error/5",
  neutral: "bg-surface-overlay/80 text-ink-muted border-line-soft",
};

export const Chip = ({ tone = "neutral", icon: Icon, className = "", children }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1
      text-[12px] sm:text-[13px] font-semibold leading-none whitespace-nowrap
      ${CHIP_TONES[tone] || CHIP_TONES.neutral} ${className}`}
  >
    {Icon && <Icon className="text-[1.1em] shrink-0" />}
    {children}
  </span>
);

/* ---------------------------------------------------------- PANEL */
export const Panel = ({ as: Tag = "section", padded = true, className = "", children, ...rest }) => (
  <Tag
    className={`bg-surface-card/90 backdrop-blur-sm border border-line-soft/80 rounded-xl shadow-sm hover:border-line-soft transition-all duration-200 ${
      padded ? "p-5 sm:p-6" : ""
    } ${className}`}
    {...rest}
  >
    {children}
  </Tag>
);

const ICON_TONES = {
  primary: "bg-gradient-to-br from-primary/20 via-primary/10 to-transparent text-primary border-primary/30",
  secondary: "bg-gradient-to-br from-secondary/20 via-secondary/10 to-transparent text-secondary border-secondary/30",
  tertiary: "bg-gradient-to-br from-tertiary/20 via-tertiary/10 to-transparent text-tertiary border-tertiary/30",
  error: "bg-gradient-to-br from-error/20 via-error/10 to-transparent text-error border-error/30",
};

export const PanelHeader = ({
  icon: Icon,
  title,
  hint,
  actions,
  tone = "primary",
  className = "",
}) => (
  <div
    className={`flex flex-wrap items-start justify-between gap-3.5 border-b border-line-soft/70 pb-4 mb-5 ${className}`}
  >
    <div className="flex items-start gap-3.5 min-w-0">
      {Icon && (
        <span
          className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-xl border shadow-sm ${
            ICON_TONES[tone] || ICON_TONES.primary
          }`}
        >
          <Icon />
        </span>
      )}
      <div className="min-w-0">
        <h3 className="text-base font-bold text-ink-strong leading-snug tracking-tight">{title}</h3>
        {hint && <p className="text-[13px] text-ink-muted mt-1 leading-relaxed">{hint}</p>}
      </div>
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
  </div>
);

/* ---------------------------------------------------------- FORM CONTROLS */
const CONTROL = `w-full bg-surface-low/80 border border-line-soft/80 rounded-lg text-ink-strong text-sm
   placeholder:text-ink-muted/60
   focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 focus:bg-surface
   disabled:opacity-50 transition-all duration-150`;

export const Field = ({ label, hint, error, required, htmlFor, className = "", children }) => (
  <div className={`space-y-1.5 ${className}`}>
    {label && (
      <label htmlFor={htmlFor} className="block text-[13px] font-semibold text-ink-body">
        {label}
        {required && (
          <span className="text-error ml-1" aria-hidden="true">
            *
          </span>
        )}
      </label>
    )}
    {children}
    {error ? (
      <p className="text-[12px] sm:text-[13px] text-error font-medium leading-snug flex items-center gap-1 mt-1">
        <span>⚠</span> {error}
      </p>
    ) : (
      hint && <p className="text-[12px] sm:text-[13px] text-ink-muted leading-snug">{hint}</p>
    )}
  </div>
);

export const Input = forwardRef(function Input({ className = "", ...rest }, ref) {
  return <input ref={ref} className={`${CONTROL} min-h-[42px] px-3.5 ${className}`} {...rest} />;
});

export const Textarea = forwardRef(function Textarea({ className = "", rows = 3, ...rest }, ref) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={`${CONTROL} px-3.5 py-3 leading-relaxed resize-y ${className}`}
      {...rest}
    />
  );
});

export const Select = forwardRef(function Select({ className = "", children, ...rest }, ref) {
  return (
    <select
      ref={ref}
      className={`${CONTROL} min-h-[42px] px-3.5 pr-9 cursor-pointer ${className}`}
      {...rest}
    >
      {children}
    </select>
  );
});

/* Labelled switch */
export const Toggle = ({ checked, onChange, label, hint, disabled, className = "" }) => {
  const id = useId();
  return (
    <label
      htmlFor={id}
      className={`flex items-center justify-between gap-4 min-h-[44px] px-4 py-2.5
        bg-surface-low/70 border border-line-soft/80 rounded-lg cursor-pointer
        hover:border-line-strong/50 hover:bg-surface-low transition-all
        ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-ink-body">{label}</span>
        {hint && <span className="block text-[12px] sm:text-[13px] text-ink-muted mt-0.5 leading-snug">{hint}</span>}
      </span>
      <span className="relative shrink-0">
        <input
          id={id}
          type="checkbox"
          checked={!!checked}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.checked)}
          className="peer sr-only"
        />
        <span
          className="block w-11 h-6 rounded-full bg-surface-overlay border border-line-soft
          peer-checked:bg-primary-container peer-checked:border-primary
          peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40 transition-colors"
        />
        <span
          className="absolute top-1 left-1 w-4 h-4 rounded-full bg-ink-muted
          peer-checked:translate-x-5 peer-checked:bg-primary-on transition-transform duration-200"
        />
      </span>
    </label>
  );
};

/* ---------------------------------------------------------- SEARCH */
export const SearchInput = ({ value, onChange, placeholder = "খুঁজুন...", className = "", ...rest }) => (
  <div className={`relative ${className}`}>
    <svg
      className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-ink-muted pointer-events-none"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <circle cx="9" cy="9" r="6" />
      <path d="m14 14 4 4" strokeLinecap="round" />
    </svg>
    <input
      type="search"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`${CONTROL} min-h-[42px] pl-11 pr-3.5 [&::-webkit-search-cancel-button]:appearance-none`}
      {...rest}
    />
  </div>
);

