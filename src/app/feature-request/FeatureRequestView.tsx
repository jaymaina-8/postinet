"use client";

import Link from "next/link";
import { useState, useMemo } from "react";

const CATEGORIES = [
  "All Ideas",
  "User Interface",
  "Performance",
  "Integrations",
  "New Features",
] as const;

type Category = (typeof CATEGORIES)[number];

type Idea = {
  id: string;
  title: string;
  details: string;
  category: string;
  votes: number;
  comments: number;
  createdAt: string;
};

type RoadmapStage = "under_review" | "planned" | "in_progress";

type RoadmapItem = {
  id: string;
  title: string;
  votes: number;
  stage: RoadmapStage;
  tag?: string;
};

const ROADMAP_COLUMNS: { key: RoadmapStage; label: string; dotClass: string }[] = [
  { key: "under_review", label: "Under Review", dotClass: "bg-emerald-500" },
  { key: "planned", label: "Planned", dotClass: "bg-emerald-500" },
  { key: "in_progress", label: "In Progress", dotClass: "bg-emerald-400" },
];

const MOCK_ROADMAP: RoadmapItem[] = [
  { id: "r1", title: "Bulk schedule for Facebook and YouTube", votes: 91, stage: "under_review", tag: "Postinet Feature Requests" },
  { id: "r2", title: "Thumbnail selection before publishing", votes: 136, stage: "under_review", tag: "Postinet Feature Requests" },
  { id: "r3", title: "Select cover image", votes: 412, stage: "under_review", tag: "Postinet Feature Requests" },
  { id: "r4", title: "Duplicate post to make a second version for alternate platform", votes: 170, stage: "planned", tag: "Postinet Feature Requests" },
  { id: "r5", title: "Set custom clip length", votes: 34, stage: "planned", tag: "Postinet Feature Requests" },
  { id: "r6", title: "Shorter videos option", votes: 102, stage: "planned", tag: "Postinet Feature Requests" },
  { id: "r7", title: "Automatically schedule clips to post", votes: 112, stage: "in_progress", tag: "Postinet Feature Requests" },
  { id: "r8", title: "More caption styles in editor", votes: 26, stage: "in_progress", tag: "Postinet Feature Requests" },
  { id: "r9", title: "Dark mode for the dashboard", votes: 48, stage: "in_progress", tag: "Postinet Feature Requests" },
];

const MOCK_IDEAS: Idea[] = [
  {
    id: "1",
    title: "Bulk schedule for Facebook and YouTube",
    details: "Allow selecting multiple posts and scheduling them in one action instead of one by one.",
    category: "New Features",
    votes: 91,
    comments: 12,
    createdAt: "5 days ago",
  },
  {
    id: "2",
    title: "Custom clip length for repurposed videos",
    details: "Set a custom max duration (e.g. 60s) when generating clips from long-form content.",
    category: "New Features",
    votes: 34,
    comments: 8,
    createdAt: "1 week ago",
  },
  {
    id: "3",
    title: "Thumbnail selection before publishing",
    details: "Pick which frame to use as the thumbnail for YouTube and Facebook posts.",
    category: "User Interface",
    votes: 136,
    comments: 24,
    createdAt: "2 weeks ago",
  },
  {
    id: "4",
    title: "Dark mode for the dashboard",
    details: "Full dark theme option for the scheduling dashboard to reduce eye strain.",
    category: "User Interface",
    votes: 48,
    comments: 6,
    createdAt: "3 days ago",
  },
  {
    id: "5",
    title: "API access for developers",
    details: "REST or GraphQL API to create schedules, list posts, and trigger publishes from external tools.",
    category: "Integrations",
    votes: 62,
    comments: 18,
    createdAt: "1 week ago",
  },
  {
    id: "6",
    title: "Faster uploads and processing",
    details: "Improve upload speed and reduce time until a post is ready to schedule.",
    category: "Performance",
    votes: 28,
    comments: 5,
    createdAt: "4 days ago",
  },
];

type Tab = "ideas" | "roadmap";

export function FeatureRequestView() {
  const [activeTab, setActiveTab] = useState<Tab>("ideas");
  const [ideas, setIdeas] = useState<Idea[]>(MOCK_IDEAS);
  const [roadmapItems] = useState<RoadmapItem[]>(MOCK_ROADMAP);
  const [selectedCategory, setSelectedCategory] = useState<Category>("All Ideas");
  const [sortBy, setSortBy] = useState<"newest" | "votes">("votes");
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[1]);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const filteredIdeas = useMemo(() => {
    let list = ideas.filter(
      (i) =>
        selectedCategory === "All Ideas" || i.category === selectedCategory
    );
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.details.toLowerCase().includes(q)
      );
    }
    if (sortBy === "votes") {
      list = [...list].sort((a, b) => b.votes - a.votes);
    } else {
      list = [...list].reverse();
    }
    return list;
  }, [ideas, selectedCategory, search, sortBy]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || submitting) return;
    setSubmitError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/feature-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          details: details.trim() || undefined,
          category: category || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit");
      }
      setIdeas((prev) => [
        {
          id: data.id ?? String(Date.now()),
          title: data.title ?? title.trim(),
          details: data.details ?? (details.trim() || "No details provided."),
          category: data.category ?? category,
          votes: data.votes ?? 0,
          comments: 0,
          createdAt: data.createdAt ? "Just now" : "Just now",
        },
        ...prev,
      ]);
      setTitle("");
      setDetails("");
      setCategory(CATEGORIES[1]);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Could not submit. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = (id: string) => {
    setIdeas((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, votes: i.votes + 1 } : i
      )
    );
  };

  return (
    <main className="pt-24 pb-20 px-4 sm:px-6">
      <div className="mx-auto max-w-6xl">
        {/* Sub-nav: Ideas + Roadmap (no Changelog) */}
        <nav className="flex items-center gap-6 border-b border-white/10 pb-4 mb-8">
          <button
            type="button"
            onClick={() => setActiveTab("ideas")}
            className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
              activeTab === "ideas"
                ? "text-emerald-400 border-emerald-500"
                : "text-zinc-400 border-transparent hover:text-zinc-200"
            }`}
          >
            Ideas
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("roadmap")}
            className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
              activeTab === "roadmap"
                ? "text-emerald-400 border-emerald-500"
                : "text-zinc-400 border-transparent hover:text-zinc-200"
            }`}
          >
            Roadmap
          </button>
        </nav>

        {activeTab === "roadmap" ? (
          /* Roadmap: three columns */
          <div>
            <h2 className="text-lg font-semibold text-white mb-6">Roadmap</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {ROADMAP_COLUMNS.map((col) => {
                const items = roadmapItems.filter((i) => i.stage === col.key);
                return (
                  <div
                    key={col.key}
                    className="rounded-xl border border-white/10 bg-zinc-900/30 overflow-hidden"
                  >
                    <div className="flex items-center gap-2 p-4 border-b border-white/10">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${col.dotClass}`} aria-hidden />
                      <span className="text-sm font-semibold text-white">{col.label}</span>
                      <span className="text-xs text-zinc-500 ml-auto">{items.length}</span>
                    </div>
                    <ul className="p-3 space-y-2 min-h-[200px]">
                      {items.map((item) => (
                        <li
                          key={item.id}
                          className="rounded-lg border border-white/5 bg-zinc-800/30 p-3 hover:border-white/10 transition-colors"
                        >
                          <div className="flex items-start gap-2">
                            <span className="flex flex-col items-center shrink-0 pt-0.5">
                              <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                              </svg>
                              <span className="text-xs font-medium text-zinc-400">{item.votes}</span>
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-white leading-snug">{item.title}</p>
                              {item.tag && (
                                <span className="inline-block mt-1.5 text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                                  {item.tag}
                                </span>
                              )}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8 lg:gap-10">
          {/* Sidebar: categories */}
          <aside>
            <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">
              Ideas
            </h2>
            <ul className="space-y-1">
              {CATEGORIES.map((cat) => (
                <li key={cat}>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left text-sm py-2 px-3 rounded-lg transition-colors ${
                      selectedCategory === cat
                        ? "bg-emerald-500/15 text-emerald-400 font-medium"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                    }`}
                  >
                    {cat}
                    {cat === "All Ideas" && (
                      <span className="ml-2 text-zinc-500">
                        {ideas.length}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <div className="min-w-0">
            {/* Submit new request */}
            <section className="rounded-2xl border border-white/10 bg-zinc-900/40 p-6 mb-8">
              <h2 className="text-lg font-semibold text-white mb-4">
                Submit a new request
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="idea-title" className="sr-only">
                    Title
                  </label>
                  <input
                    id="idea-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Give your request a clear, concise title"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900/80 px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label htmlFor="idea-details" className="sr-only">
                    Details
                  </label>
                  <textarea
                    id="idea-details"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Describe the request and why it's important"
                    rows={3}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900/80 px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-y"
                  />
                </div>
                <div>
                  <label htmlFor="idea-category" className="sr-only">
                    Category
                  </label>
                  <select
                    id="idea-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900/80 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    {CATEGORIES.filter((c) => c !== "All Ideas").map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Saving…" : submitted ? "Submitted" : "Create idea"}
                  </button>
                  {submitted && (
                    <span className="text-sm text-emerald-400">
                      Thanks! Your idea was saved and we’ll review it.
                    </span>
                  )}
                  {submitError && (
                    <span className="text-sm text-red-400">{submitError}</span>
                  )}
                </div>
              </form>
            </section>

            {/* Sort and search */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <p className="text-sm text-zinc-500">
                Showing:{" "}
                {selectedCategory === "All Ideas"
                  ? "All ideas"
                  : selectedCategory}
                {search.trim() && ` matching "${search}"`}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as "newest" | "votes")
                  }
                  className="rounded-lg border border-zinc-700 bg-zinc-900/80 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="votes">Sort by: Most votes</option>
                  <option value="newest">Sort by: Newest</option>
                </select>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </span>
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search..."
                    className="pl-9 pr-4 py-2 rounded-lg border border-zinc-700 bg-zinc-900/80 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-48 sm:w-56"
                  />
                </div>
              </div>
            </div>

            {/* List of ideas */}
            <ul className="space-y-2">
              {filteredIdeas.length === 0 ? (
                <li className="rounded-xl border border-white/10 bg-zinc-900/30 p-8 text-center text-zinc-500">
                  No ideas match. Try a different filter or search.
                </li>
              ) : (
                filteredIdeas.map((idea) => (
                  <li
                    key={idea.id}
                    className="rounded-xl border border-white/10 bg-zinc-900/30 hover:border-white/15 transition-colors overflow-hidden"
                  >
                    <div className="flex gap-4 p-4 sm:p-5">
                      <button
                        type="button"
                        onClick={() => handleVote(idea.id)}
                        className="flex flex-col items-center justify-center shrink-0 w-12 h-14 rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-colors"
                        aria-label={`Vote for ${idea.title}`}
                      >
                        <svg
                          className="w-5 h-5 text-zinc-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 15l7-7 7 7"
                          />
                        </svg>
                        <span className="text-sm font-semibold text-white mt-0.5">
                          {idea.votes}
                        </span>
                      </button>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-white mb-1">
                          {idea.title}
                        </h3>
                        <p className="text-sm text-zinc-400 line-clamp-2 mb-2">
                          {idea.details}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                          <span className="px-2 py-0.5 rounded bg-white/5 text-zinc-400">
                            {idea.category}
                          </span>
                          <span>{idea.createdAt}</span>
                          <span>{idea.comments} comments</span>
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
        )}
      </div>
    </main>
  );
}
