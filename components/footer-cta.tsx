import React, { useState } from 'react';
import { Zap, X, Terminal, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import posthog from 'posthog-js';

export interface FooterCtaProps {
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
  modalSource?: 'cta' | 'export';
  setModalSource?: (source: 'cta' | 'export') => void;
}

export default function FooterCta({
  isOpen: controlledIsOpen,
  setIsOpen: controlledSetIsOpen,
  modalSource: controlledSource,
  setModalSource: controlledSetSource,
}: FooterCtaProps = {}) {
  const [localIsOpen, localSetIsOpen] = useState(false);
  const [localSource, localSetSource] = useState<'cta' | 'export'>('cta');

  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : localIsOpen;
  const setIsOpen = controlledSetIsOpen !== undefined ? controlledSetIsOpen : localSetIsOpen;
  const modalSource = controlledSource !== undefined ? controlledSource : localSource;
  const setModalSource = controlledSetSource !== undefined ? controlledSetSource : localSetSource;

  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/beta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to request beta access.');
      }

      const domain = email.split('@')[1] || 'unknown';
      posthog.capture('beta_signup', { email_domain: domain, source: modalSource });

      setIsSubmitted(true);
      setEmail('');
      setTimeout(() => {
        setIsSubmitted(false);
        setIsOpen(false);
      }, 6000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="w-full">
        {/* Integration Engine Premium CTA Card */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-950/45 p-6 sm:p-8 shadow-2xl pulse-border">
          {/* Decorative glowing gradient orb */}
          <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                <Zap className="h-3 w-3 fill-indigo-400" />
                BatchSafe Cloud
              </div>
              <h3 className="font-display text-base sm:text-lg font-bold text-zinc-100 leading-snug">
                Ready to skip spreadsheets entirely next Friday?
              </h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Use BatchSafe Cloud when you want payout task tracking, contributor records, team workflows, saved batches, export history, and auditability. Join the waitlist for BatchSafe Cloud.
              </p>
            </div>

            <button
              onClick={() => {
                posthog.capture('click_join_beta_cta');
                setModalSource('cta');
                setIsOpen(true);
              }}
              className="flex items-center gap-2 shrink-0 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/25 hover:from-indigo-600 hover:to-violet-700 transition-all duration-200 cursor-pointer group"
            >
              <span>Join BatchSafe Cloud Waitlist</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Beta Sign Up Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-950 p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                  {modalSource === 'export' ? (
                    <Sparkles className="h-4.5 w-4.5" />
                  ) : (
                    <Terminal className="h-4.5 w-4.5" />
                  )}
                </div>
                <h4 className="font-display text-sm font-bold text-white">
                  {modalSource === 'export' ? 'Export Successful! 🎉' : 'BatchSafe Cloud Waitlist'}
                </h4>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsSubmitted(false);
                  setError(null);
                  setIsLoading(false);
                }}
                className="text-zinc-400 hover:text-zinc-200 transition-colors p-1 rounded-lg hover:bg-zinc-900 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            {isSubmitted ? (
              <div className="py-8 flex flex-col items-center justify-center text-center space-y-3 animate-in fade-in duration-300">
                <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h5 className="font-semibold text-sm text-zinc-200">You're on the list!</h5>
                  <p className="mt-1 text-xs text-zinc-200">
                    {modalSource === 'export'
                      ? "We'll invite you as soon as BatchSafe Cloud features are ready!"
                      : "We'll email you as soon as early access to BatchSafe Cloud is ready."}
                  </p>
                  <p className="mt-3 text-xs text-zinc-400 italic animate-pulse">
                    You will be redirected to the dashboard in a couple of seconds...
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {modalSource === 'export' ? (
                    <span>
                      Want payout task tracking, contributor records, and team workflows? Join the waitlist for BatchSafe Cloud.
                    </span>
                  ) : (
                    <span>
                      Enter your email to join the waitlist for BatchSafe Cloud. Get early beta previews and updates on our upcoming workflow tools.
                    </span>
                  )}
                </p>

                <div className="space-y-1">
                  <input
                    type="email"
                    required
                    disabled={isLoading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900/40 p-2.5 text-xs text-zinc-200 placeholder-zinc-550 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 transition-all disabled:opacity-50"
                  />
                  {error && (
                    <div className="text-[10px] text-rose-400 font-medium pt-1 animate-in fade-in duration-150">
                      {error}
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 focus:outline-none shadow-md shadow-indigo-600/10 transition-all cursor-pointer w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Requesting Access...' : 'Request Early Access'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
