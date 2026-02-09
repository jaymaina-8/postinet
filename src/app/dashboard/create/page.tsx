"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabaseClient";
import { PLATFORMS } from "@/lib/platforms";
import { PageGate, usePageScope } from "@/components/PageScope";

const imageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const videoTypes = ["video/mp4", "video/webm", "video/quicktime"];

type PostMode = "now" | "schedule";
type YouTubeUploadType = "video" | "shorts";
type Destination = {
  platform: string;
  accountId: string;
  name: string | null;
  recordId: string;
};

export default function CreatePage() {
  const router = useRouter();
  const { accounts, selectedAccount } = usePageScope();
  const [selectedDestinations, setSelectedDestinations] = useState<Destination[]>([]);
  const hasYouTube = selectedDestinations.some((dest) => dest.platform === PLATFORMS.YOUTUBE);
  const hasFacebook = selectedDestinations.some((dest) => dest.platform === PLATFORMS.FACEBOOK);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"public" | "unlisted" | "private">("private");
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadedMediaUrl, setUploadedMediaUrl] = useState<string | null>(null);
  const [postMode, setPostMode] = useState<PostMode>("now");
  const [uploadType, setUploadType] = useState<YouTubeUploadType>("video");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const allowedTypes = useMemo(
    () => (hasYouTube ? videoTypes : [...imageTypes, ...videoTypes]),
    [hasYouTube]
  );

  useEffect(() => {
    if (scheduledDate && scheduledTime) return;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    if (!scheduledDate) setScheduledDate(tomorrow.toISOString().split("T")[0]);
    if (!scheduledTime) setScheduledTime("09:00");
  }, [scheduledDate, scheduledTime]);

  const timezone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    []
  );

  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) return;
    if (!allowedTypes.includes(selectedFile.type)) {
      setError(hasYouTube ? "Unsupported file type. Please upload a video." : "Unsupported file type.");
      setFile(null);
      setUploadedMediaUrl(null);
      return;
    }
    setError(null);
    setFile(selectedFile);
    setUploadedMediaUrl(null);
    setUploadProgress(0);
  };

  const uploadMedia = async () => {
    if (!file) {
      throw new Error("Please select a file to upload.");
    }

    setUploading(true);
    setUploadProgress(0);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("Please log in to upload media.");
    }

    const fileExt = file.name.split(".").pop() || "bin";
    const fileName = `${session.user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

    const { data, error: signedError } = await supabase.storage
      .from("content")
      .createSignedUploadUrl(fileName);

    if (signedError || !data?.signedUrl) {
      throw new Error(signedError?.message || "Failed to create upload URL.");
    }

    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", data.signedUrl, true);
      xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setUploadProgress(Math.round((event.loaded / event.total) * 100));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error("Upload failed. Please try again."));
        }
      };

      xhr.onerror = () => reject(new Error("Upload failed. Please try again."));
      xhr.send(file);
    });

    const { data: publicUrlData } = supabase.storage.from("content").getPublicUrl(fileName);
    setUploadedMediaUrl(publicUrlData.publicUrl);
    setUploading(false);
    return publicUrlData.publicUrl;
  };

  const handleUploadClick = async () => {
    setError(null);
    try {
      await uploadMedia();
    } catch (err: any) {
      setUploading(false);
      setError(err.message || "Failed to upload file.");
    }
  };

  useEffect(() => {
    if (!selectedAccount) return;
    setSelectedDestinations((prev) => {
      const exists = prev.some(
        (dest) =>
          dest.platform === selectedAccount.platform &&
          dest.accountId === selectedAccount.accountId
      );
      if (exists) {
        return prev;
      }
      return [
        ...prev,
        {
          platform: selectedAccount.platform,
          accountId: selectedAccount.accountId,
          name: selectedAccount.name,
          recordId: selectedAccount.recordId,
        },
      ];
    });
  }, [selectedAccount]);

  const toggleDestination = (destination: Destination) => {
    setSelectedDestinations((prev) => {
      const exists = prev.some(
        (dest) =>
          dest.platform === destination.platform &&
          dest.accountId === destination.accountId
      );
      if (exists) {
        return prev.filter(
          (dest) =>
            !(
              dest.platform === destination.platform &&
              dest.accountId === destination.accountId
            )
        );
      }
      return [...prev, destination];
    });
  };

  const createDraftPost = async (destination: Destination, mediaUrl: string | null) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("Please log in to create a post.");
    }

    const mediaType = file?.type?.startsWith("video/") || mediaUrl?.match(/\.(mp4|mov|webm|mkv|avi|m4v)(\?|#|$)/i)
      ? "video"
      : mediaUrl
      ? "image"
      : null;

    const isYouTubeDestination = destination.platform === PLATFORMS.YOUTUBE;
    const payload = {
      user_id: session.user.id,
      content: isYouTubeDestination ? null : caption.trim() || null,
      media_url: mediaUrl,
      media_type: mediaType,
      title: isYouTubeDestination ? title.trim() : null,
      description: isYouTubeDestination ? description.trim() || null : null,
      visibility: isYouTubeDestination ? visibility : null,
      yt_upload_type: isYouTubeDestination ? uploadType : null,
      platform: destination.platform,
      platform_account_id: destination.accountId,
      status: "draft",
      scheduled_at: null,
      published_at: null,
      published_once: false,
    };

    const { data, error: insertError } = await supabase
      .from("posts")
      .insert(payload)
      .select()
      .single();

    if (insertError || !data) {
      throw new Error(insertError?.message || "Failed to save post.");
    }

    return data;
  };

  const validateSchedule = () => {
    if (!scheduledDate || !scheduledTime) {
      throw new Error("Please choose a date and time for scheduling.");
    }
    const scheduledAtDate = new Date(`${scheduledDate}T${scheduledTime}`);
    const minScheduleTime = Date.now() + 2 * 60 * 1000;
    if (Number.isNaN(scheduledAtDate.getTime()) || scheduledAtDate.getTime() < minScheduleTime) {
      throw new Error("Scheduled time must be at least 2 minutes in the future.");
    }
    return scheduledAtDate.toISOString();
  };

  const handleSubmit = async (mode: PostMode) => {
    if (selectedDestinations.length === 0) {
      setError("Select at least one destination before publishing.");
      return;
    }

    if (hasYouTube) {
      if (!title.trim()) {
        setError("Title is required for YouTube.");
        return;
      }
      if (!file && !uploadedMediaUrl) {
        setError("Please upload a video.");
        return;
      }
    }

    if (!hasYouTube && !caption.trim() && !file && !uploadedMediaUrl) {
      setError("Please add a caption or upload media.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      let mediaUrl = uploadedMediaUrl;
      if (file && !uploadedMediaUrl) {
        mediaUrl = await uploadMedia();
      }

      const createdPosts = await Promise.all(
        selectedDestinations.map((destination) => createDraftPost(destination, mediaUrl || null))
      );

      if (mode === "schedule") {
        const scheduledAt = validateSchedule();
        for (const post of createdPosts) {
          const res = await fetch("/api/schedule", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              postId: post.id,
              scheduledAt,
              platform: post.platform,
            }),
          });

          if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body.error || "Failed to schedule post.");
          }
        }

        const destinationNames = selectedDestinations
          .map((dest) => (dest.platform === PLATFORMS.FACEBOOK ? "Facebook" : "YouTube"))
          .join(" + ");
        setSuccess(`Post scheduled for ${destinationNames}.`);
        router.push("/dashboard/schedule");
        return;
      }

      for (const post of createdPosts) {
        if (post.platform === PLATFORMS.YOUTUBE) {
          await supabase
            .from("posts")
            .update({ status: "publishing" })
            .eq("id", post.id);

          const res = await fetch("/api/youtube/post", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ postId: post.id }),
          });

          if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body.error || "Failed to publish YouTube video.");
          }
        } else if (post.platform === PLATFORMS.FACEBOOK) {
          const res = await fetch("/api/facebook/post", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              content: caption.trim() || null,
              imageUrl: mediaUrl || null,
            }),
          });

          if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            await supabase
              .from("posts")
              .update({ status: "failed" })
              .eq("id", post.id);
            throw new Error(body.error || "Failed to publish post.");
          }

          const published = await res.json();
          await supabase
            .from("posts")
            .update({
              posted_at: new Date().toISOString(),
              published_at: new Date().toISOString(),
              platform_post_id: published.postId || null,
              provider_post_id: published.postId || null,
              platform: PLATFORMS.FACEBOOK,
              platform_account_id: post.platform_account_id,
              status: "published",
              published_once: true,
            })
            .eq("id", post.id);
        }
      }

      const destinationNames = selectedDestinations
        .map((dest) => (dest.platform === PLATFORMS.FACEBOOK ? "Facebook" : "YouTube"))
        .join(" + ");
      setSuccess(`Post sent to ${destinationNames}.`);

      setTitle("");
      setDescription("");
      setVisibility("private");
      setCaption("");
      setFile(null);
      setUploadedMediaUrl(null);
      setUploadProgress(0);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageGate>
      <div className="max-w-6xl mx-auto py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-white">Create post</h1>
          <p className="text-zinc-400">Upload once, publish exactly once.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-6">
            {hasYouTube && (
              <>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Upload type</label>
                  <div className="flex flex-wrap gap-2">
                    {(["video", "shorts"] as YouTubeUploadType[]).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setUploadType(type)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                          uploadType === type
                            ? "bg-emerald-500 text-zinc-950"
                            : "border border-zinc-800 text-zinc-300"
                        }`}
                      >
                        {type === "video" ? "Video" : "Shorts"}
                      </button>
                    ))}
                  </div>
                  {uploadType === "shorts" && (
                    <p className="text-xs text-zinc-500 mt-2">
                      Shorts should be vertical and under 60 seconds.
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Title</label>
                  <input
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="Video title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Description (optional)</label>
                  <textarea
                    className="w-full min-h-[120px] rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="Add a short description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Visibility</label>
                  <select
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value as "public" | "unlisted" | "private")}
                  >
                    <option value="public">Public</option>
                    <option value="unlisted">Unlisted</option>
                    <option value="private">Private</option>
                  </select>
                </div>
              </>
            )}
            {hasFacebook && (
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Caption</label>
                <textarea
                  className="w-full min-h-[160px] rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Write your post..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                {hasYouTube ? "Video" : "Media"}
              </label>
              <div className="rounded-lg border border-dashed border-zinc-700 bg-zinc-950 px-4 py-4">
                <div className="flex flex-col gap-3">
                  <input
                    type="file"
                    accept={hasYouTube ? "video/*" : "image/*,video/*"}
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                    className="w-full text-sm text-zinc-400"
                    disabled={uploading || submitting}
                  />
                  {(file || uploadedMediaUrl) && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-zinc-500">
                        <span>{file?.name || "Uploaded asset"}</span>
                        {uploadedMediaUrl ? <span className="text-emerald-400">Ready</span> : null}
                      </div>
                      {!uploadedMediaUrl && (
                        <button
                          type="button"
                          onClick={handleUploadClick}
                          disabled={uploading}
                          className="text-sm bg-zinc-100 text-zinc-900 px-3 py-1 rounded hover:bg-white transition-colors disabled:opacity-50"
                        >
                          {uploading ? "Uploading..." : "Upload Media"}
                        </button>
                      )}
                      {uploading && (
                        <div className="w-full bg-zinc-800 rounded-full h-2">
                          <div
                            className="bg-emerald-500 h-2 rounded-full transition-all"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-300">Schedule</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPostMode("now")}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      postMode === "now"
                        ? "bg-emerald-500 text-zinc-950"
                        : "border border-zinc-800 text-zinc-300"
                    }`}
                  >
                    Post now
                  </button>
                  <button
                    type="button"
                    onClick={() => setPostMode("schedule")}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      postMode === "schedule"
                        ? "bg-emerald-500 text-zinc-950"
                        : "border border-zinc-800 text-zinc-300"
                    }`}
                  >
                    Schedule
                  </button>
                </div>
              </div>
              {postMode === "schedule" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-2">Date</label>
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-2">Time</label>
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                    />
                  </div>
                </div>
              )}
              <div className="text-xs text-zinc-500">Timezone: {timezone}</div>
            </div>

            {error && (
              <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                {success}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                className="flex-1 bg-emerald-500 text-zinc-950 rounded-lg px-6 py-3 hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                onClick={() => handleSubmit(postMode)}
                disabled={submitting || uploading}
              >
                {submitting ? (postMode === "schedule" ? "Scheduling..." : "Publishing...") : postMode === "schedule" ? "Schedule" : "Post now"}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Destinations</h3>
              <p className="text-sm text-zinc-400">Choose one or both platforms.</p>
            </div>
            <div className="space-y-2">
              {accounts.map((account) => {
                const isSelected = selectedDestinations.some(
                  (dest) =>
                    dest.platform === account.platform &&
                    dest.accountId === account.accountId
                );
                const label = `${account.name || "Account"} · ${
                  account.platform === PLATFORMS.FACEBOOK ? "Facebook" : "YouTube"
                }`;
                return (
                  <label
                    key={`${account.platform}-${account.accountId}`}
                    className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-200"
                  >
                    <span>{label}</span>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() =>
                        toggleDestination({
                          platform: account.platform,
                          accountId: account.accountId,
                          name: account.name,
                          recordId: account.recordId,
                        })
                      }
                    />
                  </label>
                );
              })}
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-400">
              {uploadedMediaUrl ? "Media ready" : "No media uploaded"} ·{" "}
              {hasYouTube ? (title ? "Title set" : "Title missing") : caption ? "Caption added" : "Caption missing"}
            </div>
          </div>
        </div>
      </div>
    </PageGate>
  );
}
