"use client";

import React, { useState } from 'react';

const platforms = [
  { label: 'Instagram', value: 'instagram' },
  { label: 'TikTok', value: 'tiktok' },
  { label: 'YouTube', value: 'youtube' },
  // Add more platforms as needed
];

export default function GenerateContentPage() {
  const [inputText, setInputText] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState(platforms[0].value);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);
    // Placeholder call to /api/generate
    const formData = new FormData();
    formData.append('text', inputText);
    formData.append('platform', selectedPlatform);
    if (file) { formData.append('image', file); }

    try {
      const res = await fetch('/api/generate', { method: 'POST', body: formData });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ error: 'Failed to generate content.' });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto py-10 space-y-6">
      <h1 className="text-2xl font-bold">Content Generator</h1>
      <textarea
        className="w-full p-2 border rounded"
        placeholder="Enter your content, ideas, or post..."
        value={inputText}
        rows={5}
        onChange={(e) => setInputText(e.target.value)}
      />
      <div>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <select
          className="ml-4 border rounded p-1"
          value={selectedPlatform}
          onChange={(e) => setSelectedPlatform(e.target.value)}
        >
          {platforms.map((p) => (
            <option value={p.value} key={p.value}>{p.label}</option>
          ))}
        </select>
      </div>
      <button
        className="bg-blue-600 text-white rounded px-4 py-2"
        onClick={handleGenerate}
        disabled={loading}
      >
        {loading ? 'Generating...' : 'Generate'}
      </button>
      <div className="mt-8">
        <h2 className="font-semibold">Results:</h2>
        {result ? (
          <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
        ) : (
          <p className="text-gray-500">Generated content will appear here.</p>
        )}
      </div>
    </div>
  );
}
