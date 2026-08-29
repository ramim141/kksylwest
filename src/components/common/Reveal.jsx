import React from "react";
import { useInView } from "./useInView";

/* ============================================================
   SCROLL REVEAL
   Fades and lifts content into place as it is scrolled to. The
   visibility bookkeeping lives in ./useInView.
   ============================================================ */

const cx = (...parts) => parts.filter(Boolean).join(" ");

/**
 * @param {'up'|'left'|'right'|'scale'|'fade'} direction
 * @param {number} delay     ms to stagger behind its siblings
 * @param {number} duration  ms, overrides the --dur-slow default
 * @param {string} as        element tag to render
 */
export const Reveal = ({
  children,
  direction = "up",
  delay = 0,
  duration,
  threshold,
  bottomMargin,
  once = true,
  className = "",
  as = "div",
  style,
  ...rest
}) => {
  const [ref, isVisible] = useInView({ threshold, bottomMargin, once });
  const Tag = as;

  const directionClass = {
    up: "",
    left: "reveal-left",
    right: "reveal-right",
    scale: "reveal-scale",
    fade: "reveal-fade",
  }[direction];

  return (
    <Tag
      ref={ref}
      className={cx("reveal", directionClass, isVisible && "is-visible", className)}
      style={{
        transitionDelay: delay ? `${delay}ms` : undefined,
        transitionDuration: duration ? `${duration}ms` : undefined,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
};

/**
 * Reveals a list of children one after another. `step` is the gap between
 * neighbours; it is capped so a long list never leaves the last item
 * waiting seconds to appear.
 */
export const RevealGroup = ({
  children,
  step = 70,
  maxDelay = 500,
  direction = "up",
  className = "",
  itemClassName = "",
  as = "div",
  ...rest
}) => {
  const Tag = as;
  return (
    <Tag className={className} {...rest}>
      {React.Children.map(children, (child, i) =>
        child ? (
          <Reveal
            direction={direction}
            delay={Math.min(i * step, maxDelay)}
            className={itemClassName}
          >
            {child}
          </Reveal>
        ) : null
      )}
    </Tag>
  );
};

export default Reveal;
