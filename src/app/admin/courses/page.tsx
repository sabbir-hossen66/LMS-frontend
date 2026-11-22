'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Course, CourseStatus } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import {
  Plus,
  BookOpen,
  Video,
  Edit2,
  Trash2,
  ExternalLink,
  Loader2,
  ShieldAlert,
  Upload,
} from 'lucide-react';

export default function AdminCoursesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('2500');
  const [status, setStatus] = useState<CourseStatus>('PUBLISHED');
  const [thumbnail, setThumbnail] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch all courses (admin view)
  const { data: coursesData, isLoading } = useQuery({
    queryKey: ['admin-courses'],
    queryFn: async () => {
      const res = await apiClient.get('/courses');
      return res.data.data;
    },
    enabled: user?.role === 'ADMIN',
  });

  const courses: Course[] = coursesData?.items || [];

  const openCreateModal = () => {
    setEditingCourse(null);
    setTitle('');
    setDescription('');
    setPrice('2500');
    setStatus('PUBLISHED');
    setThumbnail('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (c: Course) => {
    setEditingCourse(c);
    setTitle(c.title);
    setDescription(c.description);
    setPrice(c.price.toString());
    setStatus(c.status);
    setThumbnail(c.thumbnail || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(price) || 0,
        status,
        thumbnail: thumbnail.trim() || undefined,
      };

      if (editingCourse) {
        await apiClient.patch(`/courses/${editingCourse.id}`, payload);
      } else {
        await apiClient.post('/courses', payload);
      }

      await queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to save course');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course and all its video assets?')) return;
    try {
      await apiClient.delete(`/courses/${id}`);
      await queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete course');
    }
  };

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
      </div>
    );
  }

  if (user?.role !== 'ADMIN') {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-md">
        <ShieldAlert className="w-12 h-12 text-destructive mx-auto mb-3" />
        <h2 className="text-xl font-bold">Access Restricted</h2>
        <p className="text-sm text-muted-foreground mt-1">
          You must be logged in as an administrator to manage courses.
        </p>
        <Link href="/login" className="mt-4 inline-block px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold">
          Sign in as Admin
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Course Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create, edit courses and upload protected video content
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          <span>New Course</span>
        </button>
      </div>

      {/* Courses Table / Cards */}
      {isLoading ? (
        <div className="py-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        </div>
      ) : courses.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-border rounded-2xl text-muted-foreground">
          <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p className="font-semibold">No courses created yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      c.status === 'PUBLISHED'
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : 'bg-amber-500/10 text-amber-500'
                    }`}
                  >
                    {c.status}
                  </span>
                  <span className="text-sm font-extrabold text-foreground">
                    {formatPrice(c.price)}
                  </span>
                </div>

                <h3 className="font-bold text-lg text-foreground line-clamp-1">{c.title}</h3>
                <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                  {c.description}
                </p>

                <div className="mt-4 flex items-center space-x-4 text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1 font-medium">
                    <Video className="w-3.5 h-3.5 text-primary" />
                    <span>{c.totalVideos || 0} Videos</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between gap-2">
                <Link
                  href={`/admin/courses/${c.id}/videos`}
                  className="flex items-center space-x-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Manage Videos</span>
                </Link>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => openEditModal(c)}
                    title="Edit"
                    className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    title="Delete"
                    className="p-2 text-muted-foreground hover:text-destructive rounded-lg hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <h2 className="text-xl font-bold">
              {editingCourse ? 'Edit Course' : 'Create New Course'}
            </h2>

            {formError && (
              <p className="p-3 rounded-lg bg-destructive/10 text-destructive text-xs font-medium">
                {formError}
              </p>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Course Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Master NestJS & Clean Architecture"
                  className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Description
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed course description..."
                  className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Price (BDT ৳)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as CourseStatus)}
                    className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="DRAFT">DRAFT</option>
                    <option value="PUBLISHED">PUBLISHED</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Thumbnail Image (File or URL)
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const formData = new FormData();
                      formData.append('file', file);
                      try {
                        const res = await apiClient.post('/courses/upload-thumbnail', formData, {
                          headers: { 'Content-Type': 'multipart/form-data' },
                        });
                        setThumbnail(res.data.data.thumbnailUrl);
                      } catch (err: any) {
                        alert(err.response?.data?.message || 'Failed to upload thumbnail');
                      }
                    }}
                    className="w-full text-xs text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:opacity-90 cursor-pointer"
                  />
                  <input
                    type="url"
                    value={thumbnail}
                    onChange={(e) => setThumbnail(e.target.value)}
                    placeholder="Or enter direct URL: https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity flex items-center space-x-2 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save Course</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
