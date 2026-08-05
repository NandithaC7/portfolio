import { AnimatePresence, motion } from "framer-motion";

import { useToastStore } from "../store/toastStore";
import { icons } from "../lib/pantryIcons";
import { Icon } from "./Icons";

/** Restock alerts slide up from the bottom edge. Brick accent, never a shadow. */
export default function ToastDock() {
  const toasts = useToastStore((state) => state.toasts);
  const dismiss = useToastStore((state) => state.dismiss);

  return (
    <div className="toast-dock">
      <AnimatePresence initial={false}>
        {toasts.map((item) => (
          <motion.div
            key={item.id}
            className={`toast ${item.tone === "moss" ? "toast--moss" : ""} ${
              item.tone === "yolk" ? "toast--yolk" : ""
            }`}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.28, ease: [0.32, 0.08, 0.24, 1] }}
          >
            <div className="grow">
              <p className="toast__title">{item.title}</p>
              {item.body && <p className="toast__body">{item.body}</p>}
            </div>
            <button
              type="button"
              className="btn btn--quiet btn--sm"
              onClick={() => dismiss(item.id)}
              aria-label="Dismiss"
              style={{ padding: 4 }}
            >
              <Icon as={icons.X} size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
