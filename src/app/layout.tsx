import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { Providers } from '@/components/providers';
import { Navbar } from '@/components/layout/Navbar';
import { FloatingWhatsApp } from '@/components/common/FloatingWhatsApp';
import { ChatWidget } from '@/components/common/ChatWidget';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://sabbir-lms.vercel.app'),
  title: {
    default: 'Sabbir Academy - Master Coding, CS Theory & Soft Skills',
    template: '%s | Sabbir Academy',
  },
  description:
    'Sabbir Academy by Sabbir Hossen. Production-grade software engineering courses covering Full-Stack Development, Data Structures & Algorithms, Computer Science Theory, System Architecture, and Career Soft Skills.',
  keywords: [
    'sabbir-lms',
    'sabbir-course',
    'sabbir-academy',
    'sabbir academy',
    'sabbir hossen',
    'softskill',
    'coding',
    'cs theory',
    'computer science theory',
    'software engineer at sofof tech',
    'cse amust',
    'full stack web development',
    'nest js course bangla',
    'next js fullstack',
    'data structures and algorithms',
    'system design bangla',
    'software architecture',
    'career soft skills for engineers',
    'bangladesh coding academy',
    'learn coding bangla',
    'online coding courses bangladesh',
    'software engineering mentorship',
  ],
  authors: [{ name: 'Sabbir Hossen', url: 'https://sabbir-lms.vercel.app' }],
  creator: 'Sabbir Hossen',
  publisher: 'Sabbir Academy',
  alternates: {
    canonical: 'https://sabbir-lms.vercel.app',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://sabbir-lms.vercel.app',
    siteName: 'Sabbir Academy',
    title: 'Sabbir Academy - Master Coding, CS Theory & Soft Skills',
    description:
      'Production-grade software engineering courses covering Full-Stack Development, Computer Science Theory, and Career Soft Skills by Sabbir Hossen.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sabbir Academy - Master Coding, CS Theory & Soft Skills',
    description:
      'Production-grade software engineering courses covering Full-Stack Development, Computer Science Theory, and Career Soft Skills by Sabbir Hossen.',
    creator: '@sabbir_hossen',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen flex flex-col bg-background text-foreground">
            <Navbar />
            <main className="flex-1">{children}</main>
            <FloatingWhatsApp />
            <ChatWidget />
            <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
              <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p>© {new Date().getFullYear()} Sabbir Academy. Empowering the Next Generation of Engineers.</p>
                <div className="flex items-center space-x-5">
                  <Link href="/contact" className="hover:text-primary font-medium transition-colors">
                    Contact Us
                  </Link>
                  <span>•</span>
                  <span>Coding & Architecture</span>
                  <span>•</span>
                  <span>Computer Science Theory</span>
                  <span>•</span>
                  <span>Career Soft Skills</span>
                </div>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
