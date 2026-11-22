import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { Providers } from '@/components/providers';
import { Navbar } from '@/components/layout/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Antigravity LMS - Modern Full-Stack Learning Platform',
  description: 'Production-ready Learning Management System with secure video streaming and manual bKash checkout',
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
            <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
              <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p>© {new Date().getFullYear()} Antigravity LMS. All rights reserved.</p>
                <div className="flex items-center space-x-6">
                  <span>Production Quality LMS</span>
                  <span>•</span>
                  <span>Secure HLS / Range Stream</span>
                  <span>•</span>
                  <span>bKash Payment Gateway</span>
                </div>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
