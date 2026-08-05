const BASE = { strokeWidth: 1.5, absoluteStrokeWidth: true, className: "icon" };

/** Every lucide icon is drawn through here so it inherits SplitStock's stroke. */
export function Icon({ as: Component, size = 18, color = "var(--ink)", ...rest }) {
  return <Component {...BASE} size={size} color={color} {...rest} />;
}

/** A jar — lucide has no jar, and this is the app's whole metaphor. */
export function JarIcon({ size = 18, color = "var(--ink)", filled = false }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="icon"
      aria-hidden="true"
    >
      <path d="M8 3h8" />
      <path d="M9 3v2.2c0 .9-.35 1.4-1 2C7.1 8 6.7 8.8 6.7 10v8.3A2.7 2.7 0 0 0 9.4 21h5.2a2.7 2.7 0 0 0 2.7-2.7V10c0-1.2-.4-2-1.3-2.8-.65-.6-1-1.1-1-2V3" />
      {filled && (
        <path
          d="M6.7 13h10.6v5.3A2.7 2.7 0 0 1 14.6 21H9.4a2.7 2.7 0 0 1-2.7-2.7V13Z"
          fill="var(--yolk)"
          stroke="none"
        />
      )}
    </svg>
  );
}