"use client";

import React, { useEffect, useMemo, useState } from "react";
import supabase from "@/lib/supabaseClient";
import { PLATFORMS } from "@/lib/platforms";
import { PageGate, usePageScope } from "@/components/PageScope";
import { useSearchParams } from "next/navigation";

const allowedTypes = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

export default function CreateContentPage() {
  const { selectedAccount } = usePageScope();
  const searchParams = useSearchParams();
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploadedMediaUrl, setUploadedMediaUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [previewPlatform, setPreviewPlatform] = useState("Facebook");

  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    const dateStr = tomorrow.toISOString().split("T")[0];
    if (!scheduledDate) setScheduledDate(dateStr);
    if (!scheduledTime) setScheduledTime("09:00");
  }, [scheduledDate, scheduledTime]);

  useEffect(() => {
    const mediaUrl = searchParams.get("mediaUrl");
    if (mediaUrl) {
      setUploadedMediaUrl(mediaUrl);
      setFile(null);
    }
  }, [searchParams]);

  useEffect(() => {
    async function fetchConnectedPlatforms() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const [facebookResult, youtubeResult] = await Promise.all([
        supabase
          .from("connected_accounts")
          .select("platform, facebook_page_access_token")
          .eq("user_id", session.user.id),
        supabase
          .from("platform_accounts")
          .select("platform")
          .eq("user_id", session.user.id)
          .eq("platform", PLATFORMS.YOUTUBE),
      ]);

      if (facebookResult.error || youtubeResult.error) return;
      const platforms = [
        ...(facebookResult.data || [])
          .filter((acc) => (acc.platform === PLATFORMS.FACEBOOK ? acc.facebook_page_access_token != null : true))
          .map((acc) => acc.platform),
        ...(youtubeResult.data || []).map((acc) => acc.platform),
      ];
      setConnectedPlatforms(platforms);
    }
    fetchConnectedPlatforms();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Unsupported file type. Please upload an image or video.");
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
    try {
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
      const publicUrl = publicUrlData.publicUrl;
      setUploadedMediaUrl(publicUrl);
      return publicUrl;
    } finally {
      setUploading(false);
    }
  };

  const handleUploadClick = async () => {
    setError(null);
    try {
      await uploadMedia();
    } catch (err: any) {
      setError(err.message || "Failed to upload file.");
    }
  };

  const createDraftPost = async (mediaUrl: string | null) => {
    if (!selectedAccount || selectedAccount.platform !== PLATFORMS.FACEBOOK) {
      throw new Error("Please select a Facebook Page first.");
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("Please log in to create a post.");
    }

    const { data, error: insertError } = await supabase
      .from("posts")
      .insert({
        user_id: session.user.id,
        content: content.trim() || null,
        media_url: mediaUrl,
        platform: PLATFORMS.FACEBOOK,
        platform_account_id: selectedAccount.accountId,
        status: "draft",
        scheduled_at: null,
        posted_at: null,
      })
      .select()
      .single();

    if (insertError || !data) {
      throw new Error(insertError?.message || "Failed to save post.");
    }

    return data;
  };

  const handleSubmit = async () => {
    if (!content.trim() && !file && !uploadedMediaUrl) {
      setError("Please add content or upload media.");
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

      const post = await createDraftPost(mediaUrl || null);

      if (scheduleEnabled) {
        if (!scheduledDate || !scheduledTime) {
          throw new Error("Please choose a date and time for scheduling.");
        }
        const scheduledAtDate = new Date(`${scheduledDate}T${scheduledTime}`);
        if (Number.isNaN(scheduledAtDate.getTime()) || scheduledAtDate <= new Date()) {
          throw new Error("Scheduled time must be in the future.");
        }
        const scheduledAt = scheduledAtDate.toISOString();
        const res = await fetch("/api/schedule", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            postId: post.id,
            scheduledAt,
            platform: PLATFORMS.FACEBOOK,
          }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Failed to schedule post.");
        }

        setSuccess("Post scheduled successfully.");
      } else {
        const res = await fetch("/api/facebook/post", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: content.trim() || null,
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
            platform_post_id: published.postId || null,
            platform: PLATFORMS.FACEBOOK,
            platform_account_id: selectedAccount?.accountId,
            status: "published",
          })
          .eq("id", post.id);

        setSuccess("Post published successfully.");
      }

      setContent("");
      setFile(null);
      setUploadedMediaUrl(null);
      setUploadProgress(0);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!content.trim() && !file && !uploadedMediaUrl) {
      setError("Please add content or upload media.");
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
      await createDraftPost(mediaUrl || null);
      setSuccess("Draft saved successfully.");
      setContent("");
      setFile(null);
      setUploadedMediaUrl(null);
      setUploadProgress(0);
    } catch (err: any) {
      setError(err.message || "Failed to save draft.");
    } finally {
      setSubmitting(false);
    }
  };

  const timezone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    []
  );

  const platforms = [
    { id: PLATFORMS.FACEBOOK, label: "Facebook", supported: true },
    { id: PLATFORMS.YOUTUBE, label: "YouTube", supported: false },
    { id: PLATFORMS.INSTAGRAM, label: "Instagram", supported: false },
    { id: "tiktok", label: "TikTok", supported: false },
    { id: "x", label: "X", supported: false },
  ];

  return (
    <PageGate>
      <div className="max-w-6xl mx-auto pt-4 pb-8 space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold text-white">Post composer</h1>
          <p className="text-zinc-400">Write once, publish everywhere.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Caption</label>
              <textarea
                className="w-full min-h-[160px] rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="Write your post..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <div className="mt-2 text-xs text-zinc-500">
                {content.length} characters
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Media</label>
              <div className="rounded-lg border border-dashed border-zinc-700 bg-zinc-950 px-4 py-4">
                <div className="flex flex-col gap-3">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
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
                      {uploadedMediaUrl && (
                        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-xs text-zinc-400">
                          Media uploaded and ready for publishing.
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
                <label className="inline-flex items-center gap-2 text-xs text-zinc-400">
                  <input
                    type="checkbox"
                    checked={scheduleEnabled}
                    onChange={(e) => setScheduleEnabled(e.target.checked)}
                    className="h-4 w-4"
                  />
                  Schedule for later
                </label>
              </div>
              {scheduleEnabled && (
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

            <div className="rounded-lg border border-zinc-800 bg-zinc-950">
              <button
                type="button"
                onClick={() => setAdvancedOpen((prev) => !prev)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm text-zinc-300"
              >
                Advanced options
                <span className="text-zinc-500">{advancedOpen ? "−" : "+"}</span>
              </button>
              {advancedOpen && (
                <div className="border-t border-zinc-800 px-4 py-4 text-sm text-zinc-500">
                  UTM tags, first comment, and per-platform overrides will appear here.
                </div>
              )}
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
                onClick={handleSubmit}
                disabled={submitting || uploading}
              >
                {submitting
                  ? scheduleEnabled
                    ? "Scheduling..."
                    : "Publishing..."
                  : scheduleEnabled
                  ? "Schedule post"
                  : "Publish now"}
              </button>
              <button
                type="button"
                className="rounded-lg border border-zinc-700 px-6 py-3 text-sm font-semibold text-zinc-200 hover:border-zinc-500 transition-colors disabled:opacity-50"
                onClick={handleSaveDraft}
                disabled={submitting || uploading}
              >
                Save draft
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Platforms</h3>
              <p className="text-sm text-zinc-400">Choose where to publish.</p>
            </div>
            <div className="space-y-2">
              {platforms.map((platform) => {
                const connected = connectedPlatforms.includes(platform.id);
                const supported = platform.supported;
                return (
                  <div
                    key={platform.id}
                    className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm"
                  >
                    <div>
                      <p className="text-zinc-200">{platform.label}</p>
                      <p className="text-xs text-zinc-500">
                        {supported ? (connected ? "Connected" : "Not connected") : "Coming soon"}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      disabled={!supported || !connected}
                      checked={supported && connected}
                      onChange={() => undefined}
                    />
                  </div>
                );
              })}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white">Preview</h3>
              <div className="flex flex-wrap gap-2">
                {["Facebook", "Instagram", "YouTube", "TikTok", "X"].map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setPreviewPlatform(label)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                      previewPlatform === label
                        ? "bg-zinc-100 text-zinc-900"
                        : "border border-zinc-800 text-zinc-300"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-400">
                {uploadedMediaUrl ? "Media ready" : "No media selected"} · {content ? "Caption added" : "No caption yet"}
              </div>
              <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                <div className="text-xs text-zinc-500 mb-2">{previewPlatform} Preview</div>
                <div className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-3 text-sm text-zinc-200">
                  {content || "Your caption will appear here."}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageGate>
  );
}
