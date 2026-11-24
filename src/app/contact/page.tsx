'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Sparkles,
  Send,
  MessageSquare,
  CheckCircle2,
  ExternalLink,
  Clock,
  MapPin,
} from 'lucide-react';

export default function ContactPage() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const phoneDisplay = '+880 1783-780066';
  const phoneRaw = '8801783780066';
  const email = 'sabbir.ms2000@gmail.com';

  const handleWhatsAppSend = (e: React.FormEvent) => {
    e.preventDefault();
    const text = message.trim()
      ? `Hi Sabbir Bhai, [Subject: ${subject || 'Inquiry'}] ${message}`
      : 'Hi Sabbir Bhai, I would like to get more information about courses at Sabbir Academy.';
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/${phoneRaw}?text=${encoded}`, '_blank');
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4 border border-primary/20 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 animate-pulse text-primary" />
          <span>Get in Touch • Fast Direct Support</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
          Contact{' '}
          <span className="bg-gradient-to-r from-orange-600 via-amber-500 to-rose-500 bg-clip-text text-transparent">
            Sabbir Academy
          </span>
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
          Have questions about our courses, curriculum, payment, or custom mentoring?
          Reach out directly via WhatsApp, Phone, or Email anytime.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Profile & Contact Channels */}
        <div className="lg:col-span-5 space-y-6">
          {/* Creator Profile Card */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center space-x-4 mb-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-rose-500 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-primary/25 shrink-0">
                SH
              </div>
              <div>
                <h3 className="font-extrabold text-xl text-foreground">Sabbir Hossen</h3>
                <p className="text-xs font-semibold text-primary mt-0.5">Founder & Lead Instructor</p>
                <div className="flex items-center space-x-2 text-[11px] text-muted-foreground mt-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Available for Mentorship</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-border text-xs text-muted-foreground">
              <div className="flex items-center space-x-2.5">
                <Briefcase className="w-4 h-4 text-primary shrink-0" />
                <span>
                  <strong className="text-foreground">Software Engineer</strong> at{' '}
                  <span className="text-foreground font-semibold">Sofof Tech</span>
                </span>
              </div>
              <div className="flex items-center space-x-2.5">
                <GraduationCap className="w-4 h-4 text-primary shrink-0" />
                <span>
                  <strong className="text-foreground">CSE</strong> • AMUST
                </span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Clock className="w-4 h-4 text-primary shrink-0" />
                <span>Response Time: Typically within 15–30 minutes</span>
              </div>
            </div>
          </div>

          {/* Quick Contact Links */}
          <div className="space-y-3">
            {/* WhatsApp Direct Action Button */}
            <a
              href={`https://wa.me/${phoneRaw}?text=${encodeURIComponent(
                'Hi Sabbir Bhai, I would like to know more about Sabbir Academy courses.',
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-2xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-foreground transition-all duration-300 group hover:scale-[1.02] shadow-sm"
            >
              <div className="flex items-center space-x-3.5">
                <div className="w-11 h-11 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-md shadow-[#25D366]/30 group-hover:scale-105 transition-transform shrink-0">
                  <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm.01 1.67c4.54 0 8.24 3.7 8.24 8.24 0 2.2-.86 4.28-2.42 5.84a8.18 8.18 0 01-5.82 2.41h-.01c-1.42 0-2.82-.38-4.04-1.1l-.29-.17-3.01.79.8-2.93-.19-.3a8.16 8.16 0 01-1.25-4.29c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.65.81-.8 1-.15.19-.29.21-.54.08-.25-.13-1.05-.39-2-1.23-.74-.66-1.24-1.48-1.39-1.73-.15-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.12-.14.17-.25.25-.42.08-.17.04-.31-.02-.44s-.56-1.35-.77-1.85c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.12.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.29z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold flex items-center space-x-1.5">
                    <span>Direct WhatsApp Chat</span>
                    <span className="text-[10px] bg-[#25D366] text-white px-1.5 py-0.2 rounded-full font-semibold">
                      Instant
                    </span>
                  </h4>
                  <p className="text-xs text-muted-foreground">{phoneDisplay}</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </a>

            {/* Direct Phone Call */}
            <a
              href={`tel:+${phoneRaw}`}
              className="flex items-center justify-between p-4 rounded-2xl bg-card hover:bg-muted/60 border border-border text-foreground transition-all duration-300 group hover:scale-[1.02] shadow-sm"
            >
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Call Directly</h4>
                  <p className="text-xs text-muted-foreground">{phoneDisplay}</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </a>

            {/* Direct Email */}
            <a
              href={`mailto:${email}?subject=Inquiry%20regarding%20Sabbir%20Academy`}
              className="flex items-center justify-between p-4 rounded-2xl bg-card hover:bg-muted/60 border border-border text-foreground transition-all duration-300 group hover:scale-[1.02] shadow-sm"
            >
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Send an Email</h4>
                  <p className="text-xs text-muted-foreground truncate max-w-[220px]">{email}</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </a>
          </div>
        </div>

        {/* Right: Quick WhatsApp Direct Message Form */}
        <div className="lg:col-span-7">
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <div className="flex items-center space-x-2 text-primary text-xs font-bold uppercase tracking-wider mb-1">
                <MessageSquare className="w-4 h-4" />
                <span>Quick Message Box</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold">Send a Message on WhatsApp</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Type your message below and hit send. It will immediately open WhatsApp with your text ready!
              </p>
            </div>

            <form onSubmit={handleWhatsAppSend} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                  Subject / Topic
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Course Enrollment, Mentorship, or Tech Inquiry"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                  Your Message
                </label>
                <textarea
                  rows={5}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your questions or notes here..."
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none leading-relaxed"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-sm shadow-lg shadow-[#25D366]/25 transition-all flex items-center justify-center space-x-2.5 hover:scale-[1.01] active:scale-[0.99]"
                >
                  <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm.01 1.67c4.54 0 8.24 3.7 8.24 8.24 0 2.2-.86 4.28-2.42 5.84a8.18 8.18 0 01-5.82 2.41h-.01c-1.42 0-2.82-.38-4.04-1.1l-.29-.17-3.01.79.8-2.93-.19-.3a8.16 8.16 0 01-1.25-4.29c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.65.81-.8 1-.15.19-.29.21-.54.08-.25-.13-1.05-.39-2-1.23-.74-.66-1.24-1.48-1.39-1.73-.15-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.12-.14.17-.25.25-.42.08-.17.04-.31-.02-.44s-.56-1.35-.77-1.85c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.12.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.29z" />
                  </svg>
                  <span>Open & Chat on WhatsApp</span>
                </button>
              </div>
            </form>

            <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-2">
              <div className="flex items-center space-x-1.5 text-emerald-500 font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>100% Direct & Confidential Support</span>
              </div>
              <span>Based in Dhaka, Bangladesh</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
