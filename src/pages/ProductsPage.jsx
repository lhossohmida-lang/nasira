import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { formatPrice, categories } from '../utils/constants';
import { FiSearch, FiArrowLeft, FiGrid } from 'react-icons/fi';
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
    <div style={{ minHeight: '100vh', direction: 'rtl', background: '#f8f9fc' }}>

      {/* Page Header */}
      <div style={{ background: 'linear-gradient(145deg, #075985 0%, #0284c7 100%)', padding: '48px 20px 64px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div className="animate-blob" style={{ position: 'absolute', top: '-20%', right: '-5%', width: 300, height: 300, background: 'rgba(255,255,255,0.06)', borderRadius: '60%', filter: 'blur(40px)' }} />
          <div className="animate-blob" style={{ position: 'absolute', bottom: '-30%', left: '10%', width: 250, height: 250, background: 'rgba(232,67,147,0.1)', borderRadius: '50%', filter: 'blur(35px)', animationDelay: '3s' }} />
        </div>
        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 10 }}>
          <div className="section-label" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', marginBottom: 14 }}>
            <FiGrid size={13} /> تسوق الآن
          </div>
          <h1 style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 900, color: '#fff', marginBottom: 8 }}>منتجاتنا</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16 }}>اختر التيشرت المناسب واطبع عليه تصميمك</p>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 32, background: 'linear-gradient(to top, #f8f9fc, transparent)' }} />
      </div>

      <div style={{ maxWidth: 1200, margin: '-20px auto 0', padding: '0 20px 60px', position: 'relative', zIndex: 10 }}>

        {/* Filters */}
        <div className="animate-fade-in-up" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 32, opacity: 0 }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 240px', minWidth: 200 }}>
            <FiSearch style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#8896b0' }} size={17} />
            <input type="text" placeholder="ابحث عن منتج..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '12px 44px 12px 16px', background: '#fff', border: '1.5px solid rgba(197,204,224,0.6)', borderRadius: 14, fontSize: 14, fontFamily: 'inherit', outline: 'none', color: '#1a2340', boxSizing: 'border-box' }}
              onFocus={e => { e.target.style.borderColor = '#0284c7'; e.target.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.1)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(197,204,224,0.6)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Category pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            {['', ...categories].map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} style={{
                padding: '9px 18px', borderRadius: 100, fontSize: 13, fontWeight: 600,
                border: '1.5px solid', fontFamily: 'inherit', cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: selectedCategory === cat ? '#0284c7' : '#fff',
                color: selectedCategory === cat ? '#fff' : '#6272a0',
                borderColor: selectedCategory === cat ? '#0284c7' : 'rgba(197,204,224,0.6)',
                boxShadow: selectedCategory === cat ? '0 4px 14px rgba(14,165,233,0.3)' : 'none',
              }}>
                {cat || 'الكل'}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        {!loading && (
          <p style={{ color: '#8896b0', fontSize: 13, marginBottom: 20, fontWeight: 500 }}>
            {filtered.length} منتج متاح
          </p>
        )}

        {/* Grid */}
        {loading ? <LoadingSpinner text="جاري التحميل..." /> : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }} className="animate-fade-in">
            <div style={{ fontSize: 64, marginBottom: 16 }} className="animate-float">🔍</div>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: '#1a2340', marginBottom: 8 }}>لا توجد منتجات</h3>
            <p style={{ color: '#8896b0' }}>جرب تغيير معايير البحث</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 22 }}>
            {filtered.map((product, i) => (
              <Link key={product.id} to={`/products/${product.id}`}
                className="animate-fade-in-up"
                style={{
                  display: 'block', background: '#fff', borderRadius: 20, overflow: 'hidden',
                  textDecoration: 'none', border: '1px solid rgba(197,204,224,0.4)',
                  boxShadow: '0 2px 12px rgba(13,19,38,0.04)',
                  transition: 'all 0.3s cubic-bezier(0.175,0.885,0.32,1.2)',
                  animationDelay: `${0.05*(i+1)}s`, opacity: 0,
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(14,165,233,0.14)'; e.currentTarget.style.borderColor = 'rgba(14,165,233,0.25)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(13,19,38,0.04)'; e.currentTarget.style.borderColor = 'rgba(197,204,224,0.4)'; }}
              >
                <div style={{ aspectRatio: '1/1', background: 'linear-gradient(135deg, #e0f2fe, #f0f9ff)', overflow: 'hidden', position: 'relative' }}>
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease' }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.07)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52 }}>👕</div>
                  )}
                  <span style={{ position: 'absolute', top: 10, right: 10, background: 'linear-gradient(135deg,#0284c7,#38bdf8)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 100 }}>
                    {product.category}
                  </span>
                </div>
                <div style={{ padding: '16px 18px' }}>
                  <h3 style={{ fontWeight: 800, color: '#1a2340', fontSize: 15, marginBottom: 5 }}>{product.name}</h3>
                  <p style={{ color: '#8896b0', fontSize: 12, lineHeight: 1.6, marginBottom: 14, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.description}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 18, fontWeight: 900, background: 'linear-gradient(135deg,#0284c7,#38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                      {formatPrice(product.basePrice)}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#0284c7', fontSize: 12, fontWeight: 700 }}>
                      عرض <FiArrowLeft size={12} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
