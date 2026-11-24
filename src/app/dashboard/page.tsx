'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/context/auth-context';
import { formatDuration } from '@/lib/utils';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  TrendingUp,
  PlayCircle,
  ArrowRight,
  Loader2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function StudentDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['student-dashboard-metrics'],
    queryFn: async () => {
      const res = await apiClient.get('/analytics/student-dashboard');
      return res.data.data;
    },
    enabled: !!user,
  });

  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        <p className="text-sm text-muted-foreground mt-2">Loading your learning analytics...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-md">
        <h2 className="text-xl font-bold">Please Sign In</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Sign in to view your learning dashboard and progress.
        </p>
        <Link
          href="/login"
          className="mt-4 inline-block px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const {
    overview = {
      enrolledCoursesCount: 0,
      videosCompletedCount: 0,
      totalWatchTimeSeconds: 0,
      overallProgressPercentage: 0,
    },
    continueWatching,
    courseProgressList = [],
    dailyWatchTime = [],
  } = metrics || {};

  const donutData = [
    { name: 'Completed', value: overview.videosCompletedCount, color: '#3b82f6' },
    {
      name: 'Remaining',
      value: Math.max(0, 10 - overview.videosCompletedCount),
      color: '#e2e8f0',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-10 space-y-10 max-w-6xl">
      {/* Welcome Greeting */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user.name}! 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track your course completion, watch hours, and continue right where you stopped.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          <span>Browse Catalog</span>
        </Link>
      </div>

      {/* 4 Stat Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl border border-border bg-card shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-medium block">Enrolled Courses</span>
            <span className="text-2xl font-black">{overview.enrolledCoursesCount}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-medium block">Completed Lessons</span>
            <span className="text-2xl font-black">{overview.videosCompletedCount}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-medium block">Total Watch Time</span>
            <span className="text-2xl font-black">
              {formatDuration(overview.totalWatchTimeSeconds)}
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-medium block">Overall Progress</span>
            <span className="text-2xl font-black">{overview.overallProgressPercentage}%</span>
          </div>
        </div>
      </div>

      {/* Continue Watching Section */}
      {continueWatching && (
        <section className="rounded-3xl border border-primary/30 bg-gradient-to-r from-primary/10 via-amber-500/5 to-transparent p-6 sm:p-8 shadow-sm">
          <div className="flex items-center space-x-2 text-xs font-bold text-primary uppercase tracking-wider mb-3">
            <Sparkles className="w-4 h-4" />
            <span>Continue Watching</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2 space-y-2">
              <span className="text-xs text-muted-foreground font-medium">
                {continueWatching.courseTitle}
              </span>
              <h3 className="text-xl font-bold text-foreground">
                {continueWatching.videoTitle}
              </h3>

              {/* Progress bar */}
              <div className="space-y-1 pt-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                  <span>{formatDuration(continueWatching.lastPosition)}</span>
                  <span>{continueWatching.percentage}% watched</span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${continueWatching.percentage}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-start md:justify-end">
              <Link
                href={`/watch/${continueWatching.courseId}/${continueWatching.videoId}`}
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow hover:opacity-90 transition-opacity"
              >
                <PlayCircle className="w-5 h-5" />
                <span>Resume Lesson</span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Daily Watch Time Bar Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span>Watch Time This Week</span>
            </h3>
            <span className="text-xs text-muted-foreground">Daily Minutes</span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyWatchTime}>
                <XAxis
                  dataKey="dayName"
                  stroke="#888888"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val}m`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg bg-card border border-border p-2 shadow-md text-xs">
                          <p className="font-semibold">{payload[0].payload.date}</p>
                          <p className="text-primary font-bold">{payload[0].value} minutes watched</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="minutes" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Completion Donut Chart */}
        <div className="lg:col-span-1 rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base mb-1">Lesson Completion</h3>
            <p className="text-xs text-muted-foreground">Overall ratio across enrolled courses</p>
          </div>

          <div className="h-48 w-full flex items-center justify-center relative my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black">{overview.overallProgressPercentage}%</span>
              <span className="text-[10px] text-muted-foreground font-semibold uppercase">Done</span>
            </div>
          </div>

          <div className="flex items-center justify-around text-xs pt-2 border-t border-border">
            <div className="flex items-center space-x-1.5">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span>{overview.videosCompletedCount} Completed</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-3 h-3 rounded-full bg-muted" />
              <span>In Progress</span>
            </div>
          </div>
        </div>
      </div>

      {/* Per-Course Progress List */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight">Your Enrolled Courses</h2>

        {courseProgressList.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-border rounded-2xl text-muted-foreground text-sm">
            You are not currently enrolled in any courses.{' '}
            <Link href="/" className="text-primary font-semibold hover:underline">
              Browse available courses
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {courseProgressList.map((cp: any) => (
              <div
                key={cp.courseId}
                className="p-5 rounded-2xl border border-border bg-card shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 flex-1">
                  <h4 className="font-bold text-base">{cp.title}</h4>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>
                      {cp.completedVideos} / {cp.totalVideos} Lessons Completed
                    </span>
                    <span>•</span>
                    <span>{formatDuration(cp.watchedSeconds)} watched</span>
                  </div>

                  <div className="w-full max-w-md h-2 rounded-full bg-muted overflow-hidden mt-2">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${cp.progressPercentage}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="text-sm font-extrabold text-foreground">
                    {cp.progressPercentage}%
                  </span>
                  {cp.firstVideoId && (
                    <Link
                      href={`/watch/${cp.courseId}/${cp.firstVideoId}`}
                      className="inline-flex items-center space-x-1 px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90"
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
