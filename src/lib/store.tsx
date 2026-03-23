"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

// ── Types ──────────────────────────────────────────────────────

export interface BudgetCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  monthlyBudget: number;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  categoryId: string;
  categoryName: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  color: string;
}

interface BudgetStore {
  categories: BudgetCategory[];
  transactions: Transaction[];
  goals: SavingsGoal[];
  addTransaction: (tx: Omit<Transaction, "id">) => void;
  deleteTransaction: (id: string) => void;
  setBudget: (categoryId: string, amount: number) => void;
  addCategory: (cat: Omit<BudgetCategory, "id">) => void;
  deleteCategory: (id: string) => void;
  addGoal: (goal: Omit<SavingsGoal, "id">) => void;
  updateGoal: (id: string, currentAmount: number) => void;
  deleteGoal: (id: string) => void;
  getMonthlyStats: (month: string) => { totalBudget: number; totalSpent: number; totalIncome: number; remaining: number; percentUsed: number };
  getCategorySpending: (categoryId: string, month: string) => number;
}

// ── Seed Data ──────────────────────────────────────────────────

const uid = () => crypto.randomUUID();

const defaultCategories: BudgetCategory[] = [
  { id: uid(), name: "Housing", icon: "Home", color: "#7C3AED", monthlyBudget: 1500 },
  { id: uid(), name: "Food & Groceries", icon: "ShoppingCart", color: "#059669", monthlyBudget: 600 },
  { id: uid(), name: "Transportation", icon: "Car", color: "#2563EB", monthlyBudget: 200 },
  { id: uid(), name: "Utilities", icon: "Zap", color: "#F59E0B", monthlyBudget: 150 },
  { id: uid(), name: "Entertainment", icon: "Tv", color: "#EC4899", monthlyBudget: 100 },
  { id: uid(), name: "Shopping", icon: "ShoppingBag", color: "#F97316", monthlyBudget: 80 },
  { id: uid(), name: "Health", icon: "Heart", color: "#06B6D4", monthlyBudget: 120 },
  { id: uid(), name: "Education", icon: "BookOpen", color: "#8B5CF6", monthlyBudget: 50 },
  { id: uid(), name: "Savings", icon: "PiggyBank", color: "#059669", monthlyBudget: 500 },
  { id: uid(), name: "Other", icon: "MoreHorizontal", color: "#64748B", monthlyBudget: 100 },
];

function buildSeedTransactions(cats: BudgetCategory[]): Transaction[] {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const tx: Transaction[] = [];
  const add = (day: number, desc: string, amt: number, type: "income" | "expense", catIdx: number) => {
    tx.push({ id: uid(), date: `${y}-${String(m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`, description: desc, amount: amt, type, categoryId: cats[catIdx].id, categoryName: cats[catIdx].name });
  };
  add(1, "Salary Deposit", 4500, "income", 0);
  add(1, "Rent Payment", 1400, "expense", 0);
  add(3, "Grocery Store", 127.45, "expense", 1);
  add(5, "Gas Station", 48.50, "expense", 2);
  add(6, "Electric Bill", 89.20, "expense", 3);
  add(7, "Netflix Subscription", 15.99, "expense", 4);
  add(8, "Amazon Purchase", 34.99, "expense", 5);
  add(10, "Pharmacy", 22.50, "expense", 6);
  add(11, "Online Course", 29.99, "expense", 7);
  add(12, "Grocery Store", 95.30, "expense", 1);
  add(14, "Freelance Payment", 850, "income", 0);
  add(15, "Internet Bill", 59.99, "expense", 3);
  add(16, "Movie Tickets", 28.00, "expense", 4);
  add(18, "Uber Ride", 23.45, "expense", 2);
  add(20, "Savings Transfer", 500, "expense", 8);
  return tx;
}

const defaultGoals: SavingsGoal[] = [
  { id: uid(), name: "Emergency Fund", targetAmount: 10000, currentAmount: 5000, deadline: "2026-12-31", color: "#059669" },
  { id: uid(), name: "Vacation", targetAmount: 3000, currentAmount: 800, deadline: "2026-08-01", color: "#2563EB" },
];

// ── Context ────────────────────────────────────────────────────

const BudgetContext = createContext<BudgetStore | null>(null);

export function BudgetProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const cats = localStorage.getItem("budgetly_categories");
      const txs = localStorage.getItem("budgetly_transactions");
      const gls = localStorage.getItem("budgetly_goals");
      if (cats && txs && gls) {
        setCategories(JSON.parse(cats));
        setTransactions(JSON.parse(txs));
        setGoals(JSON.parse(gls));
      } else {
        const seedCats = defaultCategories;
        setCategories(seedCats);
        setTransactions(buildSeedTransactions(seedCats));
        setGoals(defaultGoals);
      }
    } catch {
      const seedCats = defaultCategories;
      setCategories(seedCats);
      setTransactions(buildSeedTransactions(seedCats));
      setGoals(defaultGoals);
    }
    setLoaded(true);
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem("budgetly_categories", JSON.stringify(categories));
    localStorage.setItem("budgetly_transactions", JSON.stringify(transactions));
    localStorage.setItem("budgetly_goals", JSON.stringify(goals));
  }, [categories, transactions, goals, loaded]);

  const addTransaction = useCallback((tx: Omit<Transaction, "id">) => {
    setTransactions(prev => [{ ...tx, id: crypto.randomUUID() }, ...prev]);
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, []);

  const setBudget = useCallback((categoryId: string, amount: number) => {
    setCategories(prev => prev.map(c => c.id === categoryId ? { ...c, monthlyBudget: amount } : c));
  }, []);

  const addCategory = useCallback((cat: Omit<BudgetCategory, "id">) => {
    setCategories(prev => [...prev, { ...cat, id: crypto.randomUUID() }]);
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  }, []);

  const addGoal = useCallback((goal: Omit<SavingsGoal, "id">) => {
    setGoals(prev => [...prev, { ...goal, id: crypto.randomUUID() }]);
  }, []);

  const updateGoal = useCallback((id: string, currentAmount: number) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, currentAmount } : g));
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  }, []);

  const getMonthlyStats = useCallback((month: string) => {
    const totalBudget = categories.reduce((s, c) => s + c.monthlyBudget, 0);
    const monthTxs = transactions.filter(t => t.date.startsWith(month));
    const totalSpent = monthTxs.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const totalIncome = monthTxs.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const remaining = totalBudget - totalSpent;
    const percentUsed = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
    return { totalBudget, totalSpent, totalIncome, remaining, percentUsed };
  }, [categories, transactions]);

  const getCategorySpending = useCallback((categoryId: string, month: string) => {
    return transactions
      .filter(t => t.categoryId === categoryId && t.type === "expense" && t.date.startsWith(month))
      .reduce((s, t) => s + t.amount, 0);
  }, [transactions]);

  if (!loaded) return null;

  return (
    <BudgetContext.Provider value={{ categories, transactions, goals, addTransaction, deleteTransaction, setBudget, addCategory, deleteCategory, addGoal, updateGoal, deleteGoal, getMonthlyStats, getCategorySpending }}>
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget() {
  const ctx = useContext(BudgetContext);
  if (!ctx) throw new Error("useBudget must be used within BudgetProvider");
  return ctx;
}
