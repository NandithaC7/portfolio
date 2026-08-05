import { useEffect, useMemo, useRef, useState } from "react";
import { select } from "d3-selection";
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
} from "d3-force";

/**
 * The balance sheet as a corkboard: member initials pinned in circles, joined
 * by thin curved string, with a small paper tag at each string's midpoint
 * carrying the amount.
 *
 * Layout is a D3 force simulation with gentle repulsion. The simulation is
 * ticked to a resting state before the first paint, so nodes never visibly
 * jitter or bounce into place.
 */

const NODE_RADIUS = 26;

function money(amount) {
  return `₹${Number(amount).toFixed(2)}`;
}

export default function DebtGraph({ members = [], balances = [], currentUserId }) {
  const svgRef = useRef(null);
  const wrapRef = useRef(null);
  const [width, setWidth] = useState(640);
  const height = 340;

  useEffect(() => {
    const element = wrapRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.max(320, entry.contentRect.width));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const graph = useMemo(() => {
    const nodes = members.map((member) => ({ ...member }));
    const ids = new Set(nodes.map((n) => n.id));
    const links = balances
      .filter((b) => ids.has(b.debtor.id) && ids.has(b.creditor.id))
      .map((b) => ({
        source: b.debtor.id,
        target: b.creditor.id,
        amount: Number(b.amount),
        debtorId: b.debtor.id,
        creditorId: b.creditor.id,
      }));
    return { nodes, links };
  }, [members, balances]);

  useEffect(() => {
    const svg = select(svgRef.current);
    svg.selectAll("*").remove();

    if (!graph.nodes.length) return;

    const nodes = graph.nodes.map((n) => ({ ...n }));
    const links = graph.links.map((l) => ({ ...l }));

    const simulation = forceSimulation(nodes)
      .force(
        "link",
        forceLink(links)
          .id((d) => d.id)
          .distance(170)
          .strength(0.35)
      )
      .force("charge", forceManyBody().strength(-320))
      .force("center", forceCenter(width / 2, height / 2))
      .force("collide", forceCollide(NODE_RADIUS + 26).strength(0.9))
      .force("x", forceX(width / 2).strength(0.05))
      .force("y", forceY(height / 2).strength(0.08))
      .stop();

    // Settle the layout up front — no bounce-in on screen.
    simulation.tick(320);

    nodes.forEach((node) => {
      node.x = Math.max(NODE_RADIUS + 46, Math.min(width - NODE_RADIUS - 46, node.x));
      node.y = Math.max(NODE_RADIUS + 12, Math.min(height - NODE_RADIUS - 12, node.y));
    });

    const stringLayer = svg.append("g");
    const tagLayer = svg.append("g");
    const nodeLayer = svg.append("g");

    links.forEach((link) => {
      // forceLink swaps the id references for the node objects themselves.
      const from = link.source;
      const to = link.target;
      if (!from || !to || from.x === undefined || to.x === undefined) return;

      const midX = (from.x + to.x) / 2;
      const midY = (from.y + to.y) / 2;
      // Sag the string downward a little, like it's hanging between two pins.
      const sag = 26;
      const controlX = midX;
      const controlY = midY + sag;

      stringLayer
        .append("path")
        .attr("d", `M ${from.x} ${from.y} Q ${controlX} ${controlY} ${to.x} ${to.y}`)
        .attr("fill", "none")
        .attr("stroke", "var(--ink)")
        .attr("stroke-opacity", 0.4)
        .attr("stroke-width", 1.5);

      // Quadratic midpoint, so the tag sits on the string rather than beside it.
      const tagX = 0.25 * from.x + 0.5 * controlX + 0.25 * to.x;
      const tagY = 0.25 * from.y + 0.5 * controlY + 0.25 * to.y;

      const owedToMe = link.creditorId === currentUserId;
      const owedByMe = link.debtorId === currentUserId;
      const tone = owedToMe
        ? "var(--moss)"
        : owedByMe
          ? "var(--brick)"
          : "var(--ink-70)";

      const text = money(link.amount);
      const tagWidth = Math.max(58, text.length * 8.2 + 18);
      const tagHeight = 22;
      const notch = 7;

      const tag = tagLayer
        .append("g")
        .attr("transform", `translate(${tagX - tagWidth / 2}, ${tagY - tagHeight / 2})`);

      // Luggage-tag silhouette: notched left edge, rounded right.
      tag
        .append("path")
        .attr(
          "d",
          [
            `M ${notch} 0`,
            `L ${tagWidth - 4} 0`,
            `Q ${tagWidth} 0 ${tagWidth} 4`,
            `L ${tagWidth} ${tagHeight - 4}`,
            `Q ${tagWidth} ${tagHeight} ${tagWidth - 4} ${tagHeight}`,
            `L ${notch} ${tagHeight}`,
            `L 0 ${tagHeight / 2}`,
            "Z",
          ].join(" ")
        )
        .attr("fill", "var(--milk)")
        .attr("stroke", "var(--ink)")
        .attr("stroke-opacity", 0.25)
        .attr("stroke-width", 1);

      tag
        .append("circle")
        .attr("cx", notch + 5)
        .attr("cy", tagHeight / 2)
        .attr("r", 1.6)
        .attr("fill", "var(--ink)")
        .attr("fill-opacity", 0.35);

      tag
        .append("text")
        .attr("x", notch + 12)
        .attr("y", tagHeight / 2 + 4)
        .attr("font-family", "var(--font-mono)")
        .attr("font-size", 12)
        .attr("font-weight", 500)
        .attr("fill", tone)
        .text(text);
    });

    const nodeGroup = nodeLayer
      .selectAll("g")
      .data(nodes)
      .join("g")
      .attr("transform", (d) => `translate(${d.x}, ${d.y})`);

    nodeGroup
      .append("circle")
      .attr("r", NODE_RADIUS)
      .attr("fill", (d) => (d.id === currentUserId ? "var(--yolk-dim)" : "var(--paper)"))
      .attr("stroke", (d) =>
        d.id === currentUserId ? "var(--yolk-edge)" : "var(--ink)"
      )
      .attr("stroke-opacity", (d) => (d.id === currentUserId ? 1 : 0.55))
      .attr("stroke-width", 1);

    nodeGroup
      .append("text")
      .attr("text-anchor", "middle")
      .attr("y", 4)
      .attr("font-family", "var(--font-mono)")
      .attr("font-size", 12)
      .attr("font-weight", 500)
      .attr("fill", "var(--ink)")
      .text((d) => d.initials);

    nodeGroup
      .append("text")
      .attr("text-anchor", "middle")
      .attr("y", NODE_RADIUS + 16)
      .attr("font-family", "var(--font-body)")
      .attr("font-size", 12)
      .attr("fill", "var(--ink-55)")
      .text((d) => (d.id === currentUserId ? "you" : d.name.split(" ")[0]));

    return () => simulation.stop();
  }, [graph, width, currentUserId]);

  return (
    <div ref={wrapRef} style={{ width: "100%" }}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Who owes whom in this household"
        style={{ display: "block" }}
      />
    </div>
  );
}
