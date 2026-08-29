import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { SkeletonPage } from "./Skeleton";

/* ============================================================
   ROUTE TRANSITIONS
   Enter-only: React unmounts the old route before the new one
   paints, so there is nothing left to animate out. A short fade +
   12px lift is enough to read as "a new page arrived" without
   delaying it.
   ============================================================ */

/** Puts every navigation back at the top — but leaves hash links alone. */
export const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, left: 0, behavior: reduced ? "auto" : "smooth" });
  }, [pathname, hash]);

  return null;
};

/** Re-keyed on pathname so the enter animation replays per route. */
export const PageTransition = ({ children }) => {
  const { pathname } = useLocation();
  return (
    <div key={pathname} className="page-enter flex flex-col flex-grow w-full">
      {children}
    </div>
  );
};

/**
 * Suspense fallback for lazily loaded routes: an indeterminate top bar
 * plus a page-shaped skeleton.
 *
 * The bar shows immediately — it is the signal that the blank moment is
 * a load, not a broken page. The skeleton fades in behind a 140ms delay
 * (`.delayed-in`), so a warm chunk resolves before the placeholder is
 * ever really visible, and a slow one gets a full page shape.
 */
export const RouteFallback = () => (
  <>
    <TopProgressBar />
    <SkeletonPage className="delayed-in" />
  </>
);

/** Indeterminate bar pinned to the top of the viewport. */
export const TopProgressBar = () => (
  <div
    className="fixed inset-x-0 top-0 z-[60] h-1 overflow-hidden pointer-events-none bg-emerald-400/10"
    role="progressbar"
    aria-label="লোড হচ্ছে"
  >
    <div className="w-1/3 h-full rounded-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-route-bar" />
  </div>
);

export default PageTransition;
