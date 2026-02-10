import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Loader2, ArrowRight, ShieldCheck, Recycle, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
      if (user) {
          navigate('/dashboard');
      }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    setIsSubmitting(true);
    
    try {
      const result = await login(email, password);
      if (result.success) {
        toast.success('Welcome back!');
        navigate('/dashboard');
      } else {
        const errorMessage = result.message || 'Invalid email or password. Please try again.';
        setError(errorMessage);
        console.log('Showing error toast:', errorMessage);
        toast.error(errorMessage, {
          duration: 5000,
          id: 'login-error',
        });
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      console.log('Showing error toast (catch):', errorMessage);
      toast.error(errorMessage, {
        duration: 5000,
        id: 'login-error-unexpected',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F8FA] px-4 py-8 selection:bg-emerald-100 selection:text-emerald-500 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] -mr-40 -mt-40" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full relative z-10"
      >
        <div className="bg-white p-8 md:p-12 rounded-xl shadow-sm border border-slate-200">
            <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center mb-8">
                    <Recycle className="h-6 w-6 text-white" />
                </div>
                
                <div className="text-center mb-10">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome Back</h2>
                    <p className="text-slate-400 font-bold uppercase tracking-[2px] text-[9px] mt-3">Log in to your account</p>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="mb-4 bg-rose-50 border-2 border-rose-300 text-rose-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm shadow-sm"
                    >
                      <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-600" />
                      <span className="font-medium">{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.form 
                  className="w-full space-y-4" 
                  onSubmit={handleSubmit}
                  animate={error ? { x: [0, -10, 10, -10, 10, 0] } : {}}
                  transition={{ duration: 0.5 }}
                >
                    <div className="space-y-4">
                        <div className="relative group">
                            <Mail className={`absolute top-1/2 -translate-y-1/2 left-4 h-4 w-4 transition-colors ${error ? 'text-rose-500' : 'text-slate-300 group-focus-within:text-emerald-500'}`} />
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className={`block w-full pl-12 pr-6 py-3.5 rounded-lg font-bold text-xs text-slate-900 outline-none transition-all placeholder:text-slate-400 ${
                                  error 
                                    ? 'bg-rose-50 border-2 border-rose-300 focus:border-rose-500 focus:bg-white' 
                                    : 'bg-emerald-50 border border-emerald-100 focus:border-slate-900 focus:bg-white'
                                }`}
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => {
                                  setEmail(e.target.value);
                                  if (error) setError(''); // Clear error when user starts typing
                                }}
                            />
                        </div>
                        <div className="relative group">
                            <Lock className={`absolute top-1/2 -translate-y-1/2 left-4 h-4 w-4 transition-colors ${error ? 'text-rose-500' : 'text-slate-300 group-focus-within:text-emerald-500'}`} />
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className={`block w-full pl-12 pr-6 py-3.5 rounded-lg font-bold text-xs text-slate-900 outline-none transition-all placeholder:text-slate-400 ${
                                  error 
                                    ? 'bg-rose-50 border-2 border-rose-300 focus:border-rose-500 focus:bg-white' 
                                    : 'bg-emerald-50 border border-emerald-100 focus:border-slate-900 focus:bg-white'
                                }`}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => {
                                  setPassword(e.target.value);
                                  if (error) setError(''); // Clear error when user starts typing
                                }}
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full flex justify-center py-4 px-4 text-white rounded-lg font-bold text-[10px] uppercase tracking-[2px] shadow-lg transition-all active:scale-[0.98] items-center gap-3 ${
                              error 
                                ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-200' 
                                : 'bg-emerald-500 hover:bg-emerald-400 shadow-slate-200'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : (
                                <>Login <ArrowRight className="h-4 w-4 text-slate-400" /></>
                            )}
                        </button>
                    </div>

                    <div className="text-center pt-8">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            New here?{' '}
                            <Link to="/register" className="text-emerald-500 hover:underline underline-offset-8 decoration-slate-200 transition-all">
                                Create an account
                            </Link>
                        </p>
                    </div>
                </motion.form>
            </div>
        </div>
        
        <div className="mt-10 flex items-center justify-center gap-8 opacity-30">
            <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-[9px] font-bold uppercase tracking-widest">SSL Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
                <Recycle className="h-4 w-4" />
                <span className="text-[9px] font-bold uppercase tracking-widest">Best Rates</span>
            </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
