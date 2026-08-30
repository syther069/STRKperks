"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletButton } from "../wallet/WalletButton";
import { useDemoStore } from "../../lib/store/demoStore";
import {
  Shield,
  LayoutDashboard,
  Megaphone,
  PlusCircle,
  Sparkles,
  BookOpen,
  Menu,
  X,
  Lock,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { isDemoMode, toggleDemoMode } = useDemoStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/campaigns", label: "Campaigns", icon: Megaphone },
    { href: "/campaigns/create", label: "Create", icon: PlusCircle },
    { href: "/demo", label: "Judge Demo", icon: Sparkles, badge: "7-Step" },
    { href: "/docs", label: "Docs & Privacy", icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-bg/95 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-btn bg-brand-primary flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
              <Shield className="w-4 h-4 text-fg-primary" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display font-bold text-lg text-fg-primary tracking-tight">
                StrkPerks
              </span>
              <span className="text-[10px] font-mono font-bold text-brand-reward px-1.5 py-0.2 rounded bg-brand-reward-subtle border border-brand-reward/30">
                STRK20
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-btn text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-bg-raised text-brand-primary border border-border"
                      : "text-fg-secondary hover:text-fg-primary hover:bg-bg-raised/60"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-brand-primary/20 text-brand-primary font-bold">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-3">
          {/* Demo Mode Switcher */}
          <button
            onClick={() => toggleDemoMode()}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border transition-colors cursor-pointer ${
              isDemoMode
                ? "bg-brand-privacy-subtle text-brand-privacy border-brand-privacy/40"
                : "bg-bg-raised text-fg-muted border-border"
            }`}
            title="Toggle Live/Demo Sandbox Mode"
          >
            <Lock className="w-3 h-3" />
            <span>{isDemoMode ? "Demo Mode" : "Live Starknet"}</span>
          </button>

          <WalletButton />

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded md:hidden text-fg-muted hover:text-fg-primary"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-bg-surface px-4 pt-2 pb-4 space-y-1 animate-in slide-in-from-top-2 duration-150">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2 rounded-btn text-sm font-medium ${
                  isActive
                    ? "bg-bg-raised text-brand-primary font-semibold"
                    : "text-fg-secondary hover:text-fg-primary"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-brand-primary/20 text-brand-primary font-bold">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
