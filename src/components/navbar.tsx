"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Wallet, ArrowLeftRight, Target } from "lucide-react";
import { useBudget } from "@/lib/store";
import { CURRENCIES, type CurrencyCode } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/budgets", label: "Budgets", icon: Wallet },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/goals", label: "Goals", icon: Target },
];

export function Navbar() {
  const pathname = usePathname();
  const { currency, setCurrency } = useBudget();

  return (
    <>
      {/* Desktop navbar */}
      <header className="hidden sm:block" style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #7C3AED, #9333EA)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(124,58,237,0.25)' }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>B</span>
            </div>
            <span style={{ fontSize: 17, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.01em' }}>Budgetly</span>
          </Link>

          {/* Nav links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {navLinks.map(link => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: active ? 600 : 400,
                    color: active ? '#7C3AED' : '#64748B',
                    background: active ? '#EDE9FE' : 'transparent',
                    textDecoration: 'none', transition: 'all 0.15s',
                  }}
                >
                  <link.icon style={{ width: 16, height: 16 }} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Currency + Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <select
              value={currency}
              onChange={e => setCurrency(e.target.value as CurrencyCode)}
              style={{
                height: 34, padding: '0 28px 0 10px', borderRadius: 8, border: '1px solid #E2E8F0',
                background: '#F8FAFC', fontSize: 12, fontWeight: 500, color: '#475569',
                cursor: 'pointer', appearance: 'none',
                backgroundImage: "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m4 6 4 4 4-4'/%3E%3C/svg%3E\")",
                backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center', backgroundSize: '14px',
              }}
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
              ))}
            </select>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #7C3AED, #9333EA)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#fff' }}>JP</span>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav className="sm:hidden" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(255,255,255,0.97)', borderTop: '1px solid #E2E8F0', backdropFilter: 'blur(12px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', height: 60, maxWidth: 400, margin: '0 auto' }}>
          {navLinks.map(link => {
            const active = pathname === link.href;
            return (
              <Link key={link.href} href={link.href} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '4px 12px', textDecoration: 'none', color: active ? '#7C3AED' : '#94A3B8' }}>
                <link.icon style={{ width: 20, height: 20 }} />
                <span style={{ fontSize: 10, fontWeight: active ? 600 : 400 }}>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
