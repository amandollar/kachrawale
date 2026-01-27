import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../utils/api';
import PickupForm from '../components/PickupForm';
import PickupList from '../components/PickupList';
import { toast } from 'react-hot-toast';
import { 
  LayoutDashboard, Plus, AlertTriangle, Clock, X, User,
  Wallet, TrendingUp, ChevronRight, Info, Activity, ShieldCheck, Zap,
  Recycle
} from 'lucide-react';
import GPSTracker from '../components/GPSTracker';
import LiveTrackingMap from '../components/LiveTrackingMap';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const isPendingCollector = user?.role === 'collector' && !user?.isVerified;

  const fetchPickups = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/pickups');
      if (data.success) {
        setPickups(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch pickups", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && !isPendingCollector) {
        fetchPickups();
    } else {
        setLoading(false);
    }
  }, [user, isPendingCollector]);

  useEffect(() => {
    if (!socket) return;

    socket.on('pickup_status_updated', (data) => {
        const amICitizen = user.role === 'citizen' && data.citizenId === user._id;
        const amICollector = user.role === 'collector' && (data.collectorId === user._id || !data.collectorId); 
        
        if (amICitizen || amICollector) {
            fetchPickups(); 
            if (amICitizen) {
                if (data.status === 'ON_THE_WAY') {
                    toast.success("Collector is on the way! Live tracking enabled.");
                } else if (data.status === 'COMPLETED') {
                   toast.success("Pickup completed!");
                }
            }
        }
    });

    socket.on('new_pickup', (data) => {
        if (user.role === 'collector') {
            toast('New Pickup Available nearby!', { icon: '🚛' });
            fetchPickups();
        }
    });

    return () => {
        socket.off('pickup_status_updated');
        socket.off('new_pickup');
    };
  }, [socket, user]);

  const handlePickupCreated = () => {
      setShowForm(false);
      fetchPickups();
      toast.success("Pickup scheduled successfully!");
  };

  const myActivePickup = pickups.find(p => p.status === 'ON_THE_WAY');

  const collectorStats = useMemo(() => {
    if (user?.role !== 'collector') return null;
    const completed = pickups.filter(p => p.status === 'COMPLETED' || p.status === 'SETTLED');
    const totalTransactions = completed.reduce((acc, p) => acc + (p.finalAmount || 0), 0);
    return {
        earnings: totalTransactions * 0.05,
        count: completed.length
    };
  }, [pickups, user?.role]);

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 pb-20">
      {/* GPS TRACKER FOR COLLECTOR */}
      {user?.role === 'collector' && myActivePickup && (
          <GPSTracker pickupId={myActivePickup._id} />
      )}

      {/* Hero Section Container */}
      <div className="mesh-gradient border-b border-slate-100 shadow-sm relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-12 md:py-20 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-emerald-600 p-2 rounded-xl shadow-lg shadow-emerald-200">
                             <Zap className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[3px] text-emerald-600">Active Dashboard</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-800 tracking-tight leading-tight">
                        Welcome back, <br className="hidden sm:block" />
                        <span className="text-emerald-600">{user?.name.split(' ')[0]}!</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-4 text-lg max-w-md leading-relaxed">
                        Ready to make the world cleaner? Check your active pickups or schedule a new one below.
                    </p>
                </motion.div>
                
                {user?.role === 'citizen' && (
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowForm(!showForm)}
                        className={cn(
                            "w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 rounded-3xl transition-all flex items-center justify-center gap-3 font-black text-xs uppercase tracking-[2px] shadow-2xl active:scale-95 group overflow-hidden relative",
                            showForm 
                                ? "bg-white text-slate-500 border-2 border-slate-100 shadow-slate-100" 
                                : "bg-emerald-600 text-white shadow-emerald-200 ring-4 ring-emerald-500/10"
                        )}
                    >
                        {showForm ? (
                            <><X className="h-5 w-5" /> Close Form</>
                        ) : (
                            <><Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" /> New Collection</>
                        )}
                    </motion.button>
                )}
            </div>
        </div>
        
        {/* Background Decorative Element */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px] -mr-40 -mt-40" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 -mt-10 relative z-20">
        
        {/* Live Tracking Alert Card */}
        {user?.role === 'citizen' && myActivePickup && (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12 bg-white p-8 rounded-[32px] border border-emerald-100 shadow-premium overflow-hidden group"
            >
                <div className="flex flex-col md:flex-row gap-10">
                    <div className="md:w-1/2 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                </span>
                                <span className="text-[10px] font-black uppercase tracking-[3px] text-emerald-600">Live Status</span>
                            </div>
                            <h2 className="text-3xl font-bold text-slate-800 leading-tight">Your collector is <br />on the way!</h2>
                            <p className="text-slate-500 text-sm font-medium mt-4 leading-relaxed">
                                Keep your <span className="text-emerald-600 font-bold">{myActivePickup.wasteType}</span> waste ready at the collection point. You can see the collector's live location on the map.
                            </p>
                        </div>
                        <div className="pt-8 flex items-center gap-4">
                             <div className="flex -space-x-3 overflow-hidden">
                                <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 overflow-hidden"><img src="https://i.pravatar.cc/100?u=4" alt="" /></div>
                                <div className="w-10 h-10 rounded-full border-2 border-white bg-emerald-600 flex items-center justify-center text-[10px] font-black text-white">+2</div>
                             </div>
                             <span className="text-xs font-bold text-slate-400">Collector & Crew</span>
                        </div>
                    </div>
                    <div className="md:w-1/2 rounded-[24px] overflow-hidden border-2 border-slate-50 h-72 shadow-inner bg-slate-50 relative">
                        <LiveTrackingMap 
                            pickupId={myActivePickup._id} 
                            initialLat={myActivePickup.location?.coordinates[1]} 
                            initialLng={myActivePickup.location?.coordinates[0]} 
                        />
                    </div>
                </div>
            </motion.div>
        )}

        {isPendingCollector && (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-amber-50 border-2 border-amber-100 p-8 mb-12 rounded-[32px] shadow-sm flex flex-col md:flex-row items-center gap-6"
            >
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-amber-500 shadow-sm shadow-amber-100">
                    <Clock className="h-8 w-8" />
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h4 className="text-xl font-bold text-amber-900 tracking-tight">Account Under Review</h4>
                    <p className="text-sm font-semibold text-amber-700/70 mt-1 max-w-lg">Our team is verifying your collector documents. You'll receive full access within 24-48 business hours.</p>
                </div>
                <button className="px-6 py-3 bg-white text-amber-800 rounded-xl font-bold text-xs uppercase tracking-widest border border-amber-200">View Status</button>
            </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Column: Pickup List */}
            {!isPendingCollector ? (
                <div className="lg:col-span-2 space-y-12 pb-12">
                    <AnimatePresence>
                        {showForm && (
                            <motion.div 
                                initial={{ opacity: 0, y: -20, height: 0 }}
                                animate={{ opacity: 1, y: 0, height: 'auto' }}
                                exit={{ opacity: 0, y: -20, height: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="bg-white rounded-[32px] border border-slate-100 shadow-premium overflow-hidden p-2">
                                    <PickupForm onPickupCreated={handlePickupCreated} />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="space-y-6">
                        <div className="flex justify-between items-end px-4">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                                    Your Schedule <Activity className="h-5 w-5 text-emerald-600" />
                                </h2>
                                <p className="text-slate-400 text-sm font-semibold mt-1">Timeline of recent and upcoming pickups.</p>
                            </div>
                            <span className="bg-white px-4 py-2 rounded-xl text-slate-500 font-bold text-[10px] uppercase border border-slate-100 shadow-sm tracking-[2px]">
                                {pickups.length} Total
                            </span>
                        </div>
                        <div className="p-2 md:p-4 bg-white md:bg-transparent rounded-[32px] md:border-none border border-slate-100 shadow-sm md:shadow-none">
                            <PickupList pickups={pickups} loading={loading} onPickupUpdated={fetchPickups} />
                        </div>
                    </div>
                </div>
            ) : (
                 <div className="lg:col-span-2 bg-white rounded-[32px] border border-slate-100 p-20 flex flex-col items-center justify-center text-center space-y-6 shadow-sm">
                    <div className="p-8 bg-emerald-50 rounded-full ring-[20px] ring-emerald-50/50">
                        <ShieldCheck className="h-16 w-16 text-emerald-600" />
                    </div>
                    <div className="space-y-3">
                        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Verification in Progress</h2>
                        <p className="text-slate-500 text-sm max-w-sm font-medium leading-relaxed leading-relaxed">
                            To ensure high-quality service, we manually review every collector application. Thank you for your patience!
                        </p>
                    </div>
                    <div className="pt-6">
                        <button onClick={() => navigate('/profile')} className="text-emerald-600 font-bold text-xs uppercase tracking-[2px] hover:underline underline-offset-8 transition-all">Review Application Profile</button>
                    </div>
                 </div>
            )}
            
            {/* Right Column: Profile Summary & Tips */}
            <div className="space-y-10">
                {user?.role === 'collector' && collectorStats && (
                    <motion.div 
                        whileHover={{ y: -5 }}
                        className="bg-emerald-600 p-10 rounded-[32px] shadow-2xl shadow-emerald-200 relative overflow-hidden group text-white border-none"
                    >
                        <div className="absolute -right-8 -bottom-8 opacity-20 group-hover:scale-125 transition-transform duration-1000 rotate-12">
                            <Wallet className="h-40 w-40" />
                        </div>
                        <div className="relative z-10 flex flex-col justify-between h-full">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                                        <TrendingUp className="h-5 w-5 text-white" />
                                    </div>
                                    <h5 className="font-black uppercase tracking-[2px] text-xs text-emerald-100">Estimated Commission</h5>
                                </div>
                                <div className="text-5xl font-bold tracking-tight mb-2">₹{collectorStats.earnings.toFixed(2)}</div>
                                <p className="text-sm font-bold text-emerald-200/80 mb-8">{collectorStats.count} Completed Services</p>
                            </div>
                            <button 
                                onClick={() => navigate('/profile')}
                                className="w-full py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-2xl font-black text-xs uppercase tracking-[2px] transition-all border border-white/20 shadow-lg"
                            >
                                Withdrawal History
                            </button>
                        </div>
                    </motion.div>
                )}

                <div className="bg-white rounded-[32px] shadow-premium border border-slate-100 p-10 flex flex-col items-center text-center relative group">
                    <div className="absolute top-6 right-6 p-2 rounded-xl bg-slate-50 text-slate-300 group-hover:text-emerald-500 transition-colors">
                        <Info className="h-4 w-4" />
                    </div>
                    <div className="relative mb-8">
                        <div className="w-28 h-28 rounded-full border-[6px] border-slate-50 overflow-hidden bg-white shadow-xl ring-2 ring-emerald-500/10">
                            <img 
                                src={user?.profilePicture} 
                                alt={user?.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 tracking-tight">{user?.name}</h3>
                    <div className="flex items-center gap-2 mt-4">
                         <span className="text-emerald-600 font-black uppercase tracking-[3px] text-[10px] bg-emerald-50/50 px-4 py-1.5 rounded-full border border-emerald-100 shadow-sm">
                                {user?.role}
                        </span>
                    </div>
                    <p className="text-slate-400 text-xs font-bold mt-8 pb-8 leading-relaxed max-w-[200px]">Empower your recycling journey with personalized stats.</p>
                    <button 
                        onClick={() => navigate('/profile')}
                        className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black text-xs uppercase tracking-[3px] hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 active:scale-95 group"
                    >
                        View Profile <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                <div className="bg-white rounded-[32px] p-10 border border-slate-100 shadow-sm overflow-hidden flex flex-col gap-8">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-1 object-cover bg-emerald-500 rounded-full" />
                        <h4 className="text-[11px] font-black uppercase tracking-[3px] text-slate-800">Pro Guidelines</h4>
                    </div>
                    <div className="space-y-6">
                        {[
                            { text: "Segregate dry & wet waste.", icon: <Recycle className="h-3.5 w-3.5" /> },
                            { text: "Bundle metal scraps safely.", icon: <ShieldCheck className="h-3.5 w-3.5" /> },
                            { text: "Verify collector's live ID.", icon: <User className="h-3.5 w-3.5" /> }
                        ].map((tip, i) => (
                            <div key={i} className="flex gap-5 items-start">
                                <div className="h-7 w-7 rounded-xl bg-slate-50 border border-slate-100 flex-shrink-0 flex items-center justify-center text-slate-400">
                                    {tip.icon}
                                </div>
                                <span className="text-xs font-bold text-slate-500 leading-relaxed pt-1">{tip.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
