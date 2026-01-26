import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { ArrowRight, Recycle, Truck, Users, Coins, TrendingUp, ShieldCheck, BarChart3, Globe, Building2, Calculator } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);
    
  // Animation Variants
  const containerVariants = {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const [rates, setRates] = useState([]);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const { data } = await api.get('/rates');
        if (data.success) {
           // Take only top 4 for the main landing page display, or specific ones
           setRates(data.data.slice(0, 4));
        }
      } catch (error) {
        console.error("Failed to fetch rates", error);
        // Fallback or leave empty (will show nothing)
      }
    };
    fetchRates();
  }, []);

  const getCategoryColor = (category) => {
      switch(category) {
          case 'Paper': return 'text-gray-100';
          case 'Plastic': return 'text-blue-200';
          case 'Metal': return 'text-saffron-200';
          case 'E-Waste': return 'text-purple-200';
          default: return 'text-white';
      }
  };

  const itemVariants = {
      hidden: { opacity: 0, y: 10 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-white">
      
      {/* SHARP HERO SECTION WITH VIDEO */}
      <section className="relative pt-24 pb-16 lg:pt-40 lg:pb-32 overflow-hidden border-b border-gray-100">
        <div className="absolute inset-0 bg-dot-primary/[0.2] -z-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/80 to-white -z-10" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                
                {/* Text Content */}
                <motion.div 
                   className="w-full lg:w-1/2 text-left"
                   initial="hidden"
                   animate="visible"
                   variants={containerVariants}
                >
                    <motion.div variants={itemVariants} className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-xs md:text-sm font-semibold mb-6 md:mb-8 tracking-wide">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        INDIA'S TRUSTED WASTE NETWORK
                    </motion.div>
                    
                    <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl lg:text-7xl font-display font-bold text-gray-900 mb-6 leading-[1.1] tracking-tight">
                        Turn Your Waste <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-green-600 to-saffron-600">Into Wealth.</span>
                    </motion.h1>
                    
                    <motion.p variants={itemVariants} className="text-lg md:text-xl text-gray-500 mb-8 md:mb-10 leading-relaxed max-w-lg">
                        Join the smart circular economy. We provide verified door-to-door collection, guaranteed recycling, and instant payments for your scrap.
                    </motion.p>
                    
                    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
                        {user ? (
                             <Link to="/dashboard" className="group bg-green-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-green-600/20 hover:shadow-2xl">
                                Go to Dashboard <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        ) : (
                            <>
                                <Link to="/register" className="group bg-gray-900 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-gray-900/20 hover:shadow-2xl">
                                    Schedule Pickup <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link to="/login" className="bg-white text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-all border border-gray-200 text-center hover:border-gray-300">
                                    Partner Login
                                </Link>
                            </>
                        )}
                    </motion.div>
                </motion.div>

                {/* Hero Video */}
                <motion.div 
                    className="w-full lg:w-1/2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white ring-1 ring-gray-100 bg-gray-900 aspect-video group">
                        <iframe 
                            width="100%" 
                            height="100%" 
                            src="https://www.youtube.com/embed/YO2RlZ4LdaE?si=AWNnV8KvOyAMM11W&autoplay=1&mute=1&loop=1&playlist=YO2RlZ4LdaE&controls=0&showinfo=0&rel=0" 
                            title="Kachrawale Intro" 
                            frameBorder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                            allowFullScreen
                            className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition duration-500 scale-105 group-hover:scale-100"
                        ></iframe>
                    </div>
                </motion.div>
            </div>
        </div>
      </section>

      {/* PARTNERS MARQUEE */}
      <section className="py-10 border-b border-gray-100 bg-white overflow-hidden">
        <div className="container mx-auto px-6 mb-6 text-center">
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Powering Smart Cities Across India</p>
        </div>
        <div className="relative flex overflow-x-hidden group">
            <div className="py-2 animate-marquee whitespace-nowrap flex items-center gap-16 px-16">
                {['Swachh Bharat', 'NDMC New Delhi', 'BMC Mumbai', 'BBMP Bengaluru', 'GHMC Hyderabad', 'KMC Kolkata', 'AMC Ahmedabad', 'Clean India'].map((partner, i) => (
                    <div key={i} className="flex items-center gap-3 opacity-50 hover:opacity-100 transition duration-300 grayscale hover:grayscale-0 cursor-pointer">
                        <Building2 className="h-8 w-8 text-gray-400" />
                        <span className="text-xl font-bold text-gray-400 font-display">{partner}</span>
                    </div>
                ))}
                 {['Swachh Bharat', 'NDMC New Delhi', 'BMC Mumbai', 'BBMP Bengaluru', 'GHMC Hyderabad', 'KMC Kolkata', 'AMC Ahmedabad', 'Clean India'].map((partner, i) => (
                    <div key={`dup-${i}`} className="flex items-center gap-3 opacity-50 hover:opacity-100 transition duration-300 grayscale hover:grayscale-0 cursor-pointer">
                        <Building2 className="h-8 w-8 text-gray-400" />
                        <span className="text-xl font-bold text-gray-400 font-display">{partner}</span>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* FEATURE GRID (Vercel Style + Gradient Borders) */}
      <section className="py-24 bg-slate-50">
          <div className="container mx-auto px-6">
              <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                  <div className="max-w-2xl">
                      <h2 className="text-4xl font-display font-bold text-gray-900 mb-4">Technology that Cleans Cities</h2>
                      <p className="text-xl text-gray-500">We've digitized the entire waste supply chain to make recycling profitable for everyone.</p>
                  </div>
                  <Link to="/features" className="text-primary-600 font-bold hover:text-primary-700 flex items-center gap-2 group">
                      Explore Capabilities <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                  {[
                      { icon: Truck, title: 'Smart Logistics', desc: 'AI-optimized pickup routes that reduce fuel consumption by 40%.', color: 'text-blue-600', bg: 'bg-blue-50' },
                      { icon: Coins, title: 'Instant Payments', desc: 'Get paid via UPI immediately after your waste is weighed and collected.', color: 'text-green-600', bg: 'bg-green-50' },
                      { icon: BarChart3, title: 'Live Impact Data', desc: 'Track your personal contribution to carbon reduction in real-time.', color: 'text-purple-600', bg: 'bg-purple-50' },
                      { icon: ShieldCheck, title: 'Regulatory Compliance', desc: 'Automated documentation for SWM Rules 2016 compliance.', color: 'text-saffron-600', bg: 'bg-saffron-50' },
                      { icon: Users, title: 'Verified Workforce', desc: 'A database of KYC-verified, trained, and uniformed collectors.', color: 'text-teal-600', bg: 'bg-teal-50' },
                      { icon: Globe, title: 'Circular Marketplace', desc: 'Direct B2B connection between segregators and recycling plants.', color: 'text-indigo-600', bg: 'bg-indigo-50' }
                  ].map((feature, i) => (
                      <div key={i} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
                          <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-${feature.color.split('-')[1]}-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500`} />
                          <div className={`w-14 h-14 ${feature.bg} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition duration-300`}>
                              <feature.icon className={`h-7 w-7 ${feature.color}`} />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                          <p className="text-gray-500 leading-relaxed font-medium">{feature.desc}</p>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* METRICS & IMPACT (Split Layout) */}
      <section className="py-24 bg-white border-y border-gray-100">
        <div className="container mx-auto px-6">
             <div className="bg-gray-900 rounded-3xl p-12 md:p-20 relative overflow-hidden text-center md:text-left shadow-2xl shadow-gray-900/10">
                  {/* Abstract Shapes */}
                  <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-600/20 rounded-full blur-[100px] -mr-32 -mt-32" />
                  <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-saffron-500/10 rounded-full blur-[80px] -ml-20 -mb-20" />

                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-16">
                      <div className="md:w-1/2">
                          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">Don't Dump It.<br/>Cash It.</h2>
                          <p className="text-gray-300 text-lg mb-10 leading-relaxed max-w-md">
                              Your household waste has market value. We ensure it reaches the right recyclers so you get the best price, transparently.
                          </p>
                          <button className="bg-white text-gray-900 px-8 py-4 rounded-lg font-bold hover:bg-gray-50 transition flex items-center gap-2 mx-auto md:mx-0 shadow-lg group">
                              <Calculator className="h-5 w-5 group-hover:rotate-12 transition-transform" /> Check Today's Rates
                          </button>
                      </div>

                      <div className="md:w-1/2 w-full">
                          <div className="grid grid-cols-2 gap-3 sm:gap-4">
                              {rates.length > 0 ? rates.map((rate) => (
                                <div key={rate._id} className="bg-white/10 backdrop-blur-lg p-4 sm:p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition duration-300">
                                    <div className={`text-2xl sm:text-3xl font-bold ${getCategoryColor(rate.category)} mb-1 break-words`}>
                                        ₹{rate.price}/{rate.unit}
                                    </div>
                                    <div className="text-xs sm:text-sm text-gray-300 font-medium tracking-wide">{rate.name}</div>
                                </div>
                              )) : (
                                  <div className="col-span-2 text-center text-gray-400">Loading live rates...</div>
                              )}
                          </div>
                          <p className="text-gray-500 text-xs mt-4 text-center">* Live Chennai market rates. Prices updated daily.</p>
                      </div>
                  </div>
             </div>
        </div>
      </section>

      {/* ROLES: IMAGE CARDS (Sharp) */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
            <div className="text-center mb-16">
                <h2 className="text-4xl font-display font-bold text-gray-900">One Platform, Two Roles</h2>
                <p className="text-gray-500 mt-4">Bridging the gap between waste generators and processors.</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {[
                    { role: 'Households', img: '/customer.png', sub: 'Dispose & Earn', bg: 'bg-emerald-900' },
                    { role: 'Waste Collectors', img: '/rag-picker.png', sub: 'Route & Collect', bg: 'bg-blue-900' }
                ].map((item, i) => (
                    <div key={i} className="group relative h-[500px] rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100">
                        <img src={item.img} alt={item.role} className="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-105" />
                        <div className={`absolute inset-0 opacity-10 ${item.bg} group-hover:opacity-30 transition duration-500`} />
                        <div className="absolute inset-0 flex flex-col justify-end p-8 bg-gradient-to-t from-black/95 via-black/40 to-transparent">
                            <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                <p className="text-primary-400 font-bold uppercase tracking-wider text-xs mb-2">{item.sub}</p>
                                <h3 className="text-white text-3xl font-bold mb-4">{item.role}</h3>
                                <Link to="/register" className="inline-flex items-center gap-2 text-white font-semibold border border-white/20 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-lg hover:bg-white hover:text-black transition-all">
                                    Get Started <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 bg-slate-50 border-t border-gray-200">
         <div className="container mx-auto px-6 text-center max-w-4xl">
             <h2 className="text-5xl font-display font-bold text-gray-900 mb-8">Ready to Clean Up?</h2>
             <p className="text-xl text-gray-500 mb-12">Join 12,000+ active users making their cities cleaner and wallets thicker.</p>
             <div className="flex flex-col sm:flex-row justify-center gap-4">
                 <Link to="/register" className="bg-primary-600 text-white px-10 py-5 rounded-xl font-bold text-lg hover:bg-primary-700 transition shadow-lg shadow-primary-600/30">
                     Create Free Account
                 </Link>
             </div>
         </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-200 py-16">
          <div className="container mx-auto px-6">
              <div className="flex flex-col md:flex-row justify-between items-start gap-12">
                  <div className="max-w-sm">
                      <span className="text-2xl font-display font-bold text-gray-900 block mb-4">Kachrawale.</span>
                      <p className="text-gray-500 leading-relaxed">
                          The digital backbone for India's Swachh Bharat mission. Connecting the informal sector with modern technology.
                      </p>
                  </div>
                  <div className="grid grid-cols-2 gap-16">
                      <div>
                          <h4 className="font-bold text-gray-900 mb-6">Platform</h4>
                          <ul className="space-y-4 text-gray-500">
                              <li><a href="#" className="hover:text-primary-600">For Citizens</a></li>
                              <li><a href="#" className="hover:text-primary-600">For Collectors</a></li>
                              <li><a href="#" className="hover:text-primary-600">Pricing</a></li>
                          </ul>
                      </div>
                      <div>
                          <h4 className="font-bold text-gray-900 mb-6">Company</h4>
                          <ul className="space-y-4 text-gray-500">
                              <li><a href="#" className="hover:text-primary-600">About Us</a></li>
                              <li><a href="#" className="hover:text-primary-600">Careers</a></li>
                              <li><a href="#" className="hover:text-primary-600">Contact</a></li>
                          </ul>
                      </div>
                  </div>
              </div>
              <div className="border-t border-gray-100 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
                  <p>© 2024 Kachrawale. All rights reserved.</p>
                  <div className="flex gap-6 mt-4 md:mt-0">
                      <a href="#" className="hover:text-gray-900">Privacy Policy</a>
                      <a href="#" className="hover:text-gray-900">Terms of Service</a>
                  </div>
              </div>
          </div>
      </footer>
    </div>
  );
};

export default LandingPage;
