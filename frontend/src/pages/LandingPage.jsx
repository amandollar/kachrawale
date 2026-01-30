import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { ArrowRight, Recycle, Truck, Users, Coins, TrendingUp, ShieldCheck, BarChart3, Globe, Building2, Calculator, Zap, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import HeroImage from '../assets/hero_waste_management.png';
import FeatureRecycling from '../assets/feature_recycling.png';
import FeatureEco from '../assets/feature_eco.png';

const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rates, setRates] = useState([]);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const { data } = await api.get('/rates');
        if (data.success) {
           setRates(data.data.slice(0, 4));
        }
      } catch (error) {
        console.error("Failed to fetch rates", error);
      }
    };
    fetchRates();
  }, []);

  const containerVariants = {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
      hidden: { opacity: 0, y: 15 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  };

  return (
    <div className="min-h-screen bg-white selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* PROFESSIONAL HERO SECTION */}
      <section className="relative pt-24 pb-20 lg:pt-32 lg:pb-40 overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                
                {/* Text Content */}
                <motion.div 
                   className="w-full lg:w-1/2 text-left"
                   initial="hidden"
                   animate="visible"
                   variants={containerVariants}
                >
                    <motion.div variants={itemVariants} className="inline-flex items-center gap-2 py-1.5 px-4 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-[2px] mb-8">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Smart Waste Collection
                    </motion.div>
                    
                    <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl lg:text-7xl font-bold text-emerald-950 mb-8 leading-[1.05] tracking-tight">
                        Best Prices for <br />
                        <span className="text-emerald-600 font-medium">Your Scrap.</span>
                    </motion.h1>
                    
                    <motion.p variants={itemVariants} className="text-base md:text-lg text-emerald-700/80 mb-10 leading-relaxed max-w-lg font-medium">
                        Turn your household waste into cash. We provide reliable service for automated pickup, proper recycling, and instant payment.
                    </motion.p>
                    
                    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
                        <Link to="/register" className="group bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-200">
                            Sell Now <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link to="/rates" className="bg-white text-emerald-600 px-8 py-4 rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-emerald-50 transition-all border border-emerald-100 text-center">
                            Check Prices
                        </Link>
                    </motion.div>
                </motion.div>

                {/* Hero Asset */}
                <motion.div 
                    className="w-full lg:w-1/2"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <div className="relative rounded-xl overflow-hidden shadow-[0_32px_64px_-16px_rgba(16,185,129,0.2)] border border-emerald-100 bg-white aspect-video lg:aspect-[4/3] group">
                        <img 
                            src={HeroImage} 
                            alt="Sustainable Logistics Hub" 
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/40 to-transparent pointer-events-none" />
                    </div>
                </motion.div>
            </div>
        </div>
        
        {/* Background Gradient */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-400/10 rounded-full blur-[120px] -mr-40 -mt-40 pointer-events-none" />
      </section>

      {/* OPERATIONAL STANDARDS (Features) */}
      <section id="features" className="py-32 bg-emerald-50/30 border-y border-emerald-100">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-20 gap-8">
                  <div className="max-w-2xl">
                    <div className="flex items-center gap-2 mb-4">
                        <Zap className="h-4 w-4 text-emerald-600" />
                        <span className="text-[10px] font-bold uppercase tracking-[2px] text-emerald-600">How It Works</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-emerald-950 tracking-tight">Recycling Made Easy</h2>
                    <p className="text-emerald-700/80 font-medium mt-4 text-sm leading-relaxed">A simple and transparent way to manage waste, track your impact, and earn rewards for a cleaner planet.</p>
                  </div>
                  <Link to="/register" className="text-emerald-700 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 group border-b-2 border-emerald-200 pb-1 hover:border-emerald-600 transition-colors">
                      Join the Team <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                      { icon: Truck, title: 'Fast Pickup', desc: 'Smart routing ensures our trucks reach you quickly and efficiently.' },
                      { icon: Coins, title: 'Instant Payment', desc: 'Get paid directly to your account immediately after pickup.' },
                      { icon: BarChart3, title: 'Track Your Impact', desc: 'See how much waste you have recycled in real-time.' },
                      { icon: ShieldCheck, title: 'Safe & Legal', desc: 'We follow all environmental rules and regulations.' },
                      { icon: Users, title: 'Verified Agents', desc: 'All our pickup staff are verified and trained professionals.' },
                      { icon: Globe, title: 'Fair Market Rates', desc: 'We sell directly to recyclers to give you the best price.' }
                  ].map((feature, i) => (
                      <div key={i} className="bg-white p-10 rounded-xl border border-emerald-100 shadow-sm hover:border-emerald-900 transition-all group">
                          <div className="w-12 h-12 bg-emerald-50 rounded-lg border border-slate-100 flex items-center justify-center mb-8 group-hover:bg-emerald-950 group-hover:text-white transition-all">
                              <feature.icon className="h-5 w-5" />
                          </div>
                          <h3 className="text-base font-bold text-emerald-950 mb-3 tracking-tight">{feature.title}</h3>
                          <p className="text-emerald-700/80 text-xs font-medium leading-relaxed">{feature.desc}</p>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* BENEFITS COMPARISON */}
      <section id="benefits" className="py-24 bg-white border-b border-slate-50">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
              <div className="text-center mb-16">
                  <span className="text-[10px] font-bold uppercase tracking-[2px] text-emerald-600 block mb-3">Why Choose Us</span>
                  <h2 className="text-3xl md:text-4xl font-bold text-emerald-950 tracking-tight">One Platform, Two Ecosystems</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
                  {/* Citizen Benefit Card */}
                  <div className="bg-emerald-50/50 rounded-3xl p-10 border border-emerald-100 flex flex-col">
                      <div className="mb-8">
                          <h3 className="text-2xl font-bold text-emerald-950 mb-2">For Citizens</h3>
                          <p className="text-emerald-700/80 font-medium text-sm">Household generators & small businesses</p>
                      </div>
                      <ul className="space-y-6 mb-10 flex-1">
                           {[
                               "Instant cash payment for recyclables",
                               "Convenient doorstep pickup scheduling",
                               "Real-time carbon footprint tracking",
                               "Transparent pricing based on market rates"
                           ].map((item, i) => (
                               <li key={i} className="flex items-start gap-3">
                                   <div className="mt-1 min-w-5 h-5 rounded-full bg-emerald-200 flex items-center justify-center">
                                       <Check className="h-3 w-3 text-emerald-800" />
                                   </div>
                                   <span className="text-slate-700 font-medium text-sm leading-relaxed">{item}</span>
                               </li>
                           ))}
                      </ul>
                      <Link to="/register" className="w-full py-4 rounded-xl bg-white border border-emerald-200 text-emerald-800 font-bold text-xs uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all text-center shadow-sm">
                          Start Recycling
                      </Link>
                  </div>

                  {/* Collector Benefit Card */}
                  <div className="bg-emerald-950 rounded-3xl p-10 text-white flex flex-col relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                      <div className="mb-8 relative z-10">
                          <h3 className="text-2xl font-bold text-white mb-2">For Collectors</h3>
                          <p className="text-slate-400 font-medium text-sm">Aggregators & logistics partners</p>
                      </div>
                      <ul className="space-y-6 mb-10 flex-1 relative z-10">
                           {[
                               "Access to high-volume verified pickups",
                               "Smart route optimization to save fuel",
                               "Digital wallet & automated invoicing",
                               "Growth analytics & fleet management"
                           ].map((item, i) => (
                               <li key={i} className="flex items-start gap-3">
                                   <div className="mt-1 min-w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center">
                                       <Check className="h-3 w-3 text-white" />
                                   </div>
                                   <span className="text-slate-300 font-medium text-sm leading-relaxed">{item}</span>
                               </li>
                           ))}
                      </ul>
                      <Link to="/register?role=collector" className="relative z-10 w-full py-4 rounded-xl bg-emerald-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-emerald-500 transition-all text-center shadow-lg shadow-emerald-900/50">
                          Join as Collector
                      </Link>
                  </div>
              </div>
          </div>
      </section>

      {/* YIELD INDEX (Live Rates) */}
      <section id="market-rates" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
             <div className="bg-emerald-900 rounded-xl p-10 md:p-20 relative overflow-hidden text-left shadow-2xl">
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-400/20 rounded-full blur-[100px] -mr-32 -mt-32" />
                  <img src={FeatureEco} alt="Eco Economy" className="absolute bottom-0 right-0 w-96 h-96 object-contain opacity-20 translate-x-1/4 translate-y-1/4" />
                  
                  <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16 md:gap-24">
                      <div className="lg:w-1/2">
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-white/10 text-emerald-400 text-[9px] font-bold uppercase tracking-[2px] mb-8">
                            Market Rates
                          </div>
                          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight">Get <span className="text-white/40 font-medium">Full Value.</span></h2>
                          <p className="text-emerald-100/80 text-sm mb-10 leading-relaxed max-w-md font-medium">
                              Don't throw away money. Rates change daily. We ensure you get the best market price for your recyclables.
                          </p>
                          <Link to="/rates" className="bg-white text-emerald-900 px-8 py-4 rounded-lg font-bold text-[11px] uppercase tracking-widest hover:bg-emerald-50 transition shadow-lg inline-flex items-center gap-2">
                            Check Prices <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                      </div>

                      <div className="lg:w-1/2 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {rates.length > 0 ? rates.map((rate) => (
                            <div key={rate._id} className="bg-emerald-800/40 backdrop-blur-md p-6 rounded-lg border border-emerald-500/30 hover:bg-emerald-800/60 transition-all group">
                                <div className="text-[9px] font-bold text-emerald-200 uppercase tracking-widest mb-2 group-hover:text-white transition-colors">
                                    {rate.category}
                                </div>
                                <div className="flex items-baseline gap-1.5 mb-1">
                                    <span className="text-2xl font-bold text-white tracking-tight">₹{rate.price}</span>
                                    <span className="text-[10px] font-bold text-emerald-700/80 uppercase">/{rate.unit}</span>
                                </div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate">{rate.name}</div>
                            </div>
                          )) : (
                              <div className="col-span-2 text-center py-10">
                                  <div className="text-[10px] font-bold text-emerald-700/80 uppercase tracking-widest animate-pulse">Synchronizing Global Feed...</div>
                              </div>
                          )}
                      </div>
                  </div>
             </div>
        </div>
      </section>

      {/* FINAL PROTOCOL CTA */}
      <section className="py-40 bg-emerald-50/50 border-t border-emerald-100 relative overflow-hidden">
         <div className="max-w-7xl mx-auto px-6 sm:px-8 text-center relative z-10">
            <div className="max-w-3xl mx-auto">
                <h2 className="text-5xl font-bold text-emerald-950 mb-8 tracking-tight">Start Selling Today.</h2>
                <p className="text-base text-emerald-700/80 mb-12 font-medium">Join 12,000+ smart citizens making money from their waste.</p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Link to="/register" className="bg-emerald-600 text-white px-10 py-5 rounded-xl font-bold text-[11px] uppercase tracking-[3px] hover:bg-emerald-700 transition shadow-xl shadow-emerald-200">
                        Register Now
                    </Link>
                </div>
            </div>
            
            {/* Background Image Overlay */}
            <img src={FeatureRecycling} alt="Recycling Tech" className="absolute top-1/2 left-0 -translate-y-1/2 -ml-20 w-80 h-80 object-contain opacity-10 mix-blend-multiply" />
            <img src={FeatureRecycling} alt="Recycling Tech" className="absolute top-1/2 right-0 -translate-y-1/2 -mr-20 w-80 h-80 object-contain opacity-10 mix-blend-multiply scale-x-[-1]" />

         </div>
         {/* Background Detail */}
         <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-emerald-200 to-transparent" />
      </section>

      {/* FOOTER */}
      <footer className="bg-white py-24 border-t border-emerald-50">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
              <div className="flex flex-col md:flex-row justify-between items-start gap-16">
                  <div className="max-w-sm">
                      <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                            <Recycle className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-emerald-950 tracking-tight">Clean&Green.</span>
                      </div>
                      <p className="text-emerald-800/70 text-sm leading-relaxed font-medium">
                          Smart waste management for a cleaner city. We connect you with verified recyclers for fast pickup and best prices.
                      </p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-16">
                      <div>
                          <h4 className="text-[10px] font-bold text-emerald-950 uppercase tracking-widest mb-8">Platform</h4>
                          <ul className="space-y-4 text-xs font-semibold text-emerald-800/70">
                              <li><a href="#" className="hover:text-emerald-950">For Individuals</a></li>
                              <li><a href="#" className="hover:text-emerald-950">For Collectors</a></li>
                              <li><a href="#" className="hover:text-emerald-950">Live Prices</a></li>
                          </ul>
                      </div>
                      <div>
                          <h4 className="text-[10px] font-bold text-emerald-950 uppercase tracking-widest mb-8">Company</h4>
                          <ul className="space-y-4 text-xs font-semibold text-emerald-800/70">
                              <li><a href="#" className="hover:text-emerald-950">About Us</a></li>
                              <li><a href="#" className="hover:text-emerald-950">How it Works</a></li>
                              <li><a href="#" className="hover:text-emerald-950">Contact</a></li>
                          </ul>
                      </div>
                  </div>
              </div>
              <div className="border-t border-emerald-50 mt-24 pt-10 flex flex-col md:flex-row justify-between items-center text-[10px] font-bold text-emerald-700/60 uppercase tracking-widest">
                  <p>© 2024 Clean&Green. Engineering Chennai's Future.</p>
                  <div className="flex gap-8 mt-6 md:mt-0">
                      <a href="#" className="hover:text-emerald-950">Privacy Policy</a>
                      <a href="#" className="hover:text-emerald-950">Terms of Service</a>
                  </div>
              </div>
          </div>
      </footer>
    </div>
  );
};

export default LandingPage;
