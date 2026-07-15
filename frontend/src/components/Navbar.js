import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ease-in-out ${
      isScrolled 
        ? 'glass-nav scrolled py-3 bg-gray-900/80 backdrop-blur-2xl border-b border-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.8)]' 
        : 'glass-nav py-6 bg-gradient-to-b from-black/80 to-transparent'
    }`}>
      <div className="container mx-auto px-6 md:px-12 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3 group">
          <img 
            src="https://congreso.unibe.edu.ec/wp-content/uploads/2023/03/logo-unibe-color.png" 
            alt="UNIBE" 
            className="h-10 w-auto object-contain transition-all duration-300 group-hover:scale-105"
          />
        </Link>
        
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/" className={`text-sm tracking-wide font-semibold transition-all duration-300 hover:text-white ${location.pathname === '/' ? 'text-white border-b-2 border-stream-blue pb-1' : 'text-gray-400 hover:border-b-2 hover:border-gray-500 pb-1 border-b-2 border-transparent'}`}>Inicio</Link>
          <Link to="/channels" className={`text-sm tracking-wide font-semibold transition-all duration-300 hover:text-white ${location.pathname === '/channels' ? 'text-white border-b-2 border-stream-blue pb-1' : 'text-gray-400 hover:border-b-2 hover:border-gray-500 pb-1 border-b-2 border-transparent'}`}>TV en Vivo</Link>
          <Link to="/radio" className={`text-sm tracking-wide font-semibold transition-all duration-300 hover:text-white ${location.pathname === '/radio' ? 'text-white border-b-2 border-stream-blue pb-1' : 'text-gray-400 hover:border-b-2 hover:border-gray-500 pb-1 border-b-2 border-transparent'}`}>Radio</Link>
          <Link to="/admin" className={`text-sm tracking-wide font-semibold transition-all duration-300 hover:text-white ${location.pathname.startsWith('/admin') ? 'text-white border-b-2 border-stream-blue pb-1' : 'text-gray-400 hover:border-b-2 hover:border-gray-500 pb-1 border-b-2 border-transparent'}`}>Admin</Link>
        </div>

        <div className="flex items-center space-x-5">
          <button className="text-gray-400 hover:text-white hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <div className="relative group cursor-pointer">
            <div className="absolute inset-0 bg-stream-blue rounded-full blur opacity-40 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-gray-900 to-gray-800 border-2 border-gray-700/50 group-hover:border-stream-blue/50 flex items-center justify-center transition-all duration-300 shadow-inner">
              <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-stream-blue to-blue-400">U</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
