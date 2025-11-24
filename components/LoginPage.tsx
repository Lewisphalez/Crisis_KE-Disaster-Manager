import React, { useState } from 'react';
import { UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Users, Lock, ChevronRight, Loader2, Siren } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleCitizenLogin = async () => {
    setLoading(true);
    await login(UserRole.CITIZEN);
    setLoading(false);
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const success = await login(UserRole.ADMIN, password);
    if (!success) {
      setError('Invalid credentials. Access denied.');
      setLoading(false);
    }
    // Success will trigger rerender in App.tsx via Context
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl grid md:grid-cols-2 bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        
        {/* Left Side: Branding */}
        <div className="bg-slate-800 p-8 md:p-12 text-white flex flex-col justify-between relative">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div>
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/30">
                        <Siren className="w-8 h-8 text-white" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight">CrisisSync</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
                    Advanced Disaster Management System.
                </h1>
                <p className="text-slate-400 text-sm leading-relaxed">
                    Connecting citizens, responders, and government agencies on a single unified platform for rapid response and coordination.
                </p>
            </div>
            <div className="mt-8">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    SYSTEM OPERATIONAL
                </div>
            </div>
        </div>

        {/* Right Side: Login Options */}
        <div className="p-8 md:p-12 flex flex-col justify-center bg-slate-50">
            
            {!isAdminMode ? (
                // Role Selection
                <div className="space-y-6">
                    <div className="text-center md:text-left">
                        <h2 className="text-xl font-bold text-slate-900">Select Access Portal</h2>
                        <p className="text-sm text-slate-500">Choose your role to continue.</p>
                    </div>

                    <button 
                        onClick={handleCitizenLogin}
                        disabled={loading}
                        className="w-full bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 p-4 rounded-xl flex items-center justify-between group transition-all shadow-sm"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-100 text-blue-600 p-3 rounded-lg group-hover:scale-110 transition-transform">
                                <Users className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                                <h3 className="font-bold text-slate-800">Public Portal</h3>
                                <p className="text-xs text-slate-500">Report incidents & view alerts</p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500" />
                    </button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-slate-50 px-2 text-slate-400">Restricted Access</span>
                        </div>
                    </div>

                    <button 
                        onClick={() => setIsAdminMode(true)}
                        className="w-full bg-white hover:bg-slate-100 border border-slate-200 p-4 rounded-xl flex items-center justify-between group transition-all shadow-sm opacity-80 hover:opacity-100"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-slate-100 text-slate-600 p-3 rounded-lg">
                                <Shield className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                                <h3 className="font-bold text-slate-800">Command Center</h3>
                                <p className="text-xs text-slate-500">For authorized personnel only</p>
                            </div>
                        </div>
                        <Lock className="w-4 h-4 text-slate-300" />
                    </button>
                </div>
            ) : (
                // Admin Password Challenge
                <form onSubmit={handleAdminLogin} className="space-y-6 animate-in slide-in-from-right-8 duration-300">
                    <div className="text-center md:text-left">
                        <button 
                            type="button" 
                            onClick={() => setIsAdminMode(false)}
                            className="text-xs text-slate-500 hover:text-slate-800 mb-2 flex items-center gap-1"
                        >
                            ← Back to selection
                        </button>
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <Lock className="w-5 h-5 text-slate-700" /> Admin Authentication
                        </h2>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 uppercase">Access Code</label>
                        <input 
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-all"
                            placeholder="Enter 'admin123'"
                            autoFocus
                        />
                        {error && <p className="text-xs text-red-500 font-bold animate-pulse">{error}</p>}
                    </div>

                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Authenticate System'}
                    </button>
                    
                    <p className="text-[10px] text-center text-slate-400 mt-4">
                        Unauthorized access is a punishable offense under the Cybersecurity Act.
                    </p>
                </form>
            )}
        </div>
      </div>
      <p className="absolute bottom-4 text-xs text-slate-600 opacity-50">CrisisSync v2.1.0 • Secure Connection</p>
    </div>
  );
};

export default LoginPage;