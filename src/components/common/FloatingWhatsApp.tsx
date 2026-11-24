'use client';

import React from 'react';

export function FloatingWhatsApp() {
  const phoneRaw = '8801783780066';
  const defaultMsg = encodeURIComponent(
    'Hi Sabbir Bhai, I would like to get more information about courses at Sabbir Academy.',
  );

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center group">
      {/* Tooltip on hover */}
      <div className="pointer-events-none absolute right-16 sm:right-20 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:-translate-x-1 whitespace-nowrap bg-neutral-900 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-xl border border-white/10 hidden sm:flex items-center space-x-1.5">
        <span>Chat with Sabbir</span>
        <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-ping" />
      </div>

      <a
        href={`https://wa.me/${phoneRaw}?text=${defaultMsg}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp with Sabbir Hossen"
        className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white flex items-center justify-center shadow-[0_10px_25px_-5px_rgba(37,211,102,0.5)] hover:scale-110 active:scale-95 transition-all duration-300"
      >
        {/* Soft pulsing halo animation */}
        <span className="absolute -inset-1 rounded-full bg-[#25D366]/30 animate-ping pointer-events-none" />

        {/* Real Official WhatsApp Vector Icon */}
        <svg
          className="w-8 h-8 sm:w-9 sm:h-9 fill-white relative z-10 drop-shadow-sm"
          viewBox="0 0 24 24"
        >
          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm.01 1.67c4.54 0 8.24 3.7 8.24 8.24 0 2.2-.86 4.28-2.42 5.84a8.18 8.18 0 01-5.82 2.41h-.01c-1.42 0-2.82-.38-4.04-1.1l-.29-.17-3.01.79.8-2.93-.19-.3a8.16 8.16 0 01-1.25-4.29c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.65.81-.8 1-.15.19-.29.21-.54.08-.25-.13-1.05-.39-2-1.23-.74-.66-1.24-1.48-1.39-1.73-.15-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.12-.14.17-.25.25-.42.08-.17.04-.31-.02-.44s-.56-1.35-.77-1.85c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.12.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.29z" />
        </svg>
      </a>
    </div>
  );
}
