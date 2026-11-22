'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/context/auth-context';
import { formatPrice } from '@/lib/utils';
import {
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  BookOpen,
} from 'lucide-react';

export default function MyRequestsPage() {
  const { user } = useAuth();

  const { data: requests, isLoading } = useQuery({
    queryKey: ['my-access-requests'],
    queryFn: async () => {
      const res = await apiClient.get('/access-requests/my');
      return res.data.data;
    },
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-md">
        <h2 className="text-xl font-bold">Please Sign In</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Sign in to view your access and payment requests.
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

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Access Requests</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Track the verification status of your bKash payment submissions
        </p>
      </div>

      {isLoading ? (
        <div className="p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        </div>
      ) : !requests || requests.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-border rounded-2xl text-muted-foreground space-y-2">
          <CreditCard className="w-10 h-10 mx-auto opacity-50" />
          <h3 className="font-semibold text-sm">No Payment Requests</h3>
          <p className="text-xs">
            Browse courses and request access to start your learning journey.
          </p>
          <Link
            href="/"
            className="inline-block mt-3 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold"
          >
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req: any) => (
            <div
              key={req.id}
              className="p-5 rounded-2xl border border-border bg-card shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-bold text-sm text-foreground">{req.course?.title}</h4>
                  <span className="text-xs font-black text-primary">
                    {formatPrice(req.amount)}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-mono">
                  <span>Sender: {req.senderNumber}</span>
                  <span>•</span>
                  <span>TrxID: {req.trxId}</span>
                  <span>•</span>
                  <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                </div>

                {req.rejectReason && (
                  <p className="text-xs text-destructive font-medium pt-1">
                    Rejection Note: {req.rejectReason}
                  </p>
                )}
              </div>

              <div>
                {req.status === 'PENDING' ? (
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Under Review</span>
                  </span>
                ) : req.status === 'APPROVED' ? (
                  <div className="flex items-center space-x-3">
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Approved</span>
                    </span>
                    <Link
                      href={`/courses/${req.courseId}`}
                      className="px-3 py-1 text-xs rounded-lg bg-primary text-primary-foreground font-semibold"
                    >
                      Watch Course
                    </Link>
                  </div>
                ) : (
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-destructive/10 text-destructive">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Rejected</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
