import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Target, CheckSquare, BarChart2, ChevronDown, Check, Menu, X, Shield, PieChart } from 'lucide-react';

interface NavbarProps {
  currentRole: string;
  setCurrentRole: (role: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentRole, setCurrentRole }) => {
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Navigation Links array with all icons properly imported
  const navLinks = [
    { path: '/', label: 'Dashboard', icon: <BarChart2 size={18} /> },
    { path: '/goals', label: 'Goal Sheet', icon: <Target size={18} /> },
    { path: '/check-ins', label: 'Check-ins', icon: <CheckSquare size={18} /> },
    { path: '/admin', label: 'Admin Control', icon: <Shield size={18} /> },
    { path: '/analytics', label: 'Org Analytics', icon: <PieChart size={18} /> },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950 text-slate-300 shadow-lg border-b border-yellow-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Logo & Desktop Navigation */}
        <div className="flex items-center gap-8 lg:gap-12">
          {/* Mobile Menu Toggle Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-1 text-slate-400 hover:text-white focus:outline-none transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <Link to="/" className="flex items-center gap-2 text-white hover:text-yellow-400 transition-colors">
            <div className="w-8 h-8 bg-yellow-400 rounded-md flex items-center justify-center font-bold text-slate-900 shadow-sm text-lg">A</div>
            <span className="text-xl font-bold tracking-tight hidden sm:block">atomberg</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-1 h-full">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link 
                  key={link.path} 
                  to={link.path}
                  className={`flex items-center gap-2 px-3 lg:px-4 py-5 text-sm font-bold transition-all border-b-2 ${
                    isActive 
                      ? 'text-yellow-400 border-yellow-400 bg-slate-900' 
                      : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-900/50'
                  }`}
                >
                  {link.icon} {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <div 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group p-1 sm:p-2 hover:bg-slate-900 rounded-lg transition-colors border border-transparent hover:border-slate-800"
          >
            <div className="flex-col text-right hidden sm:flex">
              <span className="font-bold text-sm text-white leading-none group-hover:text-yellow-400 transition-colors">
                {currentRole === 'Employee' ? 'Amit Sharma' : currentRole === 'Manager' ? 'Priya Singh' : 'System Admin'}
              </span>
              <span className="text-[11px] font-bold text-yellow-500 tracking-wider uppercase mt-1.5">{currentRole}</span>
            </div>
            <div className="w-9 h-9 bg-slate-800 rounded-full border border-slate-700 overflow-hidden group-hover:border-yellow-400 transition-colors shrink-0">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentRole}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf`} alt="User Avatar" className="w-full h-full object-cover" />
            </div>
            <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-yellow-400' : ''}`} />
          </div>

          {/* Profile Switcher Popover Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden py-2 z-50 animate-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                Active Persona
              </div>
              {['Employee', 'Manager', 'Admin'].map(role => (
                <button 
                  key={role} 
                  onClick={() => {
                    setCurrentRole(role);
                    setIsDropdownOpen(false);
                    setIsMobileMenuOpen(false);
                  }} 
                  className={`w-full text-left px-4 py-2.5 text-sm font-bold transition-colors flex items-center justify-between ${
                    currentRole === role ? 'text-slate-900 bg-slate-50' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {role}
                  {currentRole === role && <Check size={16} className="text-emerald-500" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MOBILE EXPANDED MENU DRAWER */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-t border-slate-800/80 px-4 py-3 space-y-1 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Navigation Menu
          </div>
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  isActive 
                    ? 'bg-yellow-400 text-slate-900 shadow-md' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {link.icon} {link.label}
              </Link>
            );
          })}
          <div className="pt-2 mt-2 border-t border-slate-800 flex items-center justify-between px-3">
            <span className="text-xs text-slate-400 font-medium">Active Workspace View:</span>
            <span className="text-xs font-black bg-slate-800 border border-slate-700 text-yellow-400 px-2 py-0.5 rounded-md uppercase tracking-wider">{currentRole}</span>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;