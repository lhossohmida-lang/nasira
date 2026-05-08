import { useLocation, Link } from 'react-router-dom';
import { FiCheckCircle, FiCopy } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function OrderSuccessPage() {
  const location = useLocation();
  const orderNumber = location.state?.orderNumber || '';

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(orderNumber);
    toast.success('تم نسخ رقم الطلب');
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-20" dir="rtl">
      <div className="max-w-md w-full mx-4 text-center">
        <div className="bg-white rounded-3xl p-8 shadow-lg">
          <div className="w-20 h-20 bg-success-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheckCircle className="text-success-500" size={40} />
          </div>
          <h1 className="text-2xl font-bold text-dark-900 mb-2">تم إرسال الطلب بنجاح!</h1>
          <p className="text-dark-500 mb-6">شكرا لك، سيتم التواصل معك قريبا</p>
          {orderNumber && (
            <div className="bg-dark-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-dark-500 mb-1">رقم الطلب</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-xl font-bold text-primary-600 font-mono">{orderNumber}</span>
                <button onClick={copyOrderNumber} className="p-1.5 rounded-lg hover:bg-dark-200 transition-colors">
                  <FiCopy size={16} className="text-dark-400" />
                </button>
              </div>
              <p className="text-xs text-dark-400 mt-2">احتفظ بهذا الرقم لتتبع طلبك</p>
            </div>
          )}
          <div className="flex flex-col gap-3">
            <Link to="/track-order" className="bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition-all">
              تتبع الطلب
            </Link>
            <Link to="/products" className="bg-dark-100 text-dark-700 py-3 rounded-xl font-semibold hover:bg-dark-200 transition-all">
              متابعة التسوق
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
