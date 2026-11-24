import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { Providers } from '@/components/providers';
import { Navbar } from '@/components/layout/Navbar';
import { FloatingWhatsApp } from '@/components/common/FloatingWhatsApp';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sabbir Academy - Master Coding, CS Theory & Soft Skills',
  description: 'Production-grade engineering academy by Sabbir Hossen. Learn full-stack development, algorithms, system design theory, and career-accelerating soft skills.',
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
