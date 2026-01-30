"use client";

import React, { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";
import { PLATFORMS } from "@/lib/platforms";
import { PageGate, usePageScope } from "@/components/PageScope";

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
  const { selectedPage } = usePageScope();
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

  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    const dateStr = tomorrow.toISOString().split("T")[0];
    if (!scheduledDate) setScheduledDate(dateStr);
    if (!scheduledTime) setScheduledTime("09:00");
  }, [scheduledDate, scheduledTime]);

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
    if (!selectedPage) {
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
        platform_account_id: selectedPage.pageId,
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
            platform_account_id: selectedPage?.pageId,
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

  return (
    <PageGate>
      <div className="max-w-4xl mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">Create Post</h1>
          <p className="text-zinc-600">Create, upload, and schedule in one place.</p>
        </div>

        <div className="bg-white rounded-lg border border-zinc-200 p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Post Content
            </label>
            <textarea
              className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
              placeholder="Write your post..."
              value={content}
              rows={6}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Media (Optional)
            </label>
            <div className="space-y-2">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm"
                disabled={uploading || submitting}
              />
              {file && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>{file.name}</span>
                    {uploadedMediaUrl ? <span className="text-green-600">Uploaded</span> : null}
                  </div>
                  {!uploadedMediaUrl && (
                    <button
                      type="button"
                      onClick={handleUploadClick}
                      disabled={uploading}
                      className="text-sm bg-zinc-100 text-zinc-700 px-3 py-1 rounded hover:bg-zinc-200 transition-colors disabled:opacity-50"
                    >
                      {uploading ? "Uploading..." : "Upload Media"}
                    </button>
                  )}
                  {uploading && (
                    <div className="w-full bg-zinc-100 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}
                  {uploadedMediaUrl && file.type.startsWith("image/") && (
                    <img
                      src={uploadedMediaUrl}
                      alt="Uploaded preview"
                      className="max-w-xs rounded border border-zinc-200"
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-zinc-200 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-700">Schedule for later</span>
              <input
                type="checkbox"
                checked={scheduleEnabled}
                onChange={(e) => setScheduleEnabled(e.target.checked)}
                className="h-4 w-4"
              />
            </div>

            {scheduleEnabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full border border-zinc-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">Time</label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full border border-zinc-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
              {success}
            </div>
          )}

          <button
            className="w-full bg-zinc-900 text-white rounded-lg px-6 py-3 hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            onClick={handleSubmit}
            disabled={submitting || uploading}
          >
            {submitting
              ? scheduleEnabled
                ? "Scheduling..."
                : "Posting..."
              : scheduleEnabled
              ? "Schedule Post"
              : "Post Now"}
          </button>
        </div>
      </div>
    </PageGate>
  );
}
