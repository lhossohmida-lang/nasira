import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import toast from 'react-hot-toast';
import { FiSave } from 'react-icons/fi';
import LoadingSpinner from '../../components/LoadingSpinner';
import { wilayas } from '../../utils/constants';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    businessName: 'Nasira Tiba3a',
    phone: '',
    address: '',
    facebookPage: '',
    instagramPage: '',
    deliveryPrice: 0,
    deliveryPrices: {},
    lowStockLimit: 5,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetch() {
      try {
        const snap = await getDoc(doc(db, 'settings', 'general'));
        if (snap.exists()) setSettings(prev => ({ ...prev, ...snap.data() }));
      } catch (e) { console.error(e); } finally { setLoading(false); }
    }
    fetch();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const deliveryPrices = Object.fromEntries(
        Object.entries(settings.deliveryPrices || {})
          .filter(([, price]) => price !== '' && price !== null && price !== undefined)
          .map(([wilaya, price]) => [wilaya, Number(price || 0)])
      );
      await setDoc(doc(db, 'settings', 'general'), {
        ...settings,
        deliveryPrice: Number(settings.deliveryPrice),
        deliveryPrices,
        lowStockLimit: Number(settings.lowStockLimit),
        updatedAt: serverTimestamp(),
      });
      toast.success('تم حفظ الإعدادات');
    } catch (e) { console.error(e); toast.error('حدث خطأ'); }
    finally { setSaving(false); }
  };

  if (loading) return <LoadingSpinner text="جاري التحميل..." />;

  return (
    <div className="max-w-4xl">
      <h2 className="text-xl font-bold text-dark-900 mb-6">الإعدادات</h2>
      <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 shadow-sm space-y-5">
        <div>
          <label className="block text-sm font-medium text-dark-700 mb-1">اسم المتجر</label>
          <input value={settings.businessName} onChange={e => setSettings(p => ({ ...p, businessName: e.target.value }))}
            className="w-full px-4 py-3 border border-dark-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
        </div>
        <div>
          <label className="block text-sm font-medium text-dark-700 mb-1">رقم الهاتف</label>
          <input value={settings.phone} onChange={e => setSettings(p => ({ ...p, phone: e.target.value }))}
            className="w-full px-4 py-3 border border-dark-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
        </div>
        <div>
          <label className="block text-sm font-medium text-dark-700 mb-1">العنوان</label>
          <input value={settings.address} onChange={e => setSettings(p => ({ ...p, address: e.target.value }))}
            className="w-full px-4 py-3 border border-dark-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1">صفحة فيسبوك</label>
            <input value={settings.facebookPage} onChange={e => setSettings(p => ({ ...p, facebookPage: e.target.value }))} dir="ltr"
              className="w-full px-4 py-3 border border-dark-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1">صفحة إنستغرام</label>
            <input value={settings.instagramPage} onChange={e => setSettings(p => ({ ...p, instagramPage: e.target.value }))} dir="ltr"
              className="w-full px-4 py-3 border border-dark-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1">سعر توصيل افتراضي (د.ج)</label>
            <input type="number" value={settings.deliveryPrice} onChange={e => setSettings(p => ({ ...p, deliveryPrice: e.target.value }))}
              className="w-full px-4 py-3 border border-dark-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1">حد المخزون المنخفض</label>
            <input type="number" value={settings.lowStockLimit} onChange={e => setSettings(p => ({ ...p, lowStockLimit: e.target.value }))}
              className="w-full px-4 py-3 border border-dark-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
          </div>
        </div>
        <div className="rounded-2xl border border-dark-100 p-4 space-y-3">
          <div>
            <h3 className="font-bold text-dark-800">أسعار التوصيل حسب الولاية</h3>
            <p className="text-xs text-dark-400 mt-1">اترك الخانة فارغة لاستخدام السعر الافتراضي.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-1">
            {wilayas.map((wilaya) => (
              <label key={wilaya} className="flex items-center justify-between gap-3 rounded-xl bg-dark-50 px-3 py-2">
                <span className="text-sm font-medium text-dark-600 truncate">{wilaya}</span>
                <input
                  type="number"
                  min="0"
                  value={settings.deliveryPrices?.[wilaya] ?? ''}
                  onChange={e => setSettings(p => ({
                    ...p,
                    deliveryPrices: {
                      ...(p.deliveryPrices || {}),
                      [wilaya]: e.target.value,
                    },
                  }))}
                  placeholder={String(settings.deliveryPrice || 0)}
                  className="w-28 px-3 py-2 border border-dark-200 rounded-lg text-sm text-left focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </label>
            ))}
          </div>
        </div>
        <button type="submit" disabled={saving}
          className="flex items-center justify-center gap-2 w-full bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-50">
          <FiSave size={18} /> {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </button>
      </form>
    </div>
  );
}
