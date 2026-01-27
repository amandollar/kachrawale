import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { ArrowRight, Recycle, Truck, Users, Coins, TrendingUp, ShieldCheck, BarChart3, Globe, Building2, Calculator, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

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
                    <motion.div variants={itemVariants} className="inline-flex items-center gap-2 py-1.5 px-4 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-[2px] mb-8">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Decentralized Waste Network
                    </motion.div>
                    
                    <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl lg:text-7xl font-bold text-slate-900 mb-8 leading-[1.05] tracking-tight">
                        Material Yield <br />
                        <span className="text-slate-400 font-medium">Optimization.</span>
                    </motion.h1>
                    
                    <motion.p variants={itemVariants} className="text-base md:text-lg text-slate-500 mb-10 leading-relaxed max-w-lg font-medium">
                        Liquify your household waste into capital. We provide an enterprise-grade infrastructure for automated logistics, verified recycling, and real-time settlement.
                    </motion.p>
                    
                    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
                        <Link to="/register" className="group bg-slate-900 text-white px-8 py-4 rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2.5 shadow-xl shadow-slate-200">
                            Initiate Protocol <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link to="/rates" className="bg-white text-slate-600 px-8 py-4 rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-all border border-slate-200 text-center">
                            Yield Index
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
                    <div className="relative rounded-xl overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-200 bg-slate-900 aspect-video lg:aspect-[4/3] group">
                        <iframe 
                            width="100%" 
                            height="100%" 
                            src="https://www.youtube.com/embed/YO2RlZ4LdaE?si=AWNnV8KvOyAMM11W&autoplay=1&mute=1&loop=1&playlist=YO2RlZ4LdaE&controls=0&showinfo=0&rel=0" 
                            title="Kachrawale Intro" 
                            className="absolute inset-0 w-full h-full object-cover opacity-80"
                            allow="autoplay"
                        ></iframe>
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent pointer-events-none" />
                    </div>
                </motion.div>
            </div>
        </div>
        
        {/* Background Gradient */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[120px] -mr-40 -mt-40 pointer-events-none" />
      </section>

      {/* OPERATIONAL STANDARDS (Features) */}
      <section className="py-32 bg-slate-50 border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-20 gap-8">
                  <div className="max-w-2xl">
                    <div className="flex items-center gap-2 mb-4">
                        <Zap className="h-4 w-4 text-emerald-600" />
                        <span className="text-[10px] font-bold uppercase tracking-[2px] text-slate-400">Core Infrastructure</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Modern Recycling for Everyone</h2>
                    <p className="text-slate-500 font-medium mt-4 text-sm leading-relaxed">A simple and transparent way to manage waste, track your impact, and earn rewards for a cleaner planet.</p>
                  </div>
                  <Link to="/register" className="text-slate-900 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 group border-b-2 border-slate-900 pb-1">
                      Join the Team <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                      { icon: Truck, title: 'Optimized Logistics', desc: 'Predictive route mapping algorithms reduce operational overhead and carbon footprint by 35%.' },
                      { icon: Coins, title: 'T+0 Settlements', desc: 'Direct financial disbursement via secure gateways immediately post-verification.' },
                      { icon: BarChart3, title: 'Impact Analytics', desc: 'Real-time telemetry on material diversion and lifecycle sustainability metrics.' },
                      { icon: ShieldCheck, title: 'Regulatory Compliance', desc: 'Automated documentation stack for full compliance with environmental disposal standards.' },
                      { icon: Users, title: 'Verified Field Ops', desc: 'A network of background-verified personnel equipped for high-standard material handling.' },
                      { icon: Globe, title: 'Direct Market Access', desc: 'Direct-to-refinery channel eliminates intermediary friction, maximizing citizen yield.' }
                  ].map((feature, i) => (
                      <div key={i} className="bg-white p-10 rounded-xl border border-slate-200 shadow-sm hover:border-slate-900 transition-all group">
                          <div className="w-12 h-12 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center mb-8 group-hover:bg-slate-900 group-hover:text-white transition-all">
                              <feature.icon className="h-5 w-5" />
                          </div>
                          <h3 className="text-base font-bold text-slate-900 mb-3 tracking-tight">{feature.title}</h3>
                          <p className="text-slate-500 text-xs font-medium leading-relaxed">{feature.desc}</p>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* YIELD INDEX (Live Rates) */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
             <div className="bg-slate-900 rounded-xl p-10 md:p-20 relative overflow-hidden text-left shadow-2xl">
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[100px] -mr-32 -mt-32" />
                  
                  <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16 md:gap-24">
                      <div className="lg:w-1/2">
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-white/10 text-emerald-400 text-[9px] font-bold uppercase tracking-[2px] mb-8">
                            Market Integration
                          </div>
                          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight">Capture <span className="text-white/40 font-medium">Material Equity.</span></h2>
                          <p className="text-slate-400 text-sm mb-10 leading-relaxed max-w-md font-medium">
                              Don't discard value. Assets in the circular economy fluctuate based on global indices. We ensure you capture peak market value.
                          </p>
                          <Link to="/rates" className="bg-white text-slate-900 px-8 py-4 rounded-lg font-bold text-[11px] uppercase tracking-widest hover:bg-slate-100 transition shadow-lg inline-flex items-center gap-2">
                            Material Index <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                      </div>

                      <div className="lg:w-1/2 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {rates.length > 0 ? rates.map((rate) => (
                            <div key={rate._id} className="bg-white/5 backdrop-blur-sm p-6 rounded-lg border border-white/10 hover:bg-white/10 transition-all group">
                                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2 group-hover:text-emerald-400 transition-colors">
                                    {rate.category}
                                </div>
                                <div className="flex items-baseline gap-1.5 mb-1">
                                    <span className="text-2xl font-bold text-white tracking-tight">₹{rate.price}</span>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">/{rate.unit}</span>
                                </div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate">{rate.name}</div>
                            </div>
                          )) : (
                              <div className="col-span-2 text-center py-10">
                                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest animate-pulse">Synchronizing Global Feed...</div>
                              </div>
                          )}
                      </div>
                  </div>
             </div>
        </div>
      </section>

      {/* FINAL PROTOCOL CTA */}
      <section className="py-40 bg-slate-50 border-t border-slate-200 relative overflow-hidden">
         <div className="max-w-7xl mx-auto px-6 sm:px-8 text-center relative z-10">
            <div className="max-w-3xl mx-auto">
                <h2 className="text-5xl font-bold text-slate-900 mb-8 tracking-tight">Deploy to Dashboard.</h2>
                <p className="text-base text-slate-500 mb-12 font-medium">Join 12,000+ active nodes in the city wide material optimization network.</p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Link to="/register" className="bg-slate-900 text-white px-10 py-5 rounded-xl font-bold text-[11px] uppercase tracking-[3px] hover:bg-slate-800 transition shadow-xl shadow-slate-200">
                        Create Node Profile
                    </Link>
                </div>
            </div>
         </div>
         {/* Background Detail */}
         <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      </section>

      {/* FOOTER */}
      <footer className="bg-white py-24 border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
              <div className="flex flex-col md:flex-row justify-between items-start gap-16">
                  <div className="max-w-sm">
                      <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                            <Recycle className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-slate-900 tracking-tight">Kachrawale.</span>
                      </div>
                      <p className="text-slate-500 text-sm leading-relaxed font-medium">
                          Decentralized infrastructure for the circular economy. We provide the technical backbone for urban material recovery and sustainable logistics.
                      </p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-16">
                      <div>
                          <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-8">Ecosystem</h4>
                          <ul className="space-y-4 text-xs font-semibold text-slate-500">
                              <li><a href="#" className="hover:text-slate-900">Citizen Node</a></li>
                              <li><a href="#" className="hover:text-slate-900">Logistics Partner</a></li>
                              <li><a href="#" className="hover:text-slate-900">Yield Index</a></li>
                          </ul>
                      </div>
                      <div>
                          <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-8">Organization</h4>
                          <ul className="space-y-4 text-xs font-semibold text-slate-500">
                              <li><a href="#" className="hover:text-slate-900">Whitepaper</a></li>
                              <li><a href="#" className="hover:text-slate-900">Operations</a></li>
                              <li><a href="#" className="hover:text-slate-900">Compliance</a></li>
                          </ul>
                      </div>
                  </div>
              </div>
              <div className="border-t border-slate-50 mt-24 pt-10 flex flex-col md:flex-row justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <p>© 2024 Kachrawale. Engineering Chennai's Future.</p>
                  <div className="flex gap-8 mt-6 md:mt-0">
                      <a href="#" className="hover:text-slate-900">Privacy Protocol</a>
                      <a href="#" className="hover:text-slate-900">Terms of Service</a>
                  </div>
              </div>
          </div>
      </footer>
    </div>
  );
};

export default LandingPage;
