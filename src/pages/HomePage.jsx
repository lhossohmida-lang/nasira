import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { formatPrice } from '../utils/constants';
import { FiArrowLeft, FiStar, FiTruck, FiShield, FiClock } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const q = query(
          collection(db, 'products'),
          where('isActive', '==', true),
          orderBy('createdAt', 'desc'),
          limit(6)
        );
        const snapshot = await getDocs(q);
        setFeaturedProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const features = [
    { icon: <FiStar size={22} />, title: 'جودة عالية', desc: 'طباعة بأحدث التقنيات', color: '#fdcb6e', bg: '#fffbeb' },
    { icon: <FiTruck size={22} />, title: 'توصيل سريع', desc: 'لكل ولايات الجزائر', color: '#0284c7', bg: '#e0f2fe' },
    { icon: <FiShield size={22} />, title: 'ضمان الجودة', desc: 'نضمن جودة الطباعة', color: '#00b894', bg: '#eafaf5' },
    { icon: <FiClock size={22} />, title: 'تنفيذ سريع', desc: 'نجهز طلبك في أسرع وقت', color: '#e84393', bg: '#fff0f7' },
  ];

  return (
    <div style={{ minHeight: '100vh', direction: 'rtl', background: '#f8f9fc' }}>

      {/* ======= HERO ======= */}
      <section style={{ position: 'relative', overflow: 'hidden', minHeight: '88vh', display: 'flex', alignItems: 'center' }}>
        {/* Background */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(145deg, #075985 0%, #0284c7 42%, #38bdf8 100%)',
        }} />

        {/* Decorative blobs */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div className="animate-blob" style={{ position: 'absolute', top: '8%', right: '8%', width: 380, height: 380, background: 'rgba(125,211,252,0.26)', borderRadius: '60%', filter: 'blur(60px)' }} />
          <div className="animate-blob" style={{ position: 'absolute', bottom: '10%', left: '5%', width: 320, height: 320, background: 'rgba(232,67,147,0.15)', borderRadius: '50%', filter: 'blur(50px)', animationDelay: '2.5s' }} />
          <div className="animate-blob" style={{ position: 'absolute', top: '45%', left: '40%', width: 240, height: 240, background: 'rgba(253,203,110,0.1)', borderRadius: '50%', filter: 'blur(40px)', animationDelay: '5s' }} />
        </div>

        {/* Floating dots */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          {[{top:'12%',right:'18%',s:8},{top:'30%',right:'65%',s:12},{top:'60%',right:'35%',s:6},{top:'20%',right:'82%',s:10},{top:'75%',right:'75%',s:7}].map((d,i)=>(
            <div key={i} className="animate-float" style={{ position:'absolute', top:d.top, right:d.right, width:d.s, height:d.s, background:'rgba(255,255,255,0.18)', borderRadius:'50%', animationDelay:`${i*1.2}s` }} />
          ))}
        </div>

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 20px', position: 'relative', zIndex: 10, width: '100%' }}>
          <div style={{ maxWidth: 620 }}>

            {/* Live badge */}
            <div className="glass animate-fade-in-up" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 18px', borderRadius: 100, marginBottom: 28 }}>
              <span style={{ position: 'relative', display: 'flex', width: 10, height: 10 }}>
                <span className="animate-ping" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#4ade80', opacity: 0.7 }} />
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#4ade80', display: 'block' }} />
              </span>
              <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 600 }}>متوفرون الآن لخدمتكم</span>
            </div>

            {/* Heading */}
            <h1 className="animate-fade-in-up stagger-1" style={{ fontSize: 'clamp(38px,6vw,68px)', fontWeight: 900, lineHeight: 1.12, marginBottom: 20, opacity: 0 }}>
              <span style={{ color: '#fff' }}>اطبع تصميمك على</span>
              <span style={{ display: 'block', marginTop: 6, background: 'linear-gradient(90deg,#fdcb6e,#ff5fa0,#b3a6ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                تيشرتك المفضل
              </span>
            </h1>

            <p className="animate-fade-in-up stagger-2" style={{ fontSize: 17, color: 'rgba(255,255,255,0.6)', marginBottom: 40, lineHeight: 1.7, maxWidth: 480, opacity: 0 }}>
              نوفر لك أفضل خدمة طباعة تيشرتات في الجزائر. اختر تصميمك، نطبعه بجودة عالية ونوصله لباب بيتك.
            </p>

            <div className="animate-fade-in-up stagger-3" style={{ display: 'flex', flexWrap: 'wrap', gap: 14, opacity: 0 }}>
              <Link to="/products" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: '#fff', color: '#0284c7',
                padding: '14px 28px', borderRadius: 16,
                fontWeight: 800, fontSize: 15, textDecoration: 'none',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                transition: 'all 0.25s ease',
              }}>
                تصفح المنتجات <FiArrowLeft size={17} />
              </Link>

              <Link to="/track-order" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '14px 28px', borderRadius: 16,
                fontWeight: 700, fontSize: 15, textDecoration: 'none',
                color: 'rgba(255,255,255,0.85)',
                border: '1.5px solid rgba(255,255,255,0.25)',
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(12px)',
              }}>
                تتبع طلبك
              </Link>
            </div>

          </div>
        </div>

        {/* Bottom fade */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, background: 'linear-gradient(to top, #f8f9fc, transparent)' }} />
      </section>

      {/* ======= FEATURES ======= */}
      <section style={{ maxWidth: 1200, margin: '-40px auto 0', padding: '0 20px', position: 'relative', zIndex: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {features.map((f, i) => (
            <div key={i} className="card animate-fade-in-up" style={{ padding: '22px 20px', animationDelay: `${0.1*(i+1)}s`, opacity: 0 }}>
              <div style={{ width: 50, height: 50, borderRadius: 14, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: f.color, marginBottom: 14 }}>
                {f.icon}
              </div>
              <h3 style={{ fontWeight: 700, color: '#1a2340', marginBottom: 4, fontSize: 15 }}>{f.title}</h3>
              <p style={{ color: '#8896b0', fontSize: 13, lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ======= FEATURED PRODUCTS ======= */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div className="section-label" style={{ marginBottom: 16 }}>✨ تشكيلة مميزة</div>
          <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 900, color: '#0d1326', marginBottom: 12 }}>منتجاتنا المميزة</h2>
          <p style={{ color: '#8896b0', fontSize: 16, maxWidth: 380, margin: '0 auto' }}>اكتشف أحدث تصاميمنا واختر ما يناسب ذوقك</p>
        </div>

        {loading ? (
          <LoadingSpinner text="جاري تحميل المنتجات..." />
        ) : featuredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <div style={{ fontSize: 72, marginBottom: 16 }} className="animate-float">👕</div>
            <p style={{ color: '#8896b0', fontSize: 17 }}>لا توجد منتجات حاليا</p>
            <p style={{ color: '#c5cce0', fontSize: 13, marginTop: 6 }}>سيتم إضافة المنتجات قريبا</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
            {featuredProducts.map((product, i) => (
              <Link key={product.id} to={`/products/${product.id}`}
                className="card-hover animate-fade-in-up"
                style={{ display: 'block', background: '#fff', borderRadius: 20, overflow: 'hidden', textDecoration: 'none', border: '1px solid rgba(197,204,224,0.4)', animationDelay: `${0.1*(i+1)}s`, opacity: 0 }}
              >
                <div style={{ aspectRatio: '1/1', background: 'linear-gradient(135deg, #e0f2fe, #f0f9ff)', overflow: 'hidden', position: 'relative' }}>
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease' }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56 }}>👕</div>
                  )}
                  <div style={{ position: 'absolute', top: 12, right: 12 }}>
                    <span style={{ background: 'linear-gradient(135deg,#0284c7,#38bdf8)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 100 }}>
                      {product.category}
                    </span>
                  </div>
                </div>
                <div style={{ padding: '18px 20px' }}>
                  <h3 style={{ fontWeight: 800, color: '#1a2340', fontSize: 16, marginBottom: 6 }}>{product.name}</h3>
                  <p style={{ color: '#8896b0', fontSize: 13, lineHeight: 1.5, marginBottom: 14, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.description}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 19, fontWeight: 900, background: 'linear-gradient(135deg,#0284c7,#38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                      {formatPrice(product.basePrice)}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#e0f2fe', color: '#0284c7', fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 100 }}>
                      عرض التفاصيل <FiArrowLeft size={12} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {featuredProducts.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: 48 }}>
            <Link to="/products" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
              color: '#fff', padding: '14px 36px', borderRadius: 16,
              fontWeight: 800, fontSize: 15, textDecoration: 'none',
              boxShadow: '0 8px 24px rgba(14,165,233,0.35)',
            }}>
              عرض كل المنتجات <FiArrowLeft size={17} />
            </Link>
          </div>
        )}
      </section>

    </div>
  );
}
