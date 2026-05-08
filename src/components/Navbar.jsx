import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { FiShoppingCart, FiMenu, FiX } from 'react-icons/fi';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { getItemCount } = useCart();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const itemCount = getItemCount();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { to: '/', label: 'الرئيسية' },
    { to: '/products', label: 'المنتجات' },
    { to: '/track-order', label: 'تتبع الطلب' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-500 ${
      scrolled 
        ? 'bg-white/80 backdrop-blur-2xl shadow-premium border-b border-dark-200/50' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-primary-500/25 group-hover:shadow-primary-500/40 group-hover:scale-105 transition-all duration-300">
              N
            </div>
            <span className="text-xl font-extrabold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              Nasira Tiba3a
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  isActive(link.to)
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-dark-500 hover:text-primary-600 hover:bg-primary-50/50'
                }`}
              >
                {link.label}
                {isActive(link.to) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary-500 rounded-full"></span>
                )}
              </Link>
            ))}
          </div>

          {/* Cart + Mobile Toggle */}
          <div className="flex items-center gap-2">
            <Link
              to="/cart"
              className="relative p-2.5 rounded-xl text-dark-500 hover:text-primary-600 hover:bg-primary-50 transition-all duration-300"
            >
              <FiShoppingCart size={22} />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-gradient-to-br from-accent-500 to-accent-600 text-white text-[10px] rounded-full flex items-center justify-center font-bold shadow-lg shadow-accent-500/30 animate-scale-in">
                  {itemCount}
                </span>
              )}
            </Link>
            <button
              className="md:hidden p-2.5 rounded-xl text-dark-500 hover:bg-dark-100 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ${
        mobileOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="px-4 py-3 space-y-1 bg-white/95 backdrop-blur-2xl border-t border-dark-200/50">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`block px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                isActive(link.to)
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-dark-500 hover:bg-dark-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
