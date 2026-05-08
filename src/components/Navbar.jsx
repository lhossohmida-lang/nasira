import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { FiShoppingCart, FiMenu, FiX } from 'react-icons/fi';
import { useState } from 'react';

export default function Navbar() {
  const { getItemCount } = useCart();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const itemCount = getItemCount();

  const links = [
    { to: '/', label: 'الرئيسية' },
    { to: '/products', label: 'المنتجات' },
    { to: '/track-order', label: 'تتبع الطلب' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white/80 backdrop-blur-lg border-b border-dark-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-105 transition-transform">
              N
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              Nasira Tiba3a
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(link.to)
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-dark-600 hover:text-primary-600 hover:bg-primary-50/50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Cart + Mobile Toggle */}
          <div className="flex items-center gap-3">
            <Link
              to="/cart"
              className="relative p-2 rounded-xl text-dark-600 hover:text-primary-600 hover:bg-primary-50 transition-all"
            >
              <FiShoppingCart size={22} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-bounce">
                  {itemCount}
                </span>
              )}
            </Link>
            <button
              className="md:hidden p-2 rounded-lg text-dark-600 hover:bg-dark-100"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-dark-200 bg-white/95 backdrop-blur-lg">
          <div className="px-4 py-3 space-y-1">
            {links.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive(link.to)
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-dark-600 hover:bg-dark-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
