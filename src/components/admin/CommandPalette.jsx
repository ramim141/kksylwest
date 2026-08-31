import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { HiMagnifyingGlass, HiArrowSmallRight } from "react-icons/hi2";
import { NAV_ITEMS } from "./navConfig";

/* ============================================================
   JUMP-TO PALETTE  (Ctrl/⌘ + K)
   Modern Spotlight / Raycast-style command palette with instant
   filtering and keyboard navigation.
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

  useEffect(() => {
    if (!open) return undefined;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [open]);

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
      className="fixed inset-0 z-[95] bg-black/80 backdrop-blur-md flex items-start justify-center p-4 pt-[8vh] sm:pt-[12vh] animate-fadeIn"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="সেকশন খুঁজুন"
        className="w-full max-w-xl bg-surface-card/95 backdrop-blur-2xl border border-line-strong/50 rounded-2xl shadow-2xl overflow-hidden animate-slideUp"
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center gap-3.5 px-4.5 py-1 border-b border-line-soft/80 bg-surface-low/60">
          <HiMagnifyingGlass className="text-xl text-primary shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="সেকশন খুঁজুন — যেমন রেজাল্ট, নোটিশ, হোয়াটসঅ্যাপ..."
            aria-label="সেকশন খুঁজুন"
            className="flex-1 bg-transparent py-4 text-sm sm:text-base text-ink-strong placeholder:text-ink-muted/60 focus:outline-none"
          />
          <kbd className="hidden sm:block shrink-0 rounded-md border border-line-soft bg-surface px-2 py-0.5 text-[11px] font-semibold text-ink-muted shadow-sm">
            Esc
          </kbd>
        </div>

        <div ref={listRef} className="max-h-[55vh] overflow-y-auto p-2 scrollbar-none space-y-1">
          {results.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <p className="text-sm font-semibold text-ink-strong">কোনো সেকশন পাওয়া যায়নি</p>
              <p className="text-[13px] text-ink-muted mt-1">“{query}” দিয়ে অন্য কোনো শব্দ অনুসন্ধান করুন।</p>
            </div>
          ) : (
            results.map((item, i) => {
              const Icon = item.icon;
              const active = i === cursor;
              const isCurrent = item.id === activeId;
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
                  className={`w-full flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-left cursor-pointer transition-all duration-150 select-none ${
                    active
                      ? "bg-gradient-to-r from-primary/18 via-primary/10 to-transparent border border-primary/30 shadow-sm"
                      : "hover:bg-surface-overlay/50 border border-transparent"
                  }`}
                >
                  <span
                    className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-lg border transition-all ${
                      active
                        ? "bg-primary/25 text-primary border-primary/40 shadow-sm"
                        : "bg-surface-overlay/70 text-ink-muted border-line-soft/50"
                    }`}
                  >
                    <Icon />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="text-sm font-bold text-ink-strong truncate">
                        {item.label}
                      </span>
                      {isCurrent && (
                        <span className="text-[11px] font-bold text-primary bg-primary/15 px-2 py-0.5 rounded-full border border-primary/30">
                          বর্তমান
                        </span>
                      )}
                    </span>
                    <span className="block text-[12px] text-ink-muted truncate mt-0.5 font-medium">
                      {item.group}
                    </span>
                  </span>
                  {active && <HiArrowSmallRight className="text-lg text-primary shrink-0 animate-pulse" />}
                </button>
              );
            })
          )}
        </div>

        <div className="hidden sm:flex items-center justify-between px-4.5 py-3 border-t border-line-soft/80 bg-surface-low/80 text-[12px] text-ink-muted">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <kbd className="rounded border border-line-soft bg-surface px-1.5 py-0.5 text-[11px]">↑</kbd>
              <kbd className="rounded border border-line-soft bg-surface px-1.5 py-0.5 text-[11px]">↓</kbd>
              নির্বাচন
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="rounded border border-line-soft bg-surface px-1.5 py-0.5 text-[11px]">Enter</kbd>
              খুলুন
            </span>
          </div>
          <span className="text-[11px] text-ink-muted/80">কিশোরকণ্ঠ অ্যাডমিন কন্ট্রোল</span>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CommandPalette;

