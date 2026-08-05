import { useEffect, useRef } from "react";
import { select } from "d3-selection";
import { easeCubicInOut } from "d3-ease";
import "d3-transition";

import { ringTone } from "../lib/pantryIcons";

/**
 * Countdown ring drawn with stroke-dashoffset. Colour is the whole message:
 * Moss past a week, Yolk Dim inside the week, Brick when it's about to run out.
 */

const HORIZON_DAYS = 14; // a full ring means two weeks or more of runway

export default function DepletionRing({ days, size = 62, stroke = 3 }) {
  const arcRef = useRef(null);
  const previous = useRef(0);

  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const known = days !== null && days !== undefined;
  const fraction = known ? Math.max(0, Math.min(1, days / HORIZON_DAYS)) : 0;
  const tone = ringTone(days);

  useEffect(() => {
    const node = arcRef.current;
    if (!node) return;

    const start = previous.current;
    previous.current = fraction;

    select(node)
      .attr("stroke-dasharray", circumference)
      .attr("stroke-dashoffset", circumference * (1 - start))
      .transition()
      .duration(600)
      .ease(easeCubicInOut)
      .attr("stroke-dashoffset", circumference * (1 - fraction));
  }, [fraction, circumference]);

  const label = known
    ? Number.isInteger(days)
      ? days
      : Math.max(0, Math.round(days))
    : "—";

  return (
    <div
      style={{ position: "relative", width: size, height: size, flex: "none" }}
      title={
        known
          ? `About ${label} day${label === 1 ? "" : "s"} left`
          : "Not enough usage logged to predict yet"
      }
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--ink)"
          strokeOpacity="0.1"
          strokeWidth={stroke}
        />
        <circle
          ref={arcRef}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={tone}
          strokeWidth={stroke}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          lineHeight: 1,
        }}
      >
        <span
          className="display"
          style={{
            fontSize: size * 0.36,
            color: known ? "var(--ink)" : "var(--ink-40)",
          }}
        >
          {label}
        </span>
        {known && (
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 9,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--ink-55)",
              marginTop: 2,
            }}
          >
            {label === 1 ? "day" : "days"}
          </span>
        )}
      </div>
    </div>
  );
}
