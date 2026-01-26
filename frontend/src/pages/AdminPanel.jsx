import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Check, X, Truck, Phone, FileText, User, IndianRupee, Edit, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [rates, setRates] = useState([]);
  const [activeTab, setActiveTab] = useState('verifications'); // 'verifications' | 'rates'
  const [loading, setLoading] = useState(true);
  const [editingRate, setEditingRate] = useState(null); // Rate object or null
  const [showRateModal, setShowRateModal] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Basic protection
    if (user && user.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/verifications');
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch pending users", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRates = async () => {
      try {
          const { data } = await api.get('/rates');
          if (data.success) {
              setRates(data.data);
          }
      } catch (error) {
          console.error("Failed to fetch rates", error);
      }
  };

  useEffect(() => {
    if (activeTab === 'verifications') {
        fetchPendingUsers();
    } else {
        fetchRates();
        setLoading(false); 
    }
  }, [activeTab]);

  const handleVerify = async (id) => {
    if (window.confirm('Are you sure you want to approve this user?')) {
        try {
            await api.put(`/admin/verify/${id}`);
            // Remove from list
            setUsers(users.filter(u => u._id !== id));
            toast.success('User verified successfully');
        } catch (error) {
            toast.error('Failed to verify user');
        }
    }
  };

  const handleReject = async (id) => {
    if (window.confirm('Are you sure you want to REJECT and DELETE this user application?')) {
        try {
            await api.delete(`/admin/reject/${id}`);
            // Remove from list
            setUsers(users.filter(u => u._id !== id));
            toast.success('User rejected');
        } catch (error) {
             toast.error('Failed to reject user');
        }
    }
  };

  const handleSaveRate = async (e) => {
      e.preventDefault();
      try {
          const payload = {
              name: e.target.name.value,
              price: e.target.price.value,
              category: e.target.category.value,
              unit: e.target.unit.value,
              description: e.target.description.value
          };
          
          await api.post('/rates', payload); // Create or Update
          toast.success('Rate saved successfully');
          setShowRateModal(false);
          setEditingRate(null);
          fetchRates();
      } catch (error) {
          toast.error('Failed to save rate');
      }
  };

  const handleDeleteRate = async (id) => {
      if(window.confirm('Delete this rate?')) {
          try {
              await api.delete(`/rates/${id}`);
              toast.success('Rate deleted');
              fetchRates();
          } catch(error) {
              toast.error('Failed to delete rate');
          }
      }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
                <ShieldCheck className="h-10 w-10 text-green-600" />
                <h1 className="text-3xl font-bold text-gray-900">Admin Control Center</h1>
            </div>
            
            <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
                <button 
                    onClick={() => setActiveTab('verifications')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'verifications' ? 'bg-green-100 text-green-800' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    Verifications
                </button>
                <button 
                    onClick={() => setActiveTab('rates')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'rates' ? 'bg-green-100 text-green-800' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    Rate Manager
                </button>
            </div>
        </div>

        {activeTab === 'verifications' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">Pending Collector Applications</h2>
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold">
                        {users.length} Pending
                    </span>
                </div>
                
                {/* Users List Code Block */}
                {loading ? (
                    <div className="p-12 text-center text-gray-500">Loading requests...</div>
                ) : users.length === 0 ? (
                    <div className="p-16 text-center text-gray-400 flex flex-col items-center">
                        <ShieldCheck className="h-12 w-12 mb-4 opacity-20" />
                        <p>No pending applications.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {users.map((applicant) => (
                            <div key={applicant._id} className="p-6 hover:bg-gray-50 transition-colors">
                                {/* ... Same Card Content ... */}
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="flex-shrink-0">
                                        <img 
                                            src={applicant.profilePicture || 'https://via.placeholder.com/150'} 
                                            alt={applicant.name} 
                                            className="w-24 h-24 rounded-lg object-cover bg-gray-200 border border-gray-200 group-hover:scale-105 transition-transform cursor-pointer"
                                            onClick={() => window.open(applicant.profilePicture, '_blank')}
                                        />
                                    </div>
                                    <div className="flex-grow space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900">{applicant.name}</h3>
                                                <div className="text-sm text-gray-500 space-y-1">
                                                    <p className="flex items-center gap-2"><User className="h-3 w-3" /> {applicant.email}</p>
                                                    <p className="flex items-center gap-2"><Phone className="h-3 w-3" /> {applicant.phone}</p>
                                                </div>
                                            </div>
                                            <span className="capitalize px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100">
                                                {applicant.role}
                                            </span>
                                        </div>
                                        {applicant.collectorDetails && (
                                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                                                <div>
                                                    <span className="text-gray-400 block text-xs uppercase tracking-wider mb-1">Vehicle Type</span>
                                                    <span className="font-semibold flex items-center gap-2">
                                                        <Truck className="h-4 w-4 text-gray-400" /> {applicant.collectorDetails.vehicleType || 'N/A'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-400 block text-xs uppercase tracking-wider mb-1">Plate Number</span>
                                                    <span className="font-semibold font-mono bg-white px-2 py-1 rounded border border-gray-200 inline-block">
                                                        {applicant.collectorDetails.vehicleNumber || 'N/A'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-400 block text-xs uppercase tracking-wider mb-1">License Number</span>
                                                    <span className="font-semibold flex items-center gap-2">
                                                        <FileText className="h-4 w-4 text-gray-400" /> {applicant.collectorDetails.licenseNumber || 'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-row md:flex-col gap-3 justify-center pl-0 md:pl-4 md:border-l border-gray-100 min-w-[140px]">
                                        <button onClick={() => handleVerify(applicant._id)} className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 text-sm font-medium shadow-sm">
                                            <Check className="h-4 w-4" /> Approve
                                        </button>
                                        <button onClick={() => handleReject(applicant._id)} className="flex-1 bg-white text-red-600 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50 transition flex items-center justify-center gap-2 text-sm font-medium">
                                            <X className="h-4 w-4" /> Reject
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}

        {/* RATES TAB */}
        {activeTab === 'rates' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">Scrap Market Rates</h2>
                    <button 
                        onClick={() => { setEditingRate(null); setShowRateModal(true); }}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2 text-sm font-semibold shadow-sm"
                    >
                        <Plus className="h-4 w-4" /> Add Rate
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Item Name</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price (₹)</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Unit</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {rates.map((rate) => (
                                <tr key={rate._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{rate.name}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                                            rate.category === 'Paper' ? 'bg-gray-100 text-gray-700' :
                                            rate.category === 'Plastic' ? 'bg-blue-100 text-blue-700' :
                                            rate.category === 'Metal' ? 'bg-orange-100 text-orange-700' :
                                            rate.category === 'E-Waste' ? 'bg-purple-100 text-purple-700' : 
                                            'bg-green-100 text-green-700'
                                        }`}>
                                            {rate.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-mono font-semibold text-gray-700">₹{rate.price}</td>
                                    <td className="px-6 py-4 text-gray-500 capitalize">{rate.unit || 'kg'}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => { setEditingRate(rate); setShowRateModal(true); }}
                                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteRate(rate._id)}
                                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* Rate Edit/Create Modal */}
        {showRateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                         <h3 className="text-lg font-bold text-gray-900">{editingRate ? 'Edit Rate' : 'New Rate'}</h3>
                         <button onClick={() => setShowRateModal(false)}><X className="h-5 w-5 text-gray-400 hover:text-gray-600" /></button>
                    </div>
                    <form onSubmit={handleSaveRate} className="p-6 space-y-4">
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                             <input name="name" defaultValue={editingRate?.name} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select name="category" defaultValue={editingRate?.category || 'Plastic'} className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white">
                                    <option value="Plastic">Plastic</option>
                                    <option value="Paper">Paper</option>
                                    <option value="Metal">Metal</option>
                                    <option value="E-Waste">E-Waste</option>
                                    <option value="Glass">Glass</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                                <select name="unit" defaultValue={editingRate?.unit || 'kg'} className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white">
                                    <option value="kg">kg</option>
                                    <option value="piece">piece</option>
                                </select>
                            </div>
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                             <input name="price" type="number" step="0.5" defaultValue={editingRate?.price} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none" />
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                             <input name="description" defaultValue={editingRate?.description} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none" />
                        </div>
                        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 transition shadow-lg">
                            Save Rate
                        </button>
                    </form>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default AdminPanel;
