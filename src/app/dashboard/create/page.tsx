"use client";

import React, { useState } from "react";
import supabase from "@/lib/supabaseClient";

const allowedTypes = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadedMediaUrl, setUploadedMediaUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (selectedFile: File | null) => {
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

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Upload media</h1>
        <p className="text-zinc-400 mt-2">
          Add assets once and reuse them across posts.
        </p>
      </div>

      <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/60 p-8 text-center">
        <div className="mx-auto flex max-w-md flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0 4 4m-4-4-4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Drag & drop your file</h2>
            <p className="text-sm text-zinc-400">
              Supports video, image, and text assets up to your plan limit.
            </p>
          </div>
          <label className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-emerald-400 transition-colors">
            Browse files
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
              disabled={uploading}
            />
          </label>
          <p className="text-xs text-zinc-500">
            Supported: JPG, PNG, GIF, WEBP, MP4, WEBM, MOV
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p className="text-sm font-semibold text-white">Local upload</p>
          <p className="text-xs text-zinc-500 mt-1">Drag & drop or browse files</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 opacity-60">
          <p className="text-sm font-semibold text-white">Cloud storage</p>
          <p className="text-xs text-zinc-500 mt-1">Drive, Dropbox, and more (soon)</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 opacity-60">
          <p className="text-sm font-semibold text-white">Text uploads</p>
          <p className="text-xs text-zinc-500 mt-1">Import scripts and notes (soon)</p>
        </div>
      </div>

      {file && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
          <div className="flex items-center justify-between text-sm text-zinc-400">
            <span>{file.name}</span>
            <span>{uploadedMediaUrl ? "Uploaded" : "Ready to upload"}</span>
          </div>
          {!uploadedMediaUrl && (
            <button
              type="button"
              onClick={handleUploadClick}
              disabled={uploading}
              className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-white transition-colors disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Upload media"}
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
            <div className="flex flex-wrap gap-3">
              <a
                href={`/dashboard/generate?mediaUrl=${encodeURIComponent(uploadedMediaUrl)}`}
                className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-emerald-400 transition-colors"
              >
                Continue to composer
              </a>
              <button
                type="button"
                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-200 hover:border-zinc-500 transition-colors"
                onClick={() => {
                  setFile(null);
                  setUploadedMediaUrl(null);
                  setUploadProgress(0);
                }}
              >
                Upload another file
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}
    </div>
  );
}
