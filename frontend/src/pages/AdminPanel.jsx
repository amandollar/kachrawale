import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Check, X, Truck, Phone, FileText, User, IndianRupee, Edit, Plus, Trash2, MessageSquare } from 'lucide-react';
import { toast } from 'react-hot-toast';
import SupportCenter from '../components/SupportCenter';

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
    <div className="min-h-screen bg-[#F7F8FA] p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
                <ShieldCheck className="h-10 w-10 text-emerald-600" />
                <h1 className="text-3xl font-bold text-emerald-950">Admin Control Center</h1>
            </div>
            
            <div className="flex bg-white rounded-lg p-1 shadow-sm border border-emerald-100">
                <button 
                    onClick={() => setActiveTab('verifications')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'verifications' ? 'bg-emerald-100 text-emerald-800' : 'text-slate-600 hover:bg-emerald-50'}`}
                >
                    Verifications
                </button>
                <button 
                    onClick={() => setActiveTab('rates')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'rates' ? 'bg-emerald-100 text-emerald-800' : 'text-slate-600 hover:bg-emerald-50'}`}
                >
                    Manage Prices
                </button>
                 <button 
                    onClick={() => setActiveTab('analytics')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'analytics' ? 'bg-emerald-100 text-emerald-800' : 'text-slate-600 hover:bg-emerald-50'}`}
                >
                     Analytics
                </button>
                 <button 
                    onClick={() => setActiveTab('payouts')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'payouts' ? 'bg-emerald-100 text-emerald-800' : 'text-slate-600 hover:bg-emerald-50'}`}
                >
                     Payouts
                </button>
                <div className="w-px bg-emerald-100 my-2 mx-1"></div>
                <button 
                    onClick={() => setActiveTab('support')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'support' ? 'bg-emerald-100 text-emerald-800' : 'text-slate-600 hover:bg-emerald-50'}`}
                >
                    <MessageSquare className="h-4 w-4" /> Support Center
                </button>
            </div>
        </div>

        {activeTab === 'verifications' && (
            <div className="bg-white rounded-xl shadow-sm border border-emerald-100 overflow-hidden">
                <div className="p-6 border-b border-emerald-50 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-emerald-950">Pending Collector Applications</h2>
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold">
                        {users.length} Pending
                    </span>
                </div>
                
                {/* Users List Code Block */}
                {loading ? (
                    <div className="p-12 text-center text-slate-500">Loading requests...</div>
                ) : users.length === 0 ? (
                    <div className="p-16 text-center text-slate-400 flex flex-col items-center">
                        <ShieldCheck className="h-12 w-12 mb-4 opacity-20" />
                        <p>No pending applications.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-emerald-50">
                        {users.map((applicant) => (
                            <div key={applicant._id} className="p-6 hover:bg-emerald-50/30 transition-colors">
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="flex-shrink-0">
                                        <img 
                                            src={applicant.profilePicture || 'https://via.placeholder.com/150'} 
                                            alt={applicant.name} 
                                            className="w-24 h-24 rounded-lg object-cover bg-emerald-100 border border-emerald-200 group-hover:scale-105 transition-transform cursor-pointer"
                                            onClick={() => window.open(applicant.profilePicture, '_blank')}
                                        />
                                    </div>
                                    <div className="flex-grow space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-lg font-bold text-emerald-950">{applicant.name}</h3>
                                                <div className="text-sm text-slate-500 space-y-1">
                                                    <p className="flex items-center gap-2"><User className="h-3 w-3" /> {applicant.email}</p>
                                                    <p className="flex items-center gap-2"><Phone className="h-3 w-3" /> {applicant.phone}</p>
                                                </div>
                                            </div>
                                            <span className="capitalize px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100">
                                                {applicant.role}
                                            </span>
                                        </div>
                                        {applicant.collectorDetails && (
                                            <div className="bg-emerald-50/50 p-4 rounded-lg border border-emerald-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                                                <div>
                                                    <span className="text-slate-400 block text-xs uppercase tracking-wider mb-1">Vehicle Type</span>
                                                    <span className="font-semibold flex items-center gap-2 text-emerald-900">
                                                        <Truck className="h-4 w-4 text-slate-400" /> {applicant.collectorDetails.vehicleType || 'N/A'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-400 block text-xs uppercase tracking-wider mb-1">Plate Number</span>
                                                    <span className="font-semibold font-mono bg-white px-2 py-1 rounded border border-emerald-100 inline-block text-emerald-900">
                                                        {applicant.collectorDetails.vehicleNumber || 'N/A'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-400 block text-xs uppercase tracking-wider mb-1">License Number</span>
                                                    <span className="font-semibold flex items-center gap-2 text-emerald-900">
                                                        <FileText className="h-4 w-4 text-slate-400" /> {applicant.collectorDetails.licenseNumber || 'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-row md:flex-col gap-3 justify-center pl-0 md:pl-4 md:border-l border-emerald-50 min-w-[140px]">
                                        <button onClick={() => handleVerify(applicant._id)} className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition flex items-center justify-center gap-2 text-sm font-medium shadow-sm">
                                            <Check className="h-4 w-4" /> Approve
                                        </button>
                                        <button onClick={() => handleReject(applicant._id)} className="flex-1 bg-white text-rose-600 border border-rose-200 px-4 py-2 rounded-lg hover:bg-rose-50 transition flex items-center justify-center gap-2 text-sm font-medium">
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

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
             <AdminAnalytics rates={rates} />
        )}
        
        {/* PAYOUTS TAB */}
        {activeTab === 'payouts' && (
             <AdminPayouts />
        )}

        {/* SUPPORT CENTER TAB */}
        {activeTab === 'support' && (
// ... (code omitted for brevity, ensure context matches)
            <div className="bg-white rounded-xl shadow-sm border border-emerald-100 p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-semibold text-emerald-950">Support Center</h2>
                        <p className="text-slate-500 text-sm mt-1">Manage user inquiries and real-time support chats.</p>
                    </div>
                </div>
                <SupportCenter />
            </div>
        )}




        {/* RATES TAB */}
        {activeTab === 'rates' && (
            <div className="bg-white rounded-xl shadow-sm border border-emerald-100">
                <div className="p-6 border-b border-emerald-50 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-emerald-950">Scrap Prices</h2>
                    <button 
                        onClick={() => { setEditingRate(null); setShowRateModal(true); }}
                        className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition flex items-center gap-2 text-sm font-semibold shadow-sm"
                    >
                        <Plus className="h-4 w-4" /> Add Rate
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-emerald-50/50 border-b border-emerald-100">
                            <tr>
                                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Item Name</th>
                                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Price (₹)</th>
                                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Unit</th>
                                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-emerald-50">
                            {rates.map((rate) => (
                                <tr key={rate._id} className="hover:bg-emerald-50/30 transition-colors">
                                    <td className="px-6 py-4 font-medium text-emerald-900">{rate.name}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                                            rate.category === 'Paper' ? 'bg-slate-100 text-slate-700' :
                                            rate.category === 'Plastic' ? 'bg-blue-100 text-blue-700' :
                                            rate.category === 'Metal' ? 'bg-orange-100 text-orange-700' :
                                            rate.category === 'E-Waste' ? 'bg-purple-100 text-purple-700' : 
                                            'bg-emerald-100 text-emerald-700'
                                        }`}>
                                            {rate.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-mono font-semibold text-emerald-700">₹{rate.price}</td>
                                    <td className="px-6 py-4 text-slate-500 capitalize">{rate.unit || 'kg'}</td>
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
                                                className="p-1 text-rose-600 hover:bg-rose-50 rounded"
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
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden ring-1 ring-emerald-100">
                    <div className="p-6 border-b border-emerald-50 flex justify-between items-center">
                         <h3 className="text-lg font-bold text-emerald-950">{editingRate ? 'Edit Rate' : 'New Rate'}</h3>
                         <button onClick={() => setShowRateModal(false)}><X className="h-5 w-5 text-slate-400 hover:text-slate-600" /></button>
                    </div>
                    <form onSubmit={handleSaveRate} className="p-6 space-y-4">
                        <div>
                             <label className="block text-sm font-medium text-slate-700 mb-1">Item Name</label>
                             <input name="name" defaultValue={editingRate?.name} required className="w-full border border-emerald-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                                <select name="category" defaultValue={editingRate?.category || 'Plastic'} className="w-full border border-emerald-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                    <option value="Plastic">Plastic</option>
                                    <option value="Paper">Paper</option>
                                    <option value="Metal">Metal</option>
                                    <option value="E-Waste">E-Waste</option>
                                    <option value="Glass">Glass</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Unit</label>
                                <select name="unit" defaultValue={editingRate?.unit || 'kg'} className="w-full border border-emerald-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                    <option value="kg">kg</option>
                                    <option value="piece">piece</option>
                                </select>
                            </div>
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-slate-700 mb-1">Price (₹)</label>
                             <input name="price" type="number" step="0.5" defaultValue={editingRate?.price} required className="w-full border border-emerald-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                             <input name="description" defaultValue={editingRate?.description} className="w-full border border-emerald-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                        </div>
                        <button type="submit" className="w-full bg-emerald-600 text-white py-2 rounded-lg font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-200">
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

const AdminAnalytics = ({ rates }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/admin/stats');
                if (data.success) {
                    setStats(data.data);
                }
            } catch (error) {
                console.error("Failed to fetch admin stats", error);
            } finally {
                setLoading(false);
            }
        };

        if (rates.length === 0) {
            // Reload rates if not available for calculation
        }
        fetchStats();
    }, []);

    if (loading) return <div className="p-12 text-center text-slate-400">Loading analytics...</div>;
    if (!stats) return <div className="p-12 text-center text-slate-400">Failed to load data.</div>;

    // Calculate Inventory Value
    // Note: This is an estimation. Real app would match specific waste types to rate categories more precisely.
    const inventoryByCat = stats.pickups.byType.map(item => {
        // Find average rate for this category
        const categoryRates = rates.filter(r => r.category.toLowerCase() === item._id.toLowerCase());
        const avgRate = categoryRates.length > 0 
            ? categoryRates.reduce((acc, curr) => acc + curr.price, 0) / categoryRates.length
            : 0;
        
        return {
            category: item._id,
            count: item.count,
            weight: item.weight,
            estimatedValue: item.weight * avgRate
        };
    });

    const totalInventoryValue = inventoryByCat.reduce((acc, curr) => acc + curr.estimatedValue, 0);

    return (
        <div className="space-y-6">
            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-emerald-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
                            <Truck className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Inventory</p>
                            <h3 className="text-2xl font-bold text-emerald-950">{stats.weight.totalEstimated.toFixed(1)} <span className="text-sm text-slate-400 font-medium">kg</span></h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-emerald-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
                            <IndianRupee className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Est. Stock Value</p>
                            <h3 className="text-2xl font-bold text-emerald-950">₹{totalInventoryValue.toLocaleString()}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-emerald-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
                            <Check className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed Pickups</p>
                            <h3 className="text-2xl font-bold text-emerald-950">{stats.pickups.total}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Inventory Breakdown Grid */}
            <div className="bg-white rounded-xl shadow-sm border border-emerald-100 overflow-hidden">
                 <div className="p-6 border-b border-emerald-50 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-semibold text-emerald-950">Inventory Breakdown</h2>
                        <p className="text-slate-500 text-sm mt-1">Current stock levels by waste type.</p>
                    </div>
                    <button 
                         onClick={() => window.print()}
                         className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-bold hover:bg-emerald-100 transition-colors"
                    >
                        Export Report
                    </button>
                </div>
                
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {inventoryByCat.map((cat) => (
                            <div key={cat.category} className="border border-emerald-100 rounded-xl p-5 hover:border-emerald-300 transition-all bg-emerald-50/10">
                                <div className="flex justify-between items-start mb-4">
                                     <span className="capitalize px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                        {cat.category}
                                     </span>
                                     <span className="text-xs font-medium text-slate-400">{cat.count} Batches</span>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between items-end">
                                        <h4 className="text-3xl font-bold text-emerald-950">{cat.weight}</h4>
                                        <span className="text-sm font-bold text-slate-400 mb-1">KG</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                        <div 
                                            className="bg-emerald-500 h-full rounded-full" 
                                            style={{ width: `${(cat.weight / stats.weight.totalEstimated) * 100}%` }} 
                                        />
                                    </div>
                                    <p className="text-xs font-medium text-emerald-700 pt-2 text-right">
                                        Est. Value: ₹{cat.estimatedValue.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                        
                        {inventoryByCat.length === 0 && (
                             <div className="col-span-full py-12 text-center text-slate-400">
                                 No inventory data available yet.
                             </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


const AdminPayouts = () => {
    const [payouts, setPayouts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPayouts = async () => {
            try {
                const { data } = await api.get('/admin/payouts');
                if (data.success) {
                    setPayouts(data.data);
                }
            } catch (error) {
                console.error("Failed to fetch payouts", error);
                toast.error("Failed to load payout data");
            } finally {
                setLoading(false);
            }
        };
        fetchPayouts();
    }, []);

    if (loading) return <div className="p-12 text-center text-slate-400">Loading payouts...</div>;

    const handleSettle = (id) => {
        toast.success("Settled");
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-emerald-100 overflow-hidden">
            <div className="p-6 border-b border-emerald-50 flex justify-between items-center">
                <div>
                     <h2 className="text-xl font-semibold text-emerald-950">Collector Payouts</h2>
                     <p className="text-slate-500 text-sm mt-1">Track earnings and reimbursements.</p>
                </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-emerald-50/50 border-b border-emerald-100">
                        <tr>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Collector</th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Trips</th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Value</th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cash Spent (Reimburse)</th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Commission (10%)</th>
                            <th className="px-6 py-3 text-xs font-semibold text-emerald-700 uppercase tracking-wider text-right">Total Payable</th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-50">
                        {payouts.map((item) => (
                            <tr key={item._id} className="hover:bg-emerald-50/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-emerald-950">{item.name}</span>
                                        <span className="text-xs text-slate-500">{item.email}</span>
                                        <span className="text-xs text-slate-400">{item.vehicle}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-medium text-slate-600">{item.totalTrips}</td>
                                <td className="px-6 py-4 font-medium text-slate-600">₹{item.totalValue.toLocaleString()}</td>
                                <td className="px-6 py-4 font-mono text-slate-600">₹{item.cashSpent.toLocaleString()}</td>
                                <td className="px-6 py-4 font-mono text-green-600">+₹{item.commission.toLocaleString()}</td>
                                <td className="px-6 py-4 text-right">
                                    <span className="text-lg font-bold text-emerald-700">₹{item.totalPayable.toLocaleString()}</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button 
                                        onClick={() => handleSettle(item._id)}
                                        className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg font-bold hover:bg-emerald-200 transition"
                                    >
                                        Settle
                                    </button>
                                </td>
                            </tr>
                        ))}
                         {payouts.length === 0 && (
                             <tr>
                                 <td colSpan="7" className="p-12 text-center text-slate-400">No payout data available.</td>
                             </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminPanel;
