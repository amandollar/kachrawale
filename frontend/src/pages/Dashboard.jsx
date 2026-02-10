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
import DashboardHero from '../assets/dashboard_hero.png';
import VerificationImage from '../assets/verification_pending.png';
import RecyclingGuideImage from '../assets/recycling_guide.png';

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

  const [stats, setStats] = useState(null);

  const fetchStats = async () => {
      try {
          const { data } = await api.get('/collector/my-stats');
          if (data.success) {
              setStats(data.data);
          }
      } catch (error) {
          console.error("Failed to fetch collector stats", error);
      }
  };

  useEffect(() => {
    if (user && !isPendingCollector) {
        fetchPickups();
        if (user.role === 'collector') {
            fetchStats();
        }
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

  // Use the fetched stats instead of local calculation
  const collectorStats = useMemo(() => {
    if (!stats) return null;
    return {
        earnings: stats.totalEarnings || 0,
        count: stats.totalTrips || 0,
        cashSpent: stats.cashSpent || 0
    };
  }, [stats]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* GPS TRACKER FOR COLLECTOR */}
      {user?.role === 'collector' && myActivePickup && (
          <GPSTracker pickupId={myActivePickup._id} />
      )}

      {/* Header Section */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight break-words">
                        Welcome back, <span className="text-emerald-500">{user?.name?.split(' ')[0] || 'User'}</span>
                    </h1>
                    <p className="text-slate-500 text-sm mt-1.5">
                        {user?.role === 'citizen' 
                          ? 'Manage your waste pickups and track your impact'
                          : user?.role === 'collector'
                          ? 'View available pickups and manage your routes'
                          : 'Monitor platform activity and manage users'}
                    </p>
                </div>
                
                {user?.role === 'citizen' && (
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowForm(!showForm)}
                        className={cn(
                            "px-5 py-2.5 rounded-lg transition-all flex items-center gap-2 font-medium text-sm shadow-sm",
                            showForm 
                                ? "bg-slate-100 text-slate-700 hover:bg-slate-200" 
                                : "bg-emerald-500 text-white hover:bg-emerald-400"
                        )}
                    >
                        {showForm ? (
                            <><X className="h-4 w-4" /> Close</>
                        ) : (
                            <><Plus className="h-4 w-4" /> New Pickup</>
                        )}
                    </motion.button>
                )}
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Stats Cards for Collectors */}
        {user?.role === 'collector' && collectorStats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <motion.div 
                    whileHover={{ y: -2 }}
                    className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-200 group"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 font-medium mb-1">Total Earnings</p>
                            <p className="text-2xl font-semibold text-slate-900 group-hover:text-emerald-500 transition-colors">₹{collectorStats.earnings.toFixed(2)}</p>
                        </div>
                        <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center group-hover:bg-emerald-100 group-hover:scale-110 transition-all duration-200">
                            <Wallet className="h-6 w-6 text-emerald-500" />
                        </div>
                    </div>
                </motion.div>
                <motion.div 
                    whileHover={{ y: -2 }}
                    className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 group"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 font-medium mb-1">Completed Pickups</p>
                            <p className="text-2xl font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{collectorStats.count}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 group-hover:scale-110 transition-all duration-200">
                            <Activity className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </motion.div>
                <motion.div 
                    whileHover={{ y: -2 }}
                    className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-200 transition-all duration-200 group"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 font-medium mb-1">Cash Reimbursable</p>
                            <p className="text-2xl font-semibold text-slate-900 group-hover:text-amber-600 transition-colors">₹{collectorStats.cashSpent.toFixed(2)}</p>
                        </div>
                        <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center group-hover:bg-amber-100 group-hover:scale-110 transition-all duration-200">
                            <TrendingUp className="h-6 w-6 text-amber-600" />
                        </div>
                    </div>
                </motion.div>
            </div>
        )}

        {/* Live Tracking Alert Card */}
        {user?.role === 'citizen' && myActivePickup && (
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="lg:w-1/2 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <span className="text-xs font-semibold text-emerald-500 uppercase tracking-wide">Live Tracking</span>
                            </div>
                            <h2 className="text-2xl font-semibold text-slate-900 mb-2">Collector is on the way</h2>
                            <p className="text-slate-600 text-sm mb-6">
                                Keep your <span className="font-medium text-emerald-500">{myActivePickup?.wasteType || 'waste'}</span> waste ready. Track the collector's location in real-time.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex -space-x-2">
                                <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center">
                                    <User className="h-4 w-4 text-slate-400" />
                                </div>
                                {user?.profilePicture && (
                                    <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden">
                                        <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>
                            <span className="text-xs text-slate-500 font-medium">Collector & Team</span>
                        </div>
                    </div>
                    <div className="lg:w-1/2 rounded-lg overflow-hidden border border-slate-200 h-64 bg-slate-50 min-h-[256px]">
                        <LiveTrackingMap 
                            pickupId={myActivePickup._id} 
                            initialLat={myActivePickup.location?.coordinates?.[1]} 
                            initialLng={myActivePickup.location?.coordinates?.[0]} 
                        />
                    </div>
                </div>
            </motion.div>
        )}

        {isPendingCollector && (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-amber-50 border border-amber-200 p-6 mb-8 rounded-xl flex flex-col sm:flex-row items-center gap-4 shadow-sm"
            >
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-amber-600 flex-shrink-0">
                    <Clock className="h-6 w-6" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                    <h4 className="text-lg font-semibold text-amber-900">Account Under Review</h4>
                    <p className="text-sm text-amber-700 mt-1">We're verifying your documents. You'll receive access within 24-48 hours.</p>
                </div>
                <button 
                    onClick={() => navigate('/profile')}
                    className="px-4 py-2 bg-white text-amber-700 rounded-lg text-sm font-medium border border-amber-200 hover:bg-amber-100 hover:shadow-sm hover:scale-105 transition-all duration-200"
                >
                    View Status
                </button>
            </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Pickup List / Support Area */}
            {!isPendingCollector ? (
                <div className={cn(
                    "space-y-6",
                    activeTab === 'support' ? "lg:col-span-3" : "lg:col-span-2"
                )}>
                    <AnimatePresence>
                        {showForm && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="overflow-hidden"
                            >
                                <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
                                    <PickupForm onPickupCreated={handlePickupCreated} />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="space-y-4">
                        {/* Tab Switcher */}
                        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 w-fit shadow-sm">
                            <button 
                                onClick={() => setActiveTab('pickups')}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2",
                                    activeTab === 'pickups' 
                                        ? "bg-slate-900 text-white shadow-sm scale-105" 
                                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                )}
                            >
                                <Activity className="h-4 w-4" /> Pickups
                            </button>
                            <button 
                                onClick={() => setActiveTab('messages')}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2",
                                    activeTab === 'messages' 
                                        ? "bg-slate-900 text-white shadow-sm scale-105" 
                                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                )}
                            >
                                <MessageSquare className="h-4 w-4" /> Messages
                                {pickups && pickups.filter(p => !!p.collector).length > 0 && (
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                )}
                            </button>
                        </div>

                        {activeTab === 'pickups' ? (
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                                <div className="p-4 border-b border-slate-200 bg-slate-50/50">
                                    <h2 className="text-lg font-semibold text-slate-900">Recent Pickups</h2>
                                    <p className="text-sm text-slate-500 mt-0.5">View and manage your pickup requests</p>
                                </div>
                                <div className="p-4">
                                    <PickupList pickups={pickups} loading={loading} onPickupUpdated={fetchPickups} onOpenChat={(id) => {
                                            setActiveTab('messages');
                                            setSelectedChatId(id);
                                        }} />
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                                <div className="p-4 border-b border-slate-200 bg-slate-50/50">
                                    <h2 className="text-lg font-semibold text-slate-900">Messages</h2>
                                    <p className="text-sm text-slate-500 mt-0.5">Chat with collectors and support</p>
                                </div>
                                <div className="p-4">
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
                 <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-12 flex flex-col items-center justify-center text-center space-y-4">
                    <img src={VerificationImage} alt="Verifying" className="w-48 h-48 object-contain" />
                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold text-slate-900">Verification in Progress</h2>
                        <p className="text-slate-500 text-sm max-w-md">
                            We're reviewing your collector application. You'll receive full access within 24-48 hours.
                        </p>
                    </div>
                    <button 
                        onClick={() => navigate('/profile')} 
                        className="mt-4 text-emerald-500 text-sm font-medium hover:text-emerald-400 hover:underline"
                    >
                        Review Application Profile
                    </button>
                 </div>
            )}
            
            {/* Right Column: Profile Summary & Tips */}
            {activeTab !== 'support' && !isPendingCollector && (
                <div className="space-y-4">
                <motion.div 
                    whileHover={{ y: -2 }}
                    className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 p-6"
                >
                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 border-2 border-emerald-200 overflow-hidden mb-4 flex items-center justify-center ring-2 ring-emerald-50">
                            {user?.profilePicture ? (
                                <img 
                                    src={user.profilePicture} 
                                    alt={user.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <User className="h-8 w-8 text-emerald-500" />
                            )}
                        </div>
                        <h3 className="text-base font-semibold text-slate-900 truncate max-w-full">{user?.name || 'User'}</h3>
                        <span className="text-xs text-slate-500 mt-1 capitalize">{user?.role || 'user'}</span>
                        <button 
                            onClick={() => navigate('/profile')}
                            className="w-full mt-4 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 hover:shadow-sm rounded-lg transition-all duration-200 flex items-center justify-center gap-2 group"
                        >
                            View Profile <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </motion.div>

                <motion.div 
                    whileHover={{ y: -2 }}
                    className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 p-6"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <Info className="h-4 w-4 text-emerald-500" />
                        <h4 className="text-sm font-semibold text-slate-900">Recycling Tips</h4>
                    </div>
                    <div className="space-y-3">
                        {[
                            { text: "Segregate dry and wet waste categories", icon: <Recycle className="h-4 w-4" /> },
                            { text: "Bundle metal scraps for safe handling", icon: <ShieldCheck className="h-4 w-4" /> },
                            { text: "Verify identification before transaction", icon: <User className="h-4 w-4" /> }
                        ].map((tip, i) => (
                            <div key={i} className="flex gap-3 items-start group/tip">
                                <div className="h-8 w-8 rounded-lg bg-emerald-50 group-hover/tip:bg-emerald-100 flex-shrink-0 flex items-center justify-center text-emerald-500 transition-colors">
                                    {tip.icon}
                                </div>
                                <span className="text-sm text-slate-600 leading-relaxed pt-1 group-hover/tip:text-slate-900 transition-colors">{tip.text}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
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
        <motion.button 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowSupport(true)}
          title="Contact Support"
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 bg-emerald-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:bg-emerald-400 transition-all duration-200"
        >
          <HelpCircle className="h-5 w-5" />
        </motion.button>
      )}
    </div>
  );
};

export default Dashboard;
