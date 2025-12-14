"use client";

import React, { useState } from 'react';
import supabase from '@/lib/supabaseClient';
import { PLATFORM_LIST, PLATFORMS, Platform } from '@/lib/platforms';

const platforms = PLATFORM_LIST;

export default function GenerateContentPage() {
  const [inputText, setInputText] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(PLATFORMS.FACEBOOK);
  const [file, setFile] = useState<File | null>(null);
  const [uploadedMediaUrl, setUploadedMediaUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadedMediaUrl(null); // Reset uploaded URL when file changes
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Please log in to upload media');
      }

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload file');
      }

      setUploadedMediaUrl(data.url);
    } catch (err: any) {
      setError(err.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      setError('Please enter some content to generate');
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Please log in to generate content');
      }

      // If file is selected but not uploaded, upload it first
      let mediaUrl = uploadedMediaUrl;
      if (file && !uploadedMediaUrl) {
        const formData = new FormData();
        formData.append('file', file);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadData.error || 'Failed to upload file');
        }
        mediaUrl = uploadData.url;
        setUploadedMediaUrl(mediaUrl);
      }

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          text: inputText,
          platform: selectedPlatform,
          media_url: mediaUrl || null,
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate content');
      }

      setResult(data);
      // Reset form after successful generation
      setInputText('');
      setFile(null);
      setUploadedMediaUrl(null);
    } catch (err: any) {
      setError(err.message || 'Failed to generate content');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-zinc-900 mb-2">Content Generator</h1>
        <p className="text-zinc-600">Create AI-powered social media content</p>
      </div>

      <div className="bg-white rounded-lg border border-zinc-200 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2">
            Content Input *
          </label>
          <textarea
            className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
            placeholder="Enter your content, ideas, or post topic..."
            value={inputText}
            rows={6}
            onChange={(e) => setInputText(e.target.value)}
          />
          <p className="text-xs text-zinc-500 mt-1">
            Describe your content idea or upload media for AI analysis
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Platform
            </label>
            <select
              className="w-full border border-zinc-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value as Platform)}
            >
              {platforms.map((p) => (
                <option value={p.value} key={p.value}>{p.label}</option>
              ))}
            </select>
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
                disabled={uploading || loading}
              />
              <p className="text-xs text-zinc-500">
                Upload images or videos. You can upload now or it will upload automatically when generating.
              </p>
              {file && (
                <div className="space-y-2">
                  <p className="text-xs text-zinc-500">{file.name}</p>
                  {!uploadedMediaUrl ? (
                    <button
                      type="button"
                      onClick={handleUpload}
                      disabled={uploading}
                      className="text-sm bg-zinc-100 text-zinc-700 px-3 py-1 rounded hover:bg-zinc-200 transition-colors disabled:opacity-50"
                    >
                      {uploading ? 'Uploading...' : 'Upload Media'}
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-green-600 font-medium">✓ Uploaded</span>
                        <a
                          href={uploadedMediaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          View
                        </a>
                      </div>
                      {uploadedMediaUrl && file.type.startsWith('image/') && (
                        <img
                          src={uploadedMediaUrl}
                          alt="Uploaded preview"
                          className="max-w-xs rounded border border-zinc-200"
                        />
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            {error}
          </div>
        )}

        <button
          className="w-full bg-zinc-900 text-white rounded-lg px-6 py-3 hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          onClick={handleGenerate}
          disabled={loading || uploading || !inputText.trim()}
        >
          {loading 
            ? (file && !uploadedMediaUrl ? 'Uploading & Generating...' : 'Generating with AI...')
            : 'Generate Content'}
        </button>
      </div>

      {result && result.result && (
        <div className="mt-8 bg-white rounded-lg border border-zinc-200 p-6">
          <h2 className="text-xl font-semibold text-zinc-900 mb-4">Generated Content</h2>
          
          <div className="space-y-4">
            {result.result.title && (
              <div>
                <h3 className="text-sm font-medium text-zinc-700 mb-1">Title</h3>
                <p className="text-zinc-900 font-medium">{result.result.title}</p>
              </div>
            )}

            {result.result.description && (
              <div>
                <h3 className="text-sm font-medium text-zinc-700 mb-1">Caption</h3>
                <p className="text-zinc-900 whitespace-pre-wrap">{result.result.description}</p>
              </div>
            )}

            {result.result.hashtags && result.result.hashtags.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-zinc-700 mb-1">Hashtags</h3>
                <div className="flex flex-wrap gap-2">
                  {result.result.hashtags.map((tag: string, idx: number) => (
                    <span key={idx} className="bg-zinc-100 text-zinc-700 px-3 py-1 rounded text-sm">
                      {tag.startsWith('#') ? tag : `#${tag}`}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {result.result.optimalTime && (
              <div>
                <h3 className="text-sm font-medium text-zinc-700 mb-1">Optimal Posting Time</h3>
                <p className="text-zinc-600">{result.result.optimalTime}</p>
              </div>
            )}

            {result.result.variants && result.result.variants.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-zinc-700 mb-2">Alternative Variants</h3>
                <div className="space-y-3">
                  {result.result.variants.map((variant: any, idx: number) => (
                    <div key={idx} className="bg-zinc-50 rounded-lg p-4 border border-zinc-200">
                      {variant.title && (
                        <p className="font-medium text-zinc-900 mb-1">{variant.title}</p>
                      )}
                      {variant.caption && (
                        <p className="text-zinc-700 text-sm">{variant.caption}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
