import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { saveBudget, subscribeToUserData } from '../lib/api';
import { Budget, Transaction } from '../types';
import { CATEGORIES } from '../ai/knowledge';
import { format } from 'date-fns';

export const Budgets = () => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [amount, setAmount] = useState('');

  const currentMonthStr = format(new Date(), 'yyyy-MM');

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToUserData(user.uid, setTransactions, setBudgets);
    return () => unsub();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !amount) return;

    await saveBudget({
      userId: user.uid,
      category,
      amount: parseFloat(amount),
      month: currentMonthStr
    });
    setAmount('');
  };

  const getSpentAmount = (cat: string) => {
    const now = new Date();
    return transactions
      .filter(t => 
        t.type === 'expense' && 
        t.category === cat && 
        format(t.date, 'yyyy-MM') === currentMonthStr
      )
      .reduce((sum, t) => sum + t.amount, 0);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Budgets</h1>
        <p className="text-sm text-slate-500 mt-1">Set limits for your spending categories.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-fit">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">Set Budget</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">Category</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none bg-slate-50 text-slate-900"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">Amount Limit (₹)</label>
              <input 
                type="number" 
                required 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none bg-slate-50 text-slate-900" 
              />
            </div>

            <button type="submit" className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition mt-2">
              Save Budget
            </button>
          </form>
        </div>

        {/* List */}
        <div className="md:col-span-2 space-y-4">
          {budgets.filter(b => b.month === currentMonthStr).map(budget => {
            const spent = getSpentAmount(budget.category);
            const percentage = Math.min((spent / budget.amount) * 100, 100);
            const isOver = spent > budget.amount;

            return (
              <div key={budget.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex justify-between items-end mb-3">
                  <h4 className="font-bold text-slate-900">{budget.category}</h4>
                  <div className="text-right">
                    <span className={`font-bold ${isOver ? 'text-red-500' : 'text-slate-900'}`}>₹{spent}</span>
                    <span className="text-slate-400 text-sm"> / ₹{budget.amount}</span>
                  </div>
                </div>
                
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${isOver ? 'bg-red-500' : percentage > 80 ? 'bg-orange-400' : 'bg-indigo-600'}`} 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                
                {isOver && (
                  <p className="text-xs text-red-500 mt-2 font-medium">Over budget by ₹{spent - budget.amount}</p>
                )}
              </div>
            );
          })}

          {budgets.length === 0 && (
             <div className="p-8 text-center bg-white border border-slate-100 rounded-2xl text-slate-500">
               No budgets set for this month.
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
