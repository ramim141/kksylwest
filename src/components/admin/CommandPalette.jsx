import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { HiMagnifyingGlass, HiArrowSmallRight } from "react-icons/hi2";
import { NAV_ITEMS } from "./navConfig";

/* ============================================================
   JUMP-TO PALETTE  (Ctrl/⌘ + K)
   Sixteen sections is more than a sidebar can surface at a glance,
   so this gives every one of them a one-keystroke path. Matches on
   the Bengali label, the longer title, and English keywords —
   admins who think "result" and admins who think "ফলাফল" both land.
   ============================================================ */

const CommandPalette = ({ open, onClose, onSelect, activeId }) => {
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return NAV_ITEMS;
    return NAV_ITEMS.filter((item) =>
      `${item.label} ${item.title} ${item.group} ${item.keywords || ""}`.toLowerCase().includes(q)
    );
  }, [query]);

  // Reset to a clean slate each time it opens.
  useEffect(() => {
    if (open) {
      setQuery("");
      setCursor(0);
      const raf = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(raf);
    }
    return undefined;
  }, [open]);

  useEffect(() => setCursor(0), [query]);

  // Lock the page behind the overlay.
  useEffect(() => {
    if (!open) return undefined;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [open]);

  // Keep the highlighted row in view when arrowing past the fold.
  useEffect(() => {
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  if (!open) return null;

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => (results.length ? (c + 1) % results.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => (results.length ? (c - 1 + results.length) % results.length : 0));
    } else if (e.key === "Enter" && results[cursor]) {
      e.preventDefault();
      onSelect(results[cursor].id);
      onClose();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[95] bg-black/75 backdrop-blur-sm flex items-start justify-center p-4 pt-[10vh] animate-fadeIn"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="সেকশন খুঁজুন"
        className="w-full max-w-xl bg-surface-card border border-line-strong/40 rounded-lg shadow-overlay overflow-hidden animate-slideUp"
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center gap-3 px-4 border-b border-line-soft">
          <HiMagnifyingGlass className="text-xl text-ink-muted shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="সেকশন খুঁজুন — যেমন রেজাল্ট, notice, whatsapp..."
            aria-label="সেকশন খুঁজুন"
            className="flex-1 bg-transparent py-4 text-sm text-ink-strong placeholder:text-ink-muted/70 focus:outline-none"
          />
          <kbd className="hidden sm:block shrink-0 rounded border border-line-soft bg-surface px-2 py-1 text-[12px] font-medium text-ink-muted">
            Esc
          </kbd>
        </div>

        <div ref={listRef} className="max-h-[52vh] overflow-y-auto p-2 scrollbar-none">
          {results.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-ink-muted">
              “{query}” নামে কোনো সেকশন পাওয়া যায়নি।
            </p>
          ) : (
            results.map((item, i) => {
              const Icon = item.icon;
              const active = i === cursor;
              return (
                <button
                  key={item.id}
                  type="button"
                  data-active={active}
                  onMouseEnter={() => setCursor(i)}
                  onClick={() => {
                    onSelect(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 rounded px-3 py-2.5 text-left cursor-pointer transition-colors ${
                    active ? "bg-primary/12" : "hover:bg-surface-overlay/50"
                  }`}
                >
                  <span
                    className={`w-9 h-9 rounded shrink-0 flex items-center justify-center text-lg ${
                      active ? "bg-primary/20 text-primary" : "bg-surface-overlay/60 text-ink-muted"
                    }`}
                  >
                    <Icon />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-ink-strong truncate">
                      {item.label}
                      {item.id === activeId && (
                        <span className="ml-2 text-[12px] font-medium text-primary">• বর্তমান</span>
                      )}
                    </span>
                    <span className="block text-[13px] text-ink-muted truncate">{item.group}</span>
                  </span>
                  {active && <HiArrowSmallRight className="text-lg text-primary shrink-0" />}
                </button>
              );
            })
          )}
        </div>

        <div className="hidden sm:flex items-center gap-4 px-4 py-2.5 border-t border-line-soft bg-surface/50 text-[12px] text-ink-muted">
          <span className="flex items-center gap-1.5">
            <kbd className="rounded border border-line-soft bg-surface px-1.5 py-0.5">↑</kbd>
            <kbd className="rounded border border-line-soft bg-surface px-1.5 py-0.5">↓</kbd>
            নির্বাচন
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="rounded border border-line-soft bg-surface px-1.5 py-0.5">Enter</kbd>
            খুলুন
          </span>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CommandPalette;
