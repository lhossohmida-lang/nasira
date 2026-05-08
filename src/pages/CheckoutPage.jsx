import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { db, storage } from '../firebase';
import { collection, addDoc, doc, setDoc, getDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { wilayas, generateOrderNumber, formatPrice } from '../utils/constants';
import toast from 'react-hot-toast';
import { FiUser, FiPhone, FiMapPin, FiSend } from 'react-icons/fi';

export default function CheckoutPage() {
  const { cartItems, getTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    customerName: '', phone: '', wilaya: '', commune: '', address: '', note: ''
  });

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) { toast.error('السلة فارغة'); return; }
    if (!form.customerName || !form.phone || !form.wilaya || !form.commune || !form.address) {
      toast.error('يرجى ملء جميع الحقول المطلوبة'); return;
    }
    setSubmitting(true);
    try {
      const orderNumber = generateOrderNumber();
      let designImageUrl = '';

      // Upload design image if exists
      const itemWithDesign = cartItems.find(i => i.designFile);
      if (itemWithDesign?.designFile) {
        const fileRef = ref(storage, `designs/${orderNumber}_${Date.now()}`);
        await uploadBytes(fileRef, itemWithDesign.designFile);
        designImageUrl = await getDownloadURL(fileRef);
      }

      const items = cartItems.map(i => ({
        productId: i.productId, productName: i.productName, price: i.price,
        size: i.size, color: i.color, printType: i.printType, quantity: i.quantity,
        note: i.note || '', tshirtCost: i.tshirtCost, printingCost: i.printingCost,
        packagingCost: i.packagingCost,
      }));

      const totalPrice = getTotal();
      const totalCost = cartItems.reduce((sum, i) => sum + ((i.tshirtCost + i.printingCost + i.packagingCost) * i.quantity), 0);

      const orderData = {
        orderNumber, customerName: form.customerName, phone: form.phone,
        wilaya: form.wilaya, commune: form.commune, address: form.address,
        items, totalPrice, totalCost, deliveryCost: 0, extraCost: 0,
        netProfit: totalPrice - totalCost,
        status: 'new', note: form.note, designImageUrl,
        createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'orders'), orderData);

      // Save/update customer
      const customerQuery = collection(db, 'customers');
      const customerData = {
        name: form.customerName, phone: form.phone, wilaya: form.wilaya,
        commune: form.commune, address: form.address,
        updatedAt: serverTimestamp(),
      };

      // Use phone as a simple identifier
      const custRef = doc(db, 'customers', form.phone);
      const custSnap = await getDoc(custRef);
      if (custSnap.exists()) {
        await updateDoc(custRef, { ...customerData, totalOrders: increment(1), totalSpent: increment(totalPrice) });
      } else {
        await setDoc(custRef, { ...customerData, totalOrders: 1, totalSpent: totalPrice, createdAt: serverTimestamp() });
      }

      clearCart();
      navigate('/order-success', { state: { orderNumber } });
      toast.success('تم إرسال الطلب بنجاح!');
    } catch (error) {
      console.error(error);
      toast.error('حدث خطأ أثناء إرسال الطلب');
    } finally {
      setSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <div className="text-center"><h2 className="text-2xl font-bold mb-4">السلة فارغة</h2></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-dark-900 mb-8">إتمام الطلب</h1>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Form */}
          <form onSubmit={handleSubmit} className="md:col-span-3 space-y-5">
            <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-semibold text-dark-800 flex items-center gap-2"><FiUser /> معلومات الزبون</h2>
              <div>
                <label className="block text-sm font-medium text-dark-600 mb-1">الاسم الكامل *</label>
                <input name="customerName" value={form.customerName} onChange={handleChange} required
                  className="w-full px-4 py-3 border border-dark-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-600 mb-1">رقم الهاتف *</label>
                <input name="phone" value={form.phone} onChange={handleChange} required type="tel"
                  className="w-full px-4 py-3 border border-dark-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-semibold text-dark-800 flex items-center gap-2"><FiMapPin /> عنوان التوصيل</h2>
              <div>
                <label className="block text-sm font-medium text-dark-600 mb-1">الولاية *</label>
                <select name="wilaya" value={form.wilaya} onChange={handleChange} required
                  className="w-full px-4 py-3 border border-dark-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 appearance-none">
                  <option value="">اختر الولاية</option>
                  {wilayas.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-600 mb-1">البلدية *</label>
                <input name="commune" value={form.commune} onChange={handleChange} required
                  className="w-full px-4 py-3 border border-dark-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-600 mb-1">العنوان *</label>
                <input name="address" value={form.address} onChange={handleChange} required
                  className="w-full px-4 py-3 border border-dark-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-600 mb-1">ملاحظة (اختياري)</label>
                <textarea name="note" value={form.note} onChange={handleChange} rows={2}
                  className="w-full px-4 py-3 border border-dark-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-none" />
              </div>
            </div>
            <button type="submit" disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 rounded-xl font-semibold text-lg hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 shadow-lg shadow-primary-600/20">
              {submitting ? 'جاري الإرسال...' : <><FiSend size={18} /> إرسال الطلب</>}
            </button>
          </form>

          {/* Order Summary */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
              <h2 className="text-lg font-semibold text-dark-800 mb-4">ملخص الطلب</h2>
              <div className="space-y-3 mb-4">
                {cartItems.map(item => (
                  <div key={item.cartId} className="flex justify-between text-sm">
                    <span className="text-dark-600">{item.productName} × {item.quantity}</span>
                    <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-dark-200 pt-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>المجموع</span>
                  <span className="text-primary-600">{formatPrice(getTotal())}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
