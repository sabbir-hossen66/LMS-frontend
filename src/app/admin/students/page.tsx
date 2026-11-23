'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/context/auth-context';
import { AdminNav } from '@/components/layout/AdminNav';
import { formatDuration } from '@/lib/utils';
import {
  Users,
  Search,
  CheckCircle,
  Ban,
  Eye,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  ShieldMinus,
  Shield,
  BookOpen,
  X,
} from 'lucide-react';

export default function AdminStudentsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  const { data: studentsData, isLoading } = useQuery({
    queryKey: ['admin-students', page, search, roleFilter],
    queryFn: async () => {
      const res = await apiClient.get('/users/students', {
        params: {
          page,
          limit: 15,
          search: search || undefined,
          role: roleFilter === 'ALL' ? undefined : roleFilter,
        },
      });
      return res.data.data;
    },
    enabled: user?.role === 'ADMIN',
  });

  const students = studentsData?.items || [];

  const handleUpdateRole = async (userId: string, newRole: 'ADMIN' | 'STUDENT', userName: string) => {
    const isPromoting = newRole === 'ADMIN';
    const message = isPromoting
      ? `Are you sure you want to promote "${userName}" to ADMIN? They will have full dashboard access.`
      : `Are you sure you want to remove ADMIN privileges from "${userName}"? They will become a STUDENT.`;

    if (!confirm(message)) return;

    try {
      await apiClient.patch(`/users/${userId}/role`, { role: newRole });
      await queryClient.invalidateQueries({ queryKey: ['admin-students'] });
      alert(`User role updated to ${newRole} successfully.`);
    } catch (err: any) {
      alert(err.response?.data?.message || `Failed to update role for ${userName}`);
    }
  };

  const handleToggleBlock = async (studentId: string, currentStatus: boolean) => {
    const action = currentStatus ? 'unblock' : 'block';
    if (!confirm(`Are you sure you want to ${action} this student?`)) return;

    try {
      await apiClient.patch(`/users/${studentId}/block`);
      await queryClient.invalidateQueries({ queryKey: ['admin-students'] });
      if (selectedStudent && selectedStudent.id === studentId) {
        setSelectedStudent((prev: any) => ({ ...prev, isBlocked: !prev.isBlocked }));
      }
    } catch (err: any) {
      alert(err.response?.data?.message || `Failed to ${action} student`);
    }
  };

  const inspectStudent = async (studentId: string) => {
    try {
      const res = await apiClient.get(`/users/${studentId}`);
      setSelectedStudent(res.data.data);
    } catch {
      alert('Unable to load student details');
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
          <h1 className="text-2xl font-bold tracking-tight">User & Student Directory</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage student enrollments, inspect progress, toggle access, and assign/remove admin roles
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-border bg-card text-xs focus:ring-2 focus:ring-primary font-medium"
          >
            <option value="ALL">All Roles</option>
            <option value="STUDENT">Students Only</option>
            <option value="ADMIN">Admins Only</option>
          </select>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search name, email, phone..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full px-3.5 py-2 pl-9 rounded-xl border border-border bg-card text-xs focus:ring-2 focus:ring-primary"
            />
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-3" />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Joined</th>
                <th className="p-4">Enrollments</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                students.map((s: any) => {
                  const isSuperAdmin = s.email === 'sabbir.ms2000@gmail.com';
                  const isSelf = s.id === user?.id;

                  return (
                    <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <div>
                            <p className="font-bold text-foreground flex items-center space-x-1.5">
                              <span>{s.name}</span>
                              {isSuperAdmin && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 font-semibold">
                                  Primary
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-muted-foreground">{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        {s.role === 'ADMIN' ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                            <Shield className="w-3 h-3" />
                            <span>ADMIN</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground">
                            STUDENT
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-mono text-muted-foreground">{s.phone}</td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(s.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 font-semibold text-primary">
                        {s._count?.enrollments || 0} active
                      </td>
                      <td className="p-4">
                        {s.isBlocked ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-destructive/10 text-destructive">
                            BLOCKED
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500">
                            ACTIVE
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right space-x-1.5">
                        <button
                          onClick={() => inspectStudent(s.id)}
                          className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                          title="Inspect Progress"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Promote / Demote Role Button */}
                        {s.role === 'STUDENT' ? (
                          <button
                            onClick={() => handleUpdateRole(s.id, 'ADMIN', s.name)}
                            className="p-1.5 rounded-lg border border-purple-500/30 text-purple-600 hover:bg-purple-500/10"
                            title="Promote to Admin"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </button>
                        ) : isSuperAdmin || isSelf ? (
                          <span
                            className="p-1.5 rounded-lg border border-transparent opacity-40 cursor-not-allowed inline-block"
                            title={isSuperAdmin ? 'Primary Administrator (Cannot be removed)' : 'Your own account'}
                          >
                            <Shield className="w-3.5 h-3.5 text-purple-400" />
                          </span>
                        ) : (
                          <button
                            onClick={() => handleUpdateRole(s.id, 'STUDENT', s.name)}
                            className="p-1.5 rounded-lg border border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
                            title="Remove Admin Privileges"
                          >
                            <ShieldMinus className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Block / Unblock Button */}
                        {!isSuperAdmin && !isSelf && (
                          <button
                            onClick={() => handleToggleBlock(s.id, s.isBlocked)}
                            className={`p-1.5 rounded-lg border ${
                              s.isBlocked
                                ? 'border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10'
                                : 'border-destructive/30 text-destructive hover:bg-destructive/10'
                            }`}
                            title={s.isBlocked ? 'Unblock Account' : 'Block Account'}
                          >
                            {s.isBlocked ? (
                              <CheckCircle className="w-3.5 h-3.5" />
                            ) : (
                              <Ban className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Student Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="font-bold text-base">{selectedStudent.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {selectedStudent.email} • {selectedStudent.phone}
                </p>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Enrolled Courses
                </h4>
                {selectedStudent.enrollments?.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No active enrollments</p>
                ) : (
                  <div className="space-y-2">
                    {selectedStudent.enrollments?.map((e: any) => (
                      <div
                        key={e.id}
                        className="p-3 rounded-xl border border-border bg-background flex items-center justify-between text-xs"
                      >
                        <span className="font-semibold">{e.course.title}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500">
                          {e.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Lesson Watch Progress
                </h4>
                {selectedStudent.videoProgress?.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No lessons streamed yet</p>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {selectedStudent.videoProgress?.map((vp: any) => (
                      <div
                        key={vp.id}
                        className="p-3 rounded-xl border border-border bg-background flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-medium">{vp.video.title}</p>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {formatDuration(vp.lastPosition)} / {formatDuration(vp.video.duration)}
                          </span>
                        </div>
                        {vp.completed ? (
                          <span className="text-emerald-500 font-bold text-[10px] flex items-center space-x-1">
                            <CheckCircle className="w-3 h-3" />
                            <span>100% Completed</span>
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-[10px] font-mono">
                            In Progress
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
