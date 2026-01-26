import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { User, Phone, Upload, Loader2, X } from 'lucide-react';

const EditProfileForm = ({ onClose }) => {
  const { user, loading: authLoading } = useAuth(); // We might need a checkUser refresh from context, but let's manual update for now
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState(user?.profilePicture || 'https://via.placeholder.com/150');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    const data = new FormData();
    data.append('name', formData.name);
    data.append('phone', formData.phone);
    if (profilePic) {
      data.append('profilePicture', profilePic);
    }

    try {
      const response = await api.put('/auth/updatedetails', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
         setMessage({ type: 'success', text: 'Profile updated! Please refresh to see changes.' });
         // Ideally, update global context user here
         // For now, simple success message
         setTimeout(() => {
             if(onClose) onClose();
             window.location.reload(); // Simple reload to refresh context
         }, 1500);
      }
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Update failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-200">
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
            <X className="h-6 w-6" />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Profile Picture Upload */}
            <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                    <img 
                        src={preview} 
                        alt="Profile" 
                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity">
                        <Upload className="h-6 w-6" />
                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                </div>
                <p className="text-xs text-gray-500">Click image to change (Max 5MB)</p>
            </div>

            <div className="space-y-4">
                <div className="relative">
                    <User className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
                    <input
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                        placeholder="Full Name"
                        required
                    />
                </div>
                
                <div className="relative">
                    <Phone className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
                    <input
                        name="phone"
                        type="text"
                        value={formData.phone}
                        onChange={handleChange}
                        className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                        placeholder="Phone Number"
                        required
                    />
                </div>
            </div>

            {message.text && (
                <div className={`p-3 rounded text-sm text-center ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                    {message.text}
                </div>
            )}

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 flex justify-center items-center gap-2"
            >
                {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : 'Save Changes'}
            </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfileForm;
