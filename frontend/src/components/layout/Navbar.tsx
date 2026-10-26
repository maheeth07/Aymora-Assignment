"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Compass, MessageCircleHeart, Gamepad2, ShieldCheck } from "lucide-react";
import Image from "next/image";

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/discover", label: "Smart Matches", icon: Compass },
    { href: "/conversations", label: "Conversations", icon: MessageCircleHeart },
    { href: "/games/would-you-rather", label: "Would You Rather?", icon: Gamepad2 },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#E8E1D5]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-full bg-[#3B1E34] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-[#FAF7F2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif text-xl font-bold tracking-tight text-[#3B1E34]">
                Aymora
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#D07086] px-1.5 py-0.5 rounded bg-[#FDF2F4]">
                Spark
              </span>
            </div>
            <p className="text-[10px] text-[#645C6E] hidden sm:block">
              Meaningful compatibility & genuine connection
            </p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#3B1E34] text-white shadow-sm"
                    : "text-[#645C6E] hover:text-[#1F1A24] hover:bg-[#F3EEF9]"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Active Demo User Avatar */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-[#E8E1D5]">
          <div className="relative">
            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#D07086] shadow-sm">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                alt="Maya Lin"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#2E7D58] ring-2 ring-[#FAF7F2]" title="Active Prototype Session" />
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold text-[#1F1A24]">Maya Lin</p>
            <p className="text-[10px] text-[#645C6E] flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#2E7D58]" /> Private Account
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
