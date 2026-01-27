import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import EditProfileForm from '../components/EditProfileForm';
import { 
  User, Mail, Phone, MapPin, Truck, Hash, Edit3, Camera, 
  ShieldCheck, Wallet, BarChart3, TrendingUp, Recycle, Leaf,
  Clock, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';

const Profile = () => {
  const { user } = useAuth();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/pickups');
        if (data.success) {
          setPickups(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch pickups for stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const stats = useMemo(() => {
    const completed = pickups.filter(p => p.status === 'COMPLETED' || p.status === 'SETTLED');
    const totalWeight = completed.reduce((acc, p) => acc + (p.verifiedWeight || p.weight || 0), 0);
    
    // Logic: Collectors earn 5% commission, Citizens earn 100% of transaction value
    const baseValue = completed.reduce((acc, p) => acc + (p.finalAmount || 0), 0);
    const totalEarnings = user?.role === 'collector' ? baseValue * 0.05 : baseValue;
    
    const carbonSaved = totalWeight * 2.5; 
    
    return {
        totalPickups: completed.length,
        totalWeight,
        totalEarnings,
        carbonSaved,
        activePickups: pickups.filter(p => !['COMPLETED', 'SETTLED', 'CANCELLED'].includes(p.status)).length
    };
  }, [pickups, user?.role]);

  const isPendingCollector = user?.role === 'collector' && !user?.isVerified;

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 sm:p-8">
      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditProfile && <EditProfileForm onClose={() => setShowEditProfile(false)} />}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="mb-10">
            <h1 className="text-4xl font-black text-gray-900 flex items-center gap-3 tracking-tight">
                <User className="h-10 w-10 text-green-600" /> 
                My Profile
            </h1>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs ml-1 mt-2">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Avatar & Basic Info Card */}
          <div className="md:col-span-1 space-y-6">
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white rounded-[40px] shadow-xl shadow-gray-200/50 border border-gray-100 p-8 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700 ease-out" />
              
              <div className="relative z-10 flex flex-col items-center">
                <div className="relative mb-6">
                  <div className="w-40 h-40 rounded-[42px] overflow-hidden border-8 border-white shadow-2xl relative group/avatar">
                    <img 
                      src={user?.profilePicture || 'https://via.placeholder.com/150'} 
                      alt={user?.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                        <Camera className="text-white h-8 w-8" />
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2">
                    <span className={cn(
                      "capitalize px-6 py-2 rounded-2xl text-[12px] font-black tracking-widest shadow-lg border-4 border-white",
                      isPendingCollector ? 'bg-yellow-400 text-white' : 'bg-green-600 text-white'
                    )}>
                      {user?.role}
                    </span>
                  </div>
                </div>
                
                <h3 className="text-2xl font-black text-gray-900 tracking-tight text-center">{user?.name}</h3>
                <div className="flex items-center gap-2 mt-1 text-gray-400">
                    <ShieldCheck className={cn("h-4 w-4", user?.isVerified ? "text-blue-500" : "text-gray-300")} />
                    <span className="font-bold uppercase tracking-widest text-[10px]">{user?.isVerified ? 'Verified Account' : 'Pending Verification'}</span>
                </div>
              </div>

              <button 
                onClick={() => setShowEditProfile(true)}
                className="w-full mt-8 flex items-center justify-center gap-2 bg-green-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-green-700 transition-all shadow-xl shadow-green-200 active:scale-95"
              >
                <Edit3 className="h-5 w-5" /> Edit Profile
              </button>
            </motion.div>

            {/* Account Status Card */}
            <div className="bg-gray-900 rounded-[40px] p-8 text-white relative overflow-hidden shadow-2xl shadow-gray-900/20">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                <h4 className="text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2 text-green-500">
                     Account Security
                </h4>
                <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">Two-Factor Auth</span>
                        <span className="text-red-400 font-bold uppercase tracking-tighter text-[10px]">Disabled</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">Email Updates</span>
                        <span className="text-green-400 font-bold uppercase tracking-tighter text-[10px]">Enabled</span>
                    </div>
                </div>
            </div>
          </div>

          {/* Details Column */}
          <div className="md:col-span-2 space-y-8">
            <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-10">
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest flex items-center gap-2 mb-10">
                  <div className="w-2 h-8 bg-green-500 rounded-full" />
                  Detailed Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[3px] text-gray-400 ml-1">Email Address</label>
                  <div className="flex items-center gap-4 bg-gray-50 p-5 rounded-3xl border-2 border-transparent hover:border-green-100 transition-all group">
                    <div className="p-3 bg-white rounded-2xl shadow-sm text-gray-400 group-hover:text-green-600 transition-colors">
                      <Mail className="h-5 w-5" />
                    </div>
                    <span className="font-bold text-gray-700">{user?.email}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[3px] text-gray-400 ml-1">Phone Number</label>
                  <div className="flex items-center gap-4 bg-gray-50 p-5 rounded-3xl border-2 border-transparent hover:border-green-100 transition-all group">
                    <div className="p-3 bg-white rounded-2xl shadow-sm text-gray-400 group-hover:text-green-600 transition-colors">
                      <Phone className="h-5 w-5" />
                    </div>
                    <span className="font-bold text-gray-700">{user?.phone || 'Not provided'}</span>
                  </div>
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[3px] text-gray-400 ml-1">Primary Address</label>
                  <div className="flex items-start gap-4 bg-gray-50 p-5 rounded-3xl border-2 border-transparent hover:border-green-100 transition-all group">
                    <div className="p-3 bg-white rounded-2xl shadow-sm text-gray-400 group-hover:text-green-600 transition-colors">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <span className="font-bold text-gray-700 pt-3">{user?.address?.formattedAddress || 'No address set'}</span>
                  </div>
                </div>
              </div>

              {user?.role === 'collector' && (
                <>
                  <div className="h-px bg-gray-100 my-12" />
                  <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest flex items-center gap-2 mb-10">
                      <div className="w-2 h-8 bg-blue-500 rounded-full" />
                      Vehicle Details
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[3px] text-gray-400 ml-1">Vehicle Type</label>
                      <div className="flex items-center gap-4 bg-blue-50/50 p-5 rounded-3xl border-2 border-transparent hover:border-blue-100 transition-all group">
                        <div className="p-3 bg-white rounded-2xl shadow-sm text-blue-400 group-hover:text-blue-600 transition-colors">
                          <Truck className="h-5 w-5" />
                        </div>
                        <span className="font-black text-blue-900">{user?.collectorDetails?.vehicleType || 'Unknown'}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[3px] text-gray-400 ml-1">Vehicle Number</label>
                      <div className="flex items-center gap-4 bg-blue-50/50 p-5 rounded-3xl border-2 border-transparent hover:border-blue-100 transition-all group">
                        <div className="p-3 bg-white rounded-2xl shadow-sm text-blue-400 group-hover:text-blue-600 transition-colors">
                          <Hash className="h-5 w-5" />
                        </div>
                        <span className="font-black text-blue-900">{user?.collectorDetails?.vehicleNumber || 'Unknown'}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Analytics Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {user?.role === 'citizen' ? (
                    <>
                        <div className="bg-amber-500 rounded-[40px] p-8 text-white relative overflow-hidden group">
                            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                                <Wallet className="h-32 w-32" />
                            </div>
                            <h5 className="font-black uppercase tracking-widest text-[10px] mb-2 opacity-60">Total Earnings</h5>
                            <div className="text-4xl font-black">₹{stats.totalEarnings.toFixed(2)}</div>
                            <p className="text-xs mt-4 font-medium opacity-80">Money earned from your waste!</p>
                        </div>
                        <div className="bg-green-600 rounded-[40px] p-8 text-white relative overflow-hidden group">
                            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                                <Recycle className="h-32 w-32" />
                            </div>
                            <h5 className="font-black uppercase tracking-widest text-[10px] mb-2 opacity-60">Waste Recycled</h5>
                            <div className="text-4xl font-black">{stats.totalWeight}<span className="text-lg ml-1">kg</span></div>
                            <p className="text-xs mt-4 font-medium opacity-80">Across {stats.totalPickups} successful pickups.</p>
                        </div>
                        <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm relative overflow-hidden group sm:col-span-2 lg:col-span-1">
                             <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform text-green-600">
                                <Leaf className="h-32 w-32" />
                            </div>
                            <h5 className="font-black uppercase tracking-widest text-[10px] mb-2 text-gray-400">Carbon Saved</h5>
                            <div className="text-4xl font-black text-gray-900">{stats.carbonSaved.toFixed(1)} <span className="text-lg text-green-500">kg</span></div>
                            <div className="w-full bg-gray-100 h-2 rounded-full mt-6 overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min((stats.carbonSaved / 100) * 100, 100)}%` }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                    className="bg-green-500 h-full rounded-full" 
                                />
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="bg-blue-600 rounded-[40px] p-8 text-white relative overflow-hidden group">
                             <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                                <Wallet className="h-32 w-32" />
                            </div>
                            <h5 className="font-black uppercase tracking-widest text-[10px] mb-2 opacity-60">Total Earnings</h5>
                            <div className="text-4xl font-black">₹{stats.totalEarnings.toFixed(2)}</div>
                            <p className="text-xs mt-4 font-medium opacity-80">{stats.totalPickups} pickups completed successfully!</p>
                        </div>
                        <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm relative overflow-hidden group">
                             <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform text-blue-600">
                                <BarChart3 className="h-32 w-32" />
                            </div>
                            <h5 className="font-black uppercase tracking-widest text-[10px] mb-2 text-gray-400">Efficiency</h5>
                            <div className="text-4xl font-black text-gray-900">{(stats.totalWeight / (stats.totalPickups || 1)).toFixed(1)} <span className="text-lg text-blue-500">kg/avg</span></div>
                            <p className="text-xs mt-4 font-medium text-gray-400">Average weight per pickup collected.</p>
                        </div>
                    </>
                )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
