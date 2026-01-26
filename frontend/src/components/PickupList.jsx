import React, { useState } from 'react';
import { Package, Clock, CheckCircle, MapPin, Loader2, Eye, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import PickupDetailModal from './PickupDetailModal';
import { Skeleton } from './Skeleton';
import { motion, AnimatePresence } from 'framer-motion';

const PickupList = ({ pickups, loading, onPickupUpdated }) => {
  const { user } = useAuth();
  const [processingId, setProcessingId] = useState(null);
  const [selectedPickup, setSelectedPickup] = useState(null);

  const handleAccept = async (id) => {
    try {
        setProcessingId(id);
        const { data } = await api.put(`/pickups/${id}/status`, { status: 'ACCEPTED' });
        if (data.success) {
            if (onPickupUpdated) onPickupUpdated();
            if (selectedPickup && selectedPickup._id === id) {
                 setSelectedPickup(null); 
            }
        }
    } catch (error) {
        console.error("Failed to accept pickup", error);
        toast.error(error.response?.data?.message || "Failed to accept");
    } finally {
        setProcessingId(null);
    }
  };

  const getStatusColor = (status) => {
      switch (status) {
          case 'CREATED': return 'bg-blue-50 text-blue-700 border-blue-100';
          case 'MATCHING': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
          case 'ASSIGNED': return 'bg-purple-50 text-purple-700 border-purple-100';
          case 'ACCEPTED': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
          case 'ON_THE_WAY': return 'bg-orange-50 text-orange-700 border-orange-100';
          case 'COMPLETED': return 'bg-green-50 text-green-700 border-green-100';
          case 'CANCELLED': return 'bg-red-50 text-red-700 border-red-100';
          default: return 'bg-gray-50 text-gray-700 border-gray-100';
      }
  };

  return (
    <>
        {loading ? (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white p-4 rounded-lg border border-gray-100 flex flex-col sm:flex-row justify-between gap-4">
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-64" />
                        </div>
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-16 w-16 rounded-md" />
                            <Skeleton className="h-10 w-24 rounded-lg" />
                        </div>
                    </div>
                ))}
            </div>
        ) : !pickups || pickups.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center space-y-4"
            >
                <div className="p-4 bg-green-50 rounded-full">
                  <Package className="h-12 w-12 text-green-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">No Pickups Found</h3>
                  <p className="text-gray-500 max-w-sm mx-auto">There are no pickups available at the moment. Check back later or schedule one!</p>
                </div>
                {user?.role === 'citizen' && (
                  <button className="text-green-600 font-semibold flex items-center gap-1 hover:underline text-sm">
                      <Plus className="h-4 w-4" /> Schedule Now
                  </button>
                )}
            </motion.div>
        ) : (
            <motion.div 
                layout
                className="space-y-4"
            >
            <AnimatePresence mode="popLayout">
                {pickups.map((pickup) => (
                    <motion.div 
                        layout
                        key={pickup._id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition-all duration-300 group"
                    >
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-black border ${getStatusColor(pickup.status)}`}>
                                {pickup.status}
                            </span>
                            <span className="text-xs text-gray-400 flex items-center gap-1 font-medium">
                                <Clock className="h-3 w-3" /> {new Date(pickup.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        <h3 className="font-bold text-gray-900 capitalize text-xl group-hover:text-green-600 transition-colors">{pickup.wasteType}</h3>
                        <div className="flex items-center gap-3 mt-1">
                            <p className="text-sm font-semibold text-gray-600 flex items-center gap-1">
                                <Package className="h-4 w-4 text-green-500" /> {pickup.weight} kg
                            </p>
                            {pickup.location?.formattedAddress && (
                                <p className="text-sm text-gray-400 flex items-center gap-1 truncate max-w-[200px]" title={pickup.location.formattedAddress}>
                                    <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" /> {pickup.location.formattedAddress}
                                </p>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                        {pickup.images && pickup.images.length > 0 && (
                            <div 
                                className="flex-shrink-0 relative cursor-pointer overflow-hidden rounded-lg border-2 border-transparent group-hover:border-green-500 transition-all shadow-sm"
                                onClick={() => setSelectedPickup(pickup)}
                            >
                                <img 
                                    src={pickup.images[0]} 
                                    alt="Pickup" 
                                    className="h-14 w-14 sm:h-16 sm:w-16 object-cover transform group-hover:scale-110 transition-transform duration-500"
                                />
                                {pickup.video && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                        <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border border-white shadow-sm" />
                                    </div>
                                )}
                            </div>
                        )}
                        
                        <div className="flex gap-2">
                            <button
                                onClick={() => setSelectedPickup(pickup)}
                                className="bg-gray-50 text-gray-600 hover:text-green-600 p-2.5 rounded-xl hover:bg-green-50 transition-all border border-gray-100 hover:border-green-100"
                                title="View Details"
                            >
                                <Eye className="h-5 w-5" />
                            </button>

                            {user?.role === 'collector' && (pickup.status === 'CREATED' || pickup.status === 'MATCHING') && (
                                <button 
                                    onClick={() => handleAccept(pickup._id)}
                                    disabled={processingId === pickup._id}
                                    className="bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-200 hover:shadow-green-300 disabled:opacity-50 ring-offset-2 focus:ring-2 focus:ring-green-500 active:scale-95"
                                >
                                    {processingId === pickup._id ? <Loader2 className="animate-spin h-5 w-5" /> : 'Accept'}
                                </button>
                            )}
                        </div>
                    </div>
                    </motion.div>
                ))}
            </AnimatePresence>
            </motion.div>
        )}

        <AnimatePresence>
            {selectedPickup && (
                <PickupDetailModal 
                    pickup={selectedPickup} 
                    onClose={() => setSelectedPickup(null)} 
                    onAccept={handleAccept}
                    processingId={processingId}
                    onStatusUpdate={onPickupUpdated}
                />
            )}
        </AnimatePresence>
    </>
  );
};

export default PickupList;
