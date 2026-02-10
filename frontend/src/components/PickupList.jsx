import React, { useState } from 'react';
import { Package, Clock, CheckCircle, MapPin, Loader2, Eye, Plus, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import PickupDetailModal from './PickupDetailModal';
import { Skeleton } from './Skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';

const PickupList = ({ pickups, loading, onPickupUpdated, onOpenChat }) => {
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
    } finally {
        setProcessingId(null);
    }
  };

  const statusStyles = {
    CREATED: "bg-blue-50 text-blue-700",
    MATCHING: "bg-amber-50 text-amber-700",
    ASSIGNED: "bg-slate-100 text-slate-700",
    ACCEPTED: "bg-emerald-50 text-emerald-600",
    ON_THE_WAY: "bg-indigo-50 text-indigo-600",
    COMPLETED: "bg-emerald-100 text-emerald-600",
    SETTLED: "bg-slate-800 text-white",
    CANCELLED: "bg-rose-50 text-rose-700",
  };

  return (
    <div className="space-y-3">
        {loading ? (
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col sm:flex-row justify-between gap-4">
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-3 w-20 rounded-full" />
                            <Skeleton className="h-5 w-40 rounded" />
                            <Skeleton className="h-3 w-32 rounded" />
                        </div>
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-12 w-12 rounded-lg" />
                            <Skeleton className="h-9 w-20 rounded-lg" />
                        </div>
                    </div>
                ))}
            </div>
        ) : !pickups || pickups.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 flex flex-col items-center justify-center space-y-3"
            >
                <div className="p-3 bg-slate-100 rounded-full text-slate-400">
                  <Package className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">No pickups found</h3>
                  <p className="text-sm text-slate-500 mt-1">Your pickup requests will appear here</p>
                </div>
            </motion.div>
        ) : (
            <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                    {pickups.map((pickup, idx) => (
                        <motion.div 
                            key={pickup._id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            whileHover={{ y: -2 }}
                            className="bg-white p-4 rounded-xl border border-slate-200 hover:border-emerald-200 hover:shadow-md transition-all duration-200 cursor-pointer group"
                            onClick={() => setSelectedPickup(pickup)}
                        >
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-md text-xs font-medium uppercase tracking-wide",
                                            statusStyles[pickup.status] || "bg-slate-100 text-slate-600"
                                        )}>
                                            {pickup.status.replace('_', ' ')}
                                        </span>
                                        <span className="text-xs text-slate-500">
                                            {new Date(pickup.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                    <h3 className="text-base font-semibold text-slate-900 capitalize mb-2 truncate">
                                        {pickup.wasteType} Collection
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                                        <div className="flex items-center gap-1.5">
                                            <Package className="h-4 w-4 text-slate-400" /> 
                                            <span>{pickup.weight} kg</span>
                                        </div>
                                        {pickup.location?.formattedAddress && (
                                            <div className="flex items-center gap-1.5 max-w-[250px] sm:max-w-none">
                                                <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                                                <span className="truncate" title={pickup.location.formattedAddress}>{pickup.location.formattedAddress}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3 shrink-0">
                                    {pickup.images && pickup.images.length > 0 && (
                                        <div className="h-14 w-14 rounded-xl overflow-hidden border border-slate-200 group-hover:border-emerald-300 transition-colors shadow-sm bg-slate-100">
                                            <img 
                                                src={pickup.images[0]} 
                                                alt={`${pickup.wasteType} waste`}
                                                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.parentElement.innerHTML = '<div class="h-full w-full flex items-center justify-center bg-slate-200"><svg class="h-6 w-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                                                }}
                                            />
                                        </div>
                                    )}
                                    
                                    <div className="flex items-center gap-2">
                                        {user?.role === 'collector' && (pickup.status === 'CREATED' || pickup.status === 'MATCHING') && (
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAccept(pickup._id);
                                                }}
                                                disabled={processingId === pickup._id}
                                                className="bg-slate-900 text-white px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-slate-800 hover:shadow-md hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-1.5"
                                            >
                                                {processingId === pickup._id ? (
                                                    <><Loader2 className="animate-spin h-3.5 w-3.5" /> Accepting...</>
                                                ) : (
                                                    'Accept'
                                                )}
                                            </button>
                                        )}
                                        <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all duration-200" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        )}

        <AnimatePresence>
            {selectedPickup && (
                <PickupDetailModal 
                    pickup={selectedPickup} 
                    onClose={() => setSelectedPickup(null)} 
                    onAccept={handleAccept}
                    processingId={processingId}
                    onStatusUpdate={onPickupUpdated}
                    onOpenChat={onOpenChat}
                />
            )}
        </AnimatePresence>
    </div>
  );
};

export default PickupList;
