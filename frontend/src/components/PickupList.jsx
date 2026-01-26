import React, { useState } from 'react';
import { Package, Clock, CheckCircle, MapPin, Loader2, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import PickupDetailModal from './PickupDetailModal';

const PickupList = ({ pickups, loading, onPickupUpdated }) => {
  const { user } = useAuth();
  const [processingId, setProcessingId] = useState(null);
  const [selectedPickup, setSelectedPickup] = useState(null);

  if (loading) {
      return <div className="text-center py-10">Loading pickups...</div>;
  }

  if (!pickups || pickups.length === 0) {
      return (
          <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-200 border-dashed">
              <Package className="h-10 w-10 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No pickups scheduled yet.</p>
          </div>
      );
  }

  const handleAccept = async (id) => {
    try {
        setProcessingId(id);
        const { data } = await api.put(`/pickups/${id}/status`, { status: 'ACCEPTED' });
        if (data.success) {
            if (onPickupUpdated) onPickupUpdated();
            if (selectedPickup && selectedPickup._id === id) {
                 setSelectedPickup(null); // Close modal on accept
            }
        }
    } catch (error) {
        console.error("Failed to accept pickup", error);
        alert(error.response?.data?.message || "Failed to accept");
    } finally {
        setProcessingId(null);
    }
  };

  const getStatusColor = (status) => {
      switch (status) {
          case 'CREATED': return 'bg-blue-100 text-blue-800';
          case 'MATCHING': return 'bg-yellow-100 text-yellow-800';
          case 'ASSIGNED': return 'bg-purple-100 text-purple-800';
          case 'ACCEPTED': return 'bg-indigo-100 text-indigo-800';
          case 'ON_THE_WAY': return 'bg-orange-100 text-orange-800';
          case 'COMPLETED': return 'bg-green-100 text-green-800';
          case 'CANCELLED': return 'bg-red-100 text-red-800';
          default: return 'bg-gray-100 text-gray-800';
      }
  };

  return (
    <>
        <div className="space-y-4">
        {pickups.map((pickup) => (
            <div key={pickup._id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition-shadow">
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${getStatusColor(pickup.status)}`}>
                        {pickup.status}
                    </span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {new Date(pickup.createdAt).toLocaleDateString()}
                    </span>
                </div>
                <h3 className="font-bold text-gray-800 capitalize text-lg">{pickup.wasteType}</h3>
                <p className="text-sm text-gray-600">Weight: {pickup.weight} kg</p>
                {pickup.location?.formattedAddress && (
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-1 truncate max-w-xs" title={pickup.location.formattedAddress}>
                        <MapPin className="h-3 w-3 flex-shrink-0" /> {pickup.location.formattedAddress}
                    </p>
                )}
            </div>
            
            <div className="flex items-center gap-4">
                {pickup.images && pickup.images.length > 0 && (
                    <div className="flex-shrink-0 relative group cursor-pointer" onClick={() => setSelectedPickup(pickup)}>
                        <img 
                            src={pickup.images[0]} 
                            alt="Pickup" 
                            className="h-16 w-16 object-cover rounded-md border border-gray-200"
                        />
                        {pickup.video && <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-md"><div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" /></div>}
                    </div>
                )}
                
                <button
                    onClick={() => setSelectedPickup(pickup)}
                    className="text-gray-500 hover:text-green-600 p-2 rounded-full hover:bg-green-50 transition"
                    title="View Details"
                >
                    <Eye className="h-5 w-5" />
                </button>

                {user?.role === 'collector' && (pickup.status === 'CREATED' || pickup.status === 'MATCHING') && (
                    <button 
                        onClick={() => handleAccept(pickup._id)}
                        disabled={processingId === pickup._id}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition disabled:opacity-50"
                    >
                        {processingId === pickup._id ? <Loader2 className="animate-spin h-4 w-4" /> : 'Accept'}
                    </button>
                )}
            </div>
            </div>
        ))}
        </div>

        {selectedPickup && (
            <PickupDetailModal 
                pickup={selectedPickup} 
                onClose={() => setSelectedPickup(null)} 
                onAccept={handleAccept}
                processingId={processingId}
                onStatusUpdate={onPickupUpdated}
            />
        )}
    </>
  );
};

export default PickupList;
