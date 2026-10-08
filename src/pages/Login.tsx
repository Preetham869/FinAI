import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BrainCircuit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Login = () => {
  const { signIn, user } = useAuth();
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signIn();
    } catch (err: any) {
      console.error(err);
      setError(
        err.message?.includes('popup') || err.code === 'auth/popup-closed-by-user' || err.code === 'auth/popup-blocked'
          ? "Login popup was blocked or closed. If you are viewing this in the AI Studio preview, please click the 'Open in new tab' button at the top right, or use the direct App URL to log in."
          : err.message || "Failed to log in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-indigo-50 p-4 rounded-2xl">
            <BrainCircuit className="text-indigo-600 w-12 h-12" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">FinAI Manager</h1>
        <p className="text-slate-500 mb-8 text-sm">Intelligent agent models and ML problem-solving for personal finance.</p>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm text-left rounded-r-xl">
            {error}
          </div>
        )}

        <button 
          onClick={handleSignIn}
          disabled={loading}
          className="w-full flex justify-center items-center gap-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium py-3 px-4 rounded-xl transition shadow-sm disabled:opacity-50"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          {loading ? 'Signing in...' : 'Sign in with Google'}
        </button>

        <div className="mt-8 text-xs font-medium text-slate-400 uppercase tracking-widest">
          Academic Microproject Demo
        </div>
      </div>
    </div>
  );
};
