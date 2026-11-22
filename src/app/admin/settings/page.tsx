'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/context/auth-context';
import { AdminNav } from '@/components/layout/AdminNav';
import { Settings, Save, Loader2, CheckCircle2 } from 'lucide-react';

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [bkashNumber, setBkashNumber] = useState('');
  const [siteName, setSiteName] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const res = await apiClient.get('/settings');
      return res.data.data;
    },
    enabled: user?.role === 'ADMIN',
  });

  useEffect(() => {
    if (settingsData) {
      setBkashNumber(settingsData.bkash_number || '');
      setSiteName(settingsData.site_name || '');
      setSupportEmail(settingsData.support_email || '');
    }
  }, [settingsData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await apiClient.patch('/settings', {
        bkash_number: bkashNumber.trim(),
        site_name: siteName.trim(),
        support_email: supportEmail.trim(),
      });

      setSaveSuccess(true);
      await queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl space-y-6">
      <AdminNav />

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Platform Settings</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Configure site name, support channels, and admin bKash account for student manual payments.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Settings saved and published successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
        <div>
          <label className="text-xs font-semibold text-muted-foreground block mb-1">
            Admin bKash Number (Merchant / Personal)
          </label>
          <input
            type="text"
            required
            value={bkashNumber}
            onChange={(e) => setBkashNumber(e.target.value)}
            placeholder="e.g. 01712345678"
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm font-mono focus:ring-2 focus:ring-primary"
          />
          <p className="text-[11px] text-muted-foreground mt-1">
            This number will be displayed to students during the manual bKash checkout flow.
          </p>
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground block mb-1">
            Platform / Site Name
          </label>
          <input
            type="text"
            required
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            placeholder="e.g. Antigravity LMS"
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground block mb-1">
            Support Email
          </label>
          <input
            type="email"
            required
            value={supportEmail}
            onChange={(e) => setSupportEmail(e.target.value)}
            placeholder="e.g. support@lms.local"
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow hover:opacity-90 flex items-center space-x-2 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
