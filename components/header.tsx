import React from 'react';
import { ShieldCheck, Github } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-700/80 bg-zinc-950/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-lg font-bold tracking-tight text-white">
              BatchSafe
            </span>
            <span className="text-[10px] text-zinc-450 font-semibold tracking-wide uppercase -mt-0.5">
              batchsafe.xyz
            </span>
          </div>
        </div>

        {/* Tagline / Indicator */}
        <div className="hidden md:flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/40 px-3 py-1 text-xs text-zinc-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>100% Client-Side & Private</span>
        </div>

        {/* External Links */}
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/harry1079/BatchSafe"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-zinc-300 transition-colors hover:text-zinc-100"
          >
            <Github className="h-4 w-4" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
}
