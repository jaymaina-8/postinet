import Image from "next/image";

const LOGO_SRC = "/logo.png";

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
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Image
        src={LOGO_SRC}
        alt="Postinet AI"
        width={compact ? 24 : 28}
        height={compact ? 24 : 28}
        className="shrink-0"
        priority
      />
      {showName && (
        <span className="font-semibold text-white tracking-tight whitespace-nowrap">
          Postinet AI
        </span>
      )}
    </span>
  );
}
