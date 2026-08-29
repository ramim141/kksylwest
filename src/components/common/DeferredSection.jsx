import React, { Suspense, useEffect, useRef, useState } from "react";

/* ============================================================
   DEFERRED SECTION

   Holds a lazily imported band out of the first paint. The chunk is
   fetched when either happens first:

     - the section comes within 600px of the viewport, or
     - the browser goes idle.

   The idle path matters: it means a visitor who never scrolls, and a
   crawler that never scrolls at all, still end up with the full page
   rendered — the deferral only moves the work off the critical path,
   it does not hide content behind an interaction.

   Until then a `placeholder` of the section's own height stands in, so
   scroll position never jumps when the real band mounts.
   ============================================================ */

const DeferredSection = ({
  children,
  /** Skeleton shown before the chunk mounts. Give it a realistic height. */
  placeholder = null,
  /** How far ahead of the viewport to start fetching. */
  rootMargin = "600px 0px",
  /** ms to wait for idle before mounting regardless of scroll position. */
  idleTimeout = 2500,
}) => {
  const ref = useRef(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (show) return undefined;

    let idleHandle = 0;
    let timer = 0;
    let observer;

    const reveal = () => setShow(true);

    const node = ref.current;
    if (node && typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) reveal();
        },
        { rootMargin }
      );
      observer.observe(node);
    } else {
      // No observer (very old browser, or the node never mounted): fall back
      // to showing the content rather than hiding it forever.
      reveal();
    }

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      idleHandle = window.requestIdleCallback(reveal, { timeout: idleTimeout });
    } else {
      timer = setTimeout(reveal, idleTimeout);
    }

    return () => {
      observer?.disconnect();
      if (idleHandle && window.cancelIdleCallback) window.cancelIdleCallback(idleHandle);
      if (timer) clearTimeout(timer);
    };
  }, [show, rootMargin, idleTimeout]);

  return (
    <div ref={ref}>
      {show ? <Suspense fallback={placeholder}>{children}</Suspense> : placeholder}
    </div>
  );
};

export default DeferredSection;
