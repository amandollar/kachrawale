import React, { useState } from 'react';
import api from '../utils/api';
import { Upload, MapPin, Loader2, FileVideo, CheckCircle2, ChevronDown, Trash2 } from 'lucide-react';
import { cn } from '../utils/cn';
import { motion } from 'framer-motion';

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
        
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await res.json();
            if (data && data.display_name) {
                setAddress(data.display_name);
            } else {
                setAddress(`Lat: ${latitude.toFixed(4)}, Long: ${longitude.toFixed(4)}`);
            }
        } catch (error) {
            console.error("Geocoding failed", error);
            setAddress(`Lat: ${latitude.toFixed(4)}, Long: ${longitude.toFixed(4)}`);
        } finally {
            setLoadingLoc(false);
        }
      }, (err) => {
        setError('Location access denied. Please provide address manually.');
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
    setIsSubmitting(true);

    if (!coordinates) {
        setError('Please pin your location using GPS.');
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
        Array.from(images).forEach(img => formData.append('images', img));
    }
    
    if (video) {
        formData.append('video', video);
    }

    try {
        const { data } = await api.post('/pickups', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (data.success) {
            setWeight('');
            setImages(null);
            setVideo(null);
            if (onPickupCreated) onPickupCreated();
        }
    } catch (err) {
        setError(err.response?.data?.message || 'Error scheduling pickup');
    } finally {
        setIsSubmitting(false);
    }
  };

  const wasteTypes = [
    { id: 'plastic', label: 'Plastic', color: 'emerald' },
    { id: 'metal', label: 'Metal', color: 'slate' },
    { id: 'e-waste', label: 'E-Waste', color: 'indigo' },
    { id: 'organic', label: 'Organic', color: 'amber' },
  ];

  return (
    <div className="bg-white rounded-3xl overflow-hidden">
      <div className="px-8 pt-8 pb-4">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Schedule Pickup</h2>
          <p className="text-slate-500 text-sm font-medium mt-1">Provide details of the waste for collection.</p>
      </div>
      
      {error && (
          <div className="mx-8 mt-4 bg-rose-50 text-rose-600 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 border border-rose-100">
              <Trash2 className="h-4 w-4" /> {error}
          </div>
      )}

      <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-8">
        
        {/* Waste Type Selection */}
        <div className="space-y-4">
             <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">What are you recycling?</label>
             <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                 {wasteTypes.map((type) => (
                     <button
                        key={type.id}
                        type="button"
                        onClick={() => setWasteType(type.id)}
                        className={cn(
                            "px-2 sm:px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold border-2 transition-all flex flex-col items-center gap-2",
                            wasteType === type.id 
                                ? "border-emerald-600 bg-emerald-50 text-emerald-700 shadow-sm" 
                                : "border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200 hover:text-slate-600"
                        )}
                     >
                         <span className="capitalize">{type.label}</span>
                         {wasteType === type.id && <CheckCircle2 className="h-4 w-4" />}
                     </button>
                 ))}
             </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Weight Input */}
            <div className="space-y-4">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Estimated Weight (kg)</label>
                <div className="relative group">
                    <input
                        type="number"
                        step="0.1"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        required
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl px-6 py-4 font-bold text-slate-800 outline-none transition-all placeholder:text-slate-300"
                        placeholder="0.00 kg"
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 font-bold pointer-events-none group-focus-within:text-emerald-500 transition-colors">KG</div>
                </div>
            </div>

            {/* Location Section */}
            <div className="space-y-4">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Collection Point</label>
                <button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={loadingLoc}
                    className={cn(
                        "w-full py-4 rounded-2xl font-bold text-sm tracking-wide transition-all border-2 flex items-center justify-center gap-3 active:scale-[0.98]",
                        coordinates 
                            ? "bg-emerald-50 border-emerald-100 text-emerald-700" 
                            : "bg-white border-slate-100 text-slate-600 hover:bg-slate-50"
                    )}
                >
                    {loadingLoc ? <Loader2 className="animate-spin h-5 w-5" /> : (
                        <>
                            <MapPin className={cn("h-5 w-5", coordinates ? "text-emerald-600" : "text-slate-400")} />
                            {coordinates ? "Location Locked" : "Use Current Location"}
                        </>
                    )}
                </button>
            </div>
        </div>

        {/* Media Upload Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Identification Images</label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-100 border-dashed rounded-3xl cursor-pointer bg-slate-50/50 hover:bg-emerald-50 hover:border-emerald-200 transition-all group">
                    <div className="flex flex-col items-center justify-center pt-2">
                        <Upload className="w-6 h-6 mb-2 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                        <p className="text-xs text-slate-400 group-hover:text-emerald-700 font-bold tracking-tight">
                            {images?.length ? `${images.length} selected` : 'Drop photos here'}
                        </p>
                    </div>
                    <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
            </div>

            {(wasteType !== 'organic') && (
                <div className="space-y-4">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Condition Video</label>
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-100 border-dashed rounded-3xl cursor-pointer bg-slate-50/50 hover:bg-indigo-50 hover:border-indigo-200 transition-all group">
                        <div className="flex flex-col items-center justify-center pt-2">
                            <FileVideo className="w-6 h-6 mb-2 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                            <p className="text-xs text-slate-400 group-hover:text-indigo-700 font-bold tracking-tight">
                                {video ? video.name : 'Upload overview video'}
                            </p>
                        </div>
                        <input type="file" accept="video/*" onChange={handleVideoChange} className="hidden" />
                    </label>
                </div>
            )}
        </div>

        {/* Address Display */}
        {coordinates && (
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-50 p-6 rounded-2xl border-2 border-emerald-50 space-y-2"
            >
                <div className="flex items-center justify-between">
                    <h5 className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Selected Address</h5>
                    <button type="button" onClick={() => setCoordinates(null)} className="text-rose-500 hover:text-rose-600 transition-colors">
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
                <p className="text-sm font-semibold text-slate-700 leading-relaxed">{address}</p>
            </motion.div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-sm uppercase tracking-[2px] transition-all shadow-xl shadow-slate-200 active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {isSubmitting ? (
              <Loader2 className="animate-spin h-5 w-5" />
          ) : (
              <>Schedule Collection <ChevronDown className="h-4 w-4" /></>
          )}
        </button>
      </form>
    </div>
  );
};

export default PickupForm;
