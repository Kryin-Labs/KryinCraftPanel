'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Terminal,
  ShieldCheck,
  Server,
  Zap,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

/* Sleek Minimal Monochrome Isometric Logo */
function KryinLogo({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 3L4 9.8V22.2L16 29L28 22.2V9.8L16 3Z" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M16 3V16M16 16L4 9.8M16 16L28 9.8M16 16V29" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="16" cy="16" r="3" fill="currentColor" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim().toLowerCase();

    try {
      if (activeTab === 'signup') {
        if (password.length < 6) {
          setErrorMsg('Password must be at least 6 characters long.');
          setIsSubmitting(false);
          return;
        }

        if (password !== confirmPassword) {
          setErrorMsg('Passwords do not match. Please verify both fields.');
          setIsSubmitting(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: fullName.trim() || cleanEmail.split('@')[0],
            },
          },
        });

        if (error) {
          const lower = error.message.toLowerCase();
          if (
            lower.includes('already registered') ||
            lower.includes('user already exists') ||
            lower.includes('database error saving new user')
          ) {
            setErrorMsg('An account with this email already exists. Please sign in below.');
            setActiveTab('signin');
            return;
          }
          throw error;
        }

        if (data.session) {
          router.push('/dashboard');
        } else {
          setSuccessMsg('Account created successfully! You can now sign in.');
          setActiveTab('signin');
        }
      } else {
        // Sign In
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          const lower = error.message.toLowerCase();
          if (lower.includes('invalid login credentials')) {
            setErrorMsg('Invalid email or password. Please verify your credentials and try again.');
          } else {
            setErrorMsg(error.message);
          }
          return;
        }

        router.push('/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMsg('Please enter your email address above to receive password reset instructions.');
      return;
    }
    setErrorMsg(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail);
      if (error) throw error;
      setResetSent(true);
      setSuccessMsg(`Password reset instructions sent to ${cleanEmail}.`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to send password reset email.');
    }
  };

  return (
    <div className="min-h-screen bg-[#fbf9fe] flex flex-col justify-between p-4 sm:p-8 font-sans text-[#1a1522] selection:bg-[#eef17c]">
      {/* Top Header */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between py-3">
        <Link href="/" className="flex items-center gap-2 group select-none">
          <KryinLogo className="w-6 h-6 text-[#1a1522]" />
          <span className="font-mono font-bold tracking-tight text-[18px] text-[#1a1522]">
            KryinHost
          </span>
        </Link>

        <Link
          href="/"
          className="font-mono text-[12px] text-[#1a1522]/60 hover:text-[#1a1522] transition-colors flex items-center gap-1.5"
        >
          ← Back to Website
        </Link>
      </header>

      {/* Main Form Container */}
      <div className="w-full max-w-md mx-auto my-auto py-8">
        <div className="bg-white border border-[#1a1522]/15 rounded-xl shadow-[0_10px_30px_rgba(26,21,34,0.06)] p-6 sm:p-8 space-y-6">
          {/* Card Header Branding */}
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#1a1522]/60 uppercase tracking-widest bg-[#1a1522]/5 px-2.5 py-1 rounded">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Indian Datacenter Gateway
            </div>
            <h1 className="font-mono font-bold text-2xl text-[#1a1522] pt-1">
              {activeTab === 'signin' ? 'Sign in to Console' : 'Create an Account'}
            </h1>
            <p className="text-[13px] text-[#1a1522]/70 leading-relaxed font-sans">
              {activeTab === 'signin'
                ? 'Access your server terminal, live player manager, and file system.'
                : 'Deploy high-frequency Indian Minecraft nodes and manage your team.'}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-[#f6f5fb] p-1 rounded-lg border border-[#1a1522]/10 font-mono text-[12px]">
            <button
              type="button"
              onClick={() => {
                setActiveTab('signin');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 rounded-md font-semibold transition-all cursor-pointer ${
                activeTab === 'signin'
                  ? 'bg-white text-[#1a1522] shadow-sm'
                  : 'text-[#1a1522]/50 hover:text-[#1a1522]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('signup');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 rounded-md font-semibold transition-all cursor-pointer ${
                activeTab === 'signup'
                  ? 'bg-white text-[#1a1522] shadow-sm'
                  : 'text-[#1a1522]/50 hover:text-[#1a1522]'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Feedback Alerts */}
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-[12px] text-red-800">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2.5 text-[12px] text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === 'signup' && (
              <div>
                <label className="block font-mono text-[11px] font-bold text-[#1a1522]/80 uppercase tracking-wider mb-1.5">
                  Full Name / Username
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#1a1522]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Steve"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#fbf9fe] border border-[#1a1522]/20 rounded-lg py-2.5 pl-10 pr-3 font-mono text-[13px] text-[#1a1522] placeholder-[#1a1522]/40 focus:outline-none focus:border-[#1a1522] focus:bg-white transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block font-mono text-[11px] font-bold text-[#1a1522]/80 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#1a1522]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="operator@kryinhost.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#fbf9fe] border border-[#1a1522]/20 rounded-lg py-2.5 pl-10 pr-3 font-mono text-[13px] text-[#1a1522] placeholder-[#1a1522]/40 focus:outline-none focus:border-[#1a1522] focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block font-mono text-[11px] font-bold text-[#1a1522]/80 uppercase tracking-wider">
                  Password
                </label>
                {activeTab === 'signin' && (
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    className="font-mono text-[11px] text-[#1a1522]/60 hover:text-[#1a1522] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#1a1522]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#fbf9fe] border border-[#1a1522]/20 rounded-lg py-2.5 pl-10 pr-10 font-mono text-[13px] text-[#1a1522] placeholder-[#1a1522]/40 focus:outline-none focus:border-[#1a1522] focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1a1522]/40 hover:text-[#1a1522] cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {activeTab === 'signup' && (
              <div>
                <label className="block font-mono text-[11px] font-bold text-[#1a1522]/80 uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#1a1522]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#fbf9fe] border border-[#1a1522]/20 rounded-lg py-2.5 pl-10 pr-3 font-mono text-[13px] text-[#1a1522] placeholder-[#1a1522]/40 focus:outline-none focus:border-[#1a1522] focus:bg-white transition-all"
                  />
                </div>
              </div>
            )}

            {/* Remember Me Checkbox */}
            <div className="flex items-center gap-2 pt-1 font-mono text-[12px] text-[#1a1522]/70">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-[#1a1522]/30 text-[#1a1522] focus:ring-0 cursor-pointer"
              />
              <label htmlFor="remember" className="cursor-pointer select-none">
                Remember this device for 30 days
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#1a1522] hover:bg-[#2e263d] text-white font-mono text-[13px] font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Authenticating node session...</span>
              ) : activeTab === 'signin' ? (
                <>
                  <span>Sign In to Console</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Create Account &amp; Proceed</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Node Footer */}
      <footer className="w-full max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-[#1a1522]/50 py-3 border-t border-[#1a1522]/10 gap-2">
        <span>© {new Date().getFullYear()} KryinHost Inc. All rights reserved.</span>
        <div className="flex items-center gap-2 text-emerald-700 font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Indian Node 01 (Mumbai Tier-IV) · Online</span>
        </div>
      </footer>
    </div>
  );
}
