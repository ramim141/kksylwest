import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  HiCheckCircle,
  HiExclamationTriangle,
  HiInformationCircle,
  HiXMark,
} from "react-icons/hi2";
import { Button } from "./primitives";

/* ============================================================
   ADMIN UI KIT — feedback & overlays
   Modern, glassmorphic toast messages, modals and confirmations.
   ============================================================ */

/* ---------------------------------------------------------- TOAST */
const TOAST_TONES = {
  success: {
    cls: "bg-surface-card/95 border-primary/40 text-primary shadow-primary/10",
    Icon: HiCheckCircle,
    iconBg: "bg-primary/20 text-primary border-primary/30",
  },
  error: {
    cls: "bg-surface-card/95 border-error/40 text-error shadow-error/10",
    Icon: HiExclamationTriangle,
    iconBg: "bg-error/20 text-error border-error/30",
  },
  info: {
    cls: "bg-surface-card/95 border-tertiary/40 text-tertiary shadow-tertiary/10",
    Icon: HiInformationCircle,
    iconBg: "bg-tertiary/20 text-tertiary border-tertiary/30",
  },
};

export const Toast = ({ message, onDismiss }) => {
  if (!message) return null;
  const tone =
    TOAST_TONES[
      message.type === "success" ? "success" : message.type === "info" ? "info" : "error"
    ];
  const { Icon, iconBg } = tone;

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      className="fixed z-[90] bottom-5 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md
        sm:left-auto sm:right-6 sm:translate-x-0 sm:w-auto sm:min-w-[340px] animate-fade-in-down"
    >
      <div
        className={`flex items-start gap-3.5 rounded-xl border p-4 shadow-2xl
          backdrop-blur-2xl ${tone.cls}`}
      >
        <span
          className={`w-9 h-9 rounded-lg shrink-0 flex items-center justify-center text-lg border ${iconBg}`}
        >
          <Icon />
        </span>
        <p className="flex-1 text-sm font-semibold leading-relaxed text-ink-strong pt-1">
          {message.text}
        </p>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="বন্ধ করুন"
            className="shrink-0 -mr-1 -mt-1 w-8 h-8 rounded-lg flex items-center justify-center
              text-ink-muted hover:text-ink-strong hover:bg-surface-overlay/80 transition-colors cursor-pointer"
          >
            <HiXMark className="text-lg" />
          </button>
        )}
      </div>
    </div>,
    document.body
  );
};

export const useToast = (timeout = 4000) => {
  const [message, setMessage] = useState(null);
  const timer = useRef(null);

  const notify = useCallback(
    (type, text) => {
      clearTimeout(timer.current);
      setMessage(text ? { type, text } : type);
      timer.current = setTimeout(() => setMessage(null), timeout);
    },
    [timeout]
  );

  const dismiss = useCallback(() => {
    clearTimeout(timer.current);
    setMessage(null);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  return [message, notify, dismiss];
};

/* ---------------------------------------------------------- STATES */
export const LoadingState = ({ label = "লোড হচ্ছে...", className = "" }) => (
  <div className={`flex flex-col items-center justify-center gap-3.5 py-16 px-6 text-center ${className}`}>
    <div className="relative">
      <span className="w-10 h-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin block" />
      <span className="absolute inset-0 rounded-full bg-primary/10 blur-sm -z-10" />
    </div>
    <p className="text-sm font-medium text-ink-muted">{label}</p>
  </div>
);

export const EmptyState = ({ icon: Icon, title, description, action, className = "" }) => (
  <div
    className={`flex flex-col items-center justify-center gap-3.5 py-14 px-6 text-center
      border border-dashed border-line-soft rounded-xl bg-surface-low/50 backdrop-blur-sm ${className}`}
  >
    {Icon && (
      <div className="relative">
        <span className="w-14 h-14 rounded-2xl bg-surface-overlay/80 text-ink-muted border border-line-soft flex items-center justify-center text-2xl shadow-inner">
          <Icon />
        </span>
      </div>
    )}
    <h4 className="text-base font-bold text-ink-strong tracking-tight">{title}</h4>
    {description && (
      <p className="text-sm text-ink-muted max-w-sm leading-relaxed">{description}</p>
    )}
    {action && <div className="pt-2">{action}</div>}
  </div>
);

export const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse rounded-lg bg-surface-overlay/60 ${className}`} />
);

/* ---------------------------------------------------------- MODAL */
export const Modal = ({
  open,
  onClose,
  title,
  description,
  icon: Icon,
  size = "md",
  footer,
  children,
}) => {
  const panelRef = useRef(null);
  const restoreFocus = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    restoreFocus.current = document.activeElement;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose?.();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    const raf = requestAnimationFrame(() => {
      const target = panelRef.current?.querySelector(
        'input:not([type="hidden"]), textarea, select, button'
      );
      target?.focus();
    });

    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      cancelAnimationFrame(raf);
      document.body.style.overflow = overflow;
      restoreFocus.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  const width =
    { sm: "max-w-md", md: "max-w-2xl", lg: "max-w-4xl", xl: "max-w-6xl" }[size] || "max-w-2xl";

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center
        bg-black/85 backdrop-blur-md p-3 sm:p-6 animate-fadeIn overflow-y-auto"
      onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === "string" ? title : undefined}
        className={`relative w-full ${width} bg-surface-card border border-line-soft/90
          rounded-2xl shadow-2xl flex flex-col my-auto
          max-h-[92vh] sm:max-h-[88vh] animate-slideUp overflow-hidden`}
      >
        {/* Luminous Top Accent Line */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-emerald-400 to-teal-400" />

        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-5 sm:px-6 pt-6 pb-5 border-b border-line-soft/80 bg-surface-low/80 shrink-0">
          <div className="flex items-start gap-3.5 min-w-0">
            {Icon && (
              <span className="w-10 h-10 rounded-xl shrink-0 bg-primary/20 text-primary border border-primary/30 flex items-center justify-center text-xl shadow-sm">
                <Icon />
              </span>
            )}
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-ink-strong leading-snug tracking-tight">
                {title}
              </h2>
              {description && (
                <p className="text-xs sm:text-[13px] text-ink-muted mt-1 leading-relaxed">{description}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="বন্ধ করুন"
            className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center
              text-ink-muted hover:text-ink-strong bg-surface-card hover:bg-surface-overlay border border-line-soft/80 transition-colors cursor-pointer"
          >
            <HiXMark className="text-xl" />
          </button>
        </div>

        <div className="flex-1 px-5 py-5 overflow-y-auto sm:px-6 scrollbar-none">{children}</div>

        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-2.5 px-5 sm:px-6 py-4 border-t border-line-soft/80 shrink-0 bg-surface-low/80">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

/* ---------------------------------------------------------- CONFIRM */
export const useConfirm = () => {
  const [state, setState] = useState(null);
  const resolver = useRef(null);

  const confirm = useCallback(
    (options) =>
      new Promise((resolve) => {
        resolver.current = resolve;
        setState({ tone: "danger", confirmLabel: "মুছে ফেলুন", cancelLabel: "বাতিল", ...options });
      }),
    []
  );

  const settle = (value) => {
    resolver.current?.(value);
    resolver.current = null;
    setState(null);
  };

  const ui = (
    <Modal
      open={!!state}
      onClose={() => settle(false)}
      title={state?.title || "নিশ্চিত করুন"}
      size="sm"
      footer={
        <>
          <Button tone="neutral" onClick={() => settle(false)}>
            {state?.cancelLabel}
          </Button>
          <Button tone={state?.tone === "danger" ? "danger" : "primary"} onClick={() => settle(true)}>
            {state?.confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-ink-body leading-relaxed">{state?.body}</p>
      {state?.detail && (
        <p className="mt-3 rounded-lg border border-line-soft bg-surface-low/80 px-3.5 py-2.5 text-[13px] text-ink-muted font-mono break-all">
          {state.detail}
        </p>
      )}
    </Modal>
  );

  return [confirm, ui];
};

