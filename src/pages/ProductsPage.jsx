import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { formatPrice, categories } from '../utils/constants';
import { FiSearch, FiFilter } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    async function fetchProducts() {
      try {
        const q = query(collection(db, 'products'), where('isActive', '==', true), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) { console.error(e); } finally { setLoading(false); }
    }
    fetchProducts();
  }, []);

  const filtered = products.filter(p => {
    const s = p.name.toLowerCase().includes(search.toLowerCase());
    const c = !selectedCategory || p.category === selectedCategory;
    return s && c;
  });

  return (
    <div className="min-h-screen py-8" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dark-900 mb-2">منتجاتنا</h1>
          <p className="text-dark-500">اختر التيشرت المناسب واطبع عليه تصميمك</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
            <input type="text" placeholder="ابحث عن منتج..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pr-10 pl-4 py-3 bg-white border border-dark-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
          </div>
          <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}
            className="px-4 py-3 bg-white border border-dark-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 appearance-none">
            <option value="">كل التصنيفات</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {loading ? <LoadingSpinner text="جاري التحميل..." /> : filtered.length === 0 ? (
          <div className="text-center py-20"><div className="text-6xl mb-4">🔍</div><h3 className="text-xl font-semibold text-dark-800">لا توجد منتجات</h3></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map(product => (
              <Link key={product.id} to={`/products/${product.id}`} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="aspect-square bg-dark-100 overflow-hidden relative">
                  {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : (
                    <div className="w-full h-full flex items-center justify-center text-dark-300 text-4xl">👕</div>
                  )}
                  <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-xs px-3 py-1 rounded-full font-medium">{product.category}</span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-dark-800 group-hover:text-primary-600 transition-colors mb-1">{product.name}</h3>
                  <p className="text-dark-500 text-sm line-clamp-2 mb-3">{product.description}</p>
                  <span className="text-lg font-bold text-primary-600">{formatPrice(product.basePrice)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
