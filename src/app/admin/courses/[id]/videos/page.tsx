'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Course, Video } from '@/types';
import { formatDuration, getMediaUrl } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import {
  ChevronLeft,
  Upload,
  Plus,
  Trash2,
  Video as VideoIcon,
  Image as ImageIcon,
  Loader2,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Layers,
  FolderOpen,
  Edit2,
  X,
  Clock,
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
  const [moduleName, setModuleName] = useState('Module 1: Introduction');
  const [videoDesc, setVideoDesc] = useState('');
  const [order, setOrder] = useState('1');
  const [videoThumbnailUrl, setVideoThumbnailUrl] = useState<string | null>(null);
  const [isUploadingThumb, setIsUploadingThumb] = useState(false);
  const [isFreePreview, setIsFreePreview] = useState(false);
  const [uploadedStorageKey, setUploadedStorageKey] = useState<string | null>(null);
  const [detectedDuration, setDetectedDuration] = useState<number>(0);
  const [detectedMime, setDetectedMime] = useState<string>('video/mp4');

  // Video source mode: FILE upload or external URL (YouTube/Vimeo/Cloud MP4)
  const [videoSourceType, setVideoSourceType] = useState<'FILE' | 'URL'>('FILE');
  const [externalUrl, setExternalUrl] = useState('');
  const [customDurationMinutes, setCustomDurationMinutes] = useState('10');

  // Edit existing video modal state
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editModuleName, setEditModuleName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editOrder, setEditOrder] = useState('1');
  const [editDurationSeconds, setEditDurationSeconds] = useState('0');
  const [editThumbnailUrl, setEditThumbnailUrl] = useState<string | null>(null);
  const [isUploadingEditThumb, setIsUploadingEditThumb] = useState(false);
  const [editIsFreePreview, setEditIsFreePreview] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isCreatingVideo, setIsCreatingVideo] = useState(false);

  // Fetch course details
  const { data: course, isLoading } = useQuery<Course>({
    queryKey: ['course-videos-admin', courseId],
    queryFn: async () => {
      const res = await apiClient.get(`/courses/${courseId}`);
      return res.data.data;
    },
    enabled: user?.role === 'ADMIN',
  });

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingThumb(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await apiClient.post('/videos/upload-thumbnail', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setVideoThumbnailUrl(res.data.data.thumbnailUrl);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Thumbnail image upload failed');
    } finally {
      setIsUploadingThumb(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Immediately detect video duration client-side from file container
    try {
      const tempVideo = document.createElement('video');
      tempVideo.preload = 'metadata';
      tempVideo.src = URL.createObjectURL(file);
      tempVideo.onloadedmetadata = () => {
        window.URL.revokeObjectURL(tempVideo.src);
        if (tempVideo.duration && !isNaN(tempVideo.duration) && isFinite(tempVideo.duration) && tempVideo.duration > 0) {
          setDetectedDuration(Math.round(tempVideo.duration));
        }
      };
    } catch (err) {
      console.warn('Could not read video metadata client-side', err);
    }

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
      if (duration && duration > 0) {
        setDetectedDuration(duration);
      }
      setDetectedMime(mimeType || file.type || 'video/mp4');
      if (!videoTitle) {
        setVideoTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Video upload failed. Check extension and size.';
      setUploadError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreatingVideo) return; // Strictly prevent duplicate creation on double click

    const finalStorageKey = videoSourceType === 'URL' ? externalUrl.trim() : uploadedStorageKey;
    const finalDuration =
      videoSourceType === 'URL'
        ? (parseFloat(customDurationMinutes) || 10) * 60
        : detectedDuration;

    if (!finalStorageKey) {
      alert(
        videoSourceType === 'URL'
          ? 'Please enter a valid video URL (e.g. YouTube or direct MP4 link)'
          : 'Please select and upload a video file first',
      );
      return;
    }

    setIsCreatingVideo(true);
    try {
      await apiClient.post('/videos', {
        courseId,
        title: videoTitle.trim(),
        moduleName: moduleName.trim() || 'Module 1: Introduction',
        description: videoDesc.trim() || undefined,
        thumbnailUrl: videoThumbnailUrl || undefined,
        isFreePreview,
        order: parseInt(order, 10) || 1,
        duration: finalDuration,
        storageKey: finalStorageKey,
        mimeType: videoSourceType === 'URL' ? 'video/external' : detectedMime,
      });

      // Reset
      setVideoTitle('');
      setVideoDesc('');
      setVideoThumbnailUrl(null);
      setIsFreePreview(false);
      setUploadedStorageKey(null);
      setExternalUrl('');
      setDetectedDuration(0);

      await queryClient.invalidateQueries({ queryKey: ['course-videos-admin', courseId] });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add video lesson');
    } finally {
      setIsCreatingVideo(false);
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

  const openEditModal = (vid: Video) => {
    setEditingVideo(vid);
    setEditTitle(vid.title);
    setEditModuleName(vid.moduleName || 'Module 1: Introduction');
    setEditDesc(vid.description || '');
    setEditOrder(vid.order ? vid.order.toString() : '1');
    setEditDurationSeconds((vid.duration || 0).toString());
    setEditThumbnailUrl(vid.thumbnailUrl || null);
    setEditIsFreePreview(Boolean(vid.isFreePreview));
  };

  const handleUpdateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo) return;

    setIsSavingEdit(true);
    try {
      await apiClient.patch(`/videos/${editingVideo.id}`, {
        title: editTitle.trim(),
        moduleName: editModuleName.trim() || 'Module 1: Introduction',
        description: editDesc.trim() || undefined,
        thumbnailUrl: editThumbnailUrl || null,
        isFreePreview: editIsFreePreview,
        order: parseInt(editOrder, 10) || 1,
        duration: parseInt(editDurationSeconds, 10) || 0,
      });

      await queryClient.invalidateQueries({ queryKey: ['course-videos-admin', courseId] });
      setEditingVideo(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update video lesson');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleEditThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingEditThumb(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await apiClient.post('/videos/upload-thumbnail', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setEditThumbnailUrl(res.data.data.thumbnailUrl);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Thumbnail image upload failed');
    } finally {
      setIsUploadingEditThumb(false);
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

  const groupedModules = videos.reduce((acc, v) => {
    const mod = v.moduleName || 'Module 1: Introduction';
    if (!acc[mod]) acc[mod] = [];
    acc[mod].push(v);
    return acc;
  }, {} as Record<string, Video[]>);

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

          {/* Source Type Selector (File vs URL) */}
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-muted/60 border border-border text-xs font-semibold">
            <button
              type="button"
              onClick={() => setVideoSourceType('FILE')}
              className={`py-1.5 px-3 rounded-lg transition-all ${
                videoSourceType === 'FILE'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              📁 Upload File
            </button>
            <button
              type="button"
              onClick={() => setVideoSourceType('URL')}
              className={`py-1.5 px-3 rounded-lg transition-all ${
                videoSourceType === 'URL'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              🔗 YouTube / URL
            </button>
          </div>

          {videoSourceType === 'FILE' ? (
            /* Video File Uploader */
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Select Video File (.mp4, .mov, .webm, .mkv)
              </label>
              <input
                type="file"
                accept=".mp4,.webm,.mov,.mkv,.m4v,.avi,video/*"
                disabled={isUploading}
                onChange={handleFileUpload}
                className="w-full text-xs text-muted-foreground file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:opacity-90 cursor-pointer"
              />
              {isUploading && (
                <p className="text-xs text-primary mt-2 flex items-center space-x-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Streaming file to server...</span>
                </p>
              )}
              {uploadedStorageKey && (
                <div className="mt-2.5 p-3 rounded-xl border border-border bg-muted/40 space-y-2">
                  <p className="text-xs text-emerald-500 font-semibold flex items-center space-x-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span>Video file uploaded successfully</span>
                  </p>
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground font-medium flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        <span>Duration:</span>
                      </span>
                      <span className="font-bold text-foreground">
                        {detectedDuration > 0 ? formatDuration(detectedDuration) : '00:00'} ({detectedDuration}s)
                      </span>
                    </div>
                    <input
                      type="number"
                      min="1"
                      value={detectedDuration || ''}
                      onChange={(e) => setDetectedDuration(parseInt(e.target.value, 10) || 0)}
                      placeholder="Duration in seconds"
                      className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-xs font-mono focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Video URL (YouTube / Vimeo / Cloud MP4) */
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Video URL (YouTube Unlisted, Vimeo, or Direct MP4)
                </label>
                <input
                  type="text"
                  value={externalUrl}
                  onChange={(e) => {
                    setExternalUrl(e.target.value);
                    if (!videoTitle && e.target.value) {
                      setVideoTitle('Lesson Video');
                    }
                  }}
                  placeholder="https://www.youtube.com/watch?v=... or https://.../video.mp4"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  value={customDurationMinutes}
                  onChange={(e) => setCustomDurationMinutes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          )}

          {/* Video Thumbnail Uploader */}
          <div className="pt-2 border-t border-border">
            <label className="text-xs font-semibold text-muted-foreground block mb-1">
              Video Thumbnail Image (Optional)
            </label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              disabled={isUploadingThumb}
              onChange={handleThumbnailUpload}
              className="w-full text-xs text-muted-foreground file:mr-3 file:py-1.5 file:px-2.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-muted file:text-foreground hover:file:opacity-80 cursor-pointer"
            />
            {isUploadingThumb && (
              <p className="text-xs text-primary mt-1 flex items-center space-x-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Uploading thumbnail...</span>
              </p>
            )}
            {videoThumbnailUrl && (
              <div className="mt-2 relative w-full h-24 rounded-xl overflow-hidden border border-border">
                <img
                  src={videoThumbnailUrl}
                  alt="Thumbnail Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setVideoThumbnailUrl(null)}
                  className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full text-[10px]"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          <form onSubmit={handleCreateVideo} className="space-y-3 pt-2">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Module / Section Name
              </label>
              <input
                type="text"
                list="modules-list"
                required
                value={moduleName}
                onChange={(e) => setModuleName(e.target.value)}
                placeholder="e.g. Module 1: Introduction"
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs font-medium focus:ring-2 focus:ring-primary"
              />
              <datalist id="modules-list">
                {Array.from(new Set(videos.map((v) => v.moduleName || 'Module 1: Introduction'))).map(
                  (mod) => (
                    <option key={mod} value={mod} />
                  ),
                )}
              </datalist>
            </div>

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

            {/* Free Preview Toggle */}
            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="isFreePreview"
                checked={isFreePreview}
                onChange={(e) => setIsFreePreview(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
              />
              <label htmlFor="isFreePreview" className="text-xs font-semibold text-foreground cursor-pointer flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Allow Free Preview for Guests/Students</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={
                isCreatingVideo ||
                isUploading ||
                (videoSourceType === 'FILE' ? !uploadedStorageKey : !externalUrl.trim())
              }
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow hover:opacity-90 disabled:opacity-40 transition-opacity flex items-center justify-center space-x-2"
            >
              {isCreatingVideo ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Adding Lesson...</span>
                </>
              ) : (
                <span>Add Lesson to Course</span>
              )}
            </button>
          </form>
        </div>

        {/* Existing Lessons List */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center space-x-2">
              <Layers className="w-4 h-4 text-primary" />
              <span>Organized Course Modules ({Object.keys(groupedModules).length})</span>
            </h3>
            <span className="text-xs text-muted-foreground">{videos.length} Total Lessons</span>
          </div>

          {videos.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-border rounded-2xl text-muted-foreground text-sm">
              No videos added yet. Use the upload panel to add lessons.
            </div>
          ) : (
            Object.entries(groupedModules).map(([moduleTitle, moduleVideos]) => (
              <div
                key={moduleTitle}
                className="rounded-2xl border border-border bg-card/60 overflow-hidden shadow-sm space-y-2 p-4"
              >
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <div className="flex items-center space-x-2">
                    <FolderOpen className="w-4 h-4 text-primary" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                      {moduleTitle}
                    </h4>
                  </div>
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    {moduleVideos.length} lesson{moduleVideos.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="space-y-2 pt-1">
                  {moduleVideos.map((vid, idx) => (
                    <div
                      key={vid.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-border bg-background hover:border-primary/40 transition-all shadow-xs"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-14 h-9 rounded-lg overflow-hidden bg-muted relative shrink-0 border border-border/80">
                          {vid.thumbnailUrl ? (
                            <img
                              src={getMediaUrl(vid.thumbnailUrl)}
                              alt={vid.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-xs">
                              {vid.order || idx + 1}
                            </div>
                          )}
                        </div>

                        <div>
                          <h5 className="text-xs font-semibold flex items-center space-x-2">
                            <span>{vid.title}</span>
                            {vid.isFreePreview && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                PREVIEW
                              </span>
                            )}
                          </h5>
                          <span className="text-[10px] font-mono text-muted-foreground">
                            {formatDuration(vid.duration)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <Link
                          href={`/courses/${courseId}`}
                          target="_blank"
                          className="px-2.5 py-1 text-[11px] rounded-lg bg-muted text-foreground hover:bg-primary hover:text-primary-foreground transition-colors font-medium"
                        >
                          View
                        </Link>
                        <button
                          type="button"
                          onClick={() => openEditModal(vid)}
                          title="Edit Lesson"
                          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteVideo(vid.id)}
                          className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit Lesson Modal */}
      {editingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h2 className="text-lg font-bold">Edit Lesson & Thumbnail</h2>
              <button
                type="button"
                onClick={() => setEditingVideo(null)}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateVideo} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Lesson Title
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Module / Section Name
                  </label>
                  <input
                    type="text"
                    list="modules-list"
                    required
                    value={editModuleName}
                    onChange={(e) => setEditModuleName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary"
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
                    value={editOrder}
                    onChange={(e) => setEditOrder(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Duration (Seconds)
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="0"
                      value={editDurationSeconds}
                      onChange={(e) => setEditDurationSeconds(e.target.value)}
                      placeholder="e.g. 286"
                      className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm font-mono focus:ring-2 focus:ring-primary"
                    />
                    <span className="text-xs font-semibold text-foreground bg-muted px-2.5 py-2 rounded-xl border border-border whitespace-nowrap">
                      {formatDuration(parseInt(editDurationSeconds, 10) || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Lesson Thumbnail */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Lesson Thumbnail Image (Optional)
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    disabled={isUploadingEditThumb}
                    onChange={handleEditThumbnailUpload}
                    className="w-full text-xs text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:opacity-90 cursor-pointer"
                  />
                  {isUploadingEditThumb && (
                    <p className="text-xs text-primary flex items-center space-x-1.5">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Uploading thumbnail...</span>
                    </p>
                  )}
                  {editThumbnailUrl && (
                    <div className="relative w-full h-32 rounded-xl overflow-hidden border border-border bg-muted/40">
                      <img
                        src={getMediaUrl(editThumbnailUrl)}
                        alt="Lesson Thumbnail"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setEditThumbnailUrl(null)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-black text-xs"
                        title="Remove thumbnail"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              {/* Free Preview Toggle */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="editIsFreePreview"
                  checked={editIsFreePreview}
                  onChange={(e) => setEditIsFreePreview(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                />
                <label
                  htmlFor="editIsFreePreview"
                  className="text-xs font-semibold text-foreground cursor-pointer flex items-center space-x-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Allow Free Preview for Guests/Students</span>
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEditingVideo(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity flex items-center space-x-2 disabled:opacity-50"
                >
                  {isSavingEdit && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
