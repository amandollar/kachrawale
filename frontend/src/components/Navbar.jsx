import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, LogOut, User, Recycle, LayoutDashboard, IndianRupee, ShieldCheck } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <Recycle className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg sm:text-xl tracking-tight text-slate-800 hidden xs:block">Kachrawale</span>
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center md:space-x-2">
            {user ? (
              <>
                <Link 
                    to="/dashboard" 
                    title="Dashboard"
                    className="p-3 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                >
                  <LayoutDashboard className="h-5 w-5" />
                </Link>
                <Link 
                    to="/rates" 
                    title="Rates"
                    className="p-3 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                >
                  <IndianRupee className="h-5 w-5" />
                </Link>

                {user.role === 'admin' && (
                    <Link 
                        to="/admin" 
                        title="Admin Panel"
                        className="p-3 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                    >
                        <ShieldCheck className="h-5 w-5" />
                    </Link>
                )}
                
                <div className="h-8 w-[1px] bg-slate-100 mx-2" />
                
                <div className="flex items-center space-x-2">
                    <Link 
                        to="/profile" 
                        title="Profile"
                        className="flex items-center gap-3 px-4 py-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all font-semibold"
                    >
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                           <User className="h-4 w-4" /> 
                        </div>
                        <span className="text-sm">{user.name.split(' ')[0]}</span>
                    </Link>
                    <button
                        onClick={handleLogout}
                        title="Logout"
                        className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    >
                        <LogOut className="h-5 w-5" />
                    </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-6">
                <Link to="/login" className="text-slate-600 hover:text-emerald-600 text-sm font-semibold transition-colors">
                  Login
                </Link>
                <Link to="/register" className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-emerald-700 shadow-sm shadow-emerald-200 transition-all active:scale-95">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-50 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-slate-100">
          <div className="px-2 pt-2 pb-6 space-y-1 sm:px-3">

            {user ? (
              <>
                <Link to="/dashboard" onClick={toggleMenu} className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-semibold text-slate-700 hover:text-emerald-600 hover:bg-emerald-50">
                  <LayoutDashboard className="h-5 w-5 opacity-60" /> Dashboard
                </Link>
                <Link to="/rates" onClick={toggleMenu} className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-semibold text-slate-700 hover:text-emerald-600 hover:bg-emerald-50">
                  <IndianRupee className="h-5 w-5 opacity-60" /> Rates
                </Link>
                <Link to="/profile" onClick={toggleMenu} className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-semibold text-slate-700 hover:text-emerald-600 hover:bg-emerald-50">
                  <User className="h-5 w-5 opacity-60" /> Profile
                </Link>
                <div className="mt-4 pt-4 border-t border-slate-100 px-4">
                    <button
                        onClick={() => {
                            handleLogout();
                            toggleMenu();
                        }}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-base font-bold text-red-600 bg-red-50 hover:bg-red-100"
                    >
                        <LogOut className="h-5 w-5" /> Logout
                    </button>
                </div>
              </>
            ) : (
              <div className="space-y-2 p-2">
                <Link to="/login" onClick={toggleMenu} className="block px-4 py-3 rounded-lg text-base font-semibold text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 text-center">
                  Login
                </Link>
                <Link to="/register" onClick={toggleMenu} className="block px-4 py-3 rounded-lg text-base font-bold text-white bg-emerald-600 hover:bg-emerald-700 text-center shadow-md">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
