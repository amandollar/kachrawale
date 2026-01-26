import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../utils/api';
import PickupForm from '../components/PickupForm';
import PickupList from '../components/PickupList';
import EditProfileForm from '../components/EditProfileForm';
import { toast } from 'react-hot-toast';
import { LayoutDashboard, Plus, Edit2, AlertTriangle, Clock, Map, X } from 'lucide-react';
import GPSTracker from '../components/GPSTracker';
import LiveTrackingMap from '../components/LiveTrackingMap';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';

const Dashboard = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [activeTrackingPickup, setActiveTrackingPickup] = useState(null);

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

  // Real-time updates
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
                   setActiveTrackingPickup(null);
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

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 sm:p-8">
      {/* GPS TRACKER FOR COLLECTOR */}
      {user?.role === 'collector' && myActivePickup && (
          <GPSTracker pickupId={myActivePickup._id} />
      )}

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditProfile && <EditProfileForm onClose={() => setShowEditProfile(false)} />}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
            <div className="space-y-1">
                <h1 className="text-4xl font-black text-gray-900 flex items-center gap-3 tracking-tight">
                    <LayoutDashboard className="h-10 w-10 text-green-600" /> 
                    Dashboard
                </h1>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs ml-1">Welcome back, {user?.name}!</p>
            </div>
            
            {user?.role === 'citizen' && (
                <button 
                    onClick={() => setShowForm(!showForm)}
                    className={cn(
                        "px-6 py-3 rounded-2xl transition-all flex items-center gap-2 font-black text-sm uppercase tracking-widest shadow-xl active:scale-95",
                        showForm 
                            ? "bg-white text-gray-500 border-2 border-gray-100 hover:bg-gray-50 shadow-gray-200/50" 
                            : "bg-green-600 text-white hover:bg-green-700 shadow-green-200"
                    )}
                >
                    {showForm ? <><X className="h-5 w-5" /> Cancel</> : <><Plus className="h-5 w-5" /> Schedule Pickup</>}
                </button>
            )}
        </div>

        {/* Live Tracking Map Section (Citizen) */}
        {user?.role === 'citizen' && myActivePickup && (
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-10 bg-white p-8 rounded-[32px] border-2 border-green-100 shadow-2xl shadow-green-100/50"
            >
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                             <div className="relative flex h-4 w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
                            </div>
                            Live Pickup Tracking
                        </h2>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mt-1">Collector is on the way to pick up your <span className="text-green-600">{myActivePickup.wasteType}</span></p>
                    </div>
                </div>
                <div className="rounded-2xl overflow-hidden border-4 border-gray-50 shadow-inner">
                    <LiveTrackingMap 
                        pickupId={myActivePickup._id} 
                        initialLat={myActivePickup.location?.coordinates[1]} 
                        initialLng={myActivePickup.location?.coordinates[0]} 
                    />
                </div>
            </motion.div>
        )}

        {isPendingCollector && (
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-yellow-50 border-2 border-yellow-100 p-6 mb-10 rounded-3xl shadow-lg shadow-yellow-100/50"
            >
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-yellow-400 rounded-2xl text-white shadow-lg shadow-yellow-200">
                        <Clock className="h-6 w-6" />
                    </div>
                    <div>
                        <h4 className="font-black text-yellow-800 uppercase tracking-widest text-sm">Application Pending</h4>
                        <p className="text-yellow-700 text-sm font-medium">Your application is currently under review. This usually takes 24-48 hours.</p>
                    </div>
                </div>
            </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left Column: Pickup List */}
            {!isPendingCollector && (
                <div className="lg:col-span-2 space-y-8">
                    <AnimatePresence>
                        {showForm && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="mb-10 bg-white p-2 rounded-[32px] border-2 border-gray-100 shadow-xl overflow-hidden">
                                    <PickupForm onPickupCreated={handlePickupCreated} />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                                <div className="w-2 h-8 bg-green-500 rounded-full" />
                                Your Pickups
                            </h2>
                            <span className="bg-gray-50 text-gray-400 font-black text-xs px-3 py-1 rounded-full border border-gray-100">
                                {pickups.length} TOTAL
                            </span>
                        </div>
                        <PickupList pickups={pickups} loading={loading} onPickupUpdated={fetchPickups} />
                    </div>
                </div>
            )}
            
            {isPendingCollector && (
                 <div className="lg:col-span-2 bg-white rounded-[40px] shadow-sm border border-gray-100 p-16 flex flex-col items-center justify-center text-center space-y-6">
                    <motion.div 
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="p-6 bg-green-50 rounded-full"
                    >
                        <AlertTriangle className="h-16 w-16 text-green-600" />
                    </motion.div>
                     <div className="space-y-2">
                        <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Wait for Approval</h2>
                        <p className="text-gray-400 font-medium max-w-md mx-auto">
                            We are verifying your vehicle and license details. You'll receive an email once approved.
                        </p>
                     </div>
                 </div>
            )}

            {/* Right Column: Profile & Info */}
            <div className="space-y-8">
                <motion.div 
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-[40px] shadow-xl shadow-gray-200/50 border border-gray-100 p-8 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700 ease-out" />
                    
                    <button 
                        onClick={() => setShowEditProfile(true)}
                        className="absolute top-6 right-6 p-2 rounded-xl bg-gray-50 text-gray-400 hover:text-green-600 hover:bg-green-50 transition-all active:scale-95 z-10"
                        title="Edit Profile"
                    >
                        <Edit2 className="h-5 w-5" />
                    </button>

                    <div className="relative z-10 flex flex-col items-center mb-8">
                         <div className="relative mb-4">
                            <img 
                                src={user?.profilePicture || 'https://via.placeholder.com/150'} 
                                alt={user?.name}
                                className="w-32 h-32 rounded-[32px] object-cover border-4 border-white shadow-2xl"
                            />
                            <div className="absolute -bottom-2 -right-2">
                                <span className={cn(
                                    "capitalize px-4 py-1.5 rounded-2xl text-[10px] font-black tracking-widest shadow-lg border-2 border-white",
                                    isPendingCollector ? 'bg-yellow-400 text-white' : 'bg-green-600 text-white'
                                )}>
                                    {user?.role}
                                </span>
                            </div>
                         </div>
                         <h3 className="text-2xl font-black text-gray-900 tracking-tight">{user?.name}</h3>
                         <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-1">{user?.email}</p>
                    </div>

                    <div className="space-y-4 relative z-10">
                         {user?.phone && (
                            <div className="flex justify-between items-center bg-gray-50/50 p-4 rounded-2xl hover:bg-gray-50 transition-colors">
                                <span className="text-gray-400 font-black text-[10px] uppercase tracking-widest">Phone</span>
                                <span className="font-bold text-gray-800 text-sm">{user?.phone}</span>
                            </div>
                        )}
                        {user?.address?.formattedAddress && (
                             <div className="flex flex-col gap-1 bg-gray-50/50 p-4 rounded-2xl hover:bg-gray-50 transition-colors">
                                <span className="text-gray-400 font-black text-[10px] uppercase tracking-widest">Primary Address</span>
                                <span className="font-bold text-gray-800 text-sm line-clamp-2">{user.address.formattedAddress}</span>
                            </div>
                        )}
                         {user?.role === 'collector' && user?.collectorDetails && (
                            <div className="grid grid-cols-2 gap-4 mt-6">
                                <div className="bg-green-50/50 p-4 rounded-2xl border border-green-100">
                                    <span className="text-green-600/50 font-black text-[10px] uppercase tracking-widest block mb-1">Vehicle</span>
                                    <span className="font-black text-green-700 text-sm">{user.collectorDetails.vehicleType}</span>
                                </div>
                                 <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                                    <span className="text-blue-600/50 font-black text-[10px] uppercase tracking-widest block mb-1">Plate #</span>
                                    <span className="font-black text-blue-700 text-sm">{user.collectorDetails.vehicleNumber}</span>
                                </div>
                            </div>
                         )}
                    </div>
                </motion.div>

                <div className="bg-gray-900 rounded-[40px] p-8 text-white relative overflow-hidden shadow-2xl shadow-gray-900/20">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                    <h4 className="text-lg font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                         <div className="w-1.5 h-6 bg-green-500 rounded-full" />
                        Quick Tips
                    </h4>
                    <ul className="space-y-4">
                        {[
                            "Segregate dry and wet waste before collector arrives.",
                            "Keep your e-waste separate for special handling.",
                            "Verify the collector's identity via the dashboard."
                        ].map((tip, i) => (
                            <li key={i} className="flex gap-3 text-sm font-medium text-gray-400 leading-relaxed">
                                <div className="h-5 w-5 bg-gray-800 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] text-green-500 font-black">
                                    {i + 1}
                                </div>
                                {tip}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
      </motion.div>
    </div>
  );
};
export default Dashboard;
