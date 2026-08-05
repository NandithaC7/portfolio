import { useEffect, useRef } from "react";
import { select } from "d3-selection";
import { easeCubicInOut } from "d3-ease";
import "d3-transition";

/**
 * The Jar Bar — a jar silhouette with a Yolk fill whose top edge carries a
 * soft meniscus curve, the way liquid actually sits against glass.
 *
 * The fill level is animated with a D3 transition on the path's `d` so the
 * meniscus travels with the surface. 600ms, cubic ease, no bounce: the motion
 * should read as liquid settling.
 */

const MENISCUS_DEPTH = 5; // px of curve on the surface

function buildPath(x, width, bottom, surfaceY, radius) {
  const right = x + width;
  const midX = x + width / 2;

  // How close the surface is to the rounded base decides whether the fill
  // needs to hug the jar's bottom corners.
  const flatBottom = bottom - radius;

  if (surfaceY >= flatBottom) {
    // Shallow fill: the whole thing lives inside the rounded base.
    const h = Math.max(0, bottom - surfaceY);
    const r = Math.min(radius, h);
    return [
      `M ${x} ${surfaceY}`,
      `Q ${midX} ${surfaceY + MENISCUS_DEPTH} ${right} ${surfaceY}`,
      `L ${right} ${bottom - r}`,
      `Q ${right} ${bottom} ${right - r} ${bottom}`,
      `L ${x + r} ${bottom}`,
      `Q ${x} ${bottom} ${x} ${bottom - r}`,
      "Z",
    ].join(" ");
  }

  return [
    `M ${x} ${surfaceY}`,
    `Q ${midX} ${surfaceY + MENISCUS_DEPTH} ${right} ${surfaceY}`,
    `L ${right} ${flatBottom}`,
    `Q ${right} ${bottom} ${right - radius} ${bottom}`,
    `L ${x + radius} ${bottom}`,
    `Q ${x} ${bottom} ${x} ${flatBottom}`,
    "Z",
  ].join(" ");
}

export default function StockBar({
  percent = 0,
  width = 56,
  height = 72,
  animate = true,
  title,
}) {
  const fillRef = useRef(null);
  const previous = useRef(null);

  const clamped = Math.max(0, Math.min(100, Number(percent) || 0));

  // Jar geometry: a neck band, then the body the fill lives in.
  const neckHeight = 8;
  const bodyTop = neckHeight + 4;
  const bodyBottom = height - 2;
  const bodyX = 2;
  const bodyWidth = width - 4;
  const bodyRadius = 9;
  const usableHeight = bodyBottom - bodyTop;

  const surfaceFor = (p) => bodyBottom - (usableHeight * p) / 100;

  useEffect(() => {
    const node = fillRef.current;
    if (!node) return;

    const target = surfaceFor(clamped);
    const start = previous.current ?? bodyBottom;
    previous.current = target;

    const geometry = (surfaceY) =>
      buildPath(bodyX, bodyWidth, bodyBottom, surfaceY, bodyRadius);

    if (!animate || start === target) {
      select(node).attr("d", geometry(target));
      return;
    }

    select(node)
      .attr("d", geometry(start))
      .transition()
      .duration(600)
      .ease(easeCubicInOut)
      .attrTween("d", () => (t) => geometry(start + (target - start) * t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clamped, animate, width, height]);

  const clipId = `jar-clip-${width}-${height}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={title || `${Math.round(clamped)}% left`}
      style={{ display: "block", overflow: "visible" }}
    >
      <defs>
        <clipPath id={clipId}>
          <rect
            x={bodyX}
            y={bodyTop}
            width={bodyWidth}
            height={usableHeight}
            rx={bodyRadius}
          />
        </clipPath>
      </defs>

      {/* Lid band — reads as a jar, not a progress bar. */}
      <rect
        x={bodyX + 5}
        y={2}
        width={bodyWidth - 10}
        height={neckHeight}
        rx={3}
        fill="none"
        stroke="var(--ink)"
        strokeWidth="1.5"
        strokeOpacity="0.55"
      />

      {/* Glass body. */}
      <rect
        x={bodyX}
        y={bodyTop}
        width={bodyWidth}
        height={usableHeight}
        rx={bodyRadius}
        fill="var(--milk)"
        stroke="var(--ink)"
        strokeWidth="1.5"
        strokeOpacity="0.55"
      />

      <g clipPath={`url(#${clipId})`}>
        <path ref={fillRef} fill="var(--yolk)" d="" />
      </g>

      {/* Label band across the glass, like a masking-tape pantry label. */}
      <line
        x1={bodyX}
        y1={bodyTop + usableHeight * 0.42}
        x2={bodyX + bodyWidth}
        y2={bodyTop + usableHeight * 0.42}
        stroke="var(--ink)"
        strokeOpacity="0.12"
        strokeWidth="1"
      />
    </svg>
  );
}
