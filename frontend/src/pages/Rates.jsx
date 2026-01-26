import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { IndianRupee, Info, Search, Filter } from 'lucide-react';
import { Skeleton } from '../components/Skeleton';
import { motion } from 'framer-motion';

const Rates = () => {
    const [rates, setRates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    useEffect(() => {
        const fetchRates = async () => {
            try {
                const { data } = await api.get('/rates');
                setRates(data.data);
            } catch (error) {
                console.error("Failed to fetch rates", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRates();
    }, []);

    const categories = ['All', ...new Set(rates.map(r => r.category))];

    const filteredRates = rates.filter(rate => {
        const matchesSearch = rate.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || rate.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 sm:p-8">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-6xl mx-auto"
            >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black text-gray-900 flex items-center gap-3 tracking-tight">
                            <IndianRupee className="h-10 w-10 text-green-600" /> 
                            Waste Rates
                        </h1>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs ml-1">Current daily market prices for recyclable items</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search waste type..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white border-2 border-gray-100 rounded-2xl pl-12 pr-4 py-3 font-semibold focus:border-green-500 transition-all outline-none"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-5 py-2 rounded-xl text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-green-600 text-white shadow-lg shadow-green-200' : 'bg-white text-gray-400 border border-gray-100 hover:bg-gray-50'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 space-y-4">
                                <div className="flex justify-between items-start">
                                    <Skeleton className="h-6 w-32" />
                                    <Skeleton className="h-6 w-16 rounded-full" />
                                </div>
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-4 w-48" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredRates.map((rate) => (
                            <motion.div 
                                layout
                                key={rate._id}
                                whileHover={{ y: -5 }}
                                className="bg-white p-6 rounded-[32px] border-2 border-transparent hover:border-green-100 shadow-xl shadow-gray-200/50 transition-all group"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <span className="bg-gray-50 text-gray-400 font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-full group-hover:bg-green-50 group-hover:text-green-600 transition-colors">
                                        {rate.category}
                                    </span>
                                    {rate.description && (
                                        <div className="relative group/info">
                                            <Info className="h-4 w-4 text-gray-300 hover:text-green-500 transition-colors cursor-help" />
                                            <div className="absolute right-0 bottom-full mb-2 w-48 bg-gray-900 text-white text-[10px] p-3 rounded-xl opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all z-20 font-bold uppercase tracking-widest leading-relaxed">
                                                {rate.description}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <h3 className="text-xl font-black text-gray-900 capitalize mb-1 transform group-hover:translate-x-1 transition-transform">{rate.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-black text-green-600 tracking-tight">₹{rate.price}</span>
                                    <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">/{rate.unit}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
                
                {!loading && filteredRates.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center space-y-4">
                        <div className="p-4 bg-gray-50 rounded-full">
                            <Search className="h-12 w-12 text-gray-300" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">No rates found</h3>
                            <p className="text-gray-400 max-w-sm mx-auto">Try searching for a different waste type or adjusting your category filter.</p>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default Rates;
