import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import EditProfileForm from '../components/EditProfileForm';
import { 
  User, Mail, Phone, MapPin, Truck, Hash, Edit3, Camera, 
  ShieldCheck, Wallet, TrendingUp, Recycle, Leaf,
  Clock, CheckCircle2, ChevronRight, Settings, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';

const Profile = () => {
  const { user } = useAuth();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);

  const [backendStats, setBackendStats] = useState(null);

  useEffect(() => {
    const fetchPickups = async () => {
        try {
             const { data } = await api.get('/pickups');
             if (data.success) setPickups(data.data);
        } catch (error) {
             console.error("Failed to fetch pickups", error);
        }
    };

    const fetchStats = async () => {
        if (user?.role === 'collector') {
            try {
                const { data } = await api.get('/collector/my-stats');
                if (data.success) setBackendStats(data.data);
            } catch (error) {
                console.error("Failed to fetch collector stats", error);
            }
        }
    };

    if (user) {
        fetchPickups();
        fetchStats();
    }
  }, [user]);

  const stats = useMemo(() => {
    const completed = pickups.filter(p => p.status === 'COMPLETED' || p.status === 'SETTLED');
    const totalWeight = completed.reduce((acc, p) => acc + (p.verifiedWeight || p.weight || 0), 0);
    
    // For collectors, prefer backend stats if available to ensure 10% logic match
    let totalEarnings = 0;
    if (user?.role === 'collector') {
        totalEarnings = backendStats ? backendStats.totalEarnings : 0;
    } else {
        // Fallback for citizens or if backend stats fail (though my-stats is collector only)
        // Citizens usually don't have "earnings" but if they did, logic would go here.
        // For now, keep citizen logic simple or 0.
        const baseValue = completed.reduce((acc, p) => acc + (p.finalAmount || 0), 0);
        totalEarnings = baseValue; // Citizens get full value if applicable
    }

    const carbonSaved = totalWeight * 2.5; 
    
    return {
        totalPickups: completed.length,
        totalWeight,
        totalEarnings,
        carbonSaved,
        activePickups: pickups.filter(p => !['COMPLETED', 'SETTLED', 'CANCELLED'].includes(p.status)).length
    };
  }, [pickups, user?.role, backendStats]);

  const isPendingCollector = user?.role === 'collector' && !user?.isVerified;

  // Mock weekly activity for the "graph"
  const weeklyActivity = [35, 65, 45, 85, 55, 90, 70];

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-slate-900 selection:bg-emerald-100 selection:text-emerald-500">
      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditProfile && <EditProfileForm onClose={() => setShowEditProfile(false)} />}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-10 mb-16 px-4">
            <div className="relative group">
                <div className="w-36 h-36 md:w-44 md:h-44 rounded-full border-[6px] border-white shadow-premium overflow-hidden bg-white ring-1 ring-slate-100">
                    <img 
                      src={user?.profilePicture} 
                      alt={user?.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center cursor-pointer backdrop-blur-[2px]">
                        <Camera className="text-white h-7 w-7" />
                    </div>
                </div>
                {user?.isVerified && (
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute bottom-3 right-3 bg-emerald-500 text-white p-2 rounded-full border-4 border-white shadow-lg"
                    >
                        <ShieldCheck className="h-5 w-5" />
                    </motion.div>
                )}
            </div>

            <div className="flex-1 text-center md:text-left pt-6">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2 animate-in fade-in slide-in-from-left-4 duration-700">
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight">{user?.name}</h1>
                    <span className={cn(
                        "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[2px] shadow-sm ring-1 ring-inset",
                        isPendingCollector 
                            ? "bg-amber-50 text-amber-600 ring-amber-100" 
                            : "bg-emerald-50 text-emerald-600 ring-emerald-100"
                    )}>
                        {user?.role}
                    </span>
                </div>
                <p className="text-slate-500 font-medium mb-8 text-base sm:text-lg break-all">{user?.email}</p>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                    <button 
                        onClick={() => setShowEditProfile(true)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-bold text-sm transition-all shadow-xl shadow-slate-200 active:scale-[0.98]"
                    >
                        <Edit3 className="h-4 w-4" /> Edit Profile
                    </button>
                    <button className="flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3 bg-white hover:bg-emerald-50 text-slate-700 border-2 border-emerald-100 rounded-2xl font-bold text-sm transition-all shadow-sm">
                        <Settings className="h-4 w-4 text-slate-400" /> Settings
                    </button>
                </div>
            </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <motion.div whileHover={{ y: -5 }} className="bg-white p-8 rounded-3xl border border-emerald-100 shadow-premium flex flex-col gap-6 group">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-all duration-500">
                    <Wallet className="h-8 w-8" />
                </div>
                <div>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Total Earnings</p>
                    <p className="text-3xl font-bold text-slate-800 tracking-tight">₹{stats.totalEarnings.toFixed(2)}</p>
                </div>
            </motion.div>
            <motion.div whileHover={{ y: -5 }} className="bg-white p-8 rounded-3xl border border-emerald-100 shadow-premium flex flex-col gap-6 group text-white bg-emerald-500 border-none">
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur-sm">
                    <Recycle className="h-8 w-8" />
                </div>
                <div>
                    <p className="text-emerald-100 text-[10px] font-black uppercase tracking-widest mb-2">Waste Managed</p>
                    <p className="text-3xl font-bold tracking-tight">{stats.totalWeight}<span className="text-lg ml-1 font-semibold opacity-80">kg</span></p>
                </div>
            </motion.div>
            <motion.div whileHover={{ y: -5 }} className="bg-white p-8 rounded-3xl border border-emerald-100 shadow-premium flex flex-col gap-6 group">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                    <Leaf className="h-8 w-8" />
                </div>
                <div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Carbon Saved</p>
                    <p className="text-3xl font-bold text-slate-800 tracking-tight">{stats.carbonSaved.toFixed(1)}<span className="text-lg ml-1 font-semibold text-blue-400">kg</span></p>
                </div>
            </motion.div>
        </div>

        {/* Info Blocks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left Col: Contact & Details */}
            <div className="lg:col-span-2 space-y-8">
                <div className="bg-white rounded-3xl border border-emerald-100 shadow-premium overflow-hidden">
                    <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Personal Information</h2>
                        <button className="text-emerald-500 font-bold text-xs uppercase tracking-widest flex items-center gap-1 hover:text-emerald-400 transition-colors">
                            Update <ExternalLink className="h-3 w-3" />
                        </button>
                    </div>
                    <div className="p-10 grid grid-cols-1 sm:grid-cols-2 gap-x-16 gap-y-10">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone</label>
                            <div className="flex items-center gap-3 text-slate-700 font-bold text-base">
                                <div className="p-2 bg-emerald-50 rounded-lg"><Phone className="h-4 w-4 text-slate-400" /></div>
                                {user?.phone || 'Not provided'}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</label>
                            <div className="flex items-center gap-3 text-slate-700 font-bold text-base">
                                <div className="p-2 bg-emerald-50 rounded-lg"><Mail className="h-4 w-4 text-slate-400" /></div>
                                {user?.email}
                            </div>
                        </div>
                        {user?.upiId && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">UPI ID</label>
                                <div className="flex items-center gap-3 text-slate-700 font-bold text-base">
                                    <div className="p-2 bg-emerald-50 rounded-lg"><Wallet className="h-4 w-4 text-slate-400" /></div>
                                    {user.upiId}
                                </div>
                            </div>
                        )}
                        <div className="sm:col-span-2 space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Collection Address</label>
                            <div className="flex items-start gap-3 text-slate-600 font-bold leading-relaxed bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 shadow-inner">
                                <div className="p-2 bg-white rounded-lg shadow-sm mt-1"><MapPin className="h-4 w-4 text-emerald-500" /></div>
                                <span className="pt-2">{user?.address?.formattedAddress || 'No primary address set'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {user?.role === 'collector' && (
                    <div className="bg-white rounded-3xl border border-emerald-100 shadow-premium overflow-hidden">
                        <div className="px-10 py-8 border-b border-slate-50">
                            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Vehicle Details</h2>
                        </div>
                        <div className="p-10 grid grid-cols-1 sm:grid-cols-2 gap-x-16 gap-y-10">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vehicle Category</label>
                                <div className="flex items-center gap-3 text-slate-700 font-bold text-base">
                                    <div className="p-2 bg-emerald-50 rounded-lg"><Truck className="h-4 w-4 text-slate-400" /></div>
                                    {user?.collectorDetails?.vehicleType || 'Unknown'}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">License Number</label>
                                <div className="flex items-center gap-3 text-slate-700 font-bold text-base">
                                    <div className="p-2 bg-emerald-50 rounded-lg"><Hash className="h-4 w-4 text-slate-400" /></div>
                                    {user?.collectorDetails?.vehicleNumber || 'Unknown'}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Right Col: Activity/Badges */}
            <div className="lg:col-span-1 space-y-8">
                <div className="bg-white rounded-3xl border border-emerald-100 shadow-premium p-8 overflow-hidden relative">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[2px]">Recent Activity</h3>
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </div>
                    
                    {/* Visual Activity Graph */}
                    <div className="flex items-end justify-between h-24 mb-10 px-1">
                        {weeklyActivity.map((val, i) => (
                            <div key={i} className="group relative flex flex-col items-center gap-2 w-full">
                                <motion.div 
                                    initial={{ height: 0 }}
                                    animate={{ height: `${val}%` }}
                                    transition={{ duration: 1, delay: i * 0.1 }}
                                    className={cn(
                                        "w-[6px] rounded-full transition-all duration-300",
                                        i === 5 ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)]" : "bg-slate-100 group-hover:bg-slate-200"
                                    )}
                                />
                                <span className="text-[8px] font-bold text-slate-300 group-hover:text-slate-500">
                                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                                    <CheckCircle2 className="h-6 w-6" />
                                </div>
                                <span className="font-bold text-slate-700 text-sm">Completed</span>
                            </div>
                            <span className="font-extrabold text-lg text-slate-900">{stats.totalPickups}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 text-slate-500">
                                    <Clock className="h-6 w-6" />
                                </div>
                                <span className="font-bold text-slate-700 text-sm">Active Jobs</span>
                            </div>
                            <span className="font-extrabold text-lg text-slate-900">{stats.activePickups}</span>
                        </div>
                    </div>
                    
                    <div className="h-[2px] bg-emerald-50 my-10" />
                    
                    <button className="w-full flex items-center justify-center gap-3 text-emerald-500 font-bold text-xs uppercase tracking-[2px] hover:bg-emerald-50 py-4 border-2 border-emerald-100 rounded-2xl transition-all active:scale-[0.98]">
                        Full History <ChevronRight className="h-4 w-4" />
                    </button>
                </div>

                <div className="bg-[#111827] rounded-3xl p-10 text-white relative overflow-hidden shadow-2xl shadow-slate-900/40 border border-slate-800">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-[60px]" />
                    <div className="relative z-10">
                        <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-6">
                             <Leaf className="h-5 w-5 text-emerald-400" />
                        </div>
                        <h4 className="text-[11px] font-black uppercase tracking-[3px] text-emerald-500 mb-6">Environment Impact</h4>
                        <p className="text-slate-300 text-base leading-relaxed font-bold italic">
                            "One person's small act of recycling today becomes a cleaner world for someone tomorrow."
                        </p>
                        <div className="mt-10 flex items-center gap-4">
                            <div className="flex -space-x-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 overflow-hidden bg-slate-800 ring-2 ring-emerald-500/20">
                                        <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" className="w-full h-full object-cover grayscale opacity-60" />
                                    </div>
                                ))}
                            </div>
                            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Joined by 2.4k others</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
