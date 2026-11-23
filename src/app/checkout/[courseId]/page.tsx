'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/context/auth-context';
import { formatPrice } from '@/lib/utils';
import {
  CreditCard,
  Copy,
  Check,
  ChevronLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

export default function CheckoutPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [senderNumber, setSenderNumber] = useState('');
  const [trxId, setTrxId] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch Course
  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ['checkout-course', courseId],
    queryFn: async () => {
      const res = await apiClient.get(`/courses/${courseId}`);
      return res.data.data;
    },
  });

  // Fetch Public Settings for bKash merchant/personal number
  const { data: settings } = useQuery({
    queryKey: ['public-settings'],
    queryFn: async () => {
      const res = await apiClient.get('/settings/public');
      return res.data.data;
    },
  });

  const bkashNumber = settings?.bkash_number || '01783780066';
  const adminName = settings?.admin_name || 'Sabbir Hossen';
  const supportEmail = settings?.support_email || 'sabbir.ms2000@gmail.com';

  const copyNumber = () => {
    navigator.clipboard.writeText(bkashNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await apiClient.post('/access-requests', {
        courseId,
        senderNumber: senderNumber.trim(),
        trxId: trxId.trim().toUpperCase(),
      });
      setSuccess(true);
      setTimeout(() => {
        router.push('/my-requests');
      }, 2500);
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message || 'Failed to submit payment verification request.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || courseLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-md">
        <h2 className="text-xl font-bold">Please Sign In First</h2>
        <p className="text-sm text-muted-foreground mt-1">
          You need an account to link your course enrollment.
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
    <div className="container mx-auto px-4 py-10 max-w-2xl space-y-6">
      <Link
        href={`/courses/${courseId}`}
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Course Details</span>
      </Link>

      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xl space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Manual Checkout
          </span>
          <h1 className="text-2xl font-black tracking-tight mt-1">Request Course Access</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Enroll in <span className="font-semibold text-foreground">{course?.title}</span>
          </p>
        </div>

        {/* Amount to pay */}
        <div className="p-4 rounded-2xl bg-muted/50 border border-border flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground block">Course Fee</span>
            <span className="text-2xl font-black text-foreground">
              {formatPrice(course?.price || 0)}
            </span>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500">
            One-Time Access
          </span>
        </div>

        {/* Instructions */}
        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center space-x-1.5">
            <CreditCard className="w-4 h-4" />
            <span>Payment Instructions via bKash</span>
          </h4>

          <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal pl-4 leading-relaxed">
            <li>
              Open your <strong>bKash App</strong> and select <strong>Send Money</strong>.
            </li>
            <li>
              Send exactly <strong>{formatPrice(course?.price || 0)}</strong> to our official bKash account (Personal / Send Money):
            </li>
          </ol>

          {/* Number & Admin info copy box */}
          <div className="p-3.5 rounded-xl bg-card border border-border space-y-2">
            <div className="flex items-center justify-between font-mono text-sm font-bold">
              <div>
                <span className="text-[11px] font-sans font-normal text-muted-foreground block">
                  bKash Number (Admin: {adminName})
                </span>
                <span className="text-foreground text-base tracking-wider">{bkashNumber}</span>
              </div>
              <button
                onClick={copyNumber}
                type="button"
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-sans font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-500">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/50">
              <span>Recipient: <strong className="text-foreground">{adminName}</strong></span>
              <span>Contact: <strong className="text-foreground">{supportEmail}</strong></span>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground">
            3. After successful payment, copy the <strong>Transaction ID (TrxID)</strong> and submit below.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {success ? (
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 mx-auto" />
            <h3 className="font-bold text-base">Request Submitted Successfully!</h3>
            <p className="text-xs text-muted-foreground">
              Your bKash transaction ID is under review. Redirecting to your requests page...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Your Sender bKash Mobile Number
              </label>
              <input
                type="text"
                required
                value={senderNumber}
                onChange={(e) => setSenderNumber(e.target.value)}
                placeholder="017XXXXXXXX"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-mono focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                bKash Transaction ID (TrxID)
              </label>
              <input
                type="text"
                required
                value={trxId}
                onChange={(e) => setTrxId(e.target.value)}
                placeholder="e.g. 9K72TX0192"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-mono uppercase tracking-wider focus:ring-2 focus:ring-primary"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow hover:opacity-90 flex items-center justify-center space-x-2 disabled:opacity-50 transition-opacity"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Submit Payment Verification</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
