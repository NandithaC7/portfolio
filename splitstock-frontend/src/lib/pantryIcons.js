/**
 * The icon vocabulary. lucide-react is the base set; every use goes through
 * the `Icon` wrapper in components/Icons.jsx so stroke width and colour come
 * from the design system rather than lucide's defaults.
 */

import {
  ArrowLeft,
  Check,
  Copy,
  Droplet,
  LogOut,
  Milk,
  Package,
  Plus,
  RefreshCw,
  Soup,
  Wheat,
  X,
} from "lucide-react";

/** Interface actions. Pantry glyphs are chosen by `stockGlyph` below. */
export const icons = {
  ArrowLeft,
  Check,
  Copy,
  LogOut,
  Plus,
  RefreshCw,
  X,
};

/**
 * Pick an icon that literally references what's in the jar — a droplet for
 * oil, wheat for rice — rather than a generic dashboard glyph.
 */
export function stockGlyph(name = "", unit = "") {
  const lower = name.toLowerCase();
  if (/oil|vinegar|sauce|soap|deterg|shampoo|liquid/.test(lower)) return Droplet;
  if (/milk|cream|yog|curd/.test(lower)) return Milk;
  if (/rice|flour|wheat|pasta|oats|cereal|grain|sugar|salt/.test(lower)) return Wheat;
  if (/coffee|tea|soup|stock|broth|spice|masala/.test(lower)) return Soup;
  if (/roll|paper|towel|tissue|pack|box|bag/.test(lower)) return Package;
  if (unit === "ml" || unit === "L") return Droplet;
  if (unit === "g" || unit === "kg") return Wheat;
  return Package;
}

/** Ring colour is the whole message: healthy, watch it, or act now. */
export function ringTone(days) {
  if (days === null || days === undefined) return "var(--ink-25)";
  if (days <= 3) return "var(--brick)";
  if (days <= 7) return "var(--yolk-dim)";
  return "var(--moss)";
}
