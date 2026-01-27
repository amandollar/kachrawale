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
    CREATED: "bg-blue-50 text-blue-600 border-blue-100",
    MATCHING: "bg-amber-50 text-amber-600 border-amber-100",
    ASSIGNED: "bg-slate-100 text-slate-600 border-slate-200",
    ACCEPTED: "bg-emerald-50 text-emerald-600 border-emerald-100",
    ON_THE_WAY: "bg-indigo-50 text-indigo-600 border-indigo-100 animate-pulse",
    COMPLETED: "bg-emerald-100 text-emerald-800 border-emerald-200",
    SETTLED: "bg-slate-800 text-white border-slate-900",
    CANCELLED: "bg-rose-50 text-rose-600 border-rose-100",
  };

  return (
    <div className="space-y-4">
        {loading ? (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 flex flex-col sm:flex-row justify-between gap-6">
                        <div className="space-y-3 flex-1">
                            <Skeleton className="h-4 w-24 rounded-full" />
                            <Skeleton className="h-7 w-48 rounded-lg" />
                            <Skeleton className="h-4 w-32 rounded-md" />
                        </div>
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-16 w-16 rounded-xl" />
                            <Skeleton className="h-10 w-24 rounded-xl" />
                        </div>
                    </div>
                ))}
            </div>
        ) : !pickups || pickups.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-center space-y-4"
            >
                <div className="p-4 bg-slate-50 rounded-full text-slate-300">
                  <Package className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">No dispatch requests</h3>
                  <p className="text-slate-400 text-xs font-medium max-w-xs mx-auto mt-1">Operational logs will appear here when pickups are scheduled.</p>
                </div>
            </motion.div>
        ) : (
            <div className="grid grid-cols-1 gap-4">
                <AnimatePresence mode="popLayout">
                    {pickups.map((pickup, idx) => (
                        <motion.div 
                            key={pickup._id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-white p-5 rounded-xl border border-slate-100 hover:border-slate-300 transition-all cursor-pointer relative"
                            onClick={() => setSelectedPickup(pickup)}
                        >
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={cn(
                                            "px-2 py-0.5 rounded text-[9px] font-bold tracking-wider border uppercase",
                                            statusStyles[pickup.status] || "bg-slate-50 text-slate-500 border-slate-100"
                                        )}>
                                            {pickup.status}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5 ml-2">
                                            {new Date(pickup.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 capitalize tracking-tight mb-3">
                                        {pickup.wasteType} Collection
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-4">
                                        <div className="flex items-center gap-1.5 text-slate-600 font-bold text-xs">
                                            <Package className="h-3.5 w-3.5 text-slate-400" /> 
                                            <span>{pickup.weight} KG</span>
                                        </div>
                                        {pickup.location?.formattedAddress && (
                                            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium max-w-[300px]">
                                                <MapPin className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                                                <span className="truncate">{pickup.location.formattedAddress}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-4 shrink-0">
                                    {pickup.images && pickup.images.length > 0 && (
                                        <div className="h-12 w-12 rounded-lg overflow-hidden border border-slate-200">
                                            <img 
                                                src={pickup.images[0]} 
                                                alt="" 
                                                className="h-full w-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all"
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
                                                className="bg-slate-900 text-white px-5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-slate-800 transition-all disabled:opacity-50"
                                            >
                                                {processingId === pickup._id ? <Loader2 className="animate-spin h-3.5 w-3.5" /> : 'Accept'}
                                            </button>
                                        )}
                                        <div className="p-1.5 rounded-lg bg-slate-50 text-slate-300">
                                            <ChevronRight className="h-4 w-4" />
                                        </div>
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
