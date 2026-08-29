import React, { forwardRef, useId } from "react";

/* ============================================================
   ADMIN UI KIT — primitives
   Built on the "Nocturnal Scholar" token layer (src/index.css).
   Rules this kit enforces so every admin screen agrees:
     · surfaces   surface → surface-card → surface-overlay
     · text       ink-strong / ink-body / ink-muted, never below 13px
     · accent     primary = action, secondary = attention, error = destroy
     · radius     rounded (controls) · rounded-lg (panels)
     · hit area   44px for anything a thumb has to find
   ============================================================ */

/* ---------------------------------------------------------- BUTTON */
const BTN_TONES = {
  primary:
    "bg-primary-container text-primary-on hover:bg-primary border border-transparent",
  secondary:
    "bg-secondary-container text-secondary-on hover:bg-secondary border border-transparent",
  neutral:
    "bg-surface-overlay/70 text-ink-body hover:bg-surface-overlay hover:text-ink-strong border border-line-soft",
  outline:
    "bg-transparent text-primary hover:bg-primary/10 border border-primary/40",
  danger: "bg-error/15 text-error hover:bg-error/25 border border-error/35",
  ghost:
    "bg-transparent text-ink-muted hover:bg-surface-overlay/60 hover:text-ink-strong border border-transparent",
};

const BTN_SIZES = {
  sm: "min-h-[36px] px-3 text-[13px] gap-1.5",
  md: "min-h-[44px] px-4 text-sm gap-2",
  lg: "min-h-[48px] px-5 text-[15px] gap-2",
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
      className={`inline-flex items-center justify-center rounded font-semibold leading-none
        transition-colors duration-150 cursor-pointer whitespace-nowrap
        disabled:opacity-45 disabled:cursor-not-allowed
        ${BTN_TONES[tone] || BTN_TONES.neutral} ${BTN_SIZES[size] || BTN_SIZES.md}
        ${block ? "w-full" : ""} ${className}`}
      {...rest}
    >
      {loading ? (
        <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      ) : (
        Icon && <Icon className="text-[1.15em] shrink-0" />
      )}
      {children}
      {!loading && IconRight && <IconRight className="text-[1.15em] shrink-0" />}
    </Tag>
  );
});

/* Icon-only button. `label` is required — it becomes the accessible name. */
export const IconButton = forwardRef(function IconButton(
  { icon: Icon, label, tone = "ghost", size = "md", className = "", ...rest },
  ref
) {
  const box = size === "sm" ? "w-9 h-9" : "w-11 h-11";
  return (
    <button
      ref={ref}
      type="button"
      title={label}
      aria-label={label}
      className={`inline-flex items-center justify-center rounded shrink-0
        transition-colors duration-150 cursor-pointer
        disabled:opacity-45 disabled:cursor-not-allowed
        ${BTN_TONES[tone] || BTN_TONES.ghost} ${box} ${className}`}
      {...rest}
    >
      <Icon className="text-lg" />
    </button>
  );
});

/* ---------------------------------------------------------- CHIP */
const CHIP_TONES = {
  primary: "bg-primary/12 text-primary border-primary/30",
  secondary: "bg-secondary/12 text-secondary border-secondary/30",
  tertiary: "bg-tertiary/12 text-tertiary border-tertiary/30",
  error: "bg-error/12 text-error border-error/30",
  neutral: "bg-surface-overlay/60 text-ink-muted border-line-soft",
};

export const Chip = ({ tone = "neutral", icon: Icon, className = "", children }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1
      text-[13px] font-semibold leading-none whitespace-nowrap
      ${CHIP_TONES[tone] || CHIP_TONES.neutral} ${className}`}
  >
    {Icon && <Icon className="text-[1.05em] shrink-0" />}
    {children}
  </span>
);

/* ---------------------------------------------------------- PANEL */
/* Level 1 surface: tonal lift + ghost outline, no shadow. */
export const Panel = ({ as: Tag = "section", padded = true, className = "", children, ...rest }) => (
  <Tag
    className={`bg-surface-card border border-line-soft rounded-lg ${padded ? "p-5 sm:p-6" : ""} ${className}`}
    {...rest}
  >
    {children}
  </Tag>
);

const ICON_TONES = {
  primary: "bg-primary/12 text-primary",
  secondary: "bg-secondary/12 text-secondary",
  tertiary: "bg-tertiary/12 text-tertiary",
  error: "bg-error/12 text-error",
};

/* Title row inside a Panel. Sits above a hairline rule. */
export const PanelHeader = ({
  icon: Icon,
  title,
  hint,
  actions,
  tone = "primary",
  className = "",
}) => (
  <div
    className={`flex flex-wrap items-start justify-between gap-3 border-b border-line-soft pb-4 mb-5 ${className}`}
  >
    <div className="flex items-start gap-3 min-w-0">
      {Icon && (
        <span
          className={`w-10 h-10 rounded shrink-0 flex items-center justify-center text-xl ${
            ICON_TONES[tone] || ICON_TONES.primary
          }`}
        >
          <Icon />
        </span>
      )}
      <div className="min-w-0">
        <h3 className="text-base font-semibold text-ink-strong leading-snug">{title}</h3>
        {hint && <p className="text-[13px] text-ink-muted mt-1 leading-relaxed">{hint}</p>}
      </div>
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
  </div>
);

/* ---------------------------------------------------------- FORM CONTROLS */
const CONTROL = `w-full bg-surface border border-line-soft rounded text-ink-strong text-sm
   placeholder:text-ink-muted/70
   focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25
   disabled:opacity-50 transition-colors duration-150`;

/* Label + control + hint/error, wired together for screen readers. */
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
      <p className="text-[13px] text-error leading-snug">{error}</p>
    ) : (
      hint && <p className="text-[13px] text-ink-muted leading-snug">{hint}</p>
    )}
  </div>
);

export const Input = forwardRef(function Input({ className = "", ...rest }, ref) {
  return <input ref={ref} className={`${CONTROL} min-h-[44px] px-3.5 ${className}`} {...rest} />;
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
      className={`${CONTROL} min-h-[44px] px-3.5 pr-9 cursor-pointer ${className}`}
      {...rest}
    >
      {children}
    </select>
  );
});

/* Labelled switch. The whole row is the hit target. */
export const Toggle = ({ checked, onChange, label, hint, disabled, className = "" }) => {
  const id = useId();
  return (
    <label
      htmlFor={id}
      className={`flex items-center justify-between gap-4 min-h-[44px] px-4 py-2.5
        bg-surface border border-line-soft rounded cursor-pointer
        hover:border-line-strong/50 transition-colors
        ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-ink-body">{label}</span>
        {hint && <span className="block text-[13px] text-ink-muted mt-0.5 leading-snug">{hint}</span>}
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
      className={`${CONTROL} min-h-[44px] pl-11 pr-3.5 [&::-webkit-search-cancel-button]:appearance-none`}
      {...rest}
    />
  </div>
);
