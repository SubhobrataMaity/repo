import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EyeLogo, BrandLogo, Magnetic } from './Visuals';
import { Home as HomeIcon, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const Nav = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl">
      <motion.div 
        animate={{ 
          backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.4)',
          paddingTop: isScrolled ? '12px' : '16px',
          paddingBottom: isScrolled ? '12px' : '16px',
        }}
        className="glass-panel px-6 md:px-10 flex items-center justify-between rounded-full transition-all duration-300"
      >
        <div className="flex items-center gap-5">
          {!isHome && (
            <Magnetic>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest bg-white/30 hover:bg-white/50 transition-colors"
              >
                <HomeIcon size={16} className="sm:hidden" />
                <span className="hidden sm:inline">Back to Home</span>
                <span className="sr-only">Back to Home</span>
              </Link>
            </Magnetic>
          )}
          <Magnetic>
            <Link to="/" className="flex items-center group">
              <BrandLogo size={isScrolled ? 32 : 36} className="transition-all duration-300" />
            </Link>
          </Magnetic>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <Link
            to="/work"
            className={`text-xs font-bold uppercase tracking-widest hover:opacity-50 transition-opacity ${location.pathname === '/work' ? 'text-brand-yellow bg-brand-black px-4 py-2 rounded-full' : ''}`}
          >
            Work
          </Link>
          <Link
            to="/services"
            className={`text-xs font-bold uppercase tracking-widest hover:opacity-50 transition-opacity ${location.pathname === '/services' ? 'text-brand-yellow bg-brand-black px-4 py-2 rounded-full' : ''}`}
          >
            Services
          </Link>
          <Link
            to="/about"
            className={`text-xs font-bold uppercase tracking-widest hover:opacity-50 transition-opacity ${location.pathname === '/about' ? 'text-brand-yellow bg-brand-black px-4 py-2 rounded-full' : ''}`}
          >
            About
          </Link>
          <Magnetic>
            <Link to="/contact" className="px-6 py-2.5 bg-brand-black text-brand-yellow rounded-full text-xs font-bold uppercase tracking-widest hover:scale-105 transition-transform">
              Start a Trip
            </Link>
          </Magnetic>
        </div>

        <button 
          className="md:hidden p-2 hover:bg-black/5 rounded-full transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </motion.div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-20 left-0 w-full glass-panel p-8 md:hidden flex flex-col gap-6 items-center shadow-2xl"
          >
            {!isHome && (
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-xl font-bold uppercase tracking-widest hover:text-brand-yellow transition-colors"
              >
                Back to Home
              </Link>
            )}
            <Link
              to="/work"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`text-xl font-bold uppercase tracking-widest hover:text-brand-yellow transition-colors ${location.pathname === '/work' ? 'text-brand-yellow' : ''}`}
            >
              Work
            </Link>
            <Link
              to="/services"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-xl font-bold uppercase tracking-widest hover:text-brand-yellow transition-colors"
            >
              Services
            </Link>
            <Link
              to="/about"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-xl font-bold uppercase tracking-widest hover:text-brand-yellow transition-colors"
            >
              About
            </Link>
            <Link 
              to="/contact" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full py-4 bg-brand-black text-brand-yellow rounded-2xl text-sm font-bold uppercase tracking-widest flex items-center justify-center"
            >
              Start a Trip
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export const Footer = () => {
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  const mailtoHref = `mailto:${contactEmail ?? ''}?subject=${encodeURIComponent('Inquiry')}&body=`;

  return (
    <footer className="bg-brand-black text-brand-yellow pt-32 pb-12 px-6 md:px-12 relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute -bottom-24 -right-24 opacity-5 pointer-events-none">
        <BrandLogo size={600} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-32">
          {/* Brand Column */}
          <div className="lg:col-span-5 space-y-12">
            <div className="flex items-center gap-6">
              <div className="bg-brand-yellow rounded-3xl p-3 shadow-[0_10px_30px_rgba(255,209,0,0.2)]">
                <BrandLogo size={56} />
              </div>
              <span className="text-4xl font-display font-bold tracking-tighter">ANIMATRIPS</span>
            </div>
            <p className="text-2xl text-brand-yellow/60 max-w-sm leading-relaxed font-medium">
              Giving brands a <span className="italic-serif text-white">soul</span> through character-driven storytelling and high-end digital craft.
            </p>
            <div className="flex gap-8">
              {['Instagram', 'Twitter', 'LinkedIn'].map((platform) => (
                <Magnetic key={platform}>
                  <a href="#" className="text-xs font-bold uppercase tracking-[0.2em] hover:text-white transition-colors relative group">
                    {platform}
                    <span className="absolute -bottom-2 left-0 w-0 h-px bg-white group-hover:w-full transition-all duration-300" />
                  </a>
                </Magnetic>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-12">
            <div className="space-y-8">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-30">Navigation</h4>
              <ul className="space-y-5 text-sm font-bold uppercase tracking-[0.15em]">
                <li><Link to="/work" className="hover:text-white transition-colors">Work</Link></li>
                <li><Link to="/services" className="hover:text-white transition-colors">Services</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link to="/journal" className="hover:text-white transition-colors">Journal</Link></li>
              </ul>
            </div>
            <div className="space-y-8">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-30">Contact</h4>
              <ul className="space-y-5 text-sm font-bold uppercase tracking-[0.15em]">
                <li><a href={mailtoHref} className="hover:text-white transition-colors">Email Us</a></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Book a Call</Link></li>
              </ul>
            </div>
            <div className="space-y-8">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-30">Legal</h4>
              <ul className="space-y-5 text-sm font-bold uppercase tracking-[0.15em]">
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-brand-yellow/10 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[10px] uppercase tracking-[0.4em] opacity-30">
            © 2026 Animatrips Agency. All rights reserved.
          </p>
          <Magnetic>
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-30 hover:opacity-100 transition-opacity flex items-center gap-3 group"
            >
              Back to top <span className="group-hover:-translate-y-1 transition-transform">↑</span>
            </button>
          </Magnetic>
        </div>
      </div>
    </footer>
  );
};
