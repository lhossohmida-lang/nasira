import { useLocation, Link } from 'react-router-dom';
import { FiCheckCircle, FiCopy, FiSearch, FiShoppingBag } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function OrderSuccessPage() {
  const location = useLocation();
  const orderNumber = location.state?.orderNumber || '';

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(orderNumber);
    toast.success('تم نسخ رقم الطلب');
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-20 relative" dir="rtl">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-success-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-primary-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-md w-full mx-4 text-center relative z-10">
        <div className="bg-white rounded-3xl p-10 shadow-premium-lg animate-scale-in">
          {/* Success icon with glow */}
          <div className="relative inline-flex mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-success-50 to-emerald-50 rounded-full flex items-center justify-center">
              <FiCheckCircle className="text-success-500" size={48} />
            </div>
            <div className="absolute inset-0 w-24 h-24 bg-success-500/20 rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>
          </div>

          <h1 className="text-3xl font-extrabold text-dark-900 mb-3 animate-fade-in-up stagger-1" style={{ opacity: 0 }}>
            تم إرسال الطلب بنجاح!
          </h1>
          <p className="text-dark-400 mb-8 animate-fade-in-up stagger-2" style={{ opacity: 0 }}>
            شكرا لك، سيتم التواصل معك قريبا
          </p>

          {orderNumber && (
            <div className="bg-gradient-to-br from-dark-50 to-primary-50/30 rounded-2xl p-5 mb-8 animate-fade-in-up stagger-3" style={{ opacity: 0 }}>
              <p className="text-sm text-dark-400 mb-2">رقم الطلب</p>
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl font-extrabold text-primary-600 font-mono tracking-wider">{orderNumber}</span>
                <button onClick={copyOrderNumber} className="p-2 rounded-xl hover:bg-white transition-colors group">
                  <FiCopy size={18} className="text-dark-300 group-hover:text-primary-500 transition-colors" />
                </button>
              </div>
              <p className="text-xs text-dark-300 mt-3">احتفظ بهذا الرقم لتتبع طلبك</p>
            </div>
          )}

          <div className="flex flex-col gap-3 animate-fade-in-up stagger-4" style={{ opacity: 0 }}>
            <Link to="/track-order" className="flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 rounded-2xl font-bold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg shadow-primary-600/20 hover:-translate-y-0.5">
              <FiSearch size={18} />
              تتبع الطلب
            </Link>
            <Link to="/products" className="flex items-center justify-center gap-2 bg-dark-50 text-dark-600 py-4 rounded-2xl font-bold hover:bg-dark-100 transition-all">
              <FiShoppingBag size={18} />
              متابعة التسوق
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
