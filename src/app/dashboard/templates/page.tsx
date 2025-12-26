"use client";

import React, { useEffect, useState } from 'react';
import supabase from '@/lib/supabaseClient';

interface Template {
  id: number;
  title: string;
  prompt: string;
  user_id?: string;
  is_custom: boolean;
  created_at?: string;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState({ title: '', prompt: '' });

  useEffect(() => {
    fetchTemplates();
  }, []);

  async function fetchTemplates() {
    try {
      setLoading(true);
      
      // Try to fetch with is_custom ordering (new schema)
      let { data, error } = await supabase
        .from('templates')
        .select('*')
        .order('is_custom', { ascending: true })
        .order('created_at', { ascending: false });

      // If error is about missing column, try without is_custom ordering
      if (error && (error.message?.includes('is_custom') || error.code === '42703')) {
        const fallbackResult = await supabase
          .from('templates')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (fallbackResult.error) throw fallbackResult.error;
        
        // Add default is_custom = false for old schema
        setTemplates((fallbackResult.data || []).map(t => ({ ...t, is_custom: false })));
      } else {
        if (error) throw error;
        setTemplates(data || []);
      }
    } catch (error: any) {
      console.error('Error fetching templates:', {
        message: error?.message || 'Unknown error',
        details: error?.details || error?.hint || error,
        code: error?.code,
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Please log in to create templates');
        return;
      }

      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create template');
      }

      setShowCreateModal(false);
      setFormData({ title: '', prompt: '' });
      fetchTemplates();
    } catch (error: any) {
      alert(error.message || 'Failed to create template');
    }
  }

  async function handleUpdate() {
    if (!editingTemplate) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Please log in to update templates');
        return;
      }

      const res = await fetch('/api/templates', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingTemplate.id,
          ...formData,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update template');
      }

      setEditingTemplate(null);
      setFormData({ title: '', prompt: '' });
      fetchTemplates();
    } catch (error: any) {
      alert(error.message || 'Failed to update template');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Please log in to delete templates');
        return;
      }

      const res = await fetch(`/api/templates?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete template');
      }

      fetchTemplates();
    } catch (error: any) {
      alert(error.message || 'Failed to delete template');
    }
  }

  function openEditModal(template: Template) {
    setEditingTemplate(template);
    setFormData({ title: template.title, prompt: template.prompt });
  }

  function closeModal() {
    setShowCreateModal(false);
    setEditingTemplate(null);
    setFormData({ title: '', prompt: '' });
  }

  const predefinedTemplates = templates.filter(t => !t.is_custom);
  const customTemplates = templates.filter(t => t.is_custom);

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">Templates</h1>
          <p className="text-zinc-600">Use predefined templates or create your own</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-zinc-900 text-white px-4 py-2 rounded-lg hover:bg-zinc-800 transition-colors"
        >
          + Create Template
        </button>
      </div>

      {/* Predefined Templates */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-zinc-900 mb-4">Starter Templates</h2>
        {loading ? (
          <div className="text-center py-8 text-zinc-500">Loading templates...</div>
        ) : predefinedTemplates.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
            <p className="font-medium mb-1">No predefined templates found</p>
            <p className="text-sm">
              Run the SQL in <code className="bg-yellow-100 px-1 rounded">db/seed_templates.sql</code> to add starter templates.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {predefinedTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-white border border-zinc-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-zinc-900 mb-2">{template.title}</h3>
                <p className="text-sm text-zinc-600 mb-4 line-clamp-3">{template.prompt}</p>
                <span className="text-xs text-zinc-400 bg-zinc-100 px-2 py-1 rounded">
                  Predefined
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Custom Templates */}
      <div>
        <h2 className="text-xl font-semibold text-zinc-900 mb-4">Your Templates</h2>
        {loading ? (
          <div className="text-center py-8 text-zinc-500">Loading templates...</div>
        ) : customTemplates.length === 0 ? (
          <div className="text-center py-12 bg-white border border-zinc-200 rounded-lg">
            <p className="text-zinc-500">No custom templates yet</p>
            <p className="text-zinc-400 text-sm mt-2">Create your first template to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-white border border-zinc-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-zinc-900 mb-2">{template.title}</h3>
                <p className="text-sm text-zinc-600 mb-4 line-clamp-3">{template.prompt}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(template)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingTemplate) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">
              {editingTemplate ? 'Edit Template' : 'Create Template'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-zinc-300 rounded-lg px-3 py-2"
                  placeholder="e.g., Quote Post"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Prompt
                </label>
                <textarea
                  value={formData.prompt}
                  onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                  className="w-full border border-zinc-300 rounded-lg px-3 py-2"
                  rows={6}
                  placeholder="Enter the template prompt. Use {topic} as a placeholder for dynamic content."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={editingTemplate ? handleUpdate : handleCreate}
                className="bg-zinc-900 text-white px-4 py-2 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                {editingTemplate ? 'Update' : 'Create'}
              </button>
              <button
                onClick={closeModal}
                className="bg-zinc-100 text-zinc-700 px-4 py-2 rounded-lg hover:bg-zinc-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
