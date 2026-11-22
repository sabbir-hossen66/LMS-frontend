'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Course, Video } from '@/types';
import { formatDuration, formatPrice } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import {
  PlayCircle,
  Lock,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  BookOpen,
} from 'lucide-react';

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.id as string;
  const router = useRouter();
  const { user } = useAuth();

  const { data: course, isLoading } = useQuery<Course>({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const res = await apiClient.get(`/courses/${courseId}`);
      return res.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-5xl animate-pulse space-y-6">
        <div className="h-10 bg-muted rounded w-1/2" />
        <div className="h-64 bg-muted rounded-2xl" />
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

  const isEnrolled = course.isEnrolled || user?.role === 'ADMIN';
  const firstVideo = course.videos && course.videos.length > 0 ? course.videos[0] : null;

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      {/* Course Header Banner */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-lg mb-10 overflow-hidden relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="md:col-span-2 space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Full Access Course</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {course.title}
            </h1>

            <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
              {course.description}
            </p>

            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs sm:text-sm font-medium text-muted-foreground">
              <div className="flex items-center space-x-1.5">
                <BookOpen className="w-4 h-4 text-primary" />
                <span>{course.videos?.length || 0} Lessons</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-primary" />
                <span>
                  {formatDuration(
                    course.videos?.reduce((acc, v) => acc + (v.duration || 0), 0) || 0,
                  )}{' '}
                  Total Watch Time
                </span>
              </div>
            </div>
          </div>

          {/* Pricing & CTA Card */}
          <div className="rounded-2xl border border-border bg-background p-6 shadow-sm text-center flex flex-col justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Admission Fee
              </span>
              <div className="text-3xl font-black text-foreground mt-1 mb-4">
                {course.price === 0 ? 'Free' : formatPrice(course.price)}
              </div>
            </div>

            {isEnrolled ? (
              <div className="space-y-3">
                <div className="inline-flex items-center space-x-1.5 text-xs text-emerald-500 font-semibold bg-emerald-500/10 px-3 py-1.5 rounded-lg w-full justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Enrolled & Ready</span>
                </div>
                {firstVideo && (
                  <Link
                    href={`/watch/${course.id}/${firstVideo.id}`}
                    className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span>Watch Lessons</span>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <Link
                  href={user ? `/checkout/${course.id}` : '/login'}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Request Access (bKash)</span>
                </Link>
                <p className="text-[11px] text-muted-foreground">
                  Manual bKash verification with instant access upon approval.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Video Curriculum Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Course Curriculum</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Click any lesson to start streaming
            </p>
          </div>
          <span className="text-xs font-semibold text-muted-foreground">
            {course.videos?.length || 0} Modules
          </span>
        </div>

        <div className="space-y-3">
          {course.videos && course.videos.length > 0 ? (
            course.videos.map((video, idx) => {
              const canPlay = isEnrolled || idx === 0;

              return (
                <div
                  key={video.id}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                    canPlay
                      ? 'border-border bg-card hover:border-primary/50 cursor-pointer'
                      : 'border-border/60 bg-muted/40 opacity-75'
                  }`}
                  onClick={() => {
                    if (canPlay) {
                      router.push(`/watch/${course.id}/${video.id}`);
                    }
                  }}
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs ${
                        canPlay ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {video.order || idx + 1}
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold">{video.title}</h4>
                      {video.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {video.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="text-xs font-mono text-muted-foreground">
                      {formatDuration(video.duration)}
                    </span>

                    {canPlay ? (
                      <span className="inline-flex items-center space-x-1 text-xs font-medium text-primary">
                        <PlayCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">Stream</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 text-xs text-muted-foreground">
                        <Lock className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Locked</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center border border-dashed border-border rounded-xl text-muted-foreground text-sm">
              No lessons have been uploaded for this course yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
