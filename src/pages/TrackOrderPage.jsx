import { useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { getStatusInfo, formatDate, formatPrice } from '../utils/constants';
import toast from 'react-hot-toast';
import { FiSearch, FiPackage } from 'react-icons/fi';

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!orderNumber.trim()) { toast.error('أدخل رقم الطلب'); return; }
    setLoading(true);
    setSearched(true);
    try {
      const q = query(collection(db, 'orders'), where('orderNumber', '==', orderNumber.trim()));
      const snap = await getDocs(q);
      if (!snap.empty) {
        setOrder({ id: snap.docs[0].id, ...snap.docs[0].data() });
      } else {
        setOrder(null);
        toast.error('لم يتم العثور على الطلب');
      }
    } catch (e) { console.error(e); toast.error('حدث خطأ'); }
    finally { setLoading(false); }
  };

  const statusSteps = ['new', 'confirmed', 'printing', 'ready', 'shipped', 'delivered'];
  const currentStepIndex = order ? statusSteps.indexOf(order.status) : -1;

  return (
    <div className="min-h-screen py-8" dir="rtl">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiPackage className="text-primary-600" size={28} />
          </div>
          <h1 className="text-3xl font-bold text-dark-900 mb-2">تتبع الطلب</h1>
          <p className="text-dark-500">أدخل رقم الطلب لمعرفة حالته</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-3 mb-8">
          <input type="text" value={orderNumber} onChange={e => setOrderNumber(e.target.value)}
            placeholder="مثال: NT-260508-1234" dir="ltr"
            className="flex-1 px-4 py-3 border border-dark-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-center font-mono" />
          <button type="submit" disabled={loading}
            className="px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all disabled:opacity-50 flex items-center gap-2">
            <FiSearch size={18} />
            {loading ? 'بحث...' : 'بحث'}
          </button>
        </form>

        {order && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-dark-400">رقم الطلب</p>
                <p className="font-bold text-lg font-mono">{order.orderNumber}</p>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${getStatusInfo(order.status).color}`}>
                {getStatusInfo(order.status).label}
              </span>
            </div>

            {/* Progress */}
            {order.status !== 'cancelled' && (
              <div className="mb-6">
                <div className="flex items-center justify-between relative">
                  <div className="absolute top-4 right-4 left-4 h-1 bg-dark-200 rounded-full">
                    <div className="h-full bg-primary-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(0, (currentStepIndex / (statusSteps.length - 1)) * 100)}%` }} />
                  </div>
                  {statusSteps.map((step, i) => {
                    const info = getStatusInfo(step);
                    const isActive = i <= currentStepIndex;
                    return (
                      <div key={step} className="relative z-10 flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isActive ? 'bg-primary-500 text-white' : 'bg-dark-200 text-dark-400'}`}>
                          {i + 1}
                        </div>
                        <span className={`text-[10px] mt-1 ${isActive ? 'text-primary-600 font-medium' : 'text-dark-400'}`}>
                          {info.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Items */}
            <div className="border-t border-dark-200 pt-4">
              <h3 className="font-semibold text-dark-800 mb-3">المنتجات</h3>
              {order.items?.map((item, i) => (
                <div key={i} className="flex justify-between text-sm py-2 border-b border-dark-100 last:border-0">
                  <span className="text-dark-600">{item.productName} ({item.size}, {item.color}) × {item.quantity}</span>
                  <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold mt-3 text-lg">
                <span>المجموع</span>
                <span className="text-primary-600">{formatPrice(order.totalPrice)}</span>
              </div>
            </div>

            <div className="border-t border-dark-200 mt-4 pt-4 text-sm text-dark-500">
              <p>📅 تاريخ الطلب: {formatDate(order.createdAt)}</p>
            </div>
          </div>
        )}

        {searched && !order && !loading && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">📦</div>
            <p className="text-dark-500">لم يتم العثور على طلب بهذا الرقم</p>
          </div>
        )}
      </div>
    </div>
  );
}
