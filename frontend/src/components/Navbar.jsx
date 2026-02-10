import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, LogOut, User, Recycle, LayoutDashboard, IndianRupee, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = () => setIsOpen(!isOpen);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('nav')) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <nav className="bg-white/95 backdrop-blur-lg border-b border-slate-200/50 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2.5 group">
              <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200">
                <Recycle className="h-5 w-5 text-white group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <span className="font-semibold text-lg tracking-tight text-slate-900 group-hover:text-emerald-500 transition-colors duration-200">CleanLink</span>
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center md:space-x-1">
            {user ? (
              <>
                <Link 
                    to="/dashboard" 
                    title="Dashboard"
                    className={cn(
                      "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 relative",
                      location.pathname === '/dashboard' 
                        ? "text-emerald-500 bg-emerald-50 font-semibold" 
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/80"
                    )}
                >
                  <div className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </div>
                </Link>
                <Link 
                    to="/rates" 
                    title="Rates"
                    className={cn(
                      "px-4 py-2 text-sm font-medium rounded-lg transition-all",
                      location.pathname === '/rates' 
                        ? "text-emerald-500 bg-emerald-50" 
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    )}
                >
                  <div className="flex items-center gap-2">
                    <IndianRupee className="h-4 w-4" />
                    <span>Rates</span>
                  </div>
                </Link>

                {user.role === 'admin' && (
                    <Link 
                        to="/admin" 
                        title="Admin Panel"
                        className={cn(
                          "px-4 py-2 text-sm font-medium rounded-lg transition-all",
                          location.pathname === '/admin' 
                            ? "text-emerald-500 bg-emerald-50" 
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                        )}
                    >
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4" />
                          <span>Admin</span>
                        </div>
                    </Link>
                )}
                
                <div className="h-6 w-px bg-slate-200 mx-2" />
                
                <div className="flex items-center space-x-2">
                    <Link 
                        to="/profile" 
                        title="Profile"
                        className="flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition-all duration-200 group/profile"
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center border border-emerald-200 group-hover/profile:ring-2 group-hover/profile:ring-emerald-200 transition-all duration-200">
                           {user.profilePicture ? (
                             <img src={user.profilePicture} alt={user.name} className="w-full h-full rounded-full object-cover" />
                           ) : (
                             <User className="h-4 w-4 text-emerald-500" />
                           )}
                        </div>
                        <span className="text-sm font-medium group-hover/profile:text-slate-900 transition-colors truncate max-w-[120px]">{user.name?.split(' ')[0] || 'User'}</span>
                    </Link>
                    <button
                        onClick={handleLogout}
                        title="Logout"
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                        <LogOut className="h-4 w-4" />
                    </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-6">
                {location.pathname === '/' && (
                    <>
                        <a href="#features" className="text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors">
                            Features
                        </a>
                        <a href="#benefits" className="text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors">
                            Benefits
                        </a>
                        <a href="#market-rates" className="text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors">
                            Rates
                        </a>
                    </>
                )}
                <Link to="/login" className="text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors">
                  Login
                </Link>
                <Link to="/register" className="bg-emerald-500 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-400 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 focus:outline-none transition-colors"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-5 w-5" /> : <Menu className="block h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white border-t border-slate-200/50 shadow-lg overflow-hidden"
          >
          <div className="px-4 pt-2 pb-4 space-y-1">

            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  onClick={toggleMenu} 
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    location.pathname === '/dashboard'
                      ? "text-emerald-600 bg-emerald-50"
                      : "text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  <LayoutDashboard className="h-4 w-4" /> Dashboard
                </Link>
                <Link 
                  to="/rates" 
                  onClick={toggleMenu} 
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    location.pathname === '/rates'
                      ? "text-emerald-600 bg-emerald-50"
                      : "text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  <IndianRupee className="h-4 w-4" /> Rates
                </Link>
                <Link 
                  to="/profile" 
                  onClick={toggleMenu} 
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                >
                  <User className="h-4 w-4" /> Profile
                </Link>
                <div className="mt-4 pt-4 border-t border-slate-200 px-4">
                    <button
                        onClick={() => {
                            handleLogout();
                            toggleMenu();
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                    >
                        <LogOut className="h-4 w-4" /> Logout
                    </button>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                {location.pathname === '/' && (
                    <>
                        <a href="#features" onClick={toggleMenu} className="block px-4 py-3 rounded-lg text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 text-center transition-colors">
                            Features
                        </a>
                        <a href="#benefits" onClick={toggleMenu} className="block px-4 py-3 rounded-lg text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 text-center transition-colors">
                            Benefits
                        </a>
                        <a href="#market-rates" onClick={toggleMenu} className="block px-4 py-3 rounded-lg text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 text-center transition-colors">
                            Rates
                        </a>
                    </>
                )}
                <Link to="/login" onClick={toggleMenu} className="block px-4 py-3 rounded-lg text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 text-center transition-colors">
                  Login
                </Link>
                <Link to="/register" onClick={toggleMenu} className="block px-4 py-3 rounded-lg text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-400 text-center shadow-sm transition-colors">
                  Register
                </Link>
              </div>
            )}
          </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
