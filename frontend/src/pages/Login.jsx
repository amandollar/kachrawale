import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Loader2, ArrowRight, ShieldCheck, Recycle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
      if (user) {
          navigate('/dashboard');
      }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await login(email, password);
    if (result.success) {
      toast.success('Welcome back!');
      navigate('/dashboard');
    } else {
      toast.error(result.message || 'Login failed');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F8FA] px-4 selection:bg-emerald-100 selection:text-emerald-900 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] -mr-40 -mt-40" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full relative z-10"
      >
        <div className="bg-white p-8 md:p-12 rounded-xl shadow-sm border border-slate-200">
            <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mb-8">
                    <Recycle className="h-6 w-6 text-white" />
                </div>
                
                <div className="text-center mb-10">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Access Node</h2>
                    <p className="text-slate-400 font-bold uppercase tracking-[2px] text-[9px] mt-3">Authentication Required</p>
                </div>

                <form className="w-full space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div className="relative group">
                            <Mail className="absolute top-1/2 -translate-y-1/2 left-4 h-4 w-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="block w-full pl-12 pr-6 py-3.5 bg-slate-50 border border-slate-100 focus:border-slate-900 focus:bg-white rounded-lg font-bold text-xs text-slate-900 outline-none transition-all placeholder:text-slate-400"
                                placeholder="Corporate Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="relative group">
                            <Lock className="absolute top-1/2 -translate-y-1/2 left-4 h-4 w-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="block w-full pl-12 pr-6 py-3.5 bg-slate-50 border border-slate-100 focus:border-slate-900 focus:bg-white rounded-lg font-bold text-xs text-slate-900 outline-none transition-all placeholder:text-slate-400"
                                placeholder="Access Key"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex justify-center py-4 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-[10px] uppercase tracking-[2px] shadow-lg shadow-slate-200 transition-all active:scale-[0.98] items-center gap-3 disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : (
                                <>Authenticate Cluster <ArrowRight className="h-4 w-4 text-slate-400" /></>
                            )}
                        </button>
                    </div>

                    <div className="text-center pt-8">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            No access?{' '}
                            <Link to="/register" className="text-slate-900 hover:underline underline-offset-8 decoration-slate-200 transition-all">
                                Initialize New Node
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
        
        <div className="mt-10 flex items-center justify-center gap-8 opacity-30">
            <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-[9px] font-bold uppercase tracking-widest">SSL Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
                <Recycle className="h-4 w-4" />
                <span className="text-[9px] font-bold uppercase tracking-widest">Yield Optimized</span>
            </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
