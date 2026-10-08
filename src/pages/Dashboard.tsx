import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { subscribeToUserData, seedSampleData } from '../lib/api';
import { Transaction, Budget } from '../types';
import { FinanceAgent, AgentAnalysis } from '../ai/agent';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, AlertCircle, BrainCircuit } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';

export const Dashboard = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [analysis, setAnalysis] = useState<AgentAnalysis | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToUserData(user.uid, setTransactions, setBudgets);
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (transactions.length > 0) {
      const agent = new FinanceAgent(transactions, budgets);
      setAnalysis(agent.analyze());
    } else {
      setAnalysis(null);
    }
  }, [transactions, budgets]);

  const handleSeedData = async () => {
    if (!user) return;
    setIsSeeding(true);
    await seedSampleData(user.uid);
    setIsSeeding(false);
  };

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <h2 className="text-2xl font-semibold mb-2 text-slate-900">Welcome to FinAI Manager</h2>
        <p className="text-slate-500 mb-6">You don't have any data yet.</p>
        <button 
          onClick={handleSeedData} 
          disabled={isSeeding}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
        >
          {isSeeding ? 'Generating ML Sample Data...' : 'Generate Academic Demo Data'}
        </button>
      </div>
    );
  }

  if (!analysis) return null;

  const { state, healthScore, healthReasons, nextMonthPredictionTotal } = analysis;

  return (
    <div className="flex flex-col h-full">
      <header className='mb-8 flex items-center justify-between shrink-0'>
        <div>
          <h2 className='text-2xl font-bold text-slate-900'>Financial Dashboard</h2>
          <p className='text-sm text-slate-500'>Welcome back, {user?.displayName || 'User'}. Here is your ML-powered analysis.</p>
        </div>
        <div className='flex items-center gap-4'>
          <div className='rounded-full bg-white border border-slate-200 px-4 py-2 text-sm font-medium flex items-center gap-2 shadow-sm'>
            <span className='h-2 w-2 rounded-full bg-green-500'></span> ML Engine Online
          </div>
        </div>
      </header>

      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 xl:grid-rows-3 gap-4 pb-8'>
        
        {/* Row 1 Stats */}
        <div className='col-span-1 row-span-1 rounded-2xl bg-white p-5 border border-slate-100 shadow-sm'>
          <div className='text-xs font-bold uppercase tracking-wider text-slate-400'>Total Balance</div>
          <div className='mt-1 text-2xl font-bold text-slate-900'>₹{state.income - state.expenses}</div>
        </div>
        <div className='col-span-1 row-span-1 rounded-2xl bg-white p-5 border border-slate-100 shadow-sm'>
          <div className='text-xs font-bold uppercase tracking-wider text-slate-400'>Monthly Savings</div>
          <div className='mt-1 text-2xl font-bold text-green-600'>₹{state.savings}</div>
        </div>
        <div className='col-span-1 row-span-1 rounded-2xl bg-white p-5 border border-slate-100 shadow-sm'>
          <div className='text-xs font-bold uppercase tracking-wider text-slate-400'>Expenses</div>
          <div className='mt-1 text-2xl font-bold text-red-500'>₹{state.expenses}</div>
        </div>

        {/* Health Score - Row 1+2 */}
        <div className='col-span-1 row-span-2 rounded-2xl bg-white p-5 border border-slate-100 shadow-sm flex flex-col justify-between'>
          <div className='text-xs font-bold uppercase tracking-wider text-slate-400'>Health Score</div>
          <div className='flex flex-col items-center py-4'>
            <div className={`text-5xl font-black ${healthScore >= 80 ? 'text-green-600' : healthScore >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
              {healthScore}
            </div>
            <div className={`mt-1 text-xs font-semibold uppercase ${healthScore >= 80 ? 'text-green-400' : healthScore >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
              {healthScore >= 80 ? 'Excellent' : healthScore >= 50 ? 'Fair' : 'Needs Work'}
            </div>
          </div>
          <div className='text-[10px] leading-tight text-slate-400 text-center border-t border-slate-100 pt-3 flex flex-col gap-1'>
            {healthReasons.slice(0, 2).map((r, i) => (
               <span key={i} className="truncate">{r.replace(/^[✓⚠❌]\s*/, '')}</span>
            ))}
          </div>
        </div>

        {/* Rule Engine Insights - Row 2+3 */}
        <div className='col-span-1 md:col-span-2 xl:col-span-1 row-span-2 rounded-2xl bg-slate-900 p-5 text-white shadow-lg overflow-hidden relative flex flex-col'>
          <div className='text-xs font-bold uppercase tracking-wider opacity-60 shrink-0'>Rule Engine Insights (CO4)</div>
          <div className='mt-4 space-y-4 overflow-y-auto relative z-10 flex-1 pr-2 custom-scrollbar'>
            {analysis.recommendations.length > 0 ? (
              analysis.recommendations.map(rec => (
                <div key={rec.id} className={`border-l-2 pl-3 ${rec.type === 'warning' ? 'border-orange-400' : 'border-indigo-400'}`}>
                  <div className={`text-[10px] font-mono ${rec.type === 'warning' ? 'text-orange-300' : 'text-indigo-300'}`}>
                    {rec.reason.replace('IF ', 'IF ').replace(' THEN ', ' THEN ')}
                  </div>
                  <div className='mt-1 text-xs'>{rec.message}</div>
                </div>
              ))
            ) : (
              <div className='border-l-2 border-green-400 pl-3'>
                <div className='text-[10px] font-mono text-green-300'>IF rules_passed == true THEN optimal</div>
                <div className='mt-1 text-xs'>All spending within budget parameters. Optimal state.</div>
              </div>
            )}
          </div>
          <div className='absolute -bottom-4 -right-4 h-24 w-24 bg-indigo-500/10 rounded-full blur-xl z-0 pointer-events-none'></div>
        </div>

        {/* Top Categories - Row 2 */}
        <div className='col-span-1 md:col-span-2 xl:col-span-2 row-span-1 rounded-2xl bg-white p-5 border border-slate-100 shadow-sm'>
          <div className='text-xs font-bold uppercase tracking-wider text-slate-400 mb-4'>Top Categories</div>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3'>
            {Object.entries(state.categorySpending)
              .sort((a: [string, number], b: [string, number]) => b[1] - a[1])
              .slice(0, 4)
              .map(([cat, spent]: [string, number], idx: number) => {
                const colors = ['bg-indigo-600', 'bg-orange-400', 'bg-blue-400', 'bg-emerald-400'];
                const color = colors[idx % colors.length];
                const percentage = state.expenses > 0 ? Math.min((spent / state.expenses) * 100, 100) : 0;
                return (
                  <div key={cat}>
                    <div className='flex justify-between text-[11px] mb-1 font-medium text-slate-700'>
                      <span>{cat}</span><span>₹{spent}</span>
                    </div>
                    <div className='h-1.5 w-full bg-slate-100 rounded-full overflow-hidden'>
                      <div className={`h-full ${color}`} style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
        
        {/* ML Prediction Simple Card - Row 3 */}
        <div className='col-span-1 md:col-span-2 xl:col-span-2 row-span-1 rounded-2xl bg-indigo-50 p-5 border border-indigo-100 shadow-sm flex flex-col justify-center'>
          <div className='flex items-center justify-between mb-2'>
             <div className='text-xs font-bold uppercase tracking-wider text-indigo-400'>Next Month Prediction (CO5)</div>
             <div className='text-[10px] bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded'>Linear Regression</div>
          </div>
          <div className="flex items-end gap-4">
            <div className='text-4xl font-black text-indigo-700'>₹{nextMonthPredictionTotal}</div>
            <div className="text-sm text-indigo-500 mb-1 font-medium">Predicted Expenses</div>
          </div>
        </div>

      </div>
    </div>
  );
};
