'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { authDestination } from '@/lib/authDestination';
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
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
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');

  function destination() {
    return authDestination(new URLSearchParams(window.location.search).get('next'));
  }

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'signup') setActiveTab('signup');
    if (params.get('error') === 'callback') {
      setErrorMsg('Could not verify the sign-in link. Please try again.');
    }
  }, []);

  function callbackUrl() {
    const url = new URL('/auth/callback', window.location.origin);
    url.searchParams.set('next', destination());
    return url.toString();
  }

  function beginVerification(address: string) {
    setVerificationEmail(address);
    setVerificationCode('');
    setPassword('');
    setConfirmPassword('');
  }

  async function signInWithGitHub() {
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: { redirectTo: callbackUrl() },
      });
      if (error) throw error;
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Could not start sign-in.');
      setIsSubmitting(false);
    }
  }

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
          return;
        }

        if (password !== confirmPassword) {
          setErrorMsg('Passwords do not match. Please verify both fields.');
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: { full_name: fullName.trim(), preferred_username: username.trim().toLowerCase() },
            emailRedirectTo: callbackUrl(),
          },
        });

        if (error) throw error;
        if (data.session) {
          window.location.assign(destination());
          return;
        }

        beginVerification(cleanEmail);
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
      if (error?.code === 'email_not_confirmed') {
        beginVerification(cleanEmail);
        return;
      }
      if (error?.code === 'invalid_credentials') {
        setErrorMsg('Invalid email or password.');
        return;
      }
      if (error) throw error;

      window.location.assign(destination());
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Authentication failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  async function verifyEmail(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!verificationEmail || !/^\d{6,10}$/.test(verificationCode)) return;

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: verificationEmail,
        token: verificationCode,
        type: 'email',
      });
      if (error?.code === 'otp_expired') {
        setErrorMsg('That code is invalid or expired. Check it or request a new code.');
        return;
      }
      if (error) throw error;
      if (!data.session) throw new Error('Your email could not be verified. Please try again.');
      window.location.assign(destination());
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Could not verify the code.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function resendCode() {
    if (!verificationEmail) return;

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: verificationEmail,
        options: { emailRedirectTo: callbackUrl() },
      });
      if (error) throw error;
      setVerificationCode('');
      setSuccessMsg('Check your inbox for the latest verification code.');
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Could not send a new code.');
    } finally {
      setIsSubmitting(false);
    }
  }

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
              {verificationEmail ? 'Verify your email' : activeTab === 'signin' ? 'Sign in to Console' : 'Create an Account'}
            </h1>
            <p className="text-[13px] text-[#1a1522]/70 leading-relaxed font-sans">
              {verificationEmail
                ? <>Enter the verification code sent to <strong className="break-all">{verificationEmail}</strong>.</>
                : activeTab === 'signin'
                ? 'Access your server terminal, live player manager, and file system.'
                : 'Deploy high-frequency Indian Minecraft nodes and manage your team.'}
            </p>
          </div>

          {/* Tab Switcher */}
          {!verificationEmail && <div className="flex bg-[#f6f5fb] p-1 rounded-lg border border-[#1a1522]/10 font-mono text-[12px]">
            <button
              type="button"
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
          </div>}

          {/* Feedback Alerts */}
          {errorMsg && (
            <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-[12px] text-red-800">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          {successMsg && (
            <div role="status" className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2.5 text-[12px] text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {verificationEmail ? (
            <form onSubmit={verifyEmail} className="space-y-4">
              <label className="block text-sm font-medium">
                Verification code
                <input
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  type="text"
                  pattern="[0-9]{6,10}"
                  required
                  value={verificationCode}
                  onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="mt-1 w-full rounded-lg border border-[#1a1522]/20 bg-[#fbf9fe] px-3 py-2.5 font-mono"
                />
              </label>
              <button type="submit" disabled={isSubmitting || verificationCode.length < 6} className="w-full rounded-lg bg-[#1a1522] py-3 text-sm font-bold text-white disabled:opacity-50">
                Verify email
              </button>
              <div className="flex flex-wrap justify-between gap-2 text-sm">
                <button type="button" onClick={resendCode} disabled={isSubmitting} className="underline disabled:opacity-50">
                  Resend code
                </button>
                <button type="button" disabled={isSubmitting} className="underline disabled:opacity-50" onClick={() => {
                  setVerificationEmail(null);
                  setVerificationCode('');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}>
                  Back to {activeTab === 'signup' ? 'signup' : 'sign in'}
                </button>
              </div>
            </form>
          ) : null}

          {!verificationEmail && (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={signInWithGitHub}
              className="flex min-h-11 w-full cursor-pointer items-center justify-center gap-2.5 rounded-lg border border-[#1b1f23] bg-[#24292f] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors enabled:hover:bg-[#32383f] enabled:active:bg-[#1b1f23] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0969da] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="size-5 shrink-0">
                <path d="M10.226 17.284c-2.965-.36-5.054-2.493-5.054-5.256 0-1.123.404-2.336 1.078-3.144-.292-.741-.247-2.314.09-2.965.898-.112 2.111.36 2.83 1.01.853-.269 1.752-.404 2.853-.404 1.1 0 1.999.135 2.807.382.696-.629 1.932-1.1 2.83-.988.315.606.36 2.179.067 2.942.72.854 1.101 2 1.101 3.167 0 2.763-2.089 4.852-5.098 5.234.763.494 1.28 1.572 1.28 2.807v2.336c0 .674.561 1.056 1.235.786 4.066-1.55 7.255-5.615 7.255-10.646C23.5 6.188 18.334 1 11.978 1 5.62 1 .5 6.188.5 12.545c0 4.986 3.167 9.12 7.435 10.669.606.225 1.19-.18 1.19-.786V20.63a2.9 2.9 0 0 1-1.078.224c-1.483 0-2.359-.808-2.987-2.313-.247-.607-.517-.966-1.034-1.033-.27-.023-.359-.135-.359-.27 0-.27.45-.471.898-.471.652 0 1.213.404 1.797 1.235.45.651.921.943 1.483.943.561 0 .92-.202 1.437-.719.382-.381.674-.718.944-.943" />
              </svg>
              Continue with GitHub
            </button>
          )}

          {/* Form */}
          {!verificationEmail && <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === 'signup' && (
              <div>
                <label className="block font-mono text-[11px] font-bold text-[#1a1522]/80 uppercase tracking-wider mb-1.5">
                  Display name
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

            {activeTab === 'signup' && (
              <label className="block space-y-1.5 text-sm font-medium">
                Username
                <input
                  required
                  autoComplete="username"
                  minLength={3}
                  maxLength={30}
                  pattern="[A-Za-z0-9][A-Za-z0-9_\-]{2,29}"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="w-full rounded-lg border border-[#1a1522]/20 bg-[#fbf9fe] px-3 py-2.5"
                />
                <span className="block text-xs font-normal opacity-70">Use 3–30 letters, numbers, hyphens or underscores.</span>
              </label>
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
                  <span>Send verification code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>}
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
