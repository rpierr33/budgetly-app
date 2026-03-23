"use client";
import React, { useState, useMemo } from "react";
import { useBudget } from "@/lib/store";
import { formatCurrency, formatDate, getCurrencySymbol } from "@/lib/utils";
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Wallet, DollarSign, PiggyBank } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const card: React.CSSProperties = { background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' };
const label: React.CSSProperties = { fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748B' };
const bigNum: React.CSSProperties = { fontSize: 28, fontWeight: 800, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', color: '#0F172A' };

export default function DashboardPage() {
  const { categories, transactions, getMonthlyStats, getCategorySpending, currency } = useBudget();
  const [monthOffset, setMonthOffset] = useState(0);

  const currentMonth = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + monthOffset);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }, [monthOffset]);

  const monthLabel = useMemo(() => {
    const [y, m] = currentMonth.split('-');
    return new Date(Number(y), Number(m) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [currentMonth]);

  const stats = getMonthlyStats(currentMonth);
  const recentTxs = transactions.filter(t => t.date.startsWith(currentMonth)).slice(0, 10);

  // Build 6-month chart data
  const chartData = useMemo(() => {
    const data: { month: string; spent: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i + monthOffset);
      const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const mLabel = d.toLocaleDateString('en-US', { month: 'short' });
      const spent = transactions.filter(t => t.type === 'expense' && t.date.startsWith(m)).reduce((s, t) => s + t.amount, 0);
      data.push({ month: mLabel, spent });
    }
    return data;
  }, [transactions, monthOffset]);

  const pctColor = stats.percentUsed <= 80 ? '#059669' : stats.percentUsed <= 100 ? '#F59E0B' : '#EF4444';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">
      {/* Month selector */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <button onClick={() => setMonthOffset(o => o - 1)} className="cursor-pointer" style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid #E2E8F0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
          <ChevronLeft style={{ width: 18, height: 18 }} />
        </button>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', minWidth: 180, textAlign: 'center' }}>{monthLabel}</h2>
        <button onClick={() => setMonthOffset(o => o + 1)} className="cursor-pointer" style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid #E2E8F0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
          <ChevronRight style={{ width: 18, height: 18 }} />
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: 12 }}>
        <div style={{ ...card, padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wallet style={{ width: 16, height: 16, color: '#7C3AED' }} />
            </div>
            <span style={label}>Budget</span>
          </div>
          <p style={bigNum}>{formatCurrency(stats.totalBudget, currency)}</p>
        </div>
        <div style={{ ...card, padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingDown style={{ width: 16, height: 16, color: '#EF4444' }} />
            </div>
            <span style={label}>Spent</span>
          </div>
          <p style={{ ...bigNum, color: '#EF4444' }}>{formatCurrency(stats.totalSpent, currency)}</p>
        </div>
        <div style={{ ...card, padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PiggyBank style={{ width: 16, height: 16, color: '#059669' }} />
            </div>
            <span style={label}>Remaining</span>
          </div>
          <p style={{ ...bigNum, color: stats.remaining >= 0 ? '#059669' : '#EF4444' }}>{formatCurrency(stats.remaining, currency)}</p>
        </div>
        <div style={{ ...card, padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: pctColor === '#059669' ? '#ECFDF5' : pctColor === '#F59E0B' ? '#FFFBEB' : '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign style={{ width: 16, height: 16, color: pctColor }} />
            </div>
            <span style={label}>Used</span>
          </div>
          <p style={{ ...bigNum, color: pctColor }}>{stats.percentUsed}%</p>
          <div style={{ marginTop: 8, height: 6, borderRadius: 99, background: '#F1F5F9', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 99, background: pctColor, width: `${Math.min(stats.percentUsed, 100)}%`, transition: 'width 0.3s' }} />
          </div>
        </div>
      </div>

      {/* Category breakdown + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-5" style={{ gap: 16 }}>
        {/* Categories */}
        <div className="lg:col-span-3" style={{ ...card, padding: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 16 }}>Category Breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {categories.map(cat => {
              const spent = getCategorySpending(cat.id, currentMonth);
              const pct = cat.monthlyBudget > 0 ? Math.round((spent / cat.monthlyBudget) * 100) : 0;
              const barColor = pct <= 80 ? '#059669' : pct <= 100 ? '#F59E0B' : '#EF4444';
              return (
                <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: cat.color, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#0F172A' }}>{cat.name}</span>
                      <span style={{ fontSize: 12, fontVariantNumeric: 'tabular-nums', color: '#64748B' }}>
                        {formatCurrency(spent, currency)} / {formatCurrency(cat.monthlyBudget, currency)}
                      </span>
                    </div>
                    <div style={{ height: 4, borderRadius: 99, background: '#F1F5F9', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 99, background: barColor, width: `${Math.min(pct, 100)}%` }} />
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: barColor, minWidth: 36, textAlign: 'right' }}>{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Spending trend */}
        <div className="lg:col-span-2" style={{ ...card, padding: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>Spending Trend</h3>
          <p style={{ fontSize: 12, color: '#94A3B8', marginBottom: 16 }}>Last 6 months</p>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={45} tickFormatter={v => `${getCurrencySymbol(currency)}${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => formatCurrency(Number(v), currency)} contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }} />
                <Bar dataKey="spent" name="Spent" fill="#7C3AED" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent transactions */}
      <div style={{ ...card, padding: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 16 }}>Recent Transactions</h3>
        {recentTxs.length === 0 ? (
          <p style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', padding: 24 }}>No transactions this month</p>
        ) : (
          <div>
            {recentTxs.map((tx, i) => (
              <div key={tx.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '10px 0', borderBottom: i < recentTxs.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.description}</p>
                  <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{formatDate(tx.date)} &middot; {tx.categoryName}</p>
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, fontVariantNumeric: 'tabular-nums', flexShrink: 0, color: tx.type === 'income' ? '#059669' : '#EF4444' }}>
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
