'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Course } from '@/types';
import { formatPrice } from '@/lib/utils';
import { BookOpen, Video, Users, CheckCircle, ArrowRight, Sparkles, PlayCircle } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

export default function HomePage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');

  const { data: coursesData, isLoading } = useQuery({
    queryKey: ['courses', search],
    queryFn: async () => {
      const res = await apiClient.get('/courses', {
        params: { search: search || undefined },
      });
      return res.data.data;
    },
  });

  const courses: Course[] = coursesData?.items || [];

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto mb-16 pt-6">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4 border border-primary/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Gen Enterprise Engineering LMS</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6">
          Master Modern Tech with{' '}
          <span className="bg-gradient-to-r from-primary via-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Real-World Projects
          </span>
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-8">
          Production-grade curriculum built for engineers. Enjoy high-speed seekable range video streaming,
          interactive dashboards, and streamlined payment flows.
        </p>

        {/* Search Bar */}
        <div className="max-w-md mx-auto flex items-center relative shadow-sm">
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary pl-10"
          />
          <BookOpen className="w-4 h-4 text-muted-foreground absolute left-3.5" />
        </div>
      </section>

      {/* Courses Catalog Section */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Available Courses</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Select a course to preview lessons or enroll
            </p>
          </div>
          <span className="text-sm font-semibold text-muted-foreground">
            {courses.length} course{courses.length === 1 ? '' : 's'} available
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-6 animate-pulse space-y-4">
                <div className="h-44 bg-muted rounded-xl" />
                <div className="h-6 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-10 bg-muted rounded-xl" />
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <h3 className="text-lg font-semibold">No courses found</h3>
            <p className="text-sm mt-1">Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="group flex flex-col justify-between rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div>
                  {/* Thumbnail / Header */}
                  <div className="relative h-48 bg-muted overflow-hidden">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-blue-500/10">
                        <PlayCircle className="w-12 h-12 text-primary opacity-60" />
                      </div>
                    )}
                    {course.isEnrolled && (
                      <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500 text-white flex items-center space-x-1 shadow-md">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Enrolled</span>
                      </span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-1">
                      {course.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>

                    <div className="flex items-center space-x-4 mt-4 text-xs text-muted-foreground font-medium">
                      <div className="flex items-center space-x-1">
                        <Video className="w-3.5 h-3.5" />
                        <span>{course.totalVideos || 0} Lessons</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-3.5 h-3.5" />
                        <span>{course.totalStudents || 0} Students</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-5 pt-0 border-t border-border/50 flex items-center justify-between mt-4">
                  <div>
                    <span className="text-xs text-muted-foreground block">Course Fee</span>
                    <span className="text-lg font-extrabold text-foreground">
                      {course.price === 0 ? 'Free' : formatPrice(course.price)}
                    </span>
                  </div>

                  <Link
                    href={`/courses/${course.id}`}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                  >
                    <span>{course.isEnrolled ? 'Continue' : 'Details'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
