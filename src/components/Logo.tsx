import Image from "next/image";

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
      <Image
        src="/logo.png"
        alt="Postinet AI"
        width={size}
        height={size}
        className="shrink-0 rounded-md"
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
