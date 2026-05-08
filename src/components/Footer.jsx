import { Link } from 'react-router-dom';
import { FiFacebook, FiInstagram, FiPhone, FiMapPin, FiHeart } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-dark-900 text-dark-300 mt-auto">
      {/* Decorative gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent"></div>
      <div className="absolute top-0 right-[20%] w-64 h-32 bg-primary-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-[30%] w-48 h-24 bg-accent-500/5 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-primary-500/20">
                N
              </div>
              <span className="text-2xl font-extrabold text-white">Nasira Tiba3a</span>
            </div>
            <p className="text-dark-400 text-sm leading-relaxed max-w-xs">
              متخصصون في طباعة التيشرتات بأعلى جودة وأحدث التقنيات. اختر تصميمك المفضل ونحن نحوّله إلى واقع.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-bold mb-5 text-lg">روابط سريعة</h3>
            <div className="space-y-3">
              <Link to="/" className="block text-dark-400 hover:text-primary-400 hover:translate-x-[-4px] transition-all duration-300 text-sm">الرئيسية</Link>
              <Link to="/products" className="block text-dark-400 hover:text-primary-400 hover:translate-x-[-4px] transition-all duration-300 text-sm">المنتجات</Link>
              <Link to="/track-order" className="block text-dark-400 hover:text-primary-400 hover:translate-x-[-4px] transition-all duration-300 text-sm">تتبع الطلب</Link>
              <Link to="/cart" className="block text-dark-400 hover:text-primary-400 hover:translate-x-[-4px] transition-all duration-300 text-sm">السلة</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold mb-5 text-lg">تواصل معنا</h3>
            <div className="space-y-4">
              <a href="tel:+213000000000" className="flex items-center gap-3 text-dark-400 hover:text-primary-400 transition-colors text-sm group">
                <div className="w-9 h-9 rounded-xl bg-dark-800 group-hover:bg-primary-600/20 flex items-center justify-center transition-colors">
                  <FiPhone size={16} />
                </div>
                <span>0000 000 000</span>
              </a>
              <div className="flex items-center gap-3 text-dark-400 text-sm">
                <div className="w-9 h-9 rounded-xl bg-dark-800 flex items-center justify-center">
                  <FiMapPin size={16} />
                </div>
                <span>الجزائر</span>
              </div>
              <div className="flex items-center gap-3 mt-6">
                <a href="#" className="w-10 h-10 rounded-xl bg-dark-800 flex items-center justify-center text-dark-400 hover:text-white hover:bg-blue-600 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-600/20">
                  <FiFacebook size={18} />
                </a>
                <a href="#" className="w-10 h-10 rounded-xl bg-dark-800 flex items-center justify-center text-dark-400 hover:text-white hover:bg-gradient-to-br hover:from-purple-500 hover:to-pink-500 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-pink-500/20">
                  <FiInstagram size={18} />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-dark-800/50 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-dark-500 text-sm">
            © {new Date().getFullYear()} Nasira Tiba3a. جميع الحقوق محفوظة.
          </p>
          <p className="text-dark-600 text-xs flex items-center gap-1">
            صُنع بـ <FiHeart size={12} className="text-accent-500" /> في الجزائر
          </p>
        </div>
      </div>
    </footer>
  );
}
