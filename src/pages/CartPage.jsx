import { useCart } from '../contexts/CartContext';
import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/constants';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag } from 'react-icons/fi';

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, getTotal } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-20" dir="rtl">
        <div className="text-7xl mb-6">🛒</div>
        <h2 className="text-2xl font-bold text-dark-800 mb-2">السلة فارغة</h2>
        <p className="text-dark-500 mb-6">لم تضف أي منتج بعد</p>
        <Link to="/products" className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-all">
          <FiShoppingBag size={18} /> تصفح المنتجات
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-dark-900 mb-8">سلة التسوق</h1>
        <div className="space-y-4 mb-8">
          {cartItems.map(item => (
            <div key={item.cartId} className="bg-white rounded-2xl p-4 shadow-sm flex gap-4">
              <div className="w-20 h-20 bg-dark-100 rounded-xl overflow-hidden flex-shrink-0">
                {item.imageUrl ? <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" /> :
                  <div className="w-full h-full flex items-center justify-center text-2xl">👕</div>}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-dark-800 truncate">{item.productName}</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="text-xs bg-dark-100 px-2 py-0.5 rounded-full">{item.size}</span>
                  <span className="text-xs bg-dark-100 px-2 py-0.5 rounded-full">{item.color}</span>
                  <span className="text-xs bg-dark-100 px-2 py-0.5 rounded-full">{item.printType}</span>
                </div>
                {item.note && <p className="text-xs text-dark-400 mt-1 truncate">📝 {item.note}</p>}
                {item.designPreview && <p className="text-xs text-primary-500 mt-1">🎨 تصميم مرفق</p>}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.cartId, item.quantity - 1)} className="w-8 h-8 rounded-lg bg-dark-100 flex items-center justify-center hover:bg-dark-200"><FiMinus size={14} /></button>
                    <span className="font-semibold w-6 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.cartId, item.quantity + 1)} className="w-8 h-8 rounded-lg bg-dark-100 flex items-center justify-center hover:bg-dark-200"><FiPlus size={14} /></button>
                  </div>
                  <span className="font-bold text-primary-600">{formatPrice(item.price * item.quantity)}</span>
                </div>
              </div>
              <button onClick={() => removeFromCart(item.cartId)} className="text-dark-400 hover:text-danger-500 transition-colors self-start p-1">
                <FiTrash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-dark-600">المجموع</span>
            <span className="text-2xl font-bold text-dark-900">{formatPrice(getTotal())}</span>
          </div>
          <Link to="/checkout" className="block w-full text-center bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 rounded-xl font-semibold text-lg hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg shadow-primary-600/20">
            إتمام الطلب
          </Link>
        </div>
      </div>
    </div>
  );
}
