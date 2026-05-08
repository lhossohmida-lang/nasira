import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';
import { categories, tshirtSizes, tshirtColors, formatPrice } from '../../utils/constants';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit, FiTrash2, FiX, FiUpload } from 'react-icons/fi';
import LoadingSpinner from '../../components/LoadingSpinner';

const emptyProduct = {
  name: '', description: '', category: categories[0], basePrice: 0, tshirtCost: 0,
  printingCost: 0, packagingCost: 0, sizes: ['S', 'M', 'L', 'XL'], colors: ['أبيض', 'أسود'],
  isActive: true, imageUrl: '',
};

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ ...emptyProduct });
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchProducts = async () => {
    try {
      const snap = await getDocs(collection(db, 'products'));
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name) { toast.error('أدخل اسم المنتج'); return; }
    setSaving(true);
    try {
      let imageUrl = form.imageUrl;
      if (imageFile) {
        const fileRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
        await uploadBytes(fileRef, imageFile);
        imageUrl = await getDownloadURL(fileRef);
      }
      const data = {
        ...form, imageUrl,
        basePrice: Number(form.basePrice), tshirtCost: Number(form.tshirtCost),
        printingCost: Number(form.printingCost), packagingCost: Number(form.packagingCost),
        updatedAt: serverTimestamp(),
      };
      if (editId) {
        await updateDoc(doc(db, 'products', editId), data);
        toast.success('تم تعديل المنتج');
      } else {
        // Build initial stock
        const stock = {};
        form.sizes.forEach(s => { stock[s] = {}; form.colors.forEach(c => { stock[s][c] = 10; }); });
        await addDoc(collection(db, 'products'), { ...data, stock, createdAt: serverTimestamp() });
        toast.success('تم إضافة المنتج');
      }
      resetForm();
      fetchProducts();
    } catch (e) { console.error(e); toast.error('حدث خطأ'); }
    finally { setSaving(false); }
  };

  const handleEdit = (product) => {
    setEditId(product.id);
    setForm({
      name: product.name, description: product.description || '', category: product.category,
      basePrice: product.basePrice, tshirtCost: product.tshirtCost || 0,
      printingCost: product.printingCost || 0, packagingCost: product.packagingCost || 0,
      sizes: product.sizes || [], colors: product.colors || [],
      isActive: product.isActive !== false, imageUrl: product.imageUrl || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('حذف هذا المنتج؟')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success('تم الحذف');
    } catch (e) { toast.error('حدث خطأ'); }
  };

  const resetForm = () => { setShowForm(false); setEditId(null); setForm({ ...emptyProduct }); setImageFile(null); };

  const toggleSize = (size) => {
    setForm(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size) ? prev.sizes.filter(s => s !== size) : [...prev.sizes, size]
    }));
  };

  const toggleColor = (color) => {
    setForm(prev => ({
      ...prev,
      colors: prev.colors.includes(color) ? prev.colors.filter(c => c !== color) : [...prev.colors, color]
    }));
  };

  if (loading) return <LoadingSpinner text="جاري التحميل..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-dark-900">المنتجات ({products.length})</h2>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-700 transition-all">
          <FiPlus size={18} /> إضافة منتج
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(p => (
          <div key={p.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="aspect-video bg-dark-100">
              {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" /> :
                <div className="w-full h-full flex items-center justify-center text-4xl">👕</div>}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-dark-800">{p.name}</h3>
                  <p className="text-xs text-dark-400 mt-0.5">{p.category}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${p.isActive ? 'bg-success-50 text-success-600' : 'bg-dark-100 text-dark-400'}`}>
                  {p.isActive ? 'مفعل' : 'معطل'}
                </span>
              </div>
              <p className="text-lg font-bold text-primary-600 mt-2">{formatPrice(p.basePrice)}</p>
              <div className="flex gap-1 mt-3">
                <button onClick={() => handleEdit(p)} className="flex-1 flex items-center justify-center gap-1 bg-primary-50 text-primary-600 py-2 rounded-lg text-sm hover:bg-primary-100">
                  <FiEdit size={14} /> تعديل
                </button>
                <button onClick={() => handleDelete(p.id)} className="flex-1 flex items-center justify-center gap-1 bg-danger-50 text-danger-600 py-2 rounded-lg text-sm hover:bg-red-100">
                  <FiTrash2 size={14} /> حذف
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{editId ? 'تعديل منتج' : 'إضافة منتج'}</h3>
              <button onClick={resetForm} className="p-1 rounded-lg hover:bg-dark-100"><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">الاسم</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required
                  className="w-full px-4 py-2.5 border border-dark-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">الوصف</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2}
                  className="w-full px-4 py-2.5 border border-dark-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">التصنيف</label>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-dark-200 rounded-xl text-sm focus:outline-none appearance-none">
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">الصورة</label>
                <label className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-dark-300 rounded-xl cursor-pointer hover:border-primary-400 text-sm text-dark-400">
                  <FiUpload /> {imageFile ? imageFile.name : 'اختر صورة'}
                  <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} className="hidden" />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">سعر البيع</label>
                  <input type="number" value={form.basePrice} onChange={e => setForm(p => ({ ...p, basePrice: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-dark-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" /></div>
                <div><label className="block text-sm font-medium mb-1">تكلفة التيشرت</label>
                  <input type="number" value={form.tshirtCost} onChange={e => setForm(p => ({ ...p, tshirtCost: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-dark-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" /></div>
                <div><label className="block text-sm font-medium mb-1">تكلفة الطباعة</label>
                  <input type="number" value={form.printingCost} onChange={e => setForm(p => ({ ...p, printingCost: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-dark-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" /></div>
                <div><label className="block text-sm font-medium mb-1">تكلفة التغليف</label>
                  <input type="number" value={form.packagingCost} onChange={e => setForm(p => ({ ...p, packagingCost: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-dark-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" /></div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">المقاسات</label>
                <div className="flex flex-wrap gap-2">
                  {tshirtSizes.map(s => (
                    <button type="button" key={s} onClick={() => toggleSize(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${form.sizes.includes(s) ? 'bg-primary-50 border-primary-500 text-primary-700' : 'border-dark-200 text-dark-500'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">الألوان</label>
                <div className="flex flex-wrap gap-2">
                  {tshirtColors.map(c => (
                    <button type="button" key={c.name} onClick={() => toggleColor(c.name)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${form.colors.includes(c.name) ? 'bg-primary-50 border-primary-500 text-primary-700' : 'border-dark-200 text-dark-500'}`}>
                      <span className="w-3 h-3 rounded-full border border-dark-200" style={{ backgroundColor: c.hex }}></span>
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} id="active" className="rounded" />
                <label htmlFor="active" className="text-sm">مفعل (يظهر للزبائن)</label>
              </div>
              <button type="submit" disabled={saving}
                className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-50">
                {saving ? 'جاري الحفظ...' : editId ? 'حفظ التعديلات' : 'إضافة المنتج'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
