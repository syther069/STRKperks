"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, BookOpen, LayoutDashboard, Megaphone, Menu, Plus, Shield, X } from "lucide-react";
import { useState } from "react";
import { WalletButton } from "../wallet/WalletButton";

const links = [{ href: "/", label: "Dashboard", icon: LayoutDashboard }, { href: "/campaigns", label: "Campaigns", icon: Megaphone }, { href: "/campaigns/create", label: "Create campaign", icon: Plus }, { href: "/activity", label: "Activity", icon: Activity }, { href: "/docs", label: "Documentation", icon: BookOpen }];

export function Navbar() {
  const pathname = usePathname(); const [open, setOpen] = useState(false);
  const nav = <>{links.map(({ href, label, icon: Icon }) => { const active = href === "/" ? pathname === "/" : pathname.startsWith(href); return <Link key={href} href={href} onClick={() => setOpen(false)} className={`flex min-h-11 items-center gap-3 rounded-btn px-3 text-sm transition-colors duration-200 ${active ? "bg-bg-raised text-fg-primary" : "text-fg-secondary hover:bg-bg-surface hover:text-fg-primary"}`}><Icon className={`size-4 ${active ? "text-brand-primary" : "text-fg-muted"}`} />{label}</Link>; })}<Link href="/demo" onClick={() => setOpen(false)} className="mt-4 flex min-h-11 items-center justify-between rounded-btn border border-status-warning/30 px-3 text-sm text-status-warning"><span>Judge demo</span><span className="text-[10px] uppercase">Simulation</span></Link></>;
  return <><aside className="fixed inset-y-0 left-0 z-40 hidden w-60 border-r border-border bg-bg p-4 md:flex md:flex-col"><Link href="/" className="flex h-12 items-center gap-3 px-2 font-display text-lg font-semibold"><span className="flex size-8 items-center justify-center rounded-btn bg-brand-primary text-bg"><Shield className="size-4" /></span>StrkPerks</Link><p className="mt-7 px-3 text-[10px] uppercase tracking-[0.12em] text-fg-muted">Reward operations</p><nav className="mt-2 space-y-1">{nav}</nav><div className="mt-auto border-t border-border px-3 pt-4 text-xs leading-5 text-fg-muted">Starknet is the authoritative production state source.</div></aside><header className="sticky top-0 z-30 border-b border-border bg-bg/95 md:ml-60"><div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8"><div><p className="text-xs text-fg-muted">Starknet Sepolia</p><p className="text-sm font-medium text-fg-primary">Signal Vault</p></div><div className="flex items-center gap-2"><WalletButton /><button className="rounded p-2 md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle navigation">{open ? <X className="size-5" /> : <Menu className="size-5" />}</button></div></div>{open && <nav className="border-t border-border bg-bg p-3 md:hidden">{nav}</nav>}</header></>;
}
