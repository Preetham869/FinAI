import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Receipt, PieChart, BrainCircuit, LogOut, FileText } from 'lucide-react';

export const Layout = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Transactions', path: '/transactions', icon: Receipt },
    { name: 'Budgets', path: '/budgets', icon: PieChart },
    { name: 'AI Insights & ML', path: '/insights', icon: BrainCircuit },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="flex w-60 flex-col border-r border-slate-200 bg-white p-6">
        <div className="mb-8 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold">
            <BrainCircuit size={18} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">FinAI Manager</h1>
        </div>
        
        <nav className="flex flex-col gap-2 flex-1 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                  isActive 
                    ? 'rounded-xl bg-indigo-50 text-indigo-700 font-semibold' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon size={18} />
                <span className="text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="rounded-2xl bg-indigo-900 p-4 text-white mb-6">
          <div className="text-xs font-medium opacity-70">INTELLIGENT AGENT (CO1)</div>
          <p className="mt-2 text-xs leading-relaxed text-indigo-100">Monitoring your finances securely in the background using ML & rule-based engines.</p>
        </div>

        <div className="pt-4 border-t border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} alt="User" className="w-10 h-10 rounded-full bg-slate-200" />
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-slate-900 truncate">{user.displayName}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={signOut}
            className="flex items-center gap-2 text-slate-500 hover:text-red-600 w-full py-2 transition-colors text-sm font-medium"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden p-8 flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
