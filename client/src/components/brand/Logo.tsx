interface LogoMarkProps {
  /** Pixel size of the square tile. */
  size?: number;
  /** Soft glow behind the tile — nice for splash/login, too much for a sidebar icon. */
  glow?: boolean;
  className?: string;
}

/**
 * The Musify mark: a five-bar soundwave inside a rounded, gradient tile.
 * Pure SVG so it stays crisp at every size instead of scaling a raster PNG
 * (the old badge was a fuzzy exported .png with the tagline baked in).
 * Uses the app's existing green identity — this is a quality upgrade to the
 * mark itself, not a rebrand of the palette.
 */
export function LogoMark({ size = 40, glow = false, className = "" }: LogoMarkProps) {
  const gradId = `musify-tile-${size}-${glow ? "g" : "n"}`;
  const sheenId = `musify-sheen-${size}-${glow ? "g" : "n"}`;

  return (
    <div
      className={`relative shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {glow && (
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-[28%] bg-ahmedify-green opacity-40 blur-xl scale-90"
        />
      )}
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className="relative"
        role="img"
        aria-label="Musify"
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0F5C2C" />
            <stop offset="55%" stopColor="#1DB954" />
            <stop offset="100%" stopColor="#3DF07C" />
          </linearGradient>
          <radialGradient id={sheenId} cx="28%" cy="20%" r="60%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="100" height="100" rx="26" fill={`url(#${gradId})`} />
        <rect width="100" height="100" rx="26" fill={`url(#${sheenId})`} />
        <rect
          x="1.5"
          y="1.5"
          width="97"
          height="97"
          rx="24.5"
          fill="none"
          stroke="#FFFFFF"
          strokeOpacity="0.12"
        />

        {/* Five-bar soundwave, rounded caps, gentle asymmetric rhythm */}
        <g fill="#FFFFFF">
          <rect x="24" y="46" width="9" height="26" rx="4.5" opacity="0.92" />
          <rect x="39" y="34" width="9" height="38" rx="4.5" />
          <rect x="54" y="22" width="9" height="50" rx="4.5" />
          <rect x="69" y="38" width="9" height="34" rx="4.5" opacity="0.92" />
        </g>
      </svg>
    </div>
  );
}

interface WordmarkProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const WORDMARK_SIZE: Record<NonNullable<WordmarkProps["size"]>, string> = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-4xl",
};

/** "Musify" text treatment — a gradient sweep on the emphasis syllable. */
export function Wordmark({ size = "md", className = "" }: WordmarkProps) {
  return (
    <span
      className={`font-extrabold tracking-tight ${WORDMARK_SIZE[size]} ${className}`}
    >
      Mus
      <span className="bg-gradient-to-r from-ahmedify-green to-ahmedify-green-hover bg-clip-text text-transparent">
        ify
      </span>
    </span>
  );
}

interface LogoProps {
  size?: number;
  wordmarkSize?: WordmarkProps["size"];
  glow?: boolean;
  className?: string;
}

/** Mark + wordmark side by side — the combination used in the sidebar, login, etc. */
export default function Logo({
  size = 40,
  wordmarkSize = "md",
  glow = false,
  className = "",
}: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} glow={glow} />
      <Wordmark size={wordmarkSize} />
    </div>
  );
}
