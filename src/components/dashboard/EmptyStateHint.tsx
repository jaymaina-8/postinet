import Link from "next/link";

type EmptyStateHintProps = {
  variant: "connect" | "upload";
};

export default function EmptyStateHint({ variant }: EmptyStateHintProps) {
  const content =
    variant === "connect"
      ? {
          title: "Connect Facebook or YouTube to start.",
          cta: "Connect accounts",
          href: "/dashboard/accounts",
        }
      : {
          title: "Upload your first video or image to get started.",
          cta: "Upload media",
          href: "/dashboard/create",
        };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3 text-sm text-zinc-300">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <span>{content.title}</span>
        <Link
          href={content.href}
          className="inline-flex items-center justify-center rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:border-zinc-500"
        >
          {content.cta}
        </Link>
      </div>
    </div>
  );
}
