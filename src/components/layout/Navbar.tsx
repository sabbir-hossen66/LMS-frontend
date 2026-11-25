'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { GraduationCap, LogOut, LayoutDashboard, Shield, BookOpen, User } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-500 flex items-center justify-center text-white font-bold shadow-lg shadow-orange-500/25 group-hover:scale-105 transition-transform duration-300">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-orange-600 via-amber-500 to-rose-500 bg-clip-text text-transparent">
              Sabbir Academy
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary ml-1.5 px-1.5 py-0.5 rounded-full bg-primary/10 border border-primary/20">
              PRO
            </span>
          </div>
        </Link>

        {/* Center Links */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === '/' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            Courses Catalog
          </Link>
          <Link
            href="/editor"
            className={`text-sm font-medium transition-colors hover:text-primary flex items-center space-x-1.5 ${
              pathname === '/editor' ? 'text-primary font-bold' : 'text-muted-foreground'
            }`}
          >
            <span>Code Studio</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-primary/15 text-primary uppercase tracking-wider">
              Compiler
            </span>
          </Link>
          <Link
            href="/contact"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === '/contact' ? 'text-primary font-bold' : 'text-muted-foreground'
            }`}
          >
            Contact Us
          </Link>
          {user && (
            <>
              <Link
                href="/dashboard"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname.startsWith('/dashboard') ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                My Learning
              </Link>
              <Link
                href="/my-requests"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname.startsWith('/my-requests') ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                My Requests
              </Link>
            </>
          )}
          {user?.role === 'ADMIN' && (
            <Link
              href="/admin/courses"
              className={`text-sm font-medium flex items-center space-x-1.5 px-2.5 py-1 rounded-md transition-colors ${
                pathname.startsWith('/admin')
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              <Shield className="w-4 h-4 text-primary" />
              <span>Admin Panel</span>
            </Link>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center space-x-3">
          <ThemeToggle />

          {user ? (
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold leading-none">{user.name}</span>
                <span className="text-[10px] text-muted-foreground font-mono mt-0.5">{user.role}</span>
              </div>
              <button
                onClick={logout}
                title="Logout"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                href="/login"
                className="px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-3.5 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg shadow-sm hover:opacity-90 transition-opacity"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
