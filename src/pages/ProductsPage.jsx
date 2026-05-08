import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { formatPrice, categories } from '../utils/constants';
import { FiSearch, FiArrowUpRight } from 'react-icons/fi';
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
    <div className="min-h-screen py-10" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 animate-fade-in-up">
          <span className="inline-flex items-center gap-2 bg-primary-50 text-primary-600 px-4 py-1.5 rounded-full text-sm font-medium mb-3">
            🛍️ تسوق الآن
          </span>
          <h1 className="text-4xl font-extrabold text-dark-900 mb-2">منتجاتنا</h1>
          <p className="text-dark-400 text-lg">اختر التيشرت المناسب واطبع عليه تصميمك</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10 animate-fade-in-up stagger-1" style={{ opacity: 0 }}>
          <div className="relative flex-1">
            <FiSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-300" size={18} />
            <input type="text" placeholder="ابحث عن منتج..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pr-12 pl-4 py-3.5 bg-white border border-dark-200/80 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 shadow-premium transition-all" />
          </div>
          <div className="relative">
            <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}
              className="w-full sm:w-auto px-5 py-3.5 bg-white border border-dark-200/80 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 appearance-none pr-10 shadow-premium cursor-pointer">
              <option value="">كل التصنيفات</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? <LoadingSpinner text="جاري التحميل..." /> : filtered.length === 0 ? (
          <div className="text-center py-24 animate-fade-in">
            <div className="text-7xl mb-6 animate-float">🔍</div>
            <h3 className="text-2xl font-bold text-dark-700 mb-2">لا توجد منتجات</h3>
            <p className="text-dark-400">جرب تغيير معايير البحث</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((product, i) => (
              <Link key={product.id} to={`/products/${product.id}`}
                className="group bg-white rounded-3xl overflow-hidden shadow-premium card-hover opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${0.05 * (i + 1)}s` }}>
                <div className="aspect-square bg-gradient-to-br from-dark-50 to-dark-100 overflow-hidden relative">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-dark-300 text-5xl group-hover:scale-110 transition-transform duration-500">👕</div>
                  )}
                  <span className="absolute top-3 right-3 glass-white text-xs px-3 py-1.5 rounded-full font-semibold text-dark-600">{product.category}</span>
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-900/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-4">
                    <span className="flex items-center gap-1 text-white text-sm font-medium translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      عرض التفاصيل <FiArrowUpRight size={14} />
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-dark-800 group-hover:text-primary-600 transition-colors mb-1">{product.name}</h3>
                  <p className="text-dark-400 text-sm line-clamp-2 mb-4 leading-relaxed">{product.description}</p>
                  <span className="text-lg font-extrabold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">{formatPrice(product.basePrice)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
