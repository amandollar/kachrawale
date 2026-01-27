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
  Recycle, MessageSquare, HelpCircle
} from 'lucide-react';
import GPSTracker from '../components/GPSTracker';
import LiveTrackingMap from '../components/LiveTrackingMap';
import MessageList from '../components/MessageList';
import ChatWindow from '../components/ChatWindow';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('pickups'); // 'pickups' or 'messages'
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [showSupport, setShowSupport] = useState(false);
  const [supportAdminViewUser, setSupportAdminViewUser] = useState(null);

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
    if (!socket || !user) return;

    // Join user-specific room
    socket.emit('join_user', user._id);

    socket.on('pickup_status_updated', (data) => {
        // Since we are in the target room, we don't strictly need to filter by ID,
        // but it's good practice.
        fetchPickups(); 
        
        if (user.role === 'citizen' && data.citizenId === user._id) {
            if (data.status === 'ON_THE_WAY') {
                toast.success("Collector is on the way! Live tracking enabled.");
            } else if (data.status === 'COMPLETED') {
               toast.success("Pickup completed!");
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
      <div className="bg-white border-b border-slate-200 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12 md:py-16 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <div className="flex items-center gap-2 mb-4">
                        <Zap className="h-4 w-4 text-emerald-600" />
                        <span className="text-[10px] font-bold uppercase tracking-[2px] text-slate-400">Dashboard Overview</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
                        Welcome, <span className="text-slate-500 font-medium">{user?.name.split(' ')[0]}</span>
                    </h1>
                    <p className="text-slate-500 text-sm font-medium mt-3 max-w-sm leading-relaxed">
                        Manage your recycling operations and track active pickups.
                    </p>
                </motion.div>
                
                {user?.role === 'citizen' && (
                    <motion.button 
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowForm(!showForm)}
                        className={cn(
                            "w-full sm:w-auto px-6 py-3.5 rounded-xl transition-all flex items-center justify-center gap-2.5 font-bold text-[11px] uppercase tracking-wider active:scale-95 group",
                            showForm 
                                ? "bg-slate-100 text-slate-600 hover:bg-slate-200" 
                                : "bg-slate-900 text-white shadow-xl shadow-slate-200 hover:bg-slate-800"
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

      <div className="max-w-7xl mx-auto px-6 sm:px-8 -mt-10 relative z-20">
        
        {/* Live Tracking Alert Card */}
        {user?.role === 'citizen' && myActivePickup && (
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
            >
                <div className="flex flex-col md:flex-row gap-8">
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
                                 <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 overflow-hidden flex items-center justify-center">
                                     <User className="h-5 w-5 text-slate-400" />
                                 </div>
                                 <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 overflow-hidden flex items-center justify-center">
                                     {user?.profilePicture ? (
                                        <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
                                     ) : (
                                        <User className="h-5 w-5 text-slate-400" />
                                     )}
                                 </div>
                                 <div className="w-10 h-10 rounded-full border-2 border-white bg-emerald-600 flex items-center justify-center text-[10px] font-black text-white">+1</div>
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
            {/* Left Column: Pickup List / Support Area */}
            {!isPendingCollector ? (
                <div className={cn(
                    "space-y-12 pb-12",
                    activeTab === 'support' ? "lg:col-span-3" : "lg:col-span-2"
                )}>
                    <AnimatePresence>
                        {showForm && (
                            <motion.div 
                                initial={{ opacity: 0, y: -20, height: 0 }}
                                animate={{ opacity: 1, y: 0, height: 'auto' }}
                                exit={{ opacity: 0, y: -20, height: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                    <PickupForm onPickupCreated={handlePickupCreated} />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="space-y-8">
                        {/* Tab Switcher */}
                        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-fit border border-slate-200 ml-4">
                            <button 
                                onClick={() => setActiveTab('pickups')}
                                className={cn(
                                    "px-6 py-2 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all flex items-center gap-2",
                                    activeTab === 'pickups' 
                                        ? "bg-white text-slate-900 shadow-sm border border-slate-200" 
                                        : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                <Activity className="h-3.5 w-3.5" /> Operations
                            </button>
                            <button 
                                onClick={() => setActiveTab('messages')}
                                className={cn(
                                    "px-6 py-2 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all flex items-center gap-2",
                                    activeTab === 'messages' 
                                        ? "bg-white text-slate-900 shadow-sm border border-slate-200" 
                                        : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                <MessageSquare className="h-3.5 w-3.5" /> Communications
                                {pickups.filter(p => !!p.collector).length > 0 && (
                                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                )}
                            </button>
                        </div>

                        {activeTab === 'pickups' ? (
                            <div className="space-y-6">
                                <div className="flex justify-between items-end px-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Recent Activity</h2>
                                        <p className="text-slate-400 text-xs font-medium mt-1">Real-time status of your pickup requests.</p>
                                    </div>
                                </div>
                                <div className="bg-white rounded-2xl border border-slate-200 p-1 shadow-sm overflow-hidden">
                                    <PickupList pickups={pickups} loading={loading} onPickupUpdated={fetchPickups} onOpenChat={(id) => {
                                            setActiveTab('messages');
                                            setSelectedChatId(id);
                                        }} />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="px-4">
                                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Direct Messaging</h2>
                                    <p className="text-slate-400 text-xs font-medium mt-1">Coordination with assigned personnel.</p>
                                </div>
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-2">
                                    <MessageList 
                                        pickups={pickups} 
                                        onSelectConversation={(id) => setSelectedChatId(id)}
                                        selectedId={selectedChatId}
                                    />
                                </div>
                            </div>
                        )}
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
            {activeTab !== 'support' && (
                <div className="space-y-10">
                {user?.role === 'collector' && collectorStats && (
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                        <div className="relative z-10 flex flex-col justify-between h-full">
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <Wallet className="h-4 w-4 text-emerald-600" />
                                    <h5 className="font-bold uppercase tracking-wider text-[10px] text-slate-400">Accrued Commission</h5>
                                </div>
                                <div className="text-3xl font-bold text-slate-900 tracking-tight mb-1">₹{collectorStats.earnings.toFixed(2)}</div>
                                <p className="text-[11px] font-bold text-slate-400 mb-6">{collectorStats.count} Completed Dispatches</p>
                            </div>
                            <button 
                                onClick={() => navigate('/profile')}
                                className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all border border-slate-200"
                            >
                                Settlement Records
                            </button>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col items-center text-center relative group">
                    <div className="relative mb-6">
                        <div className="w-20 h-20 rounded-full border-4 border-slate-50 overflow-hidden bg-white shadow-sm ring-1 ring-slate-100 flex items-center justify-center">
                            {user?.profilePicture ? (
                                <img 
                                    src={user.profilePicture} 
                                    alt={user.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            ) : (
                                <User className="h-8 w-8 text-slate-300" />
                            )}
                        </div>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">{user?.name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                         <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px] bg-slate-100 px-3 py-1 rounded-md border border-slate-200">
                                {user?.role}
                        </span>
                    </div>
                    <p className="text-slate-400 text-xs font-medium mt-6 pb-6 leading-relaxed max-w-[180px]">View and manage your account credentials and personal preferences.</p>
                    <button 
                        onClick={() => navigate('/profile')}
                        className="w-full py-3.5 bg-white border border-slate-200 text-slate-800 rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95"
                    >
                        Account Settings <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                </div>

                <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col gap-6">
                    <div className="flex items-center gap-2">
                        <Info className="h-3.5 w-3.5 text-slate-400" />
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-900">Recycling Guide</h4>
                    </div>
                    <div className="space-y-4">
                        {[
                            { text: "Segregate dry and wet waste categories.", icon: <Recycle className="h-3 w-3" /> },
                            { text: "Bundle metal scraps for safe handling.", icon: <ShieldCheck className="h-3 w-3" /> },
                            { text: "Verify identification before transaction.", icon: <User className="h-3 w-3" /> }
                        ].map((tip, i) => (
                            <div key={i} className="flex gap-4 items-start">
                                <div className="h-6 w-6 rounded-lg bg-slate-50 border border-slate-100 flex-shrink-0 flex items-center justify-center text-slate-400">
                                    {tip.icon}
                                </div>
                                <span className="text-[11px] font-medium text-slate-500 leading-relaxed pt-0.5">{tip.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            )}
        </div>
      </div>

      <AnimatePresence>
        {selectedChatId && (
          <ChatWindow pickupId={selectedChatId} onClose={() => setSelectedChatId(null)} />
        )}
        {(showSupport || supportAdminViewUser) && (
          <ChatWindow 
            isSupport={true} 
            supportUserId={supportAdminViewUser?._id} 
            onClose={() => {
              setShowSupport(false);
              setSupportAdminViewUser(null);
            }} 
          />
        )}
      </AnimatePresence>

      {/* FLOATING SUPPORT BUTTON (Only for non-admins to initiate) */}
      {user?.role !== 'admin' && (
        <button 
          onClick={() => setShowSupport(true)}
          title="Contact Admin"
          className="fixed bottom-6 left-6 z-40 bg-white p-4 rounded-xl shadow-xl border border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-200 transition-all active:scale-95 group"
        >
          <HelpCircle className="h-6 w-6" />
          <span className="absolute left-full ml-4 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            Support from Kachrawale
          </span>
        </button>
      )}
    </div>
  );
};

export default Dashboard;
