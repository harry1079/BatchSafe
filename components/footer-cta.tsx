import React, { useState } from 'react';
import { Zap, X, Terminal, CheckCircle2, ArrowRight } from 'lucide-react';
import { track } from '@vercel/analytics';

export default function FooterCta() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      // Track beta registration event
      try {
        const domain = email.split('@')[1] || 'unknown';
        track('beta_signup', { email_domain: domain });
      } catch (err) {
        // Ignored in dev
      }

      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setEmail('');
        setIsOpen(false);
      }, 2500);
    }
  };

  return (
    <>
      <div className="w-full">
        {/* Trojan Horse Premium CTA Card */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-950/45 p-6 sm:p-8 shadow-2xl pulse-border">
          {/* Decorative glowing gradient orb */}
          <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                <Zap className="h-3 w-3 fill-indigo-400" />
                Trojan Horse Automation
              </div>
              <h3 className="font-display text-base sm:text-lg font-bold text-zinc-100 leading-snug">
                Tired of compiling payment spreadsheets every Friday?
              </h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Connect your ClickUp or Linear workspace directly. Automate your EVM address verification and compile Safe transfer batches in seconds. Stop pasting spreadsheets manually.
              </p>
            </div>

            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2 shrink-0 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/25 hover:from-indigo-600 hover:to-violet-700 transition-all duration-200 cursor-pointer group"
            >
              <span>Join Task Manager Beta</span>
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
                  <Terminal className="h-4.5 w-4.5" />
                </div>
                <h4 className="font-display text-sm font-bold text-white">
                  BatchSafe Automation Beta
                </h4>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsSubmitted(false);
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
                  <p className="mt-1 text-xs text-zinc-400">
                    We'll email you once linear-integration features are live.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Enter your email to receive early developer previews, API documentation, and details about our upcoming ClickUp & Linear webhook trigger modules.
                </p>

                <div className="space-y-1">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900/40 p-2.5 text-xs text-zinc-200 placeholder-zinc-550 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 transition-all"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 focus:outline-none shadow-md shadow-indigo-600/10 transition-all cursor-pointer w-full sm:w-auto"
                  >
                    Request Early Access
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
