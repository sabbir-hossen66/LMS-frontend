'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import {
  GraduationCap,
  LogOut,
  Shield,
  User,
  Code2,
  LogIn,
  UserPlus,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const authDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        authDropdownRef.current &&
        !authDropdownRef.current.contains(event.target as Node)
      ) {
        setIsAuthOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setIsAuthOpen(false);
  }, [pathname]);

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

        {/* Center Links (Courses Catalog, Contact Us) */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === '/' ? 'text-primary font-bold' : 'text-muted-foreground'
            }`}
          >
            Courses Catalog
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
                  pathname.startsWith('/dashboard') ? 'text-primary font-bold' : 'text-muted-foreground'
                }`}
              >
                My Learning
              </Link>
              <Link
                href="/my-requests"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname.startsWith('/my-requests') ? 'text-primary font-bold' : 'text-muted-foreground'
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

        {/* Right Actions: ThemeToggle, Editor Icon Button, and Auth Avatar Dropdown */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Compact Code Editor Icon Button */}
          <Link
            href="/editor"
            aria-label="Code Editor"
            title="Online Code Editor & Live Studio"
            className={`p-2 rounded-lg border transition-all duration-200 flex items-center justify-center ${
              pathname === '/editor'
                ? 'border-primary bg-primary/10 text-primary shadow-sm shadow-primary/20'
                : 'border-border bg-card hover:bg-muted text-foreground hover:border-primary/40'
            }`}
          >
            <Code2 className={`w-4 h-4 ${pathname === '/editor' ? 'text-primary' : 'text-foreground'}`} />
          </Link>

          {/* User Auth: If logged in, show user info; If guest, show sleek Animated Avatar Dropdown */}
          {user ? (
            <div className="flex items-center space-x-2.5">
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
            <div className="relative" ref={authDropdownRef}>
              {/* Compact Avatar Trigger Button */}
              <button
                onClick={() => setIsAuthOpen((prev) => !prev)}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-primary/15 via-primary/5 to-transparent border border-border hover:border-primary/50 text-foreground flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-sm"
                aria-label="Account Options"
                title="Sign In or Register"
              >
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </button>

              {/* Smooth Animated Auth Popover Dropdown */}
              {isAuthOpen && (
                <div className="absolute right-0 mt-2.5 w-60 bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-2 py-1.5 border-b border-border/60 mb-2">
                    <p className="text-xs font-semibold text-foreground flex items-center space-x-1.5">
                      <span>Welcome to Academy</span>
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Sign in to access your course progress
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Link
                      href="/login"
                      className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Sign In</span>
                    </Link>

                    <Link
                      href="/register"
                      className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl border border-border hover:bg-muted text-foreground text-xs font-semibold transition-all"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-primary" />
                      <span>Create Account</span>
                    </Link>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-border/60 text-center">
                    <Link
                      href="/contact"
                      className="text-[11px] text-muted-foreground hover:text-primary transition-colors font-medium"
                    >
                      Need help? Contact Instructor
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
