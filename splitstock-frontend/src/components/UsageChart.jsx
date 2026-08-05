import { useEffect, useMemo, useRef, useState } from "react";
import { select } from "d3-selection";
import { scaleLinear, scaleTime } from "d3-scale";
import { area, curveMonotoneX, line } from "d3-shape";
import { extent, max } from "d3-array";
import { timeFormat } from "d3-time-format";

/**
 * Remaining-quantity trail with daily usage as bars beneath it. Yolk for the
 * level, Ink hairlines for structure — no gridline noise, no second hue.
 */

const formatDay = timeFormat("%-d %b");

export default function UsageChart({ series = [], unit = "", height = 200 }) {
  const svgRef = useRef(null);
  const wrapRef = useRef(null);
  const [width, setWidth] = useState(560);

  useEffect(() => {
    const element = wrapRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) =>
      setWidth(Math.max(280, entry.contentRect.width))
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const points = useMemo(
    () =>
      series.map((row) => ({
        date: new Date(`${row.date}T00:00:00`),
        remaining: Number(row.remaining),
        used: Number(row.used),
      })),
    [series]
  );

  useEffect(() => {
    const svg = select(svgRef.current);
    svg.selectAll("*").remove();
    if (points.length < 2) return;

    const margin = { top: 12, right: 12, bottom: 24, left: 44 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const x = scaleTime()
      .domain(extent(points, (d) => d.date))
      .range([0, innerWidth]);
    const y = scaleLinear()
      .domain([0, max(points, (d) => d.remaining) * 1.1 || 1])
      .nice()
      .range([innerHeight, 0]);
    const yUsed = scaleLinear()
      .domain([0, max(points, (d) => d.used) || 1])
      .range([0, innerHeight * 0.32]);

    const root = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Baseline + a single mid rule; anything more competes with the data.
    [0, 0.5, 1].forEach((fraction) => {
      const value = y.domain()[1] * fraction;
      root
        .append("line")
        .attr("x1", 0)
        .attr("x2", innerWidth)
        .attr("y1", y(value))
        .attr("y2", y(value))
        .attr("stroke", "var(--ink)")
        .attr("stroke-opacity", fraction === 0 ? 0.25 : 0.08)
        .attr("stroke-width", 1);
      root
        .append("text")
        .attr("x", -8)
        .attr("y", y(value) + 4)
        .attr("text-anchor", "end")
        .attr("font-family", "var(--font-mono)")
        .attr("font-size", 10)
        .attr("fill", "var(--ink-55)")
        .text(Math.round(value));
    });

    // Daily usage as thin bars along the baseline.
    const barWidth = Math.max(2, innerWidth / points.length - 3);
    root
      .selectAll("rect.usage")
      .data(points.filter((d) => d.used > 0))
      .join("rect")
      .attr("class", "usage")
      .attr("x", (d) => x(d.date) - barWidth / 2)
      .attr("y", (d) => innerHeight - yUsed(d.used))
      .attr("width", barWidth)
      .attr("height", (d) => yUsed(d.used))
      .attr("rx", 2)
      .attr("fill", "var(--yolk-dim)");

    root
      .append("path")
      .datum(points)
      .attr("fill", "var(--yolk)")
      .attr("fill-opacity", 0.14)
      .attr(
        "d",
        area()
          .x((d) => x(d.date))
          .y0(innerHeight)
          .y1((d) => y(d.remaining))
          .curve(curveMonotoneX)
      );

    root
      .append("path")
      .datum(points)
      .attr("fill", "none")
      .attr("stroke", "var(--yolk-edge)")
      .attr("stroke-width", 1.75)
      .attr(
        "d",
        line()
          .x((d) => x(d.date))
          .y((d) => y(d.remaining))
          .curve(curveMonotoneX)
      );

    const ticks = [points[0], points[Math.floor(points.length / 2)], points.at(-1)];
    ticks.forEach((point) => {
      root
        .append("text")
        .attr("x", x(point.date))
        .attr("y", innerHeight + 16)
        .attr("text-anchor", "middle")
        .attr("font-family", "var(--font-mono)")
        .attr("font-size", 10)
        .attr("fill", "var(--ink-55)")
        .text(formatDay(point.date));
    });
  }, [points, width, height]);

  if (points.length < 2) {
    return (
      <p className="hint">
        Not enough history to chart yet — log a few days of usage.
      </p>
    );
  }

  return (
    <div ref={wrapRef} style={{ width: "100%" }}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        role="img"
        aria-label={`Remaining ${unit} over time`}
        style={{ display: "block" }}
      />
    </div>
  );
}
