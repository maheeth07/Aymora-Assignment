import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "Aymora Spark — Discover Meaningful Compatibility",
  description:
    "A privacy-conscious dating and connection platform designed for intentional compatibility, natural conversations, and genuine chemistry.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1F1A24]">
        <Suspense fallback={<header className="h-16 bg-[#FAF7F2] border-b border-[#E8E1D5]" />}>
          <Navbar />
        </Suspense>
        <main className="flex-1 pb-16">{children}</main>
        
        {/* Editorial Footer */}
        <footer className="border-t border-[#E8E1D5] bg-[#FAF7F2] py-8 text-xs text-[#645C6E]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-sm text-[#3B1E34]">Aymora Spark</span>
              <span>—</span>
              <span>Intentional, privacy-first connection platform</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EAE3F7]/50 border border-[#EAE3F7] text-[#3B1E34]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D58]" /> FastApi & Groq AI
              </span>
              <span>Transparent Compatibility</span>
              <span>Zero Public Likes</span>
              <span>In-Memory Prototype</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
