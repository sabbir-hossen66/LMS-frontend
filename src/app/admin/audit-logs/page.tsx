'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/context/auth-context';
import { AdminNav } from '@/components/layout/AdminNav';
import { ClipboardList, Loader2, ShieldAlert } from 'lucide-react';

export default function AdminAuditLogsPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);

  const { data: logsData, isLoading } = useQuery({
    queryKey: ['admin-audit-logs', page],
    queryFn: async () => {
      const res = await apiClient.get('/audit-logs', {
        params: { page, limit: 30 },
      });
      return res.data.data;
    },
    enabled: user?.role === 'ADMIN',
  });

  const logs = logsData?.items || [];

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

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Audit Trail</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Immutable log of every administrative action (who, what, when, and changes)
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Actor</th>
                <th className="p-4">Action</th>
                <th className="p-4">Target</th>
                <th className="p-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    No audit logs recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-mono text-muted-foreground whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-foreground">
                        {log.actor?.name || 'System / Admin'}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        {log.actor?.email}
                      </p>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-primary/10 text-primary">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {log.targetType} {log.targetId ? `(${log.targetId.slice(0, 8)}...)` : ''}
                    </td>
                    <td className="p-4 max-w-xs">
                      {log.details ? (
                        <pre className="text-[10px] bg-muted/60 p-2 rounded-lg overflow-x-auto font-mono">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
