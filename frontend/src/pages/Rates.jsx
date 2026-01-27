import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { IndianRupee, Info, Search, Filter, ArrowUpRight } from 'lucide-react';
import { Skeleton } from '../components/Skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';

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
        <div className="min-h-screen bg-[#F7F8FA] selection:bg-emerald-100 selection:text-emerald-900">
            {/* Header / Hero Section */}
            <div className="mesh-gradient border-b border-slate-100 px-4 pt-16 pb-24 md:pt-20 md:pb-32">
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-6xl mx-auto text-center md:text-left"
                >
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-white rounded-2xl shadow-sm border border-slate-100 mb-6 mx-auto md:mx-0">
                        <IndianRupee className="h-4 w-4 text-emerald-600" />
                        <span className="text-[10px] font-black uppercase tracking-[2px] text-slate-500">Live Market Prices</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-800 tracking-tight leading-tight">
                        Transparent <span className="text-emerald-600">Waste Economics</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-4 text-lg max-w-2xl mx-auto md:mx-0 leading-relaxed">
                        Stay updated with the daily market rates for all recyclable categories. 
                        We ensure you get the best value for your sustainability efforts.
                    </p>
                </motion.div>
            </div>

            <div className="max-w-6xl mx-auto px-4 -mt-16 md:-mt-24 pb-20">
                {/* Search & Filters Card */}
                <div className="bg-white p-6 md:p-8 rounded-[32px] shadow-premium border border-slate-100 mb-10 flex flex-col md:flex-row gap-6 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Explore items (e.g. Copper, Pet Bottles...)" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-3xl pl-14 pr-6 py-4 font-bold text-slate-700 transition-all outline-none placeholder:text-slate-300"
                        />
                    </div>
                    <div className="h-10 w-[2px] bg-slate-50 hidden md:block" />
                    <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0 scrollbar-hide w-full md:w-auto">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={cn(
                                    "px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-[2px] whitespace-nowrap transition-all flex items-center gap-2",
                                    selectedCategory === cat 
                                        ? "bg-slate-900 text-white shadow-xl shadow-slate-200" 
                                        : "bg-white text-slate-400 border-2 border-slate-50 hover:border-slate-100 hover:text-slate-600"
                                )}
                            >
                                {cat}
                                {selectedCategory === cat && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-100 space-y-6 shadow-sm">
                                <div className="flex justify-between items-start">
                                    <Skeleton className="h-6 w-32 rounded-lg" />
                                    <Skeleton className="h-6 w-16 rounded-full" />
                                </div>
                                <Skeleton className="h-12 w-full rounded-2xl" />
                                <Skeleton className="h-4 w-48 rounded-md" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        <AnimatePresence mode="popLayout">
                            {filteredRates.map((rate, idx) => (
                                <motion.div 
                                    layout
                                    key={rate._id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    whileHover={{ y: -8 }}
                                    className="bg-white p-6 sm:p-8 rounded-3xl sm:rounded-[40px] border border-slate-100 shadow-sm hover:shadow-premium transition-all group relative overflow-hidden"
                                >
                                    <div className="flex justify-between items-center mb-6">
                                        <span className="bg-slate-50 text-slate-400 font-black text-[10px] uppercase tracking-[2px] px-4 py-1.5 rounded-full ring-1 ring-inset ring-slate-100 group-hover:bg-emerald-50 group-hover:text-emerald-700 group-hover:ring-emerald-100 transition-all">
                                            {rate.category}
                                        </span>
                                        {rate.description && (
                                            <div className="p-2 rounded-xl bg-slate-50 text-slate-300 group-hover:text-emerald-500 transition-colors">
                                                <Info className="h-4 w-4" />
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-800 capitalize mb-2 group-hover:text-emerald-600 transition-colors">{rate.name}</h3>
                                    <div className="flex items-end gap-1.5 mb-8">
                                        <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight group-hover:text-emerald-700 transition-colors">₹{rate.price}</span>
                                        <span className="text-slate-400 font-bold uppercase tracking-widest text-xs pb-1.5">/{rate.unit}</span>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 text-emerald-600 font-bold text-[10px] uppercase tracking-[2px] opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                                        Market Standard <ArrowUpRight className="h-3 w-3" />
                                    </div>
                                    
                                    {/* Background Accent */}
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-emerald-500/10 transition-colors" />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
                
                {!loading && filteredRates.length === 0 && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-32 bg-white rounded-[40px] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center space-y-6 shadow-sm"
                    >
                        <div className="p-6 bg-slate-50 rounded-full">
                            <Search className="h-14 w-14 text-slate-200" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Resource Not Found</h3>
                            <p className="text-slate-400 font-semibold max-w-sm mx-auto">We couldn't find any rates matching your search. Try broadening your criteria.</p>
                        </div>
                        <button onClick={() => {setSearchTerm(''); setSelectedCategory('All');}} className="text-emerald-600 font-black text-xs uppercase tracking-[2px] hover:underline underline-offset-8">Reset Filters</button>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Rates;
