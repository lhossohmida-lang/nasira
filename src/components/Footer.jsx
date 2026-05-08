import { Link } from 'react-router-dom';
import { FiFacebook, FiInstagram, FiPhone, FiMapPin } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="bg-dark-900 text-dark-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                N
              </div>
              <span className="text-xl font-bold text-white">Nasira Tiba3a</span>
            </div>
            <p className="text-dark-400 text-sm leading-relaxed">
              متخصصون في طباعة التيشرتات بأعلى جودة وأحدث التقنيات. اختر تصميمك المفضل ونحن نحوّله إلى واقع.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">روابط سريعة</h3>
            <div className="space-y-2">
              <Link to="/" className="block text-dark-400 hover:text-primary-400 transition-colors text-sm">الرئيسية</Link>
              <Link to="/products" className="block text-dark-400 hover:text-primary-400 transition-colors text-sm">المنتجات</Link>
              <Link to="/track-order" className="block text-dark-400 hover:text-primary-400 transition-colors text-sm">تتبع الطلب</Link>
              <Link to="/cart" className="block text-dark-400 hover:text-primary-400 transition-colors text-sm">السلة</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">تواصل معنا</h3>
            <div className="space-y-3">
              <a href="tel:+213000000000" className="flex items-center gap-2 text-dark-400 hover:text-primary-400 transition-colors text-sm">
                <FiPhone size={16} />
                <span>0000 000 000</span>
              </a>
              <div className="flex items-center gap-2 text-dark-400 text-sm">
                <FiMapPin size={16} />
                <span>الجزائر</span>
              </div>
              <div className="flex items-center gap-3 mt-4">
                <a href="#" className="w-9 h-9 rounded-lg bg-dark-800 flex items-center justify-center text-dark-400 hover:text-primary-400 hover:bg-dark-700 transition-all">
                  <FiFacebook size={18} />
                </a>
                <a href="#" className="w-9 h-9 rounded-lg bg-dark-800 flex items-center justify-center text-dark-400 hover:text-accent-400 hover:bg-dark-700 transition-all">
                  <FiInstagram size={18} />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-dark-800 mt-8 pt-6 text-center">
          <p className="text-dark-500 text-sm">
            © {new Date().getFullYear()} Nasira Tiba3a. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
}
