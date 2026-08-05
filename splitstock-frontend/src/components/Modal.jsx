import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { icons } from "../lib/pantryIcons";
import { Icon } from "./Icons";

export default function Modal({ open, onClose, title, subtitle, children }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => event.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-scrim"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.17, ease: [0.32, 0.08, 0.24, 1] }}
          onMouseDown={(event) => event.target === event.currentTarget && onClose?.()}
        >
          <motion.div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.2, ease: [0.32, 0.08, 0.24, 1] }}
          >
            <div className="row-between" style={{ alignItems: "flex-start" }}>
              <div>
                <h2 className="modal__title">{title}</h2>
                {subtitle && <p className="modal__sub">{subtitle}</p>}
              </div>
              <button
                type="button"
                className="btn btn--quiet"
                onClick={onClose}
                aria-label="Close"
              >
                <Icon as={icons.X} size={16} />
              </button>
            </div>
            <div style={{ marginTop: "var(--space-4)" }}>{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
