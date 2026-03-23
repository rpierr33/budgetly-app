"use client";
import React, { useState, useMemo } from "react";
import { useBudget } from "@/lib/store";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Plus, Search, Trash2, Download } from "lucide-react";

const card: React.CSSProperties = { background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', overflow: 'hidden' };

export default function TransactionsPage() {
  const { categories, transactions, addTransaction, deleteTransaction } = useBudget();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [catFilter, setCatFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], description: "", amount: "", type: "expense" as "income" | "expense", categoryId: "" });

  const filtered = useMemo(() => {
    return transactions.filter(tx => {
      if (typeFilter !== "all" && tx.type !== typeFilter) return false;
      if (catFilter !== "all" && tx.categoryId !== catFilter) return false;
      if (search && !tx.description.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [transactions, search, typeFilter, catFilter]);

  const totalIncome = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const handleAdd = () => {
    if (!form.description || !form.amount || !form.categoryId) return;
    const cat = categories.find(c => c.id === form.categoryId);
    addTransaction({ ...form, amount: parseFloat(form.amount), categoryName: cat?.name || 'Other' });
    setForm({ date: new Date().toISOString().split('T')[0], description: "", amount: "", type: "expense", categoryId: "" });
    setShowAdd(false);
  };

  const exportCSV = () => {
    const rows = [['Date', 'Description', 'Category', 'Amount', 'Type'].join(','), ...filtered.map(t => [t.date, `"${t.description}"`, t.categoryName, t.amount, t.type].join(','))];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'budgetly-transactions.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="animate-fade-in">
      {/* Summary */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, background: '#ECFDF5', border: '1px solid #A7F3D0' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#059669' }}>Income: {formatCurrency(totalIncome)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, background: '#FEF2F2', border: '1px solid #FECACA' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#EF4444' }}>Expenses: {formatCurrency(totalExpense)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, background: '#EDE9FE', border: '1px solid #DDD6FE' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#7C3AED' }}>Net: {formatCurrency(totalIncome - totalExpense)}</span>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200, maxWidth: 360 }}>
          <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#94A3B8', pointerEvents: 'none' }} />
          <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
        </div>
        <Select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="w-28">
          <option value="all">All types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </Select>
        <Select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="w-36">
          <option value="all">All categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
        <button onClick={exportCSV} className="cursor-pointer" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 8, fontSize: 12, fontWeight: 500, background: '#fff', border: '1px solid #E2E8F0', color: '#475569' }}>
          <Download style={{ width: 14, height: 14 }} /> CSV
        </button>
        <Button onClick={() => setShowAdd(true)} className="cursor-pointer">
          <Plus style={{ width: 16, height: 16, marginRight: 6 }} /> Add
        </Button>
      </div>

      {/* Transaction list */}
      <div style={card}>
        {filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: '#94A3B8' }}>No transactions found</p>
          </div>
        ) : (
          <div>
            {filtered.map((tx, i) => (
              <div key={tx.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 20px', borderBottom: i < filtered.length - 1 ? '1px solid #F1F5F9' : 'none', background: i % 2 === 1 ? '#FAFBFC' : 'transparent' }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.description}</p>
                  <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{formatDate(tx.date)} &middot; {tx.categoryName}</p>
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, fontVariantNumeric: 'tabular-nums', flexShrink: 0, color: tx.type === 'income' ? '#059669' : '#EF4444' }}>
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                </span>
                <button onClick={() => deleteTransaction(tx.id)} className="cursor-pointer" style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent', color: '#CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Trash2 style={{ width: 14, height: 14 }} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add dialog */}
      <Dialog open={showAdd} onClose={() => setShowAdd(false)}>
        <DialogHeader><DialogTitle>Add Transaction</DialogTitle></DialogHeader>
        <DialogContent>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#475569', display: 'block', marginBottom: 6 }}>Description</label>
              <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="e.g., Grocery store" />
            </div>
            <div className="grid grid-cols-2" style={{ gap: 12 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: '#475569', display: 'block', marginBottom: 6 }}>Amount</label>
                <Input type="number" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0.00" />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: '#475569', display: 'block', marginBottom: 6 }}>Type</label>
                <Select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as "income" | "expense" })}>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </Select>
              </div>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#475569', display: 'block', marginBottom: 6 }}>Category</label>
              <Select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}>
                <option value="">Select category...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#475569', display: 'block', marginBottom: 6 }}>Date</label>
              <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
          </div>
        </DialogContent>
        <DialogFooter className="flex gap-3">
          <Button variant="outline" onClick={() => setShowAdd(false)} className="flex-1 w-full cursor-pointer">Cancel</Button>
          <Button onClick={handleAdd} className="flex-1 w-full cursor-pointer">Add Transaction</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
