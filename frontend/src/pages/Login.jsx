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
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] -ml-40 -mb-40" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full relative z-10"
      >
        <div className="bg-white p-10 md:p-12 rounded-[40px] shadow-premium border border-slate-100 flex flex-col items-center">
            <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200 mb-8">
                <Recycle className="h-8 w-8 text-white" />
            </div>
            
            <div className="text-center mb-10">
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">Welcome Back</h2>
                <p className="text-slate-400 font-bold uppercase tracking-[2px] text-[10px] mt-3">Access your sustainability portal</p>
            </div>

            <form className="w-full space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <div className="relative group">
                        <Mail className="absolute top-1/2 -translate-y-1/2 left-5 h-5 w-5 text-slate-300 group-focus-within:text-emerald-600 transition-colors" />
                        <input
                            id="email-address"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="block w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl font-bold text-slate-700 outline-none transition-all placeholder:text-slate-300"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="relative group">
                        <Lock className="absolute top-1/2 -translate-y-1/2 left-5 h-5 w-5 text-slate-300 group-focus-within:text-emerald-600 transition-colors" />
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            className="block w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl font-bold text-slate-700 outline-none transition-all placeholder:text-slate-300"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex justify-center py-5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-[3px] shadow-xl shadow-slate-200 transition-all active:scale-[0.98] items-center gap-3 disabled:opacity-50"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : (
                            <>Sign In <ArrowRight className="h-4 w-4" /></>
                        )}
                    </button>
                </div>

                <div className="text-center pt-8">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-emerald-600 hover:text-emerald-500 underline underline-offset-8 decoration-2 decoration-emerald-100 hover:decoration-emerald-300 transition-all">
                            Join Now
                        </Link>
                    </p>
                </div>
            </form>
        </div>
        
        <div className="mt-8 flex items-center justify-center gap-6 opacity-40">
            <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Secure Portal</span>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            <div className="flex items-center gap-2">
                <Recycle className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Eco Verified</span>
            </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
