'use client';

import React, { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Course, Video } from '@/types';
import { VideoPlayer } from '@/components/player/VideoPlayer';
import { formatDuration } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import {
  ChevronLeft,
  PlayCircle,
  CheckCircle,
  Lock,
  ListVideo,
  Info,
} from 'lucide-react';

export default function WatchPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const videoId = params.videoId as string;
  const router = useRouter();
  const { user } = useAuth();
  const lastHeartbeatRef = useRef<{ pos: number; time: number }>({ pos: 0, time: Date.now() });

  // Fetch Course with Videos
  const { data: course, isLoading } = useQuery<Course>({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const res = await apiClient.get(`/courses/${courseId}`);
      return res.data.data;
    },
  });

  const videos = course?.videos || [];
  const currentVideo = videos.find((v) => v.id === videoId) || videos[0];
  const currentIndex = videos.findIndex((v) => v.id === currentVideo?.id);
  const nextVideo = currentIndex >= 0 && currentIndex < videos.length - 1 ? videos[currentIndex + 1] : null;

  // Stream URL from authenticated NestJS Range endpoint or external direct/YouTube link
  const streamUrl = currentVideo?.storageKey?.startsWith('http')
    ? currentVideo.storageKey
    : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/videos/${videoId}/stream`;

  const sendHeartbeat = useCallback(
    async (currentPosition: number, delta: number) => {
      if (!user || delta <= 0) return;
      try {
        await apiClient.post('/progress/heartbeat', {
          videoId,
          currentPosition,
          watchedDelta: Math.min(Math.max(1, Math.round(delta)), 30),
        });
      } catch {
        // Ignored
      }
    },
    [user, videoId],
  );

  const handleTimeUpdate = (currentPos: number) => {
    const now = Date.now();
    const elapsedSeconds = (now - lastHeartbeatRef.current.time) / 1000;

    // Send heartbeat every ~10s
    if (elapsedSeconds >= 10) {
      const delta = Math.min(elapsedSeconds, 15);
      sendHeartbeat(currentPos, delta);
      lastHeartbeatRef.current = { pos: currentPos, time: now };
    }
  };

  const handleEnded = () => {
    sendHeartbeat(currentVideo?.duration || 0, 10);
  };

  const handleNext = () => {
    if (nextVideo) {
      router.push(`/watch/${courseId}/${nextVideo.id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 animate-pulse space-y-6">
        <div className="h-6 bg-muted rounded w-1/4" />
        <div className="aspect-video bg-muted rounded-2xl w-full max-w-5xl mx-auto" />
      </div>
    );
  }

  if (!currentVideo) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h3 className="text-lg font-semibold">Video not found</h3>
        <Link href={`/courses/${courseId}`} className="text-primary hover:underline mt-2 inline-block">
          Return to Course
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Back button */}
      <div className="mb-4">
        <Link
          href={`/courses/${courseId}`}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Course Outline: {course?.title}</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Player Column */}
        <div className="lg:col-span-2 space-y-4">
          <VideoPlayer
            key={currentVideo.id}
            videoId={currentVideo.id}
            streamUrl={streamUrl}
            title={currentVideo.title}
            duration={currentVideo.duration}
            initialTime={currentVideo.progress?.lastPosition || 0}
            user={user}
            hasNext={!!nextVideo}
            nextLessonTitle={nextVideo?.title}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            onNext={handleNext}
          />

          {/* Lesson Details */}
          <div className="p-6 rounded-2xl border border-border bg-card">
            <h1 className="text-xl font-bold tracking-tight">{currentVideo.title}</h1>
            {currentVideo.description && (
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                {currentVideo.description}
              </p>
            )}

            <div className="flex items-center space-x-4 mt-4 pt-4 border-t border-border/60 text-xs text-muted-foreground">
              <span>Lesson {currentVideo.order} of {videos.length}</span>
              <span>•</span>
              <span>{formatDuration(currentVideo.duration)}</span>
            </div>
          </div>
        </div>

        {/* Playlist Sidebar */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-border bg-card overflow-hidden sticky top-24">
            <div className="p-4 border-b border-border bg-muted/40 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ListVideo className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold">Course Lessons</h3>
              </div>
              <span className="text-xs font-mono text-muted-foreground">
                {currentIndex + 1} / {videos.length}
              </span>
            </div>

            <div className="max-h-[calc(100vh-250px)] overflow-y-auto divide-y divide-border/60">
              {videos.map((vid, idx) => {
                const isSelected = vid.id === currentVideo.id;
                const canPlay = course?.isEnrolled || user?.role === 'ADMIN' || idx === 0;

                return (
                  <button
                    key={vid.id}
                    disabled={!canPlay}
                    onClick={() => router.push(`/watch/${courseId}/${vid.id}`)}
                    className={`w-full text-left p-3.5 flex items-start space-x-3 transition-colors ${
                      isSelected
                        ? 'bg-primary/10 border-l-4 border-primary'
                        : canPlay
                        ? 'hover:bg-muted/50'
                        : 'opacity-50 cursor-not-allowed bg-muted/20'
                    }`}
                  >
                    <div className="mt-0.5">
                      {isSelected ? (
                        <PlayCircle className="w-4 h-4 text-primary fill-current" />
                      ) : canPlay ? (
                        <span className="w-4 h-4 rounded-full border border-muted-foreground/40 flex items-center justify-center text-[10px] font-mono">
                          {idx + 1}
                        </span>
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs font-medium truncate ${
                          isSelected ? 'text-primary font-bold' : 'text-foreground'
                        }`}
                      >
                        {vid.title}
                      </p>
                      <span className="text-[11px] font-mono text-muted-foreground">
                        {formatDuration(vid.duration)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
