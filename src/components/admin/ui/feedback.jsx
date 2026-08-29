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
   Replaces the status banner / modal / window.confirm that every
   tab used to re-implement, so success and failure look the same
   everywhere and never shove the layout around.
   ============================================================ */

/* ---------------------------------------------------------- TOAST */
const TOAST_TONES = {
  success: { cls: "bg-primary/12 border-primary/40 text-primary", Icon: HiCheckCircle },
  error: { cls: "bg-error/12 border-error/40 text-error", Icon: HiExclamationTriangle },
  info: { cls: "bg-tertiary/12 border-tertiary/40 text-tertiary", Icon: HiInformationCircle },
};

/**
 * Floating status message. Pinned to the viewport instead of sitting in the
 * document flow — a save confirmation should never push the form you just
 * used further down the page.
 *
 * `message` is the { type, text } shape every tab already produces.
 */
export const Toast = ({ message, onDismiss }) => {
  if (!message) return null;
  const tone = TOAST_TONES[message.type === "success" ? "success" : message.type === "info" ? "info" : "error"];
  const { Icon } = tone;

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      className="fixed z-[90] bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md
        sm:left-auto sm:right-6 sm:translate-x-0 sm:w-auto sm:min-w-[320px] animate-fade-in-down"
    >
      <div
        className={`flex items-start gap-3 rounded-lg border px-4 py-3.5 shadow-overlay
          backdrop-blur-xl bg-surface-overlay/95 ${tone.cls}`}
      >
        <Icon className="text-xl shrink-0 mt-px" />
        <p className="flex-1 text-sm font-medium leading-relaxed text-ink-strong">{message.text}</p>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="বন্ধ করুন"
            className="shrink-0 -mr-1 -mt-1 w-8 h-8 rounded flex items-center justify-center
              text-ink-muted hover:text-ink-strong hover:bg-surface-overlay transition-colors cursor-pointer"
          >
            <HiXMark className="text-lg" />
          </button>
        )}
      </div>
    </div>,
    document.body
  );
};

/**
 * Drop-in status state for tabs: `const [msg, notify] = useToast()`.
 * Auto-clears so nobody has to wire a setTimeout per call site.
 */
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
  <div className={`flex flex-col items-center justify-center gap-3 py-16 px-6 text-center ${className}`}>
    <span className="w-8 h-8 rounded-full border-2 border-primary/40 border-t-primary animate-spin" />
    <p className="text-sm text-ink-muted">{label}</p>
  </div>
);

export const EmptyState = ({ icon: Icon, title, description, action, className = "" }) => (
  <div
    className={`flex flex-col items-center justify-center gap-3 py-14 px-6 text-center
      border border-dashed border-line-soft rounded-lg bg-surface/40 ${className}`}
  >
    {Icon && (
      <span className="w-14 h-14 rounded-full bg-surface-overlay/60 text-ink-muted flex items-center justify-center text-2xl">
        <Icon />
      </span>
    )}
    <h4 className="text-base font-semibold text-ink-strong">{title}</h4>
    {description && (
      <p className="text-sm text-ink-muted max-w-sm leading-relaxed">{description}</p>
    )}
    {action && <div className="pt-1">{action}</div>}
  </div>
);

export const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse rounded bg-surface-overlay/50 ${className}`} />
);

/* ---------------------------------------------------------- MODAL */
/**
 * Overlay dialog with the behaviour the hand-rolled ones were missing:
 * Escape closes, background scroll locks, focus moves in on open and
 * returns to the trigger on close, and the panel scrolls instead of the page.
 */
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

      // Keep Tab inside the dialog.
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
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center
        bg-black/75 backdrop-blur-sm p-0 sm:p-6 animate-fadeIn"
      onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === "string" ? title : undefined}
        className={`w-full ${width} bg-surface-card border border-line-strong/40
          rounded-t-lg sm:rounded-lg shadow-overlay flex flex-col
          max-h-[92vh] sm:max-h-[86vh] animate-slideUp`}
      >
        {/* Header stays put while the body scrolls */}
        <div className="flex items-start justify-between gap-4 px-5 sm:px-6 py-4 border-b border-line-soft shrink-0">
          <div className="flex items-start gap-3 min-w-0">
            {Icon && (
              <span className="w-10 h-10 rounded shrink-0 bg-primary/12 text-primary flex items-center justify-center text-xl">
                <Icon />
              </span>
            )}
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-semibold text-ink-strong leading-snug">{title}</h2>
              {description && (
                <p className="text-[13px] text-ink-muted mt-1 leading-relaxed">{description}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="বন্ধ করুন"
            className="shrink-0 w-10 h-10 rounded flex items-center justify-center
              text-ink-muted hover:text-ink-strong hover:bg-surface-overlay transition-colors cursor-pointer"
          >
            <HiXMark className="text-xl" />
          </button>
        </div>

        <div className="flex-1 px-5 py-5 overflow-y-auto sm:px-6 scrollbar-none">{children}</div>

        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-2 px-5 sm:px-6 py-4 border-t border-line-soft shrink-0 bg-surface/40">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

/* ---------------------------------------------------------- CONFIRM */
/**
 * Replaces window.confirm. Unlike the native dialog this can name the exact
 * record being destroyed, so "are you sure?" is answerable.
 *
 *   const [confirm, confirmUI] = useConfirm();
 *   if (await confirm({ title: "...", body: "..." })) { ... }
 *   return (<>{confirmUI}...</>)
 */
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
        <p className="mt-3 rounded border border-line-soft bg-surface px-3.5 py-2.5 text-[13px] text-ink-muted">
          {state.detail}
        </p>
      )}
    </Modal>
  );

  return [confirm, ui];
};
