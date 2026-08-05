import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import DepletionRing from "./DepletionRing";
import StockBar from "./StockBar";
import { stockGlyph } from "../lib/pantryIcons";
import { Icon } from "./Icons";

function trimNumber(value) {
  const number = Number(value);
  return Number.isInteger(number) ? String(number) : number.toFixed(2);
}

/**
 * One jar on the shelf. Row background alternates Milk/Paper — that
 * alternation is the elevation; there is no shadow.
 */
export default function JarCard({ stock, index, onLogUsage, justUpdated }) {
  const navigate = useNavigate();
  const Glyph = stockGlyph(stock.name, stock.unit);
  const percent = Number(stock.percent_remaining ?? 0);

  return (
    <motion.div
      layout="position"
      transition={{ duration: 0.25, ease: [0.32, 0.08, 0.24, 1] }}
      className={`jar-label ${index % 2 === 1 ? "jar-label--paper" : ""}`}
      onClick={() => navigate(`/stock/${stock.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          navigate(`/stock/${stock.id}`);
        }
      }}
      style={{
        borderColor: justUpdated ? "var(--yolk-edge)" : undefined,
        transition: "border-color 600ms cubic-bezier(0.32,0.08,0.24,1)",
      }}
    >
      <StockBar percent={percent} width={56} height={72} title={`${stock.name}: ${Math.round(percent)}% left`} />

      <div>
        <div className="row" style={{ gap: "var(--space-2)" }}>
          <Icon as={Glyph} size={16} color="var(--ink-70)" />
          <h3 className="jar-label__name">{stock.name}</h3>
        </div>
        <div className="jar-label__meta">
          <span className="mono">
            {trimNumber(stock.current_quantity)}
            {stock.unit} left
          </span>
          <span aria-hidden="true">·</span>
          <span>
            bought by{" "}
            {stock.purchased_by ? stock.purchased_by.display_name : "someone"}
          </span>
          <span aria-hidden="true">·</span>
          <span className="mono">₹{Number(stock.total_cost).toFixed(2)}</span>
          {stock.is_low && (
            <span className="chip chip--brick" style={{ marginLeft: 2 }}>
              running low
            </span>
          )}
        </div>
      </div>

      <div className="jar-label__right">
        <div className="jar-label__qty">
          <div className="qty-big">{Math.round(percent)}%</div>
          <div className="qty-of">
            of {trimNumber(stock.quantity)}
            {stock.unit}
          </div>
        </div>

        <DepletionRing days={stock.days_until_empty} size={58} />

        <button
          type="button"
          className="btn btn--primary btn--sm"
          onClick={(event) => {
            event.stopPropagation();
            onLogUsage(stock);
          }}
        >
          Log usage
        </button>
      </div>
    </motion.div>
  );
}
