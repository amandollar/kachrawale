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
    
    // Clean data: only include collectorDetails if role is collector
    const submitData = { ...formData, role };
    if (role !== 'collector') {
        delete submitData.collectorDetails;
    }

    const result = await register(submitData);
    if (result.success) {
      toast.success('Welcome to the community!');
      navigate('/dashboard');
    } else {
      toast.error(result.message || 'Registration failed');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F8FA] px-4 py-20 selection:bg-emerald-100 selection:text-emerald-900 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[140px] -mr-40 -mt-40" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl w-full relative z-10"
      >
        <div className="bg-white p-8 md:p-12 rounded-xl shadow-sm border border-slate-200">
            <div className="flex flex-col items-center mb-10">
                <div className="w-12 h-12 bg-emerald-950 rounded-lg flex items-center justify-center mb-6">
                    <Recycle className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-emerald-950 tracking-tight">Create Account</h2>
                <p className="text-slate-400 font-bold uppercase tracking-[2px] text-[9px] mt-3">Join our community</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
                {/* Role Selection */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-emerald-50 rounded-lg border border-emerald-100">
                    <button
                        type="button"
                        onClick={() => setRole('citizen')}
                        className={cn(
                            "py-3 rounded-md flex flex-col items-center gap-1 transition-all font-bold text-[10px] uppercase tracking-wider",
                            role === 'citizen' ? "bg-white text-emerald-950 shadow-sm border border-emerald-100" : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        Citizen
                    </button>
                    <button
                        type="button"
                        onClick={() => setRole('collector')}
                        className={cn(
                            "py-3 rounded-md flex flex-col items-center gap-1 transition-all font-bold text-[10px] uppercase tracking-wider",
                            role === 'collector' ? "bg-white text-emerald-950 shadow-sm border border-emerald-100" : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        Collector
                    </button>
                </div>

                {/* Primary Data */}
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative group">
                            <User className="absolute top-1/2 -translate-y-1/2 left-4 h-4 w-4 text-slate-300 group-focus-within:text-emerald-950 transition-colors" />
                            <input
                                name="name"
                                type="text"
                                required
                                className="block w-full pl-12 pr-6 py-3.5 bg-emerald-50 border border-emerald-100 focus:border-slate-900 focus:bg-white rounded-lg font-bold text-xs text-emerald-950 outline-none transition-all placeholder:text-slate-400"
                                placeholder="Full Name"
                                value={formData.name}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="relative group">
                            <Mail className="absolute top-1/2 -translate-y-1/2 left-4 h-4 w-4 text-slate-300 group-focus-within:text-emerald-950 transition-colors" />
                            <input
                                name="email"
                                type="email"
                                required
                                className="block w-full pl-12 pr-6 py-3.5 bg-emerald-50 border border-emerald-100 focus:border-slate-900 focus:bg-white rounded-lg font-bold text-xs text-emerald-950 outline-none transition-all placeholder:text-slate-400"
                                placeholder="Email Address"
                                value={formData.email}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative group">
                            <Lock className="absolute top-1/2 -translate-y-1/2 left-4 h-4 w-4 text-slate-300 group-focus-within:text-emerald-950 transition-colors" />
                            <input
                                name="password"
                                type="password"
                                required
                                className="block w-full pl-12 pr-6 py-3.5 bg-emerald-50 border border-emerald-100 focus:border-slate-900 focus:bg-white rounded-lg font-bold text-xs text-emerald-950 outline-none transition-all placeholder:text-slate-400"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative group">
                            <Phone className="absolute top-1/2 -translate-y-1/2 left-4 h-4 w-4 text-slate-300 group-focus-within:text-emerald-950 transition-colors" />
                            <input
                                name="phone"
                                type="tel"
                                required
                                className="block w-full pl-12 pr-6 py-3.5 bg-emerald-50 border border-emerald-100 focus:border-slate-900 focus:bg-white rounded-lg font-bold text-xs text-emerald-950 outline-none transition-all placeholder:text-slate-400"
                                placeholder="Phone Number"
                                value={formData.phone}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="relative group">
                            <h3 className="absolute top-1/2 -translate-y-1/2 left-4 text-[10px] font-bold text-slate-400 select-none">UPI</h3>
                            <input
                                name="upiId"
                                type="text"
                                className="block w-full pl-12 pr-6 py-3.5 bg-emerald-50 border border-emerald-100 focus:border-slate-900 focus:bg-white rounded-lg font-bold text-xs text-emerald-950 outline-none transition-all placeholder:text-slate-400"
                                placeholder="Google Pay / UPI ID (Optional)"
                                value={formData.upiId || ''}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    <div className="relative group">
                        <MapPin className="absolute top-1/2 -translate-y-1/2 left-4 h-4 w-4 text-slate-300 group-focus-within:text-emerald-950 transition-colors" />
                        <input
                            name="address.formattedAddress"
                            type="text"
                            required
                            className="block w-full pl-12 pr-6 py-3.5 bg-emerald-50 border border-emerald-100 focus:border-slate-900 focus:bg-white rounded-lg font-bold text-xs text-emerald-950 outline-none transition-all placeholder:text-slate-400"
                            placeholder="Full Address"
                            value={formData.address.formattedAddress}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>

                {/* Logistics Specifics */}
                <AnimatePresence mode="wait">
                    {role === 'collector' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="p-6 bg-emerald-50 rounded-xl border border-emerald-100 space-y-6"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <Truck className="h-4 w-4 text-slate-400" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Vehicle Details</span>
                            </div>
                            
                            <div className="flex gap-2">
                                {['bicycle', 'tricycle', 'electric_van'].map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, collectorDetails: { ...prev.collectorDetails, vehicleType: type }}))}
                                        className={cn(
                                            "flex-1 py-3 rounded-lg border text-[9px] font-bold uppercase tracking-tighter transition-all",
                                            formData.collectorDetails.vehicleType === type 
                                                ? "bg-emerald-950 text-white border-slate-900" 
                                                : "bg-white text-slate-400 border-slate-200 hover:border-slate-300"
                                        )}
                                    >
                                        {type.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>

                            <div className="relative group">
                                <Hash className="absolute top-1/2 -translate-y-1/2 left-4 h-4 w-4 text-slate-300 group-focus-within:text-emerald-950 transition-colors" />
                                <input
                                    name="collectorDetails.vehicleNumber"
                                    type="text"
                                    required
                                    className="block w-full pl-12 pr-6 py-3.5 bg-white border border-emerald-100 focus:border-slate-900 rounded-lg font-bold text-xs text-emerald-950 outline-none transition-all placeholder:text-slate-400"
                                    placeholder="Vehicle Number / License Plate"
                                    value={formData.collectorDetails.vehicleNumber}
                                    onChange={handleInputChange}
                                >
                                </input>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex justify-center py-4 px-4 bg-emerald-950 hover:bg-emerald-900 text-white rounded-lg font-bold text-[10px] uppercase tracking-[2px] shadow-lg shadow-slate-200 transition-all active:scale-[0.98] items-center gap-3 disabled:opacity-50"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : (
                            <>Sign Up <ArrowRight className="h-4 w-4 text-slate-400" /></>
                        )}
                    </button>
                </div>

                <div className="text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose">
                        By registering, you agree to our <a href="#" className="text-emerald-950 underline underline-offset-4 decoration-slate-200 transition-all">Terms of Service</a>
                    </p>
                    <div className="mt-8 pt-6 border-t border-slate-50">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Already have an account?{' '}
                            <Link to="/login" className="text-emerald-950 hover:underline underline-offset-8 decoration-slate-200 transition-all">
                                Login here
                            </Link>
                        </p>
                    </div>
                </div>
            </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
