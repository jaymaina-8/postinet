"use client";

import { useState, type ReactNode } from "react";

export type ContactItem = {
  title: string;
  content: ReactNode;
};

type Props = {
  items: ContactItem[];
};

/**
 * Accordion for Contact Us: one question per card, expand/collapse with chevron.
 */
export function ContactAccordion({ items }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-[640px] space-y-2">
      {items.map((item, i) => (
        <div
          key={i}
          className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden"
        >
          <button
            type="button"
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full flex items-center justify-between gap-4 py-4 px-5 sm:px-6 text-left"
          >
            <span className="font-medium text-white text-sm sm:text-base">
              {item.title}
            </span>
            <svg
              className={`w-5 h-5 shrink-0 text-zinc-400 transition-transform ${openIndex === i ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {openIndex === i && (
            <div className="px-5 sm:px-6 pb-4 pt-0">
              <div className="text-sm text-zinc-400 leading-relaxed [&_a]:text-emerald-400 [&_a]:hover:text-emerald-300 [&_a]:underline [&_a]:underline-offset-2">
                {item.content}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
