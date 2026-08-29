import React, { useCallback, useState } from "react";

/* ============================================================
   SMART IMAGE
   A skeleton holds the exact box the image will occupy, then the
   image blurs up over it. No reflow, no white flash, and a failed
   load degrades to a quiet placeholder instead of a broken icon.
   ============================================================ */

const cx = (...parts) => parts.filter(Boolean).join(" ");

const SmartImage = ({
  src,
  alt = "",
  className = "",
  imgClassName = "",
  /** Tailwind aspect utility, e.g. "aspect-video". Reserves the box. */
  aspect,
  /** Rendered instead of the image if the source fails. */
  fallback = null,
  rounded = "rounded-xl",
  objectFit = "object-cover",
  loading = "lazy",
  ...rest
}) => {
  const [status, setStatus] = useState("loading"); // loading | loaded | error

  // Reset when the source changes, without an effect: React's documented
  // "adjust state during render" pattern.
  const [renderedSrc, setRenderedSrc] = useState(src);
  if (src !== renderedSrc) {
    setRenderedSrc(src);
    setStatus("loading");
  }

  /* A cached image can finish decoding before React attaches onLoad, which
     would leave the skeleton up forever. The ref callback runs after the
     node is attached, so it catches that case. */
  const attachImg = useCallback((node) => {
    if (node?.complete && node.naturalWidth > 0) setStatus("loaded");
  }, []);

  return (
    <div className={cx("relative overflow-hidden", rounded, aspect, className)}>
      {status !== "loaded" && (
        <div className={cx("absolute inset-0 skeleton", rounded)} aria-hidden="true" />
      )}

      {status === "error"
        ? fallback
        : src && (
            <img
              ref={attachImg}
              src={src}
              alt={alt}
              loading={loading}
              decoding="async"
              onLoad={() => setStatus("loaded")}
              onError={() => setStatus("error")}
              className={cx(
                "img-fade w-full h-full",
                objectFit,
                status === "loaded" && "is-loaded",
                imgClassName
              )}
              {...rest}
            />
          )}
    </div>
  );
};

export default SmartImage;
