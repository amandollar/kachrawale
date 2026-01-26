import React, { useState } from 'react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import { X, MapPin, Phone, User, Weight, Truck, Check, Play, Clock, Navigation, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PickupDetailModal = ({ pickup, onClose, onAccept, processingId, onStatusUpdate }) => {
  const { user } = useAuth();
  const [activeMedia, setActiveMedia] = useState({ type: 'image', index: 0 });
  const [localProcessing, setLocalProcessing] = useState(false);

  if (!pickup) return null;

  const handleStatusChange = async (newStatus) => {
      try {
          setLocalProcessing(true);
          const { data } = await api.put(`/pickups/${pickup._id}/status`, { status: newStatus });
          if (data.success) {
              toast.success(`Pickup status updated to ${newStatus}`);
              if (onStatusUpdate) onStatusUpdate(); // Refresh parent list
              onClose(); 
          }
      } catch (error) {
          console.error("Failed to update status", error);
          toast.error("Failed to update status");
      } finally {
          setLocalProcessing(false);
      }
  };

  const isAssignedToMe = pickup.collector?._id === user?._id || pickup.collector === user?._id;
  const canAccept = user?.role === 'collector' && (pickup.status === 'CREATED' || pickup.status === 'MATCHING');
  const canStartTrip = user?.role === 'collector' && pickup.status === 'ACCEPTED' && isAssignedToMe;
  const canComplete = user?.role === 'collector' && pickup.status === 'ON_THE_WAY' && isAssignedToMe;
  
  // Combine images and video for media gallery logic
  const hasVideo = !!pickup.video;
  const images = pickup.images || [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} aria-hidden="true"></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl w-full">
          
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-gray-100 flex justify-between items-start">
            <div>
                 <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-800`}>
                        {pickup.status}
                    </span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {new Date(pickup.createdAt).toLocaleDateString()}
                    </span>
                 </div>
                <h3 className="text-2xl font-bold text-gray-900 capitalize" id="modal-title">
                    {pickup.wasteType} Pickup
                </h3>
            </div>
            <button 
                onClick={onClose}
                className="bg-gray-100 p-2 rounded-full text-gray-500 hover:bg-gray-200 transition"
            >
                <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-0 overflow-y-auto max-h-[70vh]">
            
            {/* Media Section */}
            <div className="bg-gray-900 aspect-video relative group flex items-center justify-center overflow-hidden">
                {activeMedia.type === 'image' && images.length > 0 ? (
                    <img 
                        src={images[activeMedia.index]} 
                        alt="Pickup Waste" 
                        className="w-full h-full object-contain"
                    />
                ) : activeMedia.type === 'video' && hasVideo ? (
                    <video 
                        src={pickup.video} 
                        className="w-full h-full object-contain"
                        controls
                        autoPlay
                    />
                ) : (
                    <div className="text-white text-center">No Media Available</div>
                )}

                {/* Thumbnails Overlay */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 p-2 bg-black/50 rounded-lg backdrop-blur-sm">
                    {images.map((img, idx) => (
                        <button 
                            key={idx}
                            onClick={() => setActiveMedia({ type: 'image', index: idx })}
                            className={`w-12 h-12 rounded border-2 overflow-hidden ${activeMedia.type === 'image' && activeMedia.index === idx ? 'border-green-500' : 'border-transparent opacity-70 hover:opacity-100'}`}
                        >
                            <img src={img} className="w-full h-full object-cover" />
                        </button>
                    ))}
                    {hasVideo && (
                         <button 
                            onClick={() => setActiveMedia({ type: 'video' })}
                            className={`w-12 h-12 rounded border-2 overflow-hidden flex items-center justify-center bg-gray-800 ${activeMedia.type === 'video' ? 'border-green-500' : 'border-transparent opacity-70 hover:opacity-100'}`}
                         >
                             <Play className="h-5 w-5 text-white" />
                         </button>
                    )}
                </div>
            </div>

            {/* Details Grid */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 border-b pb-2">Location & Details</h4>
                    
                    <div className="flex items-start gap-3 text-gray-600">
                        <MapPin className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                        <div>
                            <p className="font-medium text-gray-900">Address</p>
                            <p className="text-sm">{pickup.location?.formattedAddress || 'No address provided'}</p>
                            {/* Google Maps Link */}
                            {pickup.location?.coordinates && (
                                <a 
                                    href={`https://www.google.com/maps/search/?api=1&query=${pickup.location.coordinates[1]},${pickup.location.coordinates[0 ]}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-1"
                                >
                                    <Navigation className="h-3 w-3" /> Open in Maps
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-gray-600">
                        <Weight className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <div>
                            <p className="font-medium text-gray-900">Estimated Weight</p>
                            <p className="text-sm">{pickup.weight} kg</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 border-b pb-2">Citizen Contact</h4>
                    
                    <div className="flex items-center gap-3 text-gray-600">
                        <User className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <div>
                            <p className="font-medium text-gray-900">Name</p>
                            <p className="text-sm">{pickup.citizen?.name || 'Unknown'}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-gray-600">
                        <Phone className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <div>
                            <p className="font-medium text-gray-900">Phone</p>
                            {isAssignedToMe || pickup.status === 'COMPLETED' ? (
                                <p className="text-sm font-mono">{pickup.citizen?.phone || 'Not available'}</p>
                            ) : (
                                <p className="text-xs text-gray-400 italic bg-gray-100 px-2 py-1 rounded inline-block">
                                    Visible after accepting
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 flex flex-row-reverse gap-3">
             {canAccept && (
                <button
                    type="button"
                    onClick={() => onAccept(pickup._id)}
                    disabled={processingId === pickup._id}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 gap-2 items-center"
                >
                    {processingId === pickup._id ? 'Processing...' : <><Check className="h-4 w-4" /> Accept Pickup</>}
                </button>
             )}
             
             {canStartTrip && (
                <button
                    type="button"
                    onClick={() => handleStatusChange('ON_THE_WAY')}
                    disabled={localProcessing}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 gap-2 items-center"
                >
                     {localProcessing ? 'Processing...' : <><Navigation className="h-4 w-4" /> Start Trip</>}
                </button>
             )}
             
             {canComplete && (
                <button
                    type="button"
                    onClick={() => handleStatusChange('COMPLETED')}
                    disabled={localProcessing}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 gap-2 items-center"
                >
                     {localProcessing ? 'Processing...' : <><CheckCircle className="h-4 w-4" /> Complete Pickup</>}
                </button>
             )}

            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PickupDetailModal;
