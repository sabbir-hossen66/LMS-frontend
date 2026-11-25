'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Tag, Sparkles, X, ArrowRight, Flame } from 'lucide-react';

const DISCOUNT_PROMOS = [
  {
    tag: '১৫% স্পেশাল ডিসকাউন্ট',
    title: 'সকল কোর্সে ১৫% মেগা ছাড়!',
    desc: 'প্রোমো কোড SABBIR15 ব্যবহার করে পছন্দের কোর্সে এনরোল করুন।',
    cta: 'কোর্স দেখুন',
    href: '/#courses',
  },
  {
    tag: 'ক্যারিয়ার অফার',
    title: 'ইন্ডাস্ট্রি-রেডি স্কিল শিখুন ১৫% ছাড়ে!',
    desc: 'ফুল-স্ট্যাক, ডিএসএ ও সিস্টেম ডিজাইন কোর্সে সীমিত সময়ের ছাড়।',
    cta: 'এনরোল করুন',
    href: '/#courses',
  },
  {
    tag: 'কুপন: SABBIR15',
    title: 'প্র্যাকটিসের সাথে ক্যারিয়ার গড়ার সুযোগ!',
    desc: 'সকল প্রিমিয়াম কোর্সে উপভোগ করুন ফ্ল্যাট ১৫% ডিসকাউন্ট।',
    cta: 'অফার নিন',
    href: '/#courses',
  },
];

export function EditorDiscountToast() {
  const [isVisible, setIsVisible] = useState(false);
  const [promoIndex, setPromoIndex] = useState(0);

  useEffect(() => {
    // Initial display after 4 seconds on editor
    const initialTimer = setTimeout(() => {
      setIsVisible(true);
    }, 4000);

    // Auto trigger every 25 seconds
    const intervalTimer = setInterval(() => {
      setPromoIndex((prev) => (prev + 1) % DISCOUNT_PROMOS.length);
      setIsVisible(true);
    }, 25000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
    };
  }, []);

  // Auto-dismiss each toast after 7 seconds of being visible
  useEffect(() => {
    if (!isVisible) return;
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
    }, 7000);

    return () => clearTimeout(hideTimer);
  }, [isVisible, promoIndex]);

  if (!isVisible) return null;

  const currentPromo = DISCOUNT_PROMOS[promoIndex];

  return (
    <div className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-sm z-50 animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-auto">
      <div className="relative bg-[#1c1d22]/95 backdrop-blur-xl border border-primary/40 rounded-2xl p-3.5 shadow-2xl shadow-primary/20 text-white overflow-hidden group">
        {/* Subtle orange accent glow line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-orange-400" />

        <div className="flex items-start justify-between gap-3">
          {/* Promo Icon */}
          <div className="w-8 h-8 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0 text-primary mt-0.5">
            <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1.5 mb-1">
              <span className="text-[10px] font-mono font-bold tracking-wide uppercase px-2 py-0.5 rounded-full bg-primary/25 text-primary border border-primary/30">
                {currentPromo.tag}
              </span>
              <Sparkles className="w-3 h-3 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
            </div>

            <h4 className="text-xs font-bold text-neutral-100 truncate">
              {currentPromo.title}
            </h4>
            <p className="text-[11px] text-neutral-300 mt-0.5 leading-relaxed">
              {currentPromo.desc}
            </p>

            <div className="mt-2 flex items-center justify-between">
              <Link
                href={currentPromo.href}
                target="_blank"
                className="inline-flex items-center space-x-1 text-[11px] font-semibold text-primary hover:text-orange-400 transition-colors"
              >
                <span>{currentPromo.cta}</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
              <span className="text-[10px] text-neutral-300 font-mono">
                Code: <strong className="text-white">SABBIR15</strong>
              </span>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={() => setIsVisible(false)}
            title="Dismiss"
            className="text-neutral-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Dynamic 6s progress bar */}
        <div className="absolute bottom-0 left-0 h-[2px] bg-primary/60 w-full animate-shrink-width" />
      </div>
    </div>
  );
}
