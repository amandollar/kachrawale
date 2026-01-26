import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../utils/api';
import PickupForm from '../components/PickupForm';
import PickupList from '../components/PickupList';
import EditProfileForm from '../components/EditProfileForm';
import { toast } from 'react-hot-toast';
import { LayoutDashboard, Plus, Edit2, AlertTriangle, Clock, Map } from 'lucide-react';
import GPSTracker from '../components/GPSTracker';
import LiveTrackingMap from '../components/LiveTrackingMap';

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
                    // Auto-open tracking if we want, or just let them click
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

  // derived state for active pickups
  const myActivePickup = pickups.find(p => p.status === 'ON_THE_WAY');

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      {/* GPS TRACKER FOR COLLECTOR */}
      {user?.role === 'collector' && myActivePickup && (
          <GPSTracker pickupId={myActivePickup._id} />
      )}

      {/* Edit Profile Modal */}
      {showEditProfile && <EditProfileForm onClose={() => setShowEditProfile(false)} />}

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                    <LayoutDashboard className="h-8 w-8 text-green-600" /> 
                    Dashboard
                </h1>
                <p className="text-gray-500 mt-1">Welcome back, {user?.name}!</p>
            </div>
            
            {user?.role === 'citizen' && (
                <button 
                    onClick={() => setShowForm(!showForm)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2 shadow-md"
                >
                    <Plus className="h-5 w-5" /> {showForm ? 'Cancel Scheduling' : 'Schedule New Pickup'}
                </button>
            )}
        </div>

        {/* Live Tracking Map Section (Citizen) */}
        {user?.role === 'citizen' && myActivePickup && (
            <div className="mb-8 bg-white p-6 rounded-xl border border-blue-100 shadow-sm">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                             <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </span>
                            Live Pickup Tracking
                        </h2>
                        <p className="text-gray-500 text-sm">Collector is on the way to pick up your {myActivePickup.wasteType}</p>
                    </div>
                </div>
                <LiveTrackingMap 
                    pickupId={myActivePickup._id} 
                    initialLat={myActivePickup.location?.coordinates[1]} 
                    initialLng={myActivePickup.location?.coordinates[0]} 
                />
            </div>
        )}

        {isPendingCollector && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 rounded-md shadow-sm">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <Clock className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                            <span className="font-medium">Application Pending!</span> 
                            Your application to become a collector is currently under review by the admin. 
                            You will receive an email once your application is approved.
                        </p>
                    </div>
                </div>
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Pickup List */}
            {!isPendingCollector && (
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Pickups</h2>
                        <PickupList pickups={pickups} loading={loading} onPickupUpdated={fetchPickups} />
                    </div>
                </div>
            )}
            
            {isPendingCollector && (
                 <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-10 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="p-4 bg-green-50 rounded-full">
                        <AlertTriangle className="h-10 w-10 text-green-600" />
                    </div>
                     <h2 className="text-2xl font-bold text-gray-900">Wait for Approval</h2>
                     <p className="text-gray-500 max-w-md">
                         We are verifying your vehicle and license details. This process usually takes 24-48 hours.
                         Please check back later.
                     </p>
                 </div>
            )}

            {/* Right Column: Profile & Form */}
            <div className="space-y-6">
                {showForm && (
                     <div className="mb-6">
                        <PickupForm onPickupCreated={handlePickupCreated} />
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative">
                    <button 
                        onClick={() => setShowEditProfile(true)}
                        className="absolute top-6 right-6 text-gray-400 hover:text-green-600 transition-colors"
                        title="Edit Profile"
                    >
                        <Edit2 className="h-5 w-5" />
                    </button>

                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Profile</h3>
                    
                    <div className="flex flex-col items-center mb-6">
                         <img 
                            src={user?.profilePicture || 'https://via.placeholder.com/150'} 
                            alt={user?.name}
                            className="w-24 h-24 rounded-full object-cover border-4 border-gray-50 shadow-md mb-2"
                         />
                         <span className={`capitalize px-3 py-1 rounded-full text-xs font-bold ${isPendingCollector ? 'bg-yellow-100 text-yellow-800' : 'bg-green-50 text-green-700'}`}>
                             {user?.role} {isPendingCollector && '(Pending)'}
                         </span>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between border-b border-gray-50 pb-2">
                            <span className="text-gray-500">Name</span>
                            <span className="font-medium text-right">{user?.name}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-50 pb-2">
                            <span className="text-gray-500">Email</span>
                            <span className="font-medium text-right truncate max-w-[150px]" title={user?.email}>{user?.email}</span>
                        </div>
                         {user?.phone && (
                            <div className="flex justify-between border-b border-gray-50 pb-2">
                                <span className="text-gray-500">Phone</span>
                                <span className="font-medium text-right">{user?.phone}</span>
                            </div>
                        )}
                        {user?.address?.formattedAddress && (
                             <div className="flex justify-between border-b border-gray-50 pb-2">
                                <span className="text-gray-500">Address</span>
                                <span className="font-medium text-right truncate max-w-[150px]" title={user.address.formattedAddress}>{user.address.formattedAddress}</span>
                            </div>
                        )}
                         {user?.role === 'collector' && user?.collectorDetails && (
                            <>
                                <div className="flex justify-between border-b border-gray-50 pb-2">
                                    <span className="text-gray-500">Vehicle</span>
                                    <span className="font-medium text-right">{user.collectorDetails.vehicleType}</span>
                                </div>
                                 <div className="flex justify-between border-b border-gray-50 pb-2">
                                    <span className="text-gray-500">Plate #</span>
                                    <span className="font-medium text-right">{user.collectorDetails.vehicleNumber}</span>
                                </div>
                            </>
                         )}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
