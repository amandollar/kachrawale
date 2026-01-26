import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import { X, MapPin, Phone, User, Weight, Truck, Check, Play, Clock, Navigation, CheckCircle, IndianRupee, Banknote, QrCode, ArrowLeft, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';

const PickupDetailModal = ({ pickup, onClose, onAccept, processingId, onStatusUpdate }) => {
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
          finalAmount: parseFloat(calculateTotal()),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      
      <motion.div 
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="relative bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-2xl max-h-[90vh] flex flex-col"
      >
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white z-10">
            <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                    <span className={cn(
                        "px-2.5 py-0.5 rounded-full text-[10px] uppercase font-black tracking-wider border",
                        pickup.status === 'COMPLETED' ? "bg-green-50 text-green-700 border-green-100" : "bg-blue-50 text-blue-700 border-blue-100"
                    )}>
                        {pickup.status}
                    </span>
                    <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {new Date(pickup.createdAt).toLocaleDateString()}
                    </span>
                </div>
                <h3 className="text-2xl font-black text-gray-900 capitalize">
                    {pickup.wasteType} Pickup
                </h3>
            </div>
            <button 
                onClick={onClose} 
                className="p-2.5 rounded-2xl bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all active:scale-95"
            >
                <X className="h-6 w-6" />
            </button>
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
                        className="p-8 space-y-8"
                    >
                        <div className="bg-green-600 rounded-2xl p-6 text-white shadow-xl shadow-green-100 flex justify-between items-center">
                            <div>
                                <p className="text-green-100 text-sm font-bold uppercase tracking-widest mb-1 items-center flex gap-1">
                                    <IndianRupee className="h-4 w-4"/> Rate Card
                                </p>
                                <h4 className="text-2xl font-black capitalize">{pickup.wasteType}</h4>
                            </div>
                            <div className="text-right">
                                <span className="text-3xl font-black">₹{rate?.price || '0'}</span>
                                <span className="text-green-100 font-bold">/{rate?.unit || 'kg'}</span>
                            </div>
                        </div>

                        <form onSubmit={handlePaymentSubmit} className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-sm font-black text-gray-400 uppercase tracking-widest ml-1">Final Verified Weight (kg)</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        value={verifiedWeight}
                                        onChange={(e) => setVerifiedWeight(e.target.value)}
                                        min="0.1"
                                        step="0.1"
                                        required
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-green-500 focus:bg-white rounded-2xl px-6 py-4 text-2xl font-black transition-all outline-none"
                                        placeholder="0.00"
                                    />
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 font-bold uppercase tracking-widest pointer-events-none">
                                        kg
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-2xl p-6 border-2 border-dashed border-gray-200 flex justify-between items-center">
                                <span className="text-gray-500 font-bold uppercase tracking-widest text-sm">Total Payable</span>
                                <span className="text-4xl font-black text-gray-900 tracking-tight">₹{calculateTotal()}</span>
                            </div>

                            <div className="space-y-4">
                                <label className="text-sm font-black text-gray-400 uppercase tracking-widest ml-1 text-center block">Payment Method</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={handleUPIPay}
                                        className={cn(
                                            "flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all active:scale-95 group",
                                            paymentMode === 'UPI' 
                                                ? "border-green-600 bg-green-50 text-green-700 shadow-lg shadow-green-100" 
                                                : "border-gray-100 hover:border-green-200 text-gray-400 hover:text-green-600"
                                        )}
                                    >
                                        <div className={cn(
                                            "p-3 rounded-2xl transition-colors",
                                            paymentMode === 'UPI' ? "bg-green-600 text-white" : "bg-gray-100"
                                        )}>
                                            <QrCode className="h-8 w-8 text-inherit" />
                                        </div>
                                        <span className="font-black text-sm uppercase tracking-wider">UPI Pay</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMode('CASH')}
                                        className={cn(
                                            "flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all active:scale-95 group",
                                            paymentMode === 'CASH' 
                                                ? "border-green-600 bg-green-50 text-green-700 shadow-lg shadow-green-100" 
                                                : "border-gray-100 hover:border-green-200 text-gray-400 hover:text-green-600"
                                        )}
                                    >
                                        <div className={cn(
                                            "p-3 rounded-2xl transition-colors",
                                            paymentMode === 'CASH' ? "bg-green-600 text-white" : "bg-gray-100"
                                        )}>
                                            <Banknote className="h-8 w-8 text-inherit" />
                                        </div>
                                        <span className="font-black text-sm uppercase tracking-wider">Cash Paid</span>
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowPaymentForm(false)}
                                    className="flex-1 flex items-center justify-center gap-2 py-5 px-6 rounded-3xl font-black text-sm text-gray-500 bg-gray-50 hover:bg-gray-100 transition-all active:scale-95"
                                >
                                    <ArrowLeft className="h-5 w-5" /> BACK
                                </button>
                                <button
                                    type="submit"
                                    disabled={localProcessing}
                                    className="flex-[2] flex items-center justify-center gap-2 py-5 px-6 rounded-3xl font-black text-sm text-white bg-green-600 hover:bg-green-700 shadow-xl shadow-green-200 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {localProcessing ? 'PROCESSING...' : <><CheckCircle className="h-5 w-5" /> CONFIRM & COMPLETE</>}
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
                        {/* Media Section */}
                        <div className="bg-gray-900 aspect-video relative group flex items-center justify-center overflow-hidden">
                            <AnimatePresence mode="wait">
                                {activeMedia.type === 'image' && images.length > 0 ? (
                                    <motion.img 
                                        key={`img-${activeMedia.index}`}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        src={images[activeMedia.index]} 
                                        alt="Pickup Waste" 
                                        className="w-full h-full object-contain"
                                    />
                                ) : activeMedia.type === 'video' && hasVideo ? (
                                    <motion.video 
                                        key="video"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        src={pickup.video} 
                                        className="w-full h-full object-contain" 
                                        controls 
                                        autoPlay
                                    />
                                ) : (
                                    <div className="text-white font-black text-center text-sm uppercase tracking-widest opacity-20">No Media Available</div>
                                )}
                            </AnimatePresence>
                            
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 p-3 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl">
                                {images.map((img, idx) => (
                                    <button 
                                        key={idx} 
                                        onClick={() => setActiveMedia({ type: 'image', index: idx })} 
                                        className={cn(
                                            "w-12 h-12 rounded-xl overflow-hidden border-2 transition-all active:scale-90",
                                            activeMedia.type === 'image' && activeMedia.index === idx ? "border-green-500 scale-110 shadow-lg" : "border-transparent opacity-50 hover:opacity-100"
                                        )}
                                    >
                                        <img src={img} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                                {hasVideo && (
                                    <button 
                                        onClick={() => setActiveMedia({ type: 'video' })} 
                                        className={cn(
                                            "w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center border-2 transition-all active:scale-90 bg-gray-800",
                                            activeMedia.type === 'video' ? "border-green-500 scale-110 shadow-lg" : "border-transparent opacity-50 hover:opacity-100"
                                        )}
                                    >
                                        <Play className="h-5 w-5 text-white" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="flex justify-between items-end border-b pb-3">
                                     <h4 className="font-black text-gray-400 text-xs uppercase tracking-widest">Location & Rate</h4>
                                     {rate && <span className="text-xs font-black text-green-600 bg-green-50 border border-green-100 px-2.5 py-1 rounded-full">₹{rate.price}/{rate.unit}</span>}
                                </div>
                                
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                                        <MapPin className="h-5 w-5" />
                                    </div>
                                    <div className="space-y-1 flex-1">
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Address</p>
                                        <p className="text-sm font-bold text-gray-800 leading-relaxed">{pickup.location?.formattedAddress || 'No address provided'}</p>
                                        {pickup.location?.coordinates && (
                                            <a 
                                                href={`https://www.google.com/maps/search/?api=1&query=${pickup.location.coordinates[1]},${pickup.location.coordinates[0]}`} 
                                                target="_blank" 
                                                rel="noreferrer" 
                                                className="inline-flex items-center gap-1 text-[10px] font-black text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-widest"
                                            >
                                                <Navigation className="h-3 w-3" /> OPEN IN GOOGLE MAPS
                                            </a>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                                        <Weight className="h-5 w-5" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Estimated Weight</p>
                                        <p className="text-lg font-black text-gray-900 leading-none">{pickup.weight} <span className="text-xs">KG</span></p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h4 className="font-black text-gray-400 text-xs uppercase tracking-widest border-b pb-3">Citizen Contact</h4>
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Name</p>
                                        <p className="text-lg font-black text-gray-900 leading-none">{pickup.citizen?.name || 'Unknown'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
                                        <Phone className="h-5 w-5" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Phone</p>
                                        {isAssignedToMe || pickup.status === 'COMPLETED' ? (
                                            <p className="text-lg font-black text-gray-900 leading-none font-mono">{pickup.citizen?.phone || 'Not available'}</p>
                                        ) : (
                                            <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest bg-orange-50 px-3 py-1.5 rounded-full inline-block">Hidden until accepted</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-8 pt-0 flex flex-col sm:flex-row gap-4">
                            {canAccept && (
                                <button 
                                    type="button" 
                                    onClick={() => onAccept(pickup._id)} 
                                    disabled={processingId === pickup._id} 
                                    className="flex-1 flex items-center justify-center gap-2 py-5 px-6 rounded-3xl font-black text-sm text-white bg-green-600 hover:bg-green-700 shadow-xl shadow-green-200 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {processingId === pickup._id ? <Loader2 className="animate-spin h-5 w-5" /> : <><Check className="h-5 w-5" /> ACCEPT PICKUP</>}
                                </button>
                            )}
                            
                            {canStartTrip && (
                                <button 
                                    type="button" 
                                    onClick={() => handleStatusChange('ON_THE_WAY')} 
                                    disabled={localProcessing} 
                                    className="flex-1 flex items-center justify-center gap-2 py-5 px-6 rounded-3xl font-black text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {localProcessing ? <Loader2 className="animate-spin h-5 w-5" /> : <><Navigation className="h-5 w-5" /> START TRIP</>}
                                </button>
                            )}
                            
                            {canComplete && (
                                <button 
                                    type="button" 
                                    onClick={() => setShowPaymentForm(true)} 
                                    disabled={localProcessing} 
                                    className="flex-1 flex items-center justify-center gap-2 py-5 px-6 rounded-3xl font-black text-sm text-white bg-green-600 hover:bg-green-700 shadow-xl shadow-green-200 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {localProcessing ? <Loader2 className="animate-spin h-5 w-5" /> : <><CheckCircle className="h-5 w-5" /> COMPLETE PICKUP</>}
                                </button>
                            )}

                            <button 
                                type="button" 
                                onClick={onClose} 
                                className="sm:flex-none px-10 flex items-center justify-center py-5 rounded-3xl font-black text-sm text-gray-500 bg-gray-50 hover:bg-gray-100 transition-all active:scale-95 border border-transparent hover:border-gray-200"
                            >
                                CLOSE
                            </button>
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
