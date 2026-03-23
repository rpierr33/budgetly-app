"use client";
import React, { useState } from "react";
import { useBudget } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Plus, Target, Trash2, CheckCircle2, PartyPopper } from "lucide-react";

const card: React.CSSProperties = { background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' };

const GOAL_COLORS = ['#7C3AED', '#059669', '#2563EB', '#F59E0B', '#EC4899', '#F97316'];

export default function GoalsPage() {
  const { goals, addGoal, updateGoal, deleteGoal, currency } = useBudget();
  const [showAdd, setShowAdd] = useState(false);
  const [addFundId, setAddFundId] = useState<string | null>(null);
  const [fundAmount, setFundAmount] = useState("");
  const [form, setForm] = useState({ name: "", targetAmount: "", deadline: "", color: GOAL_COLORS[0] });

  const handleAdd = () => {
    if (!form.name || !form.targetAmount) return;
    addGoal({ name: form.name, targetAmount: parseFloat(form.targetAmount), currentAmount: 0, deadline: form.deadline || '', color: form.color });
    setForm({ name: "", targetAmount: "", deadline: "", color: GOAL_COLORS[(goals.length + 1) % GOAL_COLORS.length] });
    setShowAdd(false);
  };

  const handleAddFund = () => {
    if (!addFundId || !fundAmount) return;
    const goal = goals.find(g => g.id === addFundId);
    if (goal) updateGoal(addFundId, goal.currentAmount + parseFloat(fundAmount));
    setAddFundId(null); setFundAmount("");
  };

  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748B' }}>Total Saved</p>
          <p style={{ fontSize: 28, fontWeight: 800, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', color: '#059669', marginTop: 4 }}>
            {formatCurrency(totalSaved, currency)}
            <span style={{ fontSize: 14, fontWeight: 500, color: '#94A3B8', marginLeft: 8 }}>of {formatCurrency(totalTarget, currency)}</span>
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="cursor-pointer">
          <Plus style={{ width: 16, height: 16, marginRight: 6 }} /> New Goal
        </Button>
      </div>

      {/* Goals grid */}
      {goals.length === 0 ? (
        <div style={{ ...card, padding: 48, textAlign: 'center' }}>
          <Target style={{ width: 40, height: 40, color: '#CBD5E1', margin: '0 auto 12px' }} />
          <p style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>No goals yet</p>
          <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 16 }}>Set a savings goal to start tracking your progress.</p>
          <Button onClick={() => setShowAdd(true)} size="sm" className="cursor-pointer"><Plus style={{ width: 14, height: 14, marginRight: 6 }} /> Create Goal</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: 16 }}>
          {goals.map(goal => {
            const pct = goal.targetAmount > 0 ? Math.round((goal.currentAmount / goal.targetAmount) * 100) : 0;
            const isComplete = pct >= 100;
            const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
            return (
              <div key={goal.id} style={{ ...card, borderTop: `4px solid ${goal.color}`, padding: 24, position: 'relative', overflow: 'hidden' }}>
                {isComplete && (
                  <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 99, background: '#ECFDF5', color: '#059669', fontSize: 11, fontWeight: 600 }}>
                    <PartyPopper style={{ width: 12, height: 12 }} /> Complete!
                  </div>
                )}
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>{goal.name}</h3>
                {goal.deadline && <p style={{ fontSize: 11, color: '#94A3B8', marginBottom: 12 }}>Deadline: {new Date(goal.deadline + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>}

                {/* Progress */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 20, fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: '#0F172A' }}>{formatCurrency(goal.currentAmount, currency)}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: goal.color }}>{pct}%</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 99, background: '#F1F5F9', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 99, background: isComplete ? '#059669' : goal.color, width: `${Math.min(pct, 100)}%`, transition: 'width 0.3s' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    <span style={{ fontSize: 11, color: '#94A3B8' }}>{formatCurrency(remaining, currency)} to go</span>
                    <span style={{ fontSize: 11, color: '#94A3B8' }}>Target: {formatCurrency(goal.targetAmount, currency)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8 }}>
                  {!isComplete && (
                    <Button size="sm" onClick={() => { setAddFundId(goal.id); setFundAmount(""); }} className="cursor-pointer flex-1">
                      <Plus style={{ width: 14, height: 14, marginRight: 4 }} /> Add Funds
                    </Button>
                  )}
                  <button onClick={() => deleteGoal(goal.id)} className="cursor-pointer" style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #E2E8F0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', flexShrink: 0 }}>
                    <Trash2 style={{ width: 14, height: 14 }} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add funds dialog */}
      <Dialog open={!!addFundId} onClose={() => setAddFundId(null)}>
        <DialogHeader><DialogTitle>Add Funds</DialogTitle></DialogHeader>
        <DialogContent>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#475569', display: 'block', marginBottom: 6 }}>Amount to add</label>
            <Input type="number" step="0.01" value={fundAmount} onChange={e => setFundAmount(e.target.value)} placeholder="0.00" />
          </div>
        </DialogContent>
        <DialogFooter className="flex gap-3">
          <Button variant="outline" onClick={() => setAddFundId(null)} className="flex-1 w-full cursor-pointer">Cancel</Button>
          <Button onClick={handleAddFund} className="flex-1 w-full cursor-pointer">Add Funds</Button>
        </DialogFooter>
      </Dialog>

      {/* New goal dialog */}
      <Dialog open={showAdd} onClose={() => setShowAdd(false)}>
        <DialogHeader><DialogTitle>New Savings Goal</DialogTitle></DialogHeader>
        <DialogContent>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#475569', display: 'block', marginBottom: 6 }}>Goal Name</label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g., Emergency Fund" />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#475569', display: 'block', marginBottom: 6 }}>Target Amount</label>
              <Input type="number" step="0.01" value={form.targetAmount} onChange={e => setForm({ ...form, targetAmount: e.target.value })} placeholder="10000" />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#475569', display: 'block', marginBottom: 6 }}>Deadline (optional)</label>
              <Input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#475569', display: 'block', marginBottom: 6 }}>Color</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {GOAL_COLORS.map(c => (
                  <button key={c} onClick={() => setForm({ ...form, color: c })} className="cursor-pointer" style={{ width: 32, height: 32, borderRadius: 8, background: c, border: form.color === c ? '3px solid #0F172A' : '3px solid transparent', transition: 'border 0.15s' }} />
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogFooter className="flex gap-3">
          <Button variant="outline" onClick={() => setShowAdd(false)} className="flex-1 w-full cursor-pointer">Cancel</Button>
          <Button onClick={handleAdd} className="flex-1 w-full cursor-pointer">Create Goal</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
