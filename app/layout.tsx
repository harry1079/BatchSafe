import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { PostHogProvider } from "../components/posthog-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://batchsafe.xyz'),
  title: "BatchSafe | Gnosis Safe CSV Import & Bulk Batch Payout Tool",
  description: "Instantly convert CSV files to Gnosis Safe bulk transfers. Validate formats, verify EVM checksums, and compile Safe-compatible batch payouts. 100% client-side, free, and secure.",
  keywords: ["Gnosis Safe", "Safe", "CSV Generator", "Bulk Transfer", "Crypto Payouts", "EVM Payouts", "Web3 Utility", "Gnosis Safe CSV Import", "Batch Payout"],
  authors: [{ name: "BatchSafe Team" }],
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full antialiased dark`}
      style={{ colorScheme: "dark" }}
    >
      <body className="min-h-full flex flex-col bg-[#030303] text-zinc-100 font-sans selection:bg-indigo-500/30 selection:text-white">
        <PostHogProvider>
          {children}
        </PostHogProvider>
        <Analytics />
      </body>
    </html>
  );
}
