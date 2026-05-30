import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
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
  title: "BatchSafe — Gnosis Safe Bulk Transfer CSV Tool",
  description: "Instantly parse, validate, checksum, and convert bulk address lists into a CSV format compatible with Gnosis Safe's Transaction Builder. 100% client-side, secure, and free.",
  keywords: ["Gnosis Safe", "Safe", "CSV Generator", "Bulk Transfer", "Crypto Payouts", "EVM Payouts", "Web3 Utility"],
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
        {children}
      </body>
    </html>
  );
}
