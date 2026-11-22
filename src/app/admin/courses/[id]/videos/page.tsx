'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Course, Video } from '@/types';
import { formatDuration } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import {
  ChevronLeft,
  Upload,
  Plus,
  Trash2,
  Video as VideoIcon,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

export default function CourseVideosManagementPage() {
  const params = useParams();
  const courseId = params.id as string;
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // New video metadata form
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDesc, setVideoDesc] = useState('');
  const [order, setOrder] = useState('1');
  const [uploadedStorageKey, setUploadedStorageKey] = useState<string | null>(null);
  const [detectedDuration, setDetectedDuration] = useState<number>(0);
  const [detectedMime, setDetectedMime] = useState<string>('video/mp4');

  // Fetch course details
  const { data: course, isLoading } = useQuery<Course>({
    queryKey: ['course-videos-admin', courseId],
    queryFn: async () => {
      const res = await apiClient.get(`/courses/${courseId}`);
      return res.data.data;
    },
    enabled: user?.role === 'ADMIN',
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await apiClient.post('/videos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const { storageKey, duration, mimeType } = res.data.data;
      setUploadedStorageKey(storageKey);
      setDetectedDuration(duration || 0);
      setDetectedMime(mimeType || 'video/mp4');
      if (!videoTitle) {
        setVideoTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    } catch (err: any) {
      setUploadError(err.response?.data?.message || 'Video upload failed. Check extension and size.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedStorageKey) {
      alert('Please upload a video file first');
      return;
    }

    try {
      await apiClient.post('/videos', {
        courseId,
        title: videoTitle.trim(),
        description: videoDesc.trim() || undefined,
        order: parseInt(order, 10) || 1,
        duration: detectedDuration,
        storageKey: uploadedStorageKey,
        mimeType: detectedMime,
      });

      // Reset
      setVideoTitle('');
      setVideoDesc('');
      setUploadedStorageKey(null);
      setDetectedDuration(0);

      await queryClient.invalidateQueries({ queryKey: ['course-videos-admin', courseId] });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add video lesson');
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;
    try {
      await apiClient.delete(`/videos/${videoId}`);
      await queryClient.invalidateQueries({ queryKey: ['course-videos-admin', courseId] });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete video');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
      </div>
    );
  }

  const videos = course?.videos || [];

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <div className="mb-6">
        <Link
          href="/admin/courses"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to All Courses</span>
        </Link>
      </div>

      <div className="flex items-center justify-between pb-6 border-b border-border mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{course?.title}</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Upload and arrange video lessons for this course
          </p>
        </div>
        <span className="text-xs font-mono px-3 py-1 bg-primary/10 text-primary font-semibold rounded-lg">
          {videos.length} Total Lessons
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Upload Form */}
        <div className="md:col-span-1 rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold flex items-center space-x-2">
            <Plus className="w-4 h-4 text-primary" />
            <span>Add New Lesson</span>
          </h3>

          {uploadError && (
            <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-xs flex items-start space-x-1.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Video File Uploader */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">
              Select Video File (.mp4, .webm)
            </label>
            <input
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              disabled={isUploading}
              onChange={handleFileUpload}
              className="w-full text-xs text-muted-foreground file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:opacity-90 cursor-pointer"
            />
            {isUploading && (
              <p className="text-xs text-primary mt-2 flex items-center space-x-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Uploading & detecting duration...</span>
              </p>
            )}
            {uploadedStorageKey && (
              <p className="text-xs text-emerald-500 mt-2 flex items-center space-x-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>File uploaded ({formatDuration(detectedDuration)})</span>
              </p>
            )}
          </div>

          <form onSubmit={handleCreateVideo} className="space-y-3 pt-2">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Lesson Title
              </label>
              <input
                type="text"
                required
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                placeholder="e.g. 02 - Project Setup"
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Lesson Order #
              </label>
              <input
                type="number"
                min="1"
                required
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Description (Optional)
              </label>
              <textarea
                rows={2}
                value={videoDesc}
                onChange={(e) => setVideoDesc(e.target.value)}
                placeholder="Key concepts covered..."
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={!uploadedStorageKey}
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              Add Lesson to Course
            </button>
          </form>
        </div>

        {/* Existing Lessons List */}
        <div className="md:col-span-2 space-y-3">
          <h3 className="text-sm font-bold">Uploaded Lessons</h3>

          {videos.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-border rounded-2xl text-muted-foreground text-sm">
              No videos added yet. Use the upload panel to add lessons.
            </div>
          ) : (
            videos.map((vid, idx) => (
              <div
                key={vid.id}
                className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/40 transition-all shadow-sm"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                    {vid.order || idx + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">{vid.title}</h4>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      {formatDuration(vid.duration)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Link
                    href={`/watch/${courseId}/${vid.id}`}
                    target="_blank"
                    className="px-3 py-1 text-xs rounded-lg bg-muted text-foreground hover:bg-primary hover:text-primary-foreground transition-colors font-medium"
                  >
                    Preview
                  </Link>
                  <button
                    onClick={() => handleDeleteVideo(vid.id)}
                    className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
