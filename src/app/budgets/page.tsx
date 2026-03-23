"use client";
import React, { useState } from "react";
import { useBudget } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";

const card: React.CSSProperties = { background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' };

const COLORS = ['#7C3AED', '#059669', '#2563EB', '#F59E0B', '#EC4899', '#F97316', '#06B6D4', '#8B5CF6', '#EF4444', '#64748B'];

export default function BudgetsPage() {
  const { categories, setBudget, addCategory, deleteCategory } = useBudget();
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [newName, setNewName] = useState("");
  const [newAmount, setNewAmount] = useState("");

  const total = categories.reduce((s, c) => s + c.monthlyBudget, 0);

  const handleSaveEdit = () => {
    if (editId && editAmount) {
      setBudget(editId, parseFloat(editAmount));
      setEditId(null);
    }
  };

  const handleAdd = () => {
    if (!newName.trim() || !newAmount) return;
    addCategory({ name: newName, icon: 'Tag', color: COLORS[categories.length % COLORS.length], monthlyBudget: parseFloat(newAmount) });
    setNewName(""); setNewAmount(""); setShowAdd(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748B' }}>Total Monthly Budget</p>
          <p style={{ fontSize: 28, fontWeight: 800, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', color: '#0F172A', marginTop: 4 }}>{formatCurrency(total)}</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="cursor-pointer">
          <Plus style={{ width: 16, height: 16, marginRight: 6 }} /> Add Category
        </Button>
      </div>

      {/* Category grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: 12 }}>
        {categories.map(cat => (
          <div key={cat.id} style={{ ...card, borderLeft: `4px solid ${cat.color}`, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{cat.name}</p>
                <p style={{ fontSize: 22, fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: '#0F172A', marginTop: 4 }}>{formatCurrency(cat.monthlyBudget)}</p>
                <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>per month</p>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => { setEditId(cat.id); setEditAmount(String(cat.monthlyBudget)); }} className="cursor-pointer" style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid #E2E8F0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
                  <Pencil style={{ width: 14, height: 14 }} />
                </button>
                <button onClick={() => deleteCategory(cat.id)} className="cursor-pointer" style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid #E2E8F0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
                  <Trash2 style={{ width: 14, height: 14 }} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit budget dialog */}
      <Dialog open={!!editId} onClose={() => setEditId(null)}>
        <DialogHeader><DialogTitle>Edit Budget</DialogTitle></DialogHeader>
        <DialogContent>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#475569', display: 'block', marginBottom: 6 }}>Monthly Amount</label>
            <Input type="number" step="0.01" value={editAmount} onChange={e => setEditAmount(e.target.value)} />
          </div>
        </DialogContent>
        <DialogFooter className="flex gap-3">
          <Button variant="outline" onClick={() => setEditId(null)} className="flex-1 w-full cursor-pointer">Cancel</Button>
          <Button onClick={handleSaveEdit} className="flex-1 w-full cursor-pointer">Save</Button>
        </DialogFooter>
      </Dialog>

      {/* Add category dialog */}
      <Dialog open={showAdd} onClose={() => setShowAdd(false)}>
        <DialogHeader><DialogTitle>New Category</DialogTitle></DialogHeader>
        <DialogContent>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#475569', display: 'block', marginBottom: 6 }}>Category Name</label>
              <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g., Subscriptions" />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#475569', display: 'block', marginBottom: 6 }}>Monthly Budget</label>
              <Input type="number" step="0.01" value={newAmount} onChange={e => setNewAmount(e.target.value)} placeholder="0.00" />
            </div>
          </div>
        </DialogContent>
        <DialogFooter className="flex gap-3">
          <Button variant="outline" onClick={() => setShowAdd(false)} className="flex-1 w-full cursor-pointer">Cancel</Button>
          <Button onClick={handleAdd} className="flex-1 w-full cursor-pointer">Add Category</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
