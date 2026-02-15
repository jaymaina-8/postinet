type LogoProps = {
  className?: string;
  showName?: boolean;
  /** Compact for sidebar collapsed state */
  compact?: boolean;
};

/**
 * Postinet AI logo. Use showName for "Postinet AI" text next to image.
 */
export function Logo({ className = "", showName = true, compact = false }: LogoProps) {
  const size = compact ? 24 : 28;
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 256 256"
        className="shrink-0"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient id="postinetMark" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#34d399" />
            <stop offset="1" stopColor="#10b981" />
          </linearGradient>
        </defs>
        <rect x="20" y="20" width="216" height="216" rx="52" fill="#0a0a0a" />
        <path
          fill="url(#postinetMark)"
          d="M84 64C84 56 90 50 98 50H132C169 50 194 74 194 106C194 139 169 162 132 162H120V206C120 214 114 220 106 220H98C90 220 84 214 84 206V64ZM120 86V126H132C149 126 160 117 160 106C160 95 149 86 132 86H120Z"
        />
        <path fill="#0a0a0a" opacity="0.92" d="M132 86L176 112L132 138Z" />
      </svg>
      {showName && (
        <span className="font-semibold text-white tracking-tight whitespace-nowrap">
          Postinet AI
        </span>
      )}
    </span>
  );
}
