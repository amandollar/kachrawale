import React, { useState } from 'react';
import { Package, Clock, CheckCircle, MapPin, Loader2, Eye, Plus, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import PickupDetailModal from './PickupDetailModal';
import { Skeleton } from './Skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';

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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center space-y-4 shadow-sm"
            >
                <div className="p-5 bg-slate-50 rounded-full">
                  <Package className="h-10 w-10 text-slate-300" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 tracking-tight">Everything's Clean!</h3>
                  <p className="text-slate-500 text-sm font-medium max-w-xs mx-auto mt-1">No active pickups found. Start recycling to see your tasks here.</p>
                </div>
            </motion.div>
        ) : (
            <div className="grid grid-cols-1 gap-4">
                <AnimatePresence mode="popLayout">
                    {pickups.map((pickup, idx) => (
                        <motion.div 
                            key={pickup._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-white p-5 md:p-6 rounded-2xl border border-slate-100 hover:border-emerald-100 hover:shadow-premium transition-all duration-300 group cursor-pointer relative overflow-hidden"
                            onClick={() => setSelectedPickup(pickup)}
                        >
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className={cn(
                                            "px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider border transition-colors",
                                            statusStyles[pickup.status] || "bg-slate-50 text-slate-500 border-slate-100"
                                        )}>
                                            {pickup.status}
                                        </span>
                                        <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5 uppercase tracking-wide">
                                            <Clock className="h-3 w-3" /> {new Date(pickup.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 capitalize tracking-tight group-hover:text-emerald-600 transition-colors mb-2">
                                        {pickup.wasteType}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                                        <div className="flex items-center gap-2 text-slate-500 font-semibold text-sm">
                                            <Package className="h-4 w-4 text-emerald-500/60" /> 
                                            <span className="text-slate-700">{pickup.weight}kg</span>
                                        </div>
                                        {pickup.location?.formattedAddress && (
                                            <div className="flex items-center gap-2 text-slate-400 text-sm font-medium truncate max-w-[240px]">
                                                <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-slate-300" />
                                                <span className="truncate">{pickup.location.formattedAddress}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-5 w-full sm:w-auto self-end sm:self-center border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-50">
                                    {pickup.images && pickup.images.length > 0 && (
                                        <div className="relative h-14 w-14 rounded-xl overflow-hidden border-2 border-slate-50 shadow-sm group-hover:shadow-md transition-shadow">
                                            <img 
                                                src={pickup.images[0]} 
                                                alt="Waste" 
                                                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                            {pickup.video && (
                                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    
                                    <div className="flex items-center gap-3 ml-auto">
                                        {user?.role === 'collector' && (pickup.status === 'CREATED' || pickup.status === 'MATCHING') && (
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAccept(pickup._id);
                                                }}
                                                disabled={processingId === pickup._id}
                                                className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-emerald-700 transition-all shadow-sm hover:shadow-emerald-200 disabled:opacity-50 active:scale-95 flex items-center gap-2"
                                            >
                                                {processingId === pickup._id ? <Loader2 className="animate-spin h-4 w-4" /> : 'Accept Request'}
                                            </button>
                                        )}
                                        <div className="p-2 rounded-xl bg-slate-50 text-slate-300 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                                            <ChevronRight className="h-5 w-5" />
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
                />
            )}
        </AnimatePresence>
    </div>
  );
};

export default PickupList;
