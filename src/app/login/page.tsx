'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Server,
  Layers,
  Check,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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
          setSuccessMsg('Account created successfully! You can now sign in with your credentials.');
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

        if (data.session) {
          router.push('/dashboard');
        } else {
          router.push('/dashboard');
        }
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
      setErrorMsg('Please enter your email address above to receive reset instructions.');
      return;
    }
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail);
      if (error) throw error;
      setSuccessMsg(`Password reset instructions have been sent to ${cleanEmail}.`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to send password reset email.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0e1117] flex flex-col justify-between p-4 sm:p-8 text-zinc-100">
      {/* Top Bar */}
      <header className="flex items-center justify-between max-w-5xl mx-auto w-full py-2">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm group-hover:bg-emerald-500 transition-colors">
            <Server className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-zinc-100 text-base tracking-tight">KryinHost</span>
            <span className="text-[11px] text-zinc-500 block leading-none">Client Control Portal</span>
          </div>
        </Link>
        <Link
          href="/"
          className="text-xs text-zinc-400 hover:text-white transition-colors"
        >
          ← Back to Website
        </Link>
      </header>

      {/* Main Authentication Container */}
      <div className="w-full max-w-md mx-auto my-auto p-6 sm:p-8 bg-[#151821] border border-zinc-800 rounded-2xl shadow-xl space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-xl bg-zinc-800/80 border border-zinc-700/60 text-emerald-400 mx-auto flex items-center justify-center mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-zinc-100">
            {activeTab === 'signin' ? 'Sign In to Control Panel' : 'Create Server Account'}
          </h2>
          <p className="text-xs text-zinc-400">
            {activeTab === 'signin'
              ? 'Access your server console, live player manager, and files.'
              : 'Register to manage servers, deploy instances, and invite operators.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[#0e1117] p-1 rounded-xl border border-zinc-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('signin');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              activeTab === 'signin'
                ? 'bg-zinc-800 text-white shadow-sm font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
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
            className={`flex-1 py-2 rounded-lg transition-all ${
              activeTab === 'signup'
                ? 'bg-zinc-800 text-white shadow-sm font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Feedback alerts */}
        {errorMsg && (
          <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl flex items-start gap-2.5 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{errorMsg}</span>
              {errorMsg.includes('already exists') && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('signin');
                    setErrorMsg(null);
                  }}
                  className="block mt-1 font-semibold text-emerald-400 hover:underline"
                >
                  Click here to switch to Sign In →
                </button>
              )}
            </div>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl flex items-start gap-2.5 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Full Name / Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Steve"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#0e1117] border border-zinc-800 rounded-xl py-2.5 pl-10 pr-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0e1117] border border-zinc-800 rounded-xl py-2.5 pl-10 pr-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-zinc-300">Password</label>
              {activeTab === 'signin' && (
                <button
                  type="button"
                  onClick={handleResetPassword}
                  className="text-[11px] text-zinc-400 hover:text-emerald-400 transition-colors"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0e1117] border border-zinc-800 rounded-xl py-2.5 pl-10 pr-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {activeTab === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#0e1117] border border-zinc-800 rounded-xl py-2.5 pl-10 pr-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-2 shadow-sm cursor-pointer"
          >
            {isSubmitting ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>{activeTab === 'signin' ? 'Sign In to Server' : 'Create My Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-zinc-800/80 text-center text-xs text-zinc-400">
          {activeTab === 'signin' ? (
            <span>
              Don&apos;t have an account yet?{' '}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('signup');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="text-emerald-400 hover:underline font-semibold"
              >
                Create one now
              </button>
            </span>
          ) : (
            <span>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('signin');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="text-emerald-400 hover:underline font-semibold"
              >
                Sign In here
              </button>
            </span>
          )}
        </div>
      </div>

      {/* Security & Architecture Footnote */}
      <footer className="text-center text-[11px] text-zinc-500 max-w-5xl mx-auto w-full pt-4 space-y-1">
        <p>KryinHost Client Management • Powered by Paper 26.3 & Supabase Auth</p>
        <p className="text-zinc-600">Enterprise 256-bit encryption with Row Level Security</p>
      </footer>
    </div>
  );
}
