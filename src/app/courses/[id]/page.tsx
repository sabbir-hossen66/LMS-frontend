'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Course, Video } from '@/types';
import { formatDuration, formatPrice, getMediaUrl } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { VideoPlayer } from '@/components/player/VideoPlayer';
import {
  PlayCircle,
  Lock,
  CheckCircle2,
  Clock,
  ShieldCheck,
  CreditCard,
  BookOpen,
  Sparkles,
  Maximize2,
  ChevronRight,
  Layers,
  FolderOpen,
} from 'lucide-react';

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.id as string;
  const router = useRouter();
  const { user } = useAuth();

  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const { data: course, isLoading } = useQuery<Course>({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const res = await apiClient.get(`/courses/${courseId}`);
      return res.data.data;
    },
  });

  const isEnrolled = Boolean(course?.isEnrolled || user?.role === 'ADMIN');
  const videos = course?.videos || [];

  // Default selected video: first preview video or first lesson
  useEffect(() => {
    if (videos.length > 0 && !selectedVideo) {
      const previewVid = videos.find((v) => v.isFreePreview) || videos[0];
      setSelectedVideo(previewVid);
    }
  }, [videos, selectedVideo]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-5xl animate-pulse space-y-6">
        <div className="h-10 bg-muted rounded w-1/2" />
        <div className="h-72 bg-muted rounded-2xl" />
        <div className="h-40 bg-muted rounded-2xl" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold">Course not found</h2>
        <Link href="/" className="text-primary hover:underline mt-4 inline-block">
          Back to Courses
        </Link>
      </div>
    );
  }

  const activeVideo = selectedVideo || (videos.length > 0 ? videos[0] : null);
  const activeVideoIdx = activeVideo ? videos.findIndex((v) => v.id === activeVideo.id) : 0;
  const canPlayActive = isEnrolled || Boolean(activeVideo?.isFreePreview) || activeVideoIdx === 0;

  const currentStreamUrl = activeVideo?.storageKey?.startsWith('http')
    ? activeVideo.storageKey
    : activeVideo
    ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/videos/${activeVideo.id}/stream`
    : '';

  const rawThumbnail =
    activeVideo?.thumbnailUrl ||
    course.thumbnail ||
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80';
  const activeThumbnail = getMediaUrl(rawThumbnail);

  const groupedModules = videos.reduce((acc, v) => {
    const mod = v.moduleName || 'Module 1: Introduction';
    if (!acc[mod]) acc[mod] = [];
    acc[mod].push(v);
    return acc;
  }, {} as Record<string, Video[]>);

  const handleSelectVideo = (vid: Video, index: number) => {
    setSelectedVideo(vid);
    const canStream = isEnrolled || Boolean(vid.isFreePreview) || index === 0;
    if (canStream) {
      setIsPlaying(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setIsPlaying(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
      {/* Top Hero Video / Thumbnail Showcase */}
      <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-2xl">
        <div className="relative aspect-video w-full bg-black flex items-center justify-center">
          {isPlaying && activeVideo && canPlayActive ? (
            <div className="w-full h-full">
              <VideoPlayer
                videoId={activeVideo.id}
                streamUrl={currentStreamUrl}
                title={activeVideo.title}
                duration={activeVideo.duration}
                user={user}
              />
            </div>
          ) : (
            <div className="relative w-full h-full group">
              <img
                src={activeThumbnail}
                alt={activeVideo?.title || course.title}
                onError={(e) => {
                  const target = e.currentTarget;
                  const fallbackUrl = `https://lms-backend-production-40b7da73.up.railway.app${rawThumbnail.startsWith('/') ? rawThumbnail : '/' + rawThumbnail}`;
                  if (target.src !== fallbackUrl) {
                    target.src = fallbackUrl;
                  }
                }}
                className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

              {/* Play Overlay Button */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                {canPlayActive ? (
                  <button
                    onClick={() => setIsPlaying(true)}
                    className="p-5 sm:p-6 rounded-full bg-primary text-primary-foreground shadow-2xl shadow-primary/50 hover:scale-110 active:scale-95 transition-all flex items-center justify-center group/btn"
                  >
                    <PlayCircle className="w-12 h-12 sm:w-14 sm:h-14 fill-primary-foreground/20" />
                  </button>
                ) : (
                  <div className="p-5 rounded-full bg-muted/80 text-muted-foreground backdrop-blur-md mb-2">
                    <Lock className="w-10 h-10" />
                  </div>
                )}

                <div className="mt-4 space-y-1">
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-black/60 text-white backdrop-blur-md border border-white/20">
                    {canPlayActive ? (
                      activeVideo?.isFreePreview || activeVideoIdx === 0 ? (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>Free Preview Lesson</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Enrolled - Click to Stream</span>
                        </>
                      )
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Enrolled Access Only</span>
                      </>
                    )}
                  </span>
                  <h3 className="text-lg sm:text-2xl font-black text-white tracking-tight drop-shadow-md">
                    {activeVideo ? activeVideo.title : course.title}
                  </h3>
                </div>
              </div>

              {/* Top Bar on Player */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-xs text-white/90">
                <span className="px-3 py-1 rounded-lg bg-black/60 backdrop-blur-md font-semibold border border-white/10">
                  {course.title}
                </span>
                {canPlayActive && (
                  <Link
                    href={`/watch/${course.id}/${activeVideo?.id}`}
                    className="px-3 py-1 rounded-lg bg-black/60 backdrop-blur-md font-semibold border border-white/10 hover:bg-black/90 flex items-center space-x-1 transition-colors"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Watch Theater Room</span>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Video Info Strip Under Player */}
        <div className="p-4 sm:p-6 bg-card border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold text-primary px-2 py-0.5 rounded bg-primary/10">
                Lesson {activeVideo ? activeVideo.order || activeVideoIdx + 1 : 1}
              </span>
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                {activeVideo ? activeVideo.title : course.title}
              </h2>
            </div>
            {activeVideo?.description && (
              <p className="text-xs text-muted-foreground line-clamp-1">
                {activeVideo.description}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-xs font-mono text-muted-foreground flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatDuration(activeVideo?.duration || 0)}</span>
            </span>

            {isEnrolled ? (
              <Link
                href={`/watch/${course.id}/${activeVideo?.id || videos[0]?.id}`}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow hover:opacity-90 flex items-center space-x-1.5"
              >
                <PlayCircle className="w-4 h-4" />
                <span>Full Watch Room</span>
              </Link>
            ) : (
              <Link
                href={user ? `/checkout/${course.id}` : '/login'}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow hover:opacity-90 flex items-center space-x-1.5"
              >
                <CreditCard className="w-4 h-4" />
                <span>Unlock Full Course ({formatPrice(course.price)})</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Course Details & Pricing Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <div className="md:col-span-2 rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-4">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            {course.contentStatus === 'COMPLETED' ? (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Complete Course (সম্পূর্ণ কোর্স)</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                <Clock className="w-3.5 h-3.5" />
                <span>Ongoing Course (চলমান কোর্স - নিয়মিত নতুন ভিডিও আসছে)</span>
              </span>
            )}
          </div>

          <h1 className="text-2xl font-black tracking-tight">{course.title}</h1>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
            {course.description}
          </p>

          <div className="flex flex-wrap items-center gap-6 pt-3 text-xs font-medium text-muted-foreground border-t border-border">
            <div className="flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-primary" />
              <span>{Object.keys(groupedModules).length} Modules</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <BookOpen className="w-4 h-4 text-primary" />
              <span>{videos.length} Video Lessons</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-primary" />
              <span>
                {formatDuration(videos.reduce((acc, v) => acc + (v.duration || 0), 0))} Total Runtime
              </span>
            </div>
            <div className="flex items-center space-x-1.5 text-emerald-500 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Certificate Access</span>
            </div>
          </div>
        </div>

        {/* Pricing / Admission Box */}
        <div className="rounded-3xl border border-border bg-card p-6 text-center space-y-4 shadow-sm">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">
              Admission Price
            </span>
            <div className="text-3xl font-black text-foreground mt-1">
              {course.price === 0 ? 'Free' : formatPrice(course.price)}
            </div>
          </div>

          {isEnrolled ? (
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-1.5 text-xs text-emerald-500 font-bold bg-emerald-500/10 px-3 py-2 rounded-xl w-full justify-center border border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4" />
                <span>You Have Full Access</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <Link
                href={user ? `/checkout/${course.id}` : '/login'}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-md hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>Request Access (bKash)</span>
              </Link>
              <p className="text-[11px] text-muted-foreground leading-normal">
                Pay via bKash Send Money to Admin Sabbir Hossen & submit Transaction ID for instant activation.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Course Curriculum (with Video Thumbnails & Modules) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Course Curriculum & Modules</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Structured step-by-step learning modules with free preview lessons
            </p>
          </div>
          <span className="text-xs font-semibold text-primary px-3 py-1 bg-primary/10 rounded-full">
            {Object.keys(groupedModules).length} Modules • {videos.length} Lessons
          </span>
        </div>

        <div className="space-y-6">
          {Object.keys(groupedModules).length > 0 ? (
            Object.entries(groupedModules).map(([moduleTitle, moduleVideos], mIdx) => {
              const moduleDuration = moduleVideos.reduce((acc, v) => acc + (v.duration || 0), 0);
              return (
                <div
                  key={moduleTitle}
                  className="rounded-3xl border border-border bg-card/60 overflow-hidden shadow-sm space-y-3 p-4 sm:p-5"
                >
                  {/* Module Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-border/70">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-1.5 rounded-xl bg-primary/10 text-primary">
                        <FolderOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Module {mIdx + 1}
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-foreground">
                          {moduleTitle}
                        </h3>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-muted-foreground block">
                        {moduleVideos.length} lesson{moduleVideos.length > 1 ? 's' : ''}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {formatDuration(moduleDuration)}
                      </span>
                    </div>
                  </div>

                  {/* Module Lessons */}
                  <div className="space-y-2.5 pt-1">
                    {moduleVideos.map((vid) => {
                      const globalIdx = videos.findIndex((v) => v.id === vid.id);
                      const canPlayThis = isEnrolled || Boolean(vid.isFreePreview) || globalIdx === 0;
                      const isSelected = activeVideo?.id === vid.id;
                      const rawThumb = vid.thumbnailUrl || course.thumbnail;
                      const vidThumb = getMediaUrl(rawThumb);

                      return (
                        <div
                          key={vid.id}
                          onClick={() => handleSelectVideo(vid, globalIdx)}
                          className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer gap-3 ${
                            isSelected
                              ? 'border-primary bg-primary/5 shadow-sm'
                              : canPlayThis
                              ? 'border-border bg-background hover:border-primary/50'
                              : 'border-border/60 bg-muted/30 opacity-80'
                          }`}
                        >
                          <div className="flex items-center space-x-3.5">
                            {/* Video Thumbnail */}
                            <div className="w-24 h-14 rounded-xl overflow-hidden bg-muted relative shrink-0 border border-border group">
                              {vidThumb ? (
                                <img
                                  src={vidThumb}
                                  alt={vid.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-xs">
                                  {vid.order || globalIdx + 1}
                                </div>
                              )}

                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                {canPlayThis ? (
                                  <PlayCircle className="w-5 h-5 text-white/90 drop-shadow" />
                                ) : (
                                  <Lock className="w-4 h-4 text-white/80 drop-shadow" />
                                )}
                              </div>
                            </div>

                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="text-[10px] font-mono font-semibold text-muted-foreground">
                                  #{vid.order || globalIdx + 1}
                                </span>
                                <h4 className="text-sm font-bold text-foreground hover:text-primary transition-colors">
                                  {vid.title}
                                </h4>
                                {(vid.isFreePreview || globalIdx === 0) && (
                                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                    FREE PREVIEW
                                  </span>
                                )}
                              </div>
                              {vid.description && (
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                  {vid.description}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-3 self-end sm:self-center">
                            <span className="text-xs font-mono text-muted-foreground">
                              {formatDuration(vid.duration)}
                            </span>

                            {canPlayThis ? (
                              <span className="inline-flex items-center space-x-1 text-xs font-bold text-primary px-2.5 py-1 rounded-lg bg-primary/10">
                                <PlayCircle className="w-3.5 h-3.5" />
                                <span>{isSelected && isPlaying ? 'Playing' : 'Watch'}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 text-xs text-muted-foreground px-2 py-1 rounded-lg bg-muted">
                                <Lock className="w-3.5 h-3.5" />
                                <span>Locked</span>
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center border border-dashed border-border rounded-2xl text-muted-foreground text-sm">
              No lessons have been uploaded for this course yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
