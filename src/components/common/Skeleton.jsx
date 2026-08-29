import React from "react";

/* ============================================================
   SKELETON PRIMITIVES
   Placeholders mirror the real layout they stand in for — same
   grid, same card height, same number of rows — so nothing jumps
   when the data lands.
   ============================================================ */

const cx = (...parts) => parts.filter(Boolean).join(" ");

/** Bare shimmering block. Size it with className. */
export const Skeleton = ({ className = "", style, ...rest }) => (
  <div aria-hidden="true" className={cx("skeleton", className)} style={style} {...rest} />
);

/** A stack of text lines; the last one is short, the way real text ends. */
export const SkeletonText = ({ lines = 3, className = "", lineClassName = "" }) => (
  <div className={cx("space-y-2", className)} aria-hidden="true">
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className={cx("skeleton-line", lineClassName)}
        style={{ width: i === lines - 1 ? "62%" : "100%" }}
      />
    ))}
  </div>
);

export const SkeletonCircle = ({ size = 40, className = "" }) => (
  <div
    aria-hidden="true"
    className={cx("skeleton-circle", className)}
    style={{ width: size, height: size }}
  />
);

/** Announces "loading" to screen readers once, for a whole skeleton region. */
export const SkeletonRegion = ({ label = "লোড হচ্ছে", className = "", children }) => (
  <div role="status" aria-busy="true" aria-live="polite" className={cx("content-swap", className)}>
    <span className="sr-only">{label}</span>
    {children}
  </div>
);

/* ---------- Composed shapes ---------- */

/** Generic content card: media strip, title, body lines, footer row. */
export const SkeletonCard = ({ media = true, lines = 2, className = "" }) => (
  <div
    aria-hidden="true"
    className={cx(
      "p-4 sm:p-5 rounded-2xl bg-[#0f1124] border border-white/10 space-y-3",
      className
    )}
  >
    {media && <Skeleton className="w-full h-36 rounded-xl" />}
    <div className="flex items-center justify-between gap-2">
      <Skeleton className="h-5 w-24 rounded-full" />
      <Skeleton className="h-3 w-16 rounded-full" />
    </div>
    <Skeleton className="h-4 w-4/5 rounded-md" />
    <SkeletonText lines={lines} />
    <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
      <Skeleton className="h-3 w-20 rounded-full" />
      <Skeleton className="h-3 w-14 rounded-full" />
    </div>
  </div>
);

export const SkeletonGrid = ({
  count = 6,
  columns = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  media = true,
  className = "",
}) => (
  <div className={cx("grid gap-4 sm:gap-5", columns, className)} aria-hidden="true">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} media={media} />
    ))}
  </div>
);

/** Stat tiles — the row of counters most pages open with. */
export const SkeletonStats = ({ count = 4, className = "" }) => (
  <div
    className={cx("grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4", className)}
    aria-hidden="true"
  >
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="p-4 sm:p-5 bg-[#14162b] border border-white/10 rounded-2xl text-center space-y-2"
      >
        <Skeleton className="h-7 sm:h-9 w-16 mx-auto rounded-md" />
        <Skeleton className="h-3 w-24 mx-auto rounded-full" />
      </div>
    ))}
  </div>
);

/** Page hero: eyebrow chip, headline, sub-line. */
export const SkeletonHero = ({ className = "" }) => (
  <div className={cx("space-y-4 text-center max-w-3xl mx-auto", className)} aria-hidden="true">
    <Skeleton className="h-8 w-72 max-w-full mx-auto rounded-full" />
    <Skeleton className="h-9 sm:h-11 w-96 max-w-full mx-auto rounded-lg" />
    <Skeleton className="h-4 w-2/3 mx-auto rounded-full" />
  </div>
);

/**
 * Table on desktop, stacked cards on mobile — matching the leaderboard
 * and result-list layouts. Rows fade out down the stack so the block
 * reads as "more below" rather than a solid slab.
 */
export const SkeletonTable = ({ rows = 8, columns = 7, className = "" }) => (
  <div
    className={cx("rounded-3xl border border-white/10 bg-[#0f1124] overflow-hidden", className)}
    aria-hidden="true"
  >
    <div className="hidden md:block">
      <div className="flex gap-5 px-5 py-4 bg-[#14162b] border-b border-white/[0.08]">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-3 flex-1 rounded-full" />
        ))}
      </div>
      <div className="divide-y divide-white/[0.06]">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-5 px-5 py-4" style={{ opacity: 1 - r * 0.07 }}>
            {Array.from({ length: columns }).map((_, c) => (
              <Skeleton key={c} className="h-4 flex-1 rounded-full" />
            ))}
          </div>
        ))}
      </div>
    </div>

    <div className="md:hidden divide-y divide-white/[0.08]">
      {Array.from({ length: Math.min(rows, 6) }).map((_, r) => (
        <div key={r} className="p-4 space-y-2.5" style={{ opacity: 1 - r * 0.09 }}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center flex-1 gap-2">
              <SkeletonCircle size={24} />
              <Skeleton className="h-4 flex-1 max-w-[160px] rounded-full" />
            </div>
            <Skeleton className="w-16 h-5 rounded-full" />
          </div>
          <Skeleton className="h-3 w-2/3 ml-8 rounded-full" />
          <Skeleton className="w-1/2 h-3 ml-8 rounded-full" />
        </div>
      ))}
    </div>
  </div>
);

/** The 1st/2nd/3rd podium, keeping the winner raised. */
export const SkeletonPodium = ({ className = "" }) => (
  <div
    className={cx("grid grid-cols-3 gap-2 sm:gap-6 items-end max-w-4xl mx-auto", className)}
    aria-hidden="true"
  >
    {[
      { pad: "p-3 sm:p-6", avatar: 36, lift: "" },
      { pad: "p-4 sm:p-7", avatar: 44, lift: "-translate-y-2 sm:-translate-y-4" },
      { pad: "p-3 sm:p-6", avatar: 36, lift: "" },
    ].map((cfg, i) => (
      <div
        key={i}
        className={cx(
          "bg-[#14162b] border border-white/10 rounded-2xl sm:rounded-3xl text-center relative space-y-2",
          cfg.pad,
          cfg.lift
        )}
      >
        <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2">
          <SkeletonCircle size={28} />
        </div>
        <div className="flex justify-center pt-2">
          <Skeleton className="rounded-xl" style={{ width: cfg.avatar, height: cfg.avatar }} />
        </div>
        <Skeleton className="w-3/4 h-4 mx-auto rounded-full" />
        <Skeleton className="w-1/2 h-3 mx-auto rounded-full" />
        <div className="pt-2 mt-2 border-t border-white/[0.08]">
          <Skeleton className="w-20 h-3 mx-auto rounded-full" />
        </div>
      </div>
    ))}
  </div>
);

/** Filter dock: a scroll row of pills plus a search field. */
export const SkeletonFilterBar = ({ pills = 6, className = "" }) => (
  <div
    className={cx(
      "p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#0f1124] border border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4",
      className
    )}
    aria-hidden="true"
  >
    <div className="flex items-center gap-1.5 overflow-hidden">
      {Array.from({ length: pills }).map((_, i) => (
        <Skeleton key={i} className="w-20 h-8 shrink-0 rounded-xl" />
      ))}
    </div>
    <Skeleton className="h-9 w-full md:w-72 shrink-0 rounded-xl" />
  </div>
);

/** Full marksheet card, for the roll-number search. */
export const SkeletonResultCard = ({ className = "" }) => (
  <div
    className={cx(
      "w-full max-w-3xl rounded-3xl border border-white/10 bg-[#0f1124] overflow-hidden",
      className
    )}
    aria-hidden="true"
  >
    <div className="p-5 sm:p-7 border-b border-white/[0.08] flex items-center gap-4">
      <SkeletonCircle size={56} />
      <div className="flex-1 space-y-2">
        <Skeleton className="w-2/3 h-5 rounded-md" />
        <Skeleton className="w-1/3 h-3 rounded-full" />
      </div>
      <Skeleton className="w-24 h-7 rounded-full" />
    </div>

    <div className="p-5 sm:p-7 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="p-3 rounded-xl bg-[#090a16] border border-white/10 space-y-2">
          <Skeleton className="w-16 h-3 rounded-full" />
          <Skeleton className="w-24 h-4 rounded-md" />
        </div>
      ))}
    </div>

    <div className="px-5 pb-6 space-y-3 sm:px-7">
      <Skeleton className="w-full h-11 rounded-xl" />
      <div className="flex gap-3">
        <Skeleton className="flex-1 h-10 rounded-xl" />
        <Skeleton className="flex-1 h-10 rounded-xl" />
      </div>
    </div>
  </div>
);

/** Route-level fallback while a lazily loaded page chunk arrives. */
export const SkeletonPage = ({ className = "" }) => (
  <SkeletonRegion
    label="পৃষ্ঠা লোড হচ্ছে"
    className={cx("min-h-screen bg-[#0b1326]", className)}
  >
    <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-14 sm:pt-20 pb-16 space-y-10">
      <SkeletonHero />
      <SkeletonStats />
      <SkeletonGrid count={6} />
    </div>
  </SkeletonRegion>
);

export default Skeleton;
