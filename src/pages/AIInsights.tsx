import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { subscribeToUserData } from '../lib/api';
import { Transaction, Budget } from '../types';
import { FinanceAgent, AgentAnalysis } from '../ai/agent';
import { predictNextMonthExpense, PredictionResult } from '../ai/ml';
import { BrainCircuit, LineChart as ChartIcon, Zap, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const AIInsights = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [analysis, setAnalysis] = useState<AgentAnalysis | null>(null);
  const [categoryPredictions, setCategoryPredictions] = useState<PredictionResult[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToUserData(user.uid, setTransactions, setBudgets);
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (transactions.length > 0) {
      const agent = new FinanceAgent(transactions, budgets);
      setAnalysis(agent.analyze());

      // Get predictions for each unique category
      const categories = Array.from(new Set(transactions.filter(t => t.type === 'expense').map(t => t.category))) as string[];
      const predictions = categories.map(cat => predictNextMonthExpense(transactions, cat));
      setCategoryPredictions(predictions);
    }
  }, [transactions, budgets]);

  if (!analysis) return <div className="p-8">Gathering data for AI Insights...</div>;

  // Prepare chart data for total prediction
  const totalPred = predictNextMonthExpense(transactions, null);
  const chartData = [...totalPred.historicalData.map(d => ({ name: d.month, actual: d.amount, predicted: null }))];
  chartData.push({ name: 'Next Month', actual: null as any, predicted: totalPred.predictedAmount as any });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <BrainCircuit className="text-indigo-600" />
          AI Insights & Predictions
        </h1>
        <p className="text-sm text-slate-500 mt-1">Machine learning predictions and rule-based insights (CO3, CO4, CO5).</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ML Prediction (CO5) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <ChartIcon size={16} className="text-indigo-600" />
                Expense Forecasting
              </h3>
              <p className="text-xs text-slate-500 mt-1">Linear Regression on historical data</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-indigo-700">₹{totalPred.predictedAmount}</p>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Pred. Next Month</p>
            </div>
          </div>
          
          <div className="h-64 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="actual" stroke="#4f46e5" strokeWidth={3} dot={{r: 4}} name="Actual Spend" />
                <Line type="monotone" dataKey="predicted" stroke="#818cf8" strokeWidth={3} dot={{r: 6}} strokeDasharray="5 5" name="Predicted Spend" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="p-3 bg-indigo-50 rounded-xl text-xs text-indigo-900 border border-indigo-100">
            <strong>Model Info:</strong> Simple Linear Regression trained on {totalPred.historicalData.length} months of data. 
            Confidence: <span className="font-semibold">{totalPred.confidence}</span>.
          </div>
        </div>

        {/* Knowledge & Rules (CO3, CO4) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <Target size={16} className="text-indigo-600" />
            Category Predictions
          </h3>
          <div className="space-y-4">
            {categoryPredictions.length > 0 ? categoryPredictions.map((pred, i) => (
              <div key={i} className="flex justify-between items-center p-3 border-b border-slate-50 last:border-0">
                <div>
                  <h4 className="font-medium text-slate-900 text-sm">{pred.category}</h4>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide">Confidence: {pred.confidence}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">₹{pred.predictedAmount}</p>
                </div>
              </div>
            )) : (
              <p className="text-sm text-slate-500">Not enough data for category predictions.</p>
            )}
          </div>
        </div>

      </div>

      <div className="bg-slate-900 p-6 rounded-2xl shadow-lg relative overflow-hidden">
        <h3 className="text-sm font-bold uppercase tracking-wider opacity-60 text-white mb-6 flex items-center gap-2 relative z-10">
          <Zap size={16} className="text-amber-400" />
          Agent Explanations (Explainable AI)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
          {analysis.recommendations.map(rec => (
            <div key={rec.id} className={`p-4 rounded-xl border-l-2 bg-slate-800/50 ${rec.type === 'warning' ? 'border-orange-400' : 'border-indigo-400'}`}>
              <h4 className="font-semibold text-white mb-1 text-sm">{rec.title}</h4>
              <p className="text-xs text-slate-300 mb-3">{rec.message}</p>
              <div className={`text-[10px] font-mono ${rec.type === 'warning' ? 'text-orange-300' : 'text-indigo-300'}`}>
                {rec.reason.replace('IF ', 'IF ').replace(' THEN ', ' THEN ')}
              </div>
            </div>
          ))}
          {analysis.recommendations.length === 0 && (
             <p className="text-sm text-slate-400">No active rules triggered.</p>
          )}
        </div>
        <div className='absolute -bottom-10 -right-10 h-40 w-40 bg-indigo-500/20 rounded-full blur-2xl z-0 pointer-events-none'></div>
      </div>
    </div>
  );
};
