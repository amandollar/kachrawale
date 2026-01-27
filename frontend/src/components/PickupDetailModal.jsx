import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import { X, MapPin, Phone, User, Weight, Truck, Check, Play, Clock, Navigation, CheckCircle, IndianRupee, Banknote, QrCode, ArrowLeft, ArrowRight, MessageSquare, Loader2, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';
import ChatWindow from './ChatWindow';

const PickupDetailModal = ({ pickup, onClose, onAccept, processingId, onStatusUpdate, onOpenChat }) => {
  const { user } = useAuth();
  const [activeMedia, setActiveMedia] = useState({ type: 'image', index: 0 });
  const [localProcessing, setLocalProcessing] = useState(false);
  
  // Payment State
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [verifiedWeight, setVerifiedWeight] = useState(pickup?.weight || '');
  const [rate, setRate] = useState(null);
  const [paymentMode, setPaymentMode] = useState('CASH'); // CASH or UPI

  // Combine images and video for media gallery logic
  const hasVideo = !!pickup?.video;
  const images = pickup?.images || [];

  const isAssignedToMe = pickup?.collector?._id === user?._id || pickup?.collector === user?._id;
  const isMyPickup = pickup?.citizen?._id === user?._id || pickup?.citizen === user?._id;
  const hasCollector = !!pickup?.collector;
  const canChat = (isAssignedToMe || isMyPickup) && hasCollector;

  const canAccept = user?.role === 'collector' && (pickup?.status === 'CREATED' || pickup?.status === 'MATCHING');
  const canStartTrip = user?.role === 'collector' && pickup?.status === 'ACCEPTED' && isAssignedToMe;
  const canComplete = user?.role === 'collector' && pickup?.status === 'ON_THE_WAY' && isAssignedToMe;

  // Fetch Rate on mount
  useEffect(() => {
      if (pickup?.wasteType) {
          fetchRate();
      }
  }, [pickup]);

  const fetchRate = async () => {
    try {
        console.log("Fetching rates for type:", pickup.wasteType);
        const response = await api.get('/rates');
        console.log("Full API Response:", response);
        
        // Destructure from the response body (backend ApiResponse)
        const responseBody = response.data;
        const ratesArray = responseBody.data;
        
        console.log("Rates Array:", ratesArray);

        if (!Array.isArray(ratesArray)) {
            console.error("Rates is not an array:", ratesArray);
            return;
        }

        const matchedRate = ratesArray.find(r => r.name.toLowerCase() === pickup.wasteType.toLowerCase()) || 
                          ratesArray.find(r => r.category.toLowerCase() === 'other'); 
        
        console.log("Matched Rate:", matchedRate);
        setRate(matchedRate);
    } catch (error) {
        console.error("Failed to fetch rates:", error);
    }
  };

  const calculateTotal = () => {
      if (!rate || !verifiedWeight) return 0;
      return (parseFloat(verifiedWeight) * rate.price).toFixed(2);
  };

  if (!pickup) return null;

  const handleStatusChange = async (newStatus, paymentDetails = {}) => {
      try {
          setLocalProcessing(true);
          const payload = { status: newStatus, ...paymentDetails };
          
          const { data } = await api.put(`/pickups/${pickup._id}/status`, payload);
          if (data.success) {
              toast.success(`Pickup updated to ${newStatus}`);
              if (onStatusUpdate) onStatusUpdate(); 
              onClose(); 
          }
      } catch (error) {
          console.error("Failed to update status", error);
          toast.error("Failed to update status");
      } finally {
          setLocalProcessing(false);
      }
  };

  const handlePaymentSubmit = (e) => {
      e.preventDefault();
      handleStatusChange('COMPLETED', {
          verifiedWeight: parseFloat(verifiedWeight),
          // finalAmount is now handled by the backend for security
          paymentMode,
          isPaid: true
      });
  };

  const handleUPIPay = () => {
     const amount = calculateTotal();
     const upiLink = `upi://pay?pa=kachrawale@upi&pn=Kachrawale&am=${amount}&cu=INR`;
     window.location.href = upiLink;
     setPaymentMode('UPI');
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.9, y: 20 }
  };

  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-center items-start overflow-y-auto p-4 py-8 sm:py-20">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
      />
      
      <motion.div 
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="relative bg-white rounded-xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] overflow-hidden w-full max-w-4xl max-h-none sm:max-h-[90vh] flex flex-col my-auto"
      >
          {/* Professional Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white z-10">
            <div className="flex items-center gap-4">
                <div className="p-2.5 bg-slate-50 rounded-lg text-slate-400">
                    <Package className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="text-base font-bold text-slate-900 capitalize tracking-tight">
                        {pickup.wasteType} Dispatch Log
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className={cn(
                            "px-2 py-0.5 rounded text-[9px] font-bold tracking-wider border uppercase",
                            pickup.status === 'COMPLETED' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-blue-50 text-blue-700 border-blue-100"
                        )}>
                            {pickup.status}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                            Ref: #{pickup._id.slice(-6).toUpperCase()}
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-3">
                {canChat && (
                    <button 
                        onClick={() => {
                            if (onOpenChat) onOpenChat(pickup._id);
                            onClose();
                        }}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                    >
                        <MessageSquare className="h-3.5 w-3.5" /> Message Center
                    </button>
                )}
                <button 
                    onClick={onClose} 
                    className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
                {showPaymentForm ? (
                    <motion.div 
                        key="payment-form"
                        variants={pageVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="p-8 max-w-2xl mx-auto space-y-8"
                    >
                        <div className="bg-slate-900 rounded-xl p-8 text-white flex justify-between items-center relative overflow-hidden">
                            <div className="relative z-10">
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[2px] mb-2">Service Rate Agreement</p>
                                <h4 className="text-2xl font-bold capitalize">{pickup.wasteType}</h4>
                            </div>
                            <div className="relative z-10 text-right">
                                <div className="text-3xl font-bold">₹{rate?.price || '0'}</div>
                                <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Per {rate?.unit || 'KG'}</div>
                            </div>
                        </div>

                        <form onSubmit={handlePaymentSubmit} className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Verified Net Weight</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        value={verifiedWeight}
                                        onChange={(e) => setVerifiedWeight(e.target.value)}
                                        min="0.1"
                                        step="0.1"
                                        required
                                        className="w-full bg-slate-50 border border-slate-200 focus:border-slate-900 rounded-xl px-5 py-4 text-xl font-bold transition-all outline-none"
                                        placeholder="0.00"
                                    />
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 font-bold uppercase tracking-widest pointer-events-none text-xs">
                                        kg
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-100 flex justify-between items-center">
                                <div className="space-y-1">
                                    <span className="text-emerald-800/60 font-bold uppercase tracking-widest text-[10px]">Total Commission Payable</span>
                                    <p className="text-xs text-emerald-800 font-medium">Verified weight × Standard rate</p>
                                </div>
                                <span className="text-3xl font-bold text-emerald-950 tracking-tight">₹{calculateTotal()}</span>
                            </div>

                            <div className="space-y-4 text-center">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Disbursement Channel</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={handleUPIPay}
                                        className={cn(
                                            "flex items-center gap-4 p-5 rounded-xl border transition-all active:scale-95 group",
                                            paymentMode === 'UPI' 
                                                ? "border-slate-900 bg-slate-900 text-white" 
                                                : "border-slate-200 hover:border-slate-400 text-slate-500 hover:text-slate-900"
                                        )}
                                    >
                                        <div className={cn(
                                            "p-2.5 rounded-lg transition-colors",
                                            paymentMode === 'UPI' ? "bg-white/20 text-white" : "bg-slate-100"
                                        )}>
                                            <QrCode className="h-5 w-5" />
                                        </div>
                                        <span className="font-bold text-xs uppercase tracking-wider">UPI / Gateway</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMode('CASH')}
                                        className={cn(
                                            "flex items-center gap-4 p-5 rounded-xl border transition-all active:scale-95 group",
                                            paymentMode === 'CASH' 
                                                ? "border-slate-900 bg-slate-900 text-white" 
                                                : "border-slate-200 hover:border-slate-400 text-slate-500 hover:text-slate-900"
                                        )}
                                    >
                                        <div className={cn(
                                            "p-2.5 rounded-lg transition-colors",
                                            paymentMode === 'CASH' ? "bg-white/20 text-white" : "bg-slate-100"
                                        )}>
                                            <Banknote className="h-5 w-5" />
                                        </div>
                                        <span className="font-bold text-xs uppercase tracking-wider">Physical Cash</span>
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowPaymentForm(false)}
                                    className="flex-1 py-4 px-6 rounded-lg font-bold text-[10px] text-slate-500 bg-slate-50 hover:bg-slate-100 uppercase tracking-widest transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={localProcessing}
                                    className="flex-[2] flex items-center justify-center gap-2 py-4 px-6 rounded-lg font-bold text-[10px] text-white bg-slate-900 hover:bg-slate-800 uppercase tracking-widest transition-all disabled:opacity-50"
                                >
                                    {localProcessing ? 'Syncing...' : 'Finalize Dispatch'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="details-view"
                        variants={pageVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                            {/* Media Section */}
                            <div className="bg-slate-50 p-6 border-r border-slate-100 space-y-4">
                                <div className="aspect-square relative rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden flex items-center justify-center">
                                    <AnimatePresence mode="wait">
                                        {activeMedia.type === 'image' && images.length > 0 ? (
                                            <motion.img 
                                                key={`img-${activeMedia.index}`}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                src={images[activeMedia.index]} 
                                                className="w-full h-full object-cover"
                                            />
                                        ) : activeMedia.type === 'video' && hasVideo ? (
                                            <motion.video 
                                                key="video"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                src={pickup.video} 
                                                className="w-full h-full object-cover" 
                                                controls 
                                            />
                                        ) : (
                                            <div className="text-slate-300 font-bold text-[10px] uppercase tracking-[3px]">Missing Media</div>
                                        )}
                                    </AnimatePresence>
                                </div>
                                
                                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                    {images.map((img, idx) => (
                                        <button 
                                            key={idx} 
                                            onClick={() => setActiveMedia({ type: 'image', index: idx })} 
                                            className={cn(
                                                "w-14 h-14 rounded-md overflow-hidden border-2 transition-all",
                                                activeMedia.type === 'image' && activeMedia.index === idx ? "border-slate-900 shadow-md" : "border-white opacity-40 hover:opacity-100"
                                            )}
                                        >
                                            <img src={img} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                    {hasVideo && (
                                        <button 
                                            onClick={() => setActiveMedia({ type: 'video' })} 
                                            className={cn(
                                                "w-14 h-14 rounded-md overflow-hidden flex items-center justify-center border-2 transition-all bg-slate-900",
                                                activeMedia.type === 'video' ? "border-slate-900 shadow-md" : "border-white opacity-40 hover:opacity-100"
                                            )}
                                        >
                                            <Play className="h-4 w-4 text-white" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Details Information */}
                            <div className="p-8 space-y-8">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Operational Parameters</h4>
                                        <div className="text-[10px] font-bold text-slate-900 flex items-center gap-1.5">
                                            <Clock className="h-3.5 w-3.5 text-slate-300" />
                                            {new Date(pickup.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                                <Weight className="h-3 w-3" /> Declaration
                                            </div>
                                            <p className="text-base font-bold text-slate-950">{pickup.weight} KG</p>
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                                <Truck className="h-3 w-3" /> Material
                                            </div>
                                            <p className="text-base font-bold text-slate-950 capitalize">{pickup.wasteType}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                            <MapPin className="h-3 w-3" /> Collection Coordinate
                                        </div>
                                        <p className="text-xs font-medium text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
                                            {pickup.location?.formattedAddress}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-3">Resource Partners</h4>
                                    
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${pickup.citizen?.name || 'citizen'}`} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Citizen</p>
                                                    <p className="text-sm font-bold text-slate-900">{pickup.citizen?.name}</p>
                                                </div>
                                            </div>
                                            {pickup.citizen?.phone && (isAssignedToMe || pickup.status === 'COMPLETED') && (
                                                <a href={`tel:${pickup.citizen.phone}`} className="h-8 w-8 rounded-lg bg-slate-50 text-slate-400 hover:text-slate-900 border border-slate-100 flex items-center justify-center transition-colors">
                                                    <Phone className="h-3.5 w-3.5" />
                                                </a>
                                            )}
                                        </div>

                                        {pickup.collector && (
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${pickup.collector?.name || 'collector'}`} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Dispatch Personnel</p>
                                                        <p className="text-sm font-bold text-slate-900">{pickup.collector?.name}</p>
                                                    </div>
                                                </div>
                                                {pickup.collector?.phone && (
                                                    <a href={`tel:${pickup.collector.phone}`} className="h-8 w-8 rounded-lg bg-slate-50 text-slate-400 hover:text-slate-900 border border-slate-100 flex items-center justify-center transition-colors">
                                                        <Phone className="h-3.5 w-3.5" />
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Professional Footer Actions */}
                        <div className="px-8 py-6 border-t border-slate-100 bg-white sticky bottom-0">
                            <div className="flex gap-4">
                                {canAccept && (
                                    <button 
                                        onClick={() => onAccept(pickup._id)} 
                                        disabled={processingId === pickup._id} 
                                        className="flex-1 py-4 px-6 rounded-lg font-bold text-[11px] text-white bg-slate-900 hover:bg-slate-800 uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {processingId === pickup._id ? <Loader2 className="animate-spin h-4 w-4" /> : 'Confirm Assignment'}
                                    </button>
                                )}
                                
                                {canStartTrip && (
                                    <button 
                                        onClick={() => handleStatusChange('ON_THE_WAY')} 
                                        disabled={localProcessing} 
                                        className="flex-1 py-4 px-6 rounded-lg font-bold text-[11px] text-white bg-slate-900 hover:bg-slate-800 uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {localProcessing ? <Loader2 className="animate-spin h-4 w-4" /> : 'Initiate Logistics'}
                                    </button>
                                )}
                                
                                {canComplete && (
                                    <button 
                                        onClick={() => setShowPaymentForm(true)} 
                                        className="flex-1 py-4 px-6 rounded-lg font-bold text-[11px] text-white bg-emerald-600 hover:bg-emerald-700 uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                    >
                                        Proceed to Settle
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
          </div>
      </motion.div>
    </div>
  );
};

export default PickupDetailModal;
