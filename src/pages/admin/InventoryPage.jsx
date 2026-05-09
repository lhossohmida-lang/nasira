import { useEffect, useState } from 'react';
import { collection, doc, getDocs, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '../../firebase';
import toast from 'react-hot-toast';
import { FiAlertTriangle, FiSave, FiTrash2 } from 'react-icons/fi';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingStock, setEditingStock] = useState({});
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const snap = await getDocs(collection(db, 'products'));
        setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const handleStockChange = (productId, size, color, value) => {
    setEditingStock(prev => ({
      ...prev,
      [productId]: { ...(prev[productId] || {}), [`${size}_${color}`]: Number(value) },
    }));
  };

  const saveStock = async (product) => {
    try {
      const newStock = { ...(product.stock || {}) };
      const changes = editingStock[product.id] || {};
      Object.entries(changes).forEach(([key, val]) => {
        const [size, color] = key.split('_');
        if (!newStock[size]) newStock[size] = {};
        newStock[size][color] = val;
      });
      await updateDoc(doc(db, 'products', product.id), { stock: newStock });
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, stock: newStock } : p));
      setEditingStock(prev => {
        const next = { ...prev };
        delete next[product.id];
        return next;
      });
      toast.success('تم تحديث المخزون');
    } catch (e) {
      console.error(e);
      toast.error('حدث خطأ');
    }
  };

  const deleteAllProducts = async () => {
    if (products.length === 0) return;
    if (!confirm('هل تريد حذف كل المنتجات نهائياً؟ سيتم حذف المنتجات والمخزون المرتبط بها.')) return;

    setDeleting(true);
    try {
      const batch = writeBatch(db);
      products.forEach(product => {
        batch.delete(doc(db, 'products', product.id));
      });

      await batch.commit();
      setProducts([]);
      setEditingStock({});
      toast.success('تم حذف كل المنتجات');
    } catch (e) {
      console.error(e);
      toast.error('تعذر حذف المنتجات');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <LoadingSpinner text="جاري التحميل..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl font-bold text-dark-900">إدارة المخزون</h2>
        <button
          onClick={deleteAllProducts}
          disabled={deleting || products.length === 0}
          className="inline-flex items-center justify-center gap-2 bg-danger-50 text-danger-600 border border-danger-100 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-danger-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <FiTrash2 size={16} />
          {deleting ? 'جاري الحذف...' : 'حذف كل المنتجات'}
        </button>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-10 text-center text-dark-400">
          لا توجد منتجات حالياً.
        </div>
      ) : products.map(product => (
        <div key={product.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-dark-50 border-b border-dark-200 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-dark-800">{product.name}</h3>
              <p className="text-xs text-dark-400">{product.category}</p>
            </div>
            {editingStock[product.id] && (
              <button
                onClick={() => saveStock(product)}
                className="flex items-center gap-1 bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary-700"
              >
                <FiSave size={14} /> حفظ
              </button>
            )}
          </div>
          <div className="p-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-200">
                  <th className="px-3 py-2 text-right text-dark-600 font-medium">المقاس / اللون</th>
                  {(product.colors || []).map(c => (
                    <th key={c} className="px-3 py-2 text-center text-dark-600 font-medium">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(product.sizes || []).map(size => (
                  <tr key={size} className="border-b border-dark-100">
                    <td className="px-3 py-2 font-medium">{size}</td>
                    {(product.colors || []).map(color => {
                      const qty = editingStock[product.id]?.[`${size}_${color}`] ?? product.stock?.[size]?.[color] ?? 0;
                      const isLow = qty < 5;
                      return (
                        <td key={color} className="px-3 py-2">
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="number"
                              value={qty}
                              min={0}
                              onChange={e => handleStockChange(product.id, size, color, e.target.value)}
                              className={`w-16 text-center px-2 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${isLow ? 'border-warning-500 bg-warning-50' : 'border-dark-200'}`}
                            />
                            {isLow && <FiAlertTriangle className="text-warning-500" size={14} />}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
