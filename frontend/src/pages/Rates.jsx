import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { IndianRupee, Info, Search, Filter, ArrowUpRight } from 'lucide-react';
import { Skeleton } from '../components/Skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';
import RatesHeroMotivation from '../assets/rates_hero_motivation.png';
import EcoImpactMotivation from '../assets/eco_impact_motivation.png';
import CommunityGreenHands from '../assets/community_green_hands.png';

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
        <div className="min-h-screen bg-[#F7F8FA] selection:bg-emerald-100 selection:text-emerald-900 pb-20">
            {/* Professional Header */}
            <div className="bg-white border-b border-slate-200 px-4 pt-20 pb-24 md:pt-24 md:pb-32 relative overflow-hidden">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <IndianRupee className="h-4 w-4 text-emerald-500" />
                        <span className="text-[10px] font-bold uppercase tracking-[2px] text-slate-400">Price List</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
                        Scrap <span className="text-slate-500 font-medium">Prices</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-4 text-sm max-w-xl leading-relaxed">
                        Current market rates for recyclable materials. Prices are updated daily based on market demand.
                    </p>
                </motion.div>
                
                {/* Background Decorative Element */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] -mr-40 -mt-40" />
            </div>

            <div className="max-w-7xl mx-auto px-6 sm:px-8 -mt-12 relative z-20">
                {/* Motivational Environment Section - Moved to Top */}
                <div className="mb-20">
                    <div className="flex items-center gap-2 mb-8">
                        <div className="h-[1px] w-8 bg-emerald-300"></div>
                        <span className="text-[10px] font-bold uppercase tracking-[2px] text-emerald-500">Our Shared Future</span>
                    </div>
                    
                    <h2 className="text-3xl md:text-3xl font-bold text-slate-900 tracking-tight leading-tight mb-8">
                         More Than Just <br />
                         <span className="text-emerald-500 font-medium italic">Scrap & Metal.</span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 h-[400px]">
                        {/* Card 1: Hero/Wealth */}
                        <div className="relative group rounded-3xl overflow-hidden shadow-2xl shadow-emerald-500/10 border border-emerald-100">
                            <img src={RatesHeroMotivation} alt="Wealth from Waste" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/80 via-emerald-400/20 to-transparent" />
                            <div className="absolute bottom-0 left-0 p-8">
                                <h3 className="text-white text-lg font-bold tracking-tight mb-2">Wealth from Waste</h3>
                                <p className="text-emerald-100/80 text-[10px] font-medium leading-relaxed">Transforming discarded materials into valuable resources.</p>
                            </div>
                        </div>

                        {/* Card 2: Community */}
                        <div className="relative group rounded-3xl overflow-hidden shadow-2xl shadow-emerald-900/10 border border-emerald-100 md:mt-8">
                            <img src={CommunityGreenHands} alt="Community" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/80 via-emerald-400/20 to-transparent" />
                            <div className="absolute bottom-0 left-0 p-8">
                                <h3 className="text-white text-lg font-bold tracking-tight mb-2">Community Power</h3>
                                <p className="text-emerald-100/80 text-[10px] font-medium leading-relaxed">Thousands of citizens united in a single green mission.</p>
                            </div>
                        </div>

                        {/* Card 3: Future Tech */}
                        <div className="relative group rounded-3xl overflow-hidden shadow-2xl shadow-emerald-500/10 border border-emerald-100">
                            <img src={EcoImpactMotivation} alt="Future" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/80 via-emerald-400/20 to-transparent" />
                            <div className="absolute bottom-0 left-0 p-8">
                                <h3 className="text-white text-lg font-bold tracking-tight mb-2">Future Powered</h3>
                                <p className="text-emerald-100/80 text-[10px] font-medium leading-relaxed">Innovating with sustainable energy cycles.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search & Intelligence Controls */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-10 flex flex-col lg:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Search items..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-emerald-50 border border-emerald-100 focus:border-slate-900 focus:bg-white rounded-lg pl-12 pr-6 py-3.5 text-xs font-bold text-slate-900 transition-all outline-none placeholder:text-slate-400"
                        />
                    </div>
                    <div className="flex gap-2 p-1 bg-emerald-50 rounded-lg border border-slate-200 w-full lg:w-auto overflow-x-auto scrollbar-hide">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={cn(
                                    "px-5 py-2 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap",
                                    selectedCategory === cat 
                                        ? "bg-white text-slate-900 shadow-sm border border-slate-200" 
                                        : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-white p-8 rounded-xl border border-slate-200 space-y-4 shadow-sm">
                                <Skeleton className="h-4 w-20 rounded" />
                                <Skeleton className="h-8 w-40 rounded" />
                                <div className="pt-4">
                                     <Skeleton className="h-10 w-full rounded-lg" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence mode="popLayout">
                            {filteredRates.map((rate, idx) => (
                                <motion.div 
                                    layout
                                    key={rate._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm hover:border-slate-400 transition-all group relative overflow-hidden"
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest border border-emerald-100 px-3 py-1 rounded">
                                            {rate.category}
                                        </span>
                                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                    </div>
                                    
                                    <div className="space-y-1 mb-8">
                                        <h3 className="text-base font-bold text-slate-900 capitalize tracking-tight">{rate.name}</h3>
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-3xl font-bold text-slate-900 tracking-tight">₹{rate.price}</span>
                                            <span className="text-slate-400 font-bold uppercase tracking-tighter text-[10px]">Per {rate.unit}</span>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 rounded bg-emerald-50 flex items-center justify-center">
                                                <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase">Current Price</span>
                                        </div>
                                        {rate.description && (
                                            <button className="text-slate-300 hover:text-emerald-500 transition-colors">
                                                <Info className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                    
                                    {/* Subtle Gradient Accent */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-500/5 transition-colors" />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
                
                {!loading && filteredRates.length === 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-32 bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-center space-y-6 shadow-sm"
                    >
                        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100">
                            <Search className="h-6 w-6 text-slate-300" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-slate-900 tracking-tight">No Matching Resources</h3>
                            <p className="text-slate-400 text-xs font-medium max-w-[240px] mx-auto">No items found matching your search.</p>
                        </div>
                        <button 
                            onClick={() => {setSearchTerm(''); setSelectedCategory('All');}} 
                            className="bg-emerald-500 text-white px-8 py-3 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-400 transition-all"
                        >
                            Clear Search
                        </button>
                    </motion.div>
                )}
            </div>


        </div>
    );
};

export default Rates;
