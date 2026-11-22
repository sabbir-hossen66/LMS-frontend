'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/context/auth-context';
import { AdminNav } from '@/components/layout/AdminNav';
import { formatPrice } from '@/lib/utils';
import {
  CreditCard,
  Search,
  Check,
  X,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  ShieldAlert,
} from 'lucide-react';

export default function AdminPaymentRequestsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');
  const [search, setSearch] = useState('');

  // Rejection modal state
  const [rejectModalReqId, setRejectModalReqId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('Transaction could not be verified in bKash');

  const { data: requestsData, isLoading } = useQuery({
    queryKey: ['admin-payment-requests', page, statusFilter, search],
    queryFn: async () => {
      const res = await apiClient.get('/access-requests', {
        params: {
          page,
          limit: 20,
          status: statusFilter || undefined,
          search: search || undefined,
        },
      });
      return res.data.data;
    },
    enabled: user?.role === 'ADMIN',
  });

  const requests = requestsData?.items || [];

  const handleReview = async (requestId: string, status: 'APPROVED' | 'REJECTED', reason?: string) => {
    try {
      await apiClient.patch(`/access-requests/${requestId}/review`, {
        status,
        rejectReason: reason,
      });

      setRejectModalReqId(null);
      await queryClient.invalidateQueries({ queryKey: ['admin-payment-requests'] });
      await queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to review request');
    }
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-md">
        <ShieldAlert className="w-12 h-12 text-destructive mx-auto mb-3" />
        <h2 className="text-xl font-bold">Admin Privileges Required</h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl space-y-6">
      <AdminNav />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payment Requests</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Verify manual bKash transactions and approve instant course enrollment
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-border bg-card text-xs focus:ring-2 focus:ring-primary"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
          </select>

          <div className="relative flex-1 sm:w-56">
            <input
              type="text"
              placeholder="Search TrxID, phone..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 pl-8 rounded-xl border border-border bg-card text-xs focus:ring-2 focus:ring-primary"
            />
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-2.5" />
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="p-4">Student</th>
                <th className="p-4">Course</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Sender Phone</th>
                <th className="p-4">TrxID</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    No payment requests found.
                  </td>
                </tr>
              ) : (
                requests.map((req: any) => (
                  <tr key={req.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-foreground">{req.user?.name}</p>
                      <p className="text-[11px] text-muted-foreground">{req.user?.email}</p>
                    </td>
                    <td className="p-4 font-medium max-w-xs truncate">{req.course?.title}</td>
                    <td className="p-4 font-bold text-primary">{formatPrice(req.amount)}</td>
                    <td className="p-4 font-mono">{req.senderNumber}</td>
                    <td className="p-4 font-mono font-bold uppercase">{req.trxId}</td>
                    <td className="p-4">
                      {req.status === 'PENDING' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500">
                          PENDING
                        </span>
                      ) : req.status === 'APPROVED' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500">
                          APPROVED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-destructive/10 text-destructive">
                          REJECTED
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {req.status === 'PENDING' ? (
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleReview(req.id, 'APPROVED')}
                            title="Approve & Enroll"
                            className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-colors"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setRejectModalReqId(req.id)}
                            title="Reject"
                            className="p-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-muted-foreground font-mono">Completed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModalReqId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold">Reject Payment Request</h3>
            <p className="text-xs text-muted-foreground">
              Provide a clear reason for the student explaining why this transaction could not be approved.
            </p>

            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-3 rounded-xl border border-border bg-background text-xs focus:ring-2 focus:ring-primary resize-none"
            />

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setRejectModalReqId(null)}
                className="px-3.5 py-1.5 rounded-xl text-xs hover:bg-muted font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReview(rejectModalReqId, 'REJECTED', rejectReason)}
                className="px-4 py-1.5 rounded-xl bg-destructive text-destructive-foreground text-xs font-semibold hover:opacity-90"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
