import React, { useState } from 'react';
import api from '../utils/api';
import { Upload, MapPin, Loader2, FileVideo } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PickupForm = ({ onPickupCreated }) => {
  const [wasteType, setWasteType] = useState('plastic');
  const [weight, setWeight] = useState('');
  const [images, setImages] = useState(null);
  const [video, setVideo] = useState(null);
  const [coordinates, setCoordinates] = useState(null);
  const [address, setAddress] = useState('');
  const [loadingLoc, setLoadingLoc] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleImageChange = (e) => {
    setImages(e.target.files);
  };

  const handleVideoChange = (e) => {
    setVideo(e.target.files[0]);
  };

  const getCurrentLocation = () => {
    setLoadingLoc(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates([longitude, latitude]);
        
        let addressText = '';
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await res.json();
            if (data && data.display_name) {
                addressText = data.display_name;
            }
        } catch (error) {
            console.error("Geocoding failed", error);
        }
        
        // If geocoding fails or returns empty, keep existing or set default
        setAddress(prev => addressText || prev || `Lat: ${latitude}, Long: ${longitude}`);
        setLoadingLoc(false);
      }, (err) => {
        setError('Failed to get location: ' + err.message);
        setLoadingLoc(false);
      });
    } else {
      setError('Geolocation not supported');
      setLoadingLoc(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    if (!coordinates) {
        setError('Please click "Get My Location" to pin your exact location.');
        setIsSubmitting(false);
        return;
    }

    if (!address.trim()) {
        setError('Please provide an address.');
        setIsSubmitting(false);
        return;
    }

    const locationJson = JSON.stringify({
        type: 'Point',
        coordinates: coordinates,
        formattedAddress: address
    });

    const formData = new FormData();
    formData.append('wasteType', wasteType);
    formData.append('weight', weight);
    formData.append('location', locationJson);
    
    if (images) {
        for (let i = 0; i < images.length; i++) {
            formData.append('images', images[i]);
        }
    }
    
    if (video) {
        formData.append('video', video);
    }

    try {
        const response = await api.post('/pickups', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        if (response.data.success) {
            setSuccess('Pickup scheduled successfully!');
            // Reset form
            setWeight('');
            setImages(null);
            setVideo(null);
            // Notify parent to refresh list
            if (onPickupCreated) onPickupCreated();
        } else {
             setError(response.data.message || 'Failed to schedule');
        }
    } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Error scheduling pickup');
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Schedule a Pickup</h2>
      
      {error && <div className="mb-4 text-red-600 bg-red-50 p-2 rounded text-sm">{error}</div>}
      {success && <div className="mb-4 text-green-600 bg-green-50 p-2 rounded text-sm">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Waste Type</label>
          <select
            value={wasteType}
            onChange={(e) => setWasteType(e.target.value)}
            className="w-full border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 shadow-sm p-2 border"
          >
            <option value="plastic">Plastic</option>
            <option value="metal">Metal</option>
            <option value="e-waste">E-Waste</option>
            <option value="organic">Organic</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Weight (kg)</label>
          <input
            type="number"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            required
            className="w-full border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 shadow-sm p-2 border"
            placeholder="e.g. 2.5"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
             Images (Required)
          </label>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-gray-500" />
                    <p className="text-sm text-gray-500"><span className="font-semibold">Click to upload</span> images</p>
                </div>
                <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" required />
            </label>
          </div>
          {images && <p className="text-sm text-green-600 mt-1">{images.length} files selected</p>}
        </div>

        {(wasteType === 'plastic' || wasteType === 'metal' || wasteType === 'e-waste') && (
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Video (Required for {wasteType})
            </label>
            <div className="flex items-center gap-2">
                <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    <FileVideo className="w-5 h-5 mr-2 text-gray-400" />
                    Upload Video
                    <input type="file" accept="video/*" onChange={handleVideoChange} className="hidden" />
                </label>
                {video && <span className="text-sm text-gray-500">{video.name}</span>}
            </div>
            </div>
        )}

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
           <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1">
               <MapPin className="h-4 w-4 text-green-600" /> Location Details
           </label>
           
           <div className="flex gap-2 mb-3">
               <button
                 type="button"
                 onClick={getCurrentLocation}
                 disabled={loadingLoc}
                 className={`flex-shrink-0 flex items-center justify-center px-4 py-2 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors ${coordinates ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100' : 'border-transparent bg-green-600 text-white hover:bg-green-700'}`}
               >
                 {loadingLoc ? <Loader2 className="animate-spin h-4 w-4" /> : (coordinates ? 'Update GPS Pin' : 'Pin My Location')}
               </button>
               {coordinates && (
                   <div className="flex items-center text-xs text-green-700 bg-green-100 px-3 py-1 rounded-full border border-green-200">
                       <MapPin className="h-3 w-3 mr-1" /> GPS Locked
                   </div>
               )}
           </div>
           
           <div className="relative">
             <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                disabled={!coordinates}
                className={`w-full border-gray-300 rounded-md shadow-sm p-3 text-sm resize-none focus:ring-green-500 focus:border-green-500 ${!coordinates ? 'bg-gray-100 text-transparent select-none' : 'bg-white text-gray-900'}`}
                placeholder={coordinates ? "Ensure address is correct. Add house/flat number, landmarks..." : ""}
                required
             />
             {!coordinates && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center rounded-md pointer-events-none text-gray-500">
                     <MapPin className="h-5 w-5 mb-1 text-gray-400 opacity-50" />
                     <span className="text-sm font-medium">Pin Location to Enable Address</span>
                 </div>
             )}
           </div>
           <p className="text-xs text-gray-500 mt-2">
               *We use GPS for precise collector navigation and the address for identification.
           </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : 'Schedule Pickup'}
        </button>
      </form>
    </div>
  );
};

export default PickupForm;
