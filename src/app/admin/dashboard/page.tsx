'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/context/auth-context';
import { AdminNav } from '@/components/layout/AdminNav';
import { formatPrice } from '@/lib/utils';
import {
  Users,
  BookOpen,
  Clock,
  DollarSign,
  TrendingUp,
  Loader2,
  ShieldAlert,
  Calendar,
  Flame,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export default function AdminDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/dashboard');
      return res.data.data;
    },
    enabled: user?.role === 'ADMIN',
  });

  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        <p className="text-sm text-muted-foreground mt-2">Loading platform analytics...</p>
      </div>
    );
  }

  if (user?.role !== 'ADMIN') {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-md">
        <ShieldAlert className="w-12 h-12 text-destructive mx-auto mb-3" />
        <h2 className="text-xl font-bold">Admin Privileges Required</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Sign in with an admin account to access the control panel.
        </p>
      </div>
    );
  }

  const {
    stats = {
      totalStudents: 0,
      totalCourses: 0,
      pendingRequests: 0,
      approvedRequests: 0,
      revenue: 0,
    },
    charts = [],
    mostWatchedCourses = [],
    recentSignups = [],
  } = dashboard || {};

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl space-y-8">
      {/* Admin Navigation Bar */}
      <AdminNav />

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor revenue, enrollments, student signups, and platform activity.
        </p>
      </div>

      {/* 4 Stat Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl border border-border bg-card shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-medium block">Total Students</span>
            <span className="text-2xl font-black">{stats.totalStudents}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-medium block">Total Courses</span>
            <span className="text-2xl font-black">{stats.totalCourses}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-medium block">Pending Requests</span>
            <span className="text-2xl font-black">{stats.pendingRequests}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-medium block">Total Revenue</span>
            <span className="text-2xl font-black">{formatPrice(stats.revenue)}</span>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Signups Over Time (14 Days) */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span>Student Signups (14 Days)</span>
            </h3>
            <span className="text-xs text-muted-foreground">New Registrations</span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts}>
                <defs>
                  <linearGradient id="signupGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg bg-card border border-border p-2 shadow-md text-xs">
                          <p className="font-semibold">{payload[0].payload.date}</p>
                          <p className="text-primary font-bold">{payload[0].value} new students</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="signups" stroke="#3b82f6" strokeWidth={2} fill="url(#signupGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Over Time (14 Days) */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-emerald-500" />
              <span>Revenue Growth (14 Days)</span>
            </h3>
            <span className="text-xs text-muted-foreground">Approved bKash Fees</span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts}>
                <XAxis dataKey="day" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `৳${v}`} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg bg-card border border-border p-2 shadow-md text-xs">
                          <p className="font-semibold">{payload[0].payload.date}</p>
                          <p className="text-emerald-500 font-bold">{formatPrice(Number(payload[0].value))}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Most Watched Courses & Recent Signups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Most Watched Courses */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-base flex items-center space-x-2">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Most Watched Courses</span>
          </h3>

          <div className="space-y-3">
            {mostWatchedCourses.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">
                Watch sessions will appear here as students stream videos.
              </p>
            ) : (
              mostWatchedCourses.map((c: any, idx: number) => (
                <div
                  key={c.courseId}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-border/80 bg-background"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-md bg-muted text-foreground flex items-center justify-center text-xs font-mono font-bold">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-semibold">{c.title}</span>
                  </div>
                  <span className="text-xs font-mono text-primary font-bold">
                    {c.totalWatchMinutes} mins
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Student Signups */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base flex items-center space-x-2">
              <Users className="w-4 h-4 text-blue-500" />
              <span>Recent Signups</span>
            </h3>
            <Link href="/admin/students" className="text-xs text-primary font-semibold hover:underline">
              View All
            </Link>
          </div>

          <div className="divide-y divide-border/60">
            {recentSignups.map((s: any) => (
              <div key={s.id} className="py-3 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold">{s.name}</h4>
                  <p className="text-[11px] text-muted-foreground">{s.email}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground block">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </span>
                  <span className="text-[10px] font-semibold text-primary">
                    {s._count?.enrollments || 0} Enrollments
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
