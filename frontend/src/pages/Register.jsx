import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Mail, Lock, User, Phone, MapPin, Truck, Hash, 
  Loader2, ArrowRight, Recycle, ShieldCheck, CheckCircle2 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';

const Register = () => {
  const [role, setRole] = useState('citizen');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: {
      formattedAddress: '',
      coordinates: [0, 0]
    },
    collectorDetails: {
      vehicleType: 'bicycle',
      vehicleNumber: ''
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await register({ ...formData, role });
    if (result.success) {
      toast.success('Welcome to the community!');
      navigate('/dashboard');
    } else {
      toast.error(result.message || 'Registration failed');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F8FA] px-4 py-12 selection:bg-emerald-100 selection:text-emerald-900 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[140px] -mr-40 -mt-40" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] -ml-40 -mb-40" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full relative z-10"
      >
        <div className="bg-white p-8 md:p-12 rounded-[48px] shadow-premium border border-slate-100">
            <div className="flex flex-col items-center mb-12">
                <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl shadow-slate-200 mb-6">
                    <Recycle className="h-8 w-8 text-emerald-400" />
                </div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">Create Account</h2>
                <p className="text-slate-400 font-bold uppercase tracking-[2px] text-[10px] mt-3">Join the future of waste management</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
                {/* Role Selection */}
                <div className="grid grid-cols-2 gap-4 p-1.5 bg-slate-50 rounded-3xl">
                    <button
                        type="button"
                        onClick={() => setRole('citizen')}
                        className={cn(
                            "py-4 rounded-[22px] flex flex-col items-center gap-2 transition-all font-black text-xs uppercase tracking-widest",
                            role === 'citizen' ? "bg-white text-emerald-600 shadow-sm ring-1 ring-slate-100" : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        Citizen
                    </button>
                    <button
                        type="button"
                        onClick={() => setRole('collector')}
                        className={cn(
                            "py-4 rounded-[22px] flex flex-col items-center gap-2 transition-all font-black text-xs uppercase tracking-widest",
                            role === 'collector' ? "bg-white text-indigo-600 shadow-sm ring-1 ring-slate-100" : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        Collector
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Full Name</label>
                        <div className="relative group">
                            <User className="absolute top-1/2 -translate-y-1/2 left-5 h-5 w-5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                            <input name="name" type="text" required value={formData.name} onChange={handleInputChange} 
                                className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl pl-14 pr-6 py-4 font-bold text-slate-800 outline-none transition-all placeholder:text-slate-300"
                                placeholder="e.g. John Doe"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Email Address</label>
                        <div className="relative group">
                            <Mail className="absolute top-1/2 -translate-y-1/2 left-5 h-5 w-5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                            <input name="email" type="email" required value={formData.email} onChange={handleInputChange} 
                                className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl pl-14 pr-6 py-4 font-bold text-slate-800 outline-none transition-all placeholder:text-slate-300"
                                placeholder="john@example.com"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Security Password</label>
                        <div className="relative group">
                            <Lock className="absolute top-1/2 -translate-y-1/2 left-5 h-5 w-5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                            <input name="password" type="password" required value={formData.password} onChange={handleInputChange} 
                                className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl pl-14 pr-6 py-4 font-bold text-slate-800 outline-none transition-all placeholder:text-slate-300"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Phone Number</label>
                        <div className="relative group">
                            <Phone className="absolute top-1/2 -translate-y-1/2 left-5 h-5 w-5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                            <input name="phone" type="tel" required value={formData.phone} onChange={handleInputChange} 
                                className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl pl-14 pr-6 py-4 font-bold text-slate-800 outline-none transition-all placeholder:text-slate-300"
                                placeholder="+91 9876543210"
                            />
                        </div>
                    </div>
                </div>

                {role === 'collector' && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="p-8 bg-indigo-50/50 rounded-3xl border-2 border-indigo-50 grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        <div className="space-y-2 md:col-span-2">
                            <h4 className="text-sm font-black text-indigo-900 uppercase tracking-wider mb-2">Logistics Details</h4>
                        </div>
                        <div className="space-y-2">
                             <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest pl-2">Vehicle Type</label>
                             <div className="relative group">
                                <Truck className="absolute top-1/2 -translate-y-1/2 left-5 h-5 w-5 text-indigo-300" />
                                <select name="collectorDetails.vehicleType" value={formData.collectorDetails.vehicleType} onChange={handleInputChange}
                                    className="w-full bg-white border-2 border-transparent focus:border-indigo-500 rounded-2xl pl-14 pr-6 py-4 font-bold text-indigo-800 outline-none appearance-none cursor-pointer"
                                >
                                    <option value="bicycle">Bicycle (Eco)</option>
                                    <option value="scooter">Scooter</option>
                                    <option value="truck">Electric Truck</option>
                                    <option value="van">Service Van</option>
                                </select>
                             </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest pl-2">Registration No.</label>
                            <div className="relative group">
                                <Hash className="absolute top-1/2 -translate-y-1/2 left-5 h-5 w-5 text-indigo-300" />
                                <input name="collectorDetails.vehicleNumber" type="text" required value={formData.collectorDetails.vehicleNumber} onChange={handleInputChange}
                                    className="w-full bg-white border-2 border-transparent focus:border-indigo-500 rounded-2xl pl-14 pr-6 py-4 font-bold text-indigo-800 outline-none placeholder:text-indigo-200"
                                    placeholder="MH-01-AB-1234"
                                />
                            </div>
                        </div>
                    </motion.div>
                )}

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={cn(
                            "w-full flex justify-center py-5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-[3px] shadow-2xl transition-all active:scale-[0.98] items-center gap-3 disabled:opacity-50",
                            role === 'collector' ? "shadow-indigo-100" : "shadow-emerald-100"
                        )}
                    >
                        {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : (
                            <>Complete Onboarding <ArrowRight className="h-4 w-4" /></>
                        )}
                    </button>
                    <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-[2px] mt-6">
                        By signing up, you agree to our <span className="text-slate-800 underline">Terms of Sustainablity</span>
                    </p>
                </div>
            </form>
            
            <div className="h-[2px] bg-slate-50 my-10" />

            <div className="text-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Already part of the movement?{' '}
                    <Link to="/login" className="text-slate-800 hover:text-emerald-600 underline underline-offset-8 decoration-2 decoration-slate-100 hover:decoration-emerald-100 transition-all font-black">
                        Log In
                    </Link>
                </p>
            </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
