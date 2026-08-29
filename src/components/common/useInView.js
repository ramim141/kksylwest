import { useEffect, useRef, useState } from "react";

/* ============================================================
   IN-VIEW REGISTRY

   One shared, throttled checker drives every pending element rather
   than an IntersectionObserver each. Two reasons:

   - Reliability. A .reveal starts at opacity 0, so anything that
     stops the callbacks arriving leaves the content invisible for
     good. Observers go quiet in contexts that never paint; a rect
     check against the scroll position cannot.
   - Cost. The registry only holds elements that have not revealed
     yet, and it empties as the user scrolls, so the listener is
     torn down entirely once the page has come in.
   ============================================================ */

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const watchers = new Set();
let pending = 0;
let listening = false;

const runChecks = () => {
  pending = 0;
  const viewport = window.innerHeight || document.documentElement.clientHeight;

  watchers.forEach((watcher) => {
    const node = watcher.ref.current;
    if (!node) return;

    const rect = node.getBoundingClientRect();
    const height = rect.height || 1;
    // How much of the element is inside the viewport, as a fraction of
    // its own height — the same measure IntersectionObserver reports.
    const covered =
      Math.min(rect.bottom, viewport - watcher.bottomMargin) - Math.max(rect.top, 0);
    // Anything already above the viewport counts as revealed: landing deep
    // in the page (a hash link, a restored scroll position) must not leave
    // the content above the fold stuck at opacity 0.
    const inView =
      rect.bottom <= 0 ||
      (covered > 0 && covered / height >= Math.min(watcher.threshold, 1));

    if (inView) {
      watcher.onChange(true);
      if (watcher.once) unwatch(watcher);
    } else if (!watcher.once) {
      watcher.onChange(false);
    }
  });

  if (watchers.size === 0) stopListening();
};

/* Coalesce a burst of scroll events into one pass. A timer rather than
   requestAnimationFrame: rAF is paused while a document is not being
   painted, which is one of the states this checker exists to survive. */
const schedule = () => {
  if (pending) return;
  pending = setTimeout(runChecks, 0);
};

const startListening = () => {
  if (listening) return;
  listening = true;
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  document.addEventListener("visibilitychange", schedule);
};

const stopListening = () => {
  if (!listening) return;
  listening = false;
  window.removeEventListener("scroll", schedule);
  window.removeEventListener("resize", schedule);
  document.removeEventListener("visibilitychange", schedule);
};

const watch = (watcher) => {
  watchers.add(watcher);
  startListening();
  schedule();
};

const unwatch = (watcher) => {
  watchers.delete(watcher);
  if (watchers.size === 0) stopListening();
};

/**
 * Returns [ref, isVisible]. Attach the ref to the element to observe.
 *
 * @param {object}  options
 * @param {number}  options.threshold    fraction of the element that must show
 * @param {number}  options.bottomMargin px of the viewport bottom to ignore, so
 *                                       motion starts just before the element
 *                                       is fully in
 * @param {boolean} options.once         stop watching after the first reveal
 */
export const useInView = ({ threshold = 0.12, bottomMargin = 60, once = true } = {}) => {
  const ref = useRef(null);
  // Reduced motion means "already visible" from the very first render —
  // there is nothing to animate and nothing to watch.
  const [isVisible, setIsVisible] = useState(prefersReducedMotion);

  useEffect(() => {
    if (!ref.current || prefersReducedMotion()) return;

    const watcher = {
      ref,
      threshold,
      bottomMargin,
      once,
      onChange: setIsVisible,
    };

    watch(watcher);
    return () => unwatch(watcher);
  }, [threshold, bottomMargin, once]);

  return [ref, isVisible];
};

export default useInView;
