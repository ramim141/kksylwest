import { useEffect, useRef, useState } from "react";

/* ============================================================
   IN-VIEW REGISTRY

   IntersectionObserver drives the reveals, with a rect-based sweep
   kept as a safety net.

   The observer is the part that matters for smoothness: it reports
   from the compositor, off the main thread, so scrolling never pays
   for it. The previous version re-read getBoundingClientRect() for
   every pending element on every scroll burst — a forced layout per
   element per tick, which is exactly the kind of work that turns a
   flick into a stutter on a mid-range phone.

   The sweep is still here because a .reveal starts at opacity 0: if
   anything ever stops notifications arriving, the content would be
   invisible for good. So the registry is also swept on the events
   where an observer can legitimately have missed something — a
   restored bfcache page, a tab coming back to the foreground — and
   anything already scrolled past counts as revealed.

   Observers are shared per (threshold, bottomMargin) pair, so the
   whole site typically runs on one or two.
   ============================================================ */

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const watchers = new Set();
const observers = new Map();
let sweepBound = false;

/** True when the element is inside the viewport, or already above it. */
const isInViewByRect = (rect, watcher) => {
  const viewport = window.innerHeight || document.documentElement.clientHeight;
  const height = rect.height || 1;
  const covered =
    Math.min(rect.bottom, viewport - watcher.bottomMargin) - Math.max(rect.top, 0);

  // Anything already above the viewport counts as revealed: landing deep in
  // the page (a hash link, a restored scroll position) must not leave the
  // content above the fold stuck at opacity 0.
  return (
    rect.bottom <= 0 ||
    (covered > 0 && covered / height >= Math.min(watcher.threshold, 1))
  );
};

const settle = (watcher, visible) => {
  watcher.onChange(visible);
  if (visible && watcher.once) unwatch(watcher);
};

/** Last-resort pass over everything still waiting. */
const sweep = () => {
  if (watchers.size === 0) return;
  // One read pass, no interleaved writes: the reflow is paid once.
  const pending = Array.from(watchers);
  const rects = pending.map((w) => w.ref.current?.getBoundingClientRect());
  pending.forEach((w, i) => {
    if (rects[i] && isInViewByRect(rects[i], w)) settle(w, true);
  });
};

const bindSweep = () => {
  if (sweepBound || typeof window === "undefined") return;
  sweepBound = true;
  document.addEventListener("visibilitychange", sweep);
  window.addEventListener("pageshow", sweep);
  window.addEventListener("resize", sweep);
};

const observerFor = (watcher) => {
  const key = `${watcher.threshold}|${watcher.bottomMargin}`;
  let observer = observers.get(key);
  if (observer) return observer;

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const target = entry.target.__inViewWatcher;
        if (!target) return;

        // `isIntersecting` misses one case the reveals depend on: an element
        // that is already scrolled past. The entry carries its rect, so that
        // check costs nothing extra here.
        const visible =
          entry.isIntersecting || entry.boundingClientRect.bottom <= 0;

        if (visible) settle(target, true);
        else if (!target.once) target.onChange(false);
      });
    },
    {
      // Shrinking the bottom edge starts the motion just before the element
      // is fully in, which is what bottomMargin has always meant here.
      rootMargin: `0px 0px ${-watcher.bottomMargin}px 0px`,
      threshold: Math.min(Math.max(watcher.threshold, 0), 1),
    }
  );
  observers.set(key, observer);
  return observer;
};

const watch = (watcher) => {
  const node = watcher.ref.current;
  if (!node) return;

  watchers.add(watcher);
  bindSweep();

  if (typeof IntersectionObserver === "undefined") {
    // No observer available: reveal rather than risk invisible content.
    settle(watcher, true);
    return;
  }

  node.__inViewWatcher = watcher;
  watcher.observer = observerFor(watcher);
  watcher.observer.observe(node);
};

const unwatch = (watcher) => {
  const node = watcher.ref.current;
  if (node) {
    watcher.observer?.unobserve(node);
    delete node.__inViewWatcher;
  }
  watchers.delete(watcher);
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
    if (!ref.current || prefersReducedMotion()) return undefined;

    const watcher = {
      ref,
      threshold,
      bottomMargin,
      once,
      observer: null,
      onChange: setIsVisible,
    };

    watch(watcher);
    return () => unwatch(watcher);
  }, [threshold, bottomMargin, once]);

  return [ref, isVisible];
};

export default useInView;
