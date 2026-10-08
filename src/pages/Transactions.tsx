import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { addTransaction, deleteTransaction, subscribeToUserData } from '../lib/api';
import { Transaction } from '../types';
import { CATEGORIES } from '../ai/knowledge';
import { format } from 'date-fns';
import { Trash2, Plus } from 'lucide-react';

export const Transactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'income'|'expense'>('expense');

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToUserData(user.uid, setTransactions, () => {});
    return () => unsub();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !amount) return;

    await addTransaction({
      userId: user.uid,
      amount: parseFloat(amount),
      category: type === 'income' ? 'Salary' : category, // simplified
      description,
      type,
      date: new Date().getTime()
    });

    setAmount('');
    setDescription('');
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Transactions</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your income and expenses.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm h-fit">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-6">Add Transaction</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition ${type === 'expense' ? 'bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-slate-50' : 'text-slate-500 dark:text-slate-400'}`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition ${type === 'income' ? 'bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-slate-50' : 'text-slate-500 dark:text-slate-400'}`}
              >
                Income
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Amount (₹)</label>
              <input 
                type="number" 
                required 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50" 
              />
            </div>

            {type === 'expense' && (
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Category</label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Description</label>
              <input 
                type="text" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50" 
              />
            </div>

            <button type="submit" className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-medium hover:bg-indigo-700 dark:hover:bg-indigo-500 transition flex justify-center items-center gap-2 mt-2">
              <Plus size={18} /> Add
            </button>
          </form>
        </div>

        {/* List */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 shrink-0">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Recent Transactions</h3>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-800 overflow-y-auto flex-1">
            {transactions.map(tx => (
              <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition group">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-50">{tx.description || tx.category}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{tx.category} • {format(tx.date, 'MMM dd, yyyy')}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`font-bold ${tx.type === 'income' ? 'text-green-600' : 'text-slate-900 dark:text-slate-50'}`}>
                    {tx.type === 'income' ? '+' : '-'}₹{tx.amount}
                  </span>
                  <button 
                    onClick={() => deleteTransaction(tx.id)}
                    className="p-2 text-slate-300 hover:text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400">No transactions found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
