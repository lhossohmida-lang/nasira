import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { formatPrice } from '../utils/constants';
import { FiArrowLeft, FiStar, FiTruck, FiShield, FiClock, FiArrowUpRight } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const uploadRef = useRef(null);

  const handleDesignUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      sessionStorage.setItem('pendingDesign', reader.result);
      navigate('/products');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

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
    { icon: <FiStar size={24} />, title: 'جودة عالية', desc: 'طباعة بأحدث التقنيات وأفضل الخامات', gradient: 'from-amber-400 to-orange-500' },
    { icon: <FiTruck size={24} />, title: 'توصيل سريع', desc: 'نوصل لكل ولايات الجزائر', gradient: 'from-blue-400 to-cyan-500' },
    { icon: <FiShield size={24} />, title: 'ضمان الجودة', desc: 'نضمن لك جودة الطباعة والمنتج', gradient: 'from-emerald-400 to-green-500' },
    { icon: <FiClock size={24} />, title: 'تنفيذ سريع', desc: 'نجهز طلبك في أسرع وقت', gradient: 'from-violet-400 to-purple-500' },
  ];

  return (
    <div className="min-h-screen" dir="rtl">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[85vh] flex items-center">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-dark-900 animate-gradient-shift"></div>
        
        {/* Animated decorative blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-[10%] w-80 h-80 bg-primary-500/20 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute bottom-20 left-[15%] w-96 h-96 bg-accent-500/15 rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl animate-blob" style={{ animationDelay: '4s' }}></div>
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[15%] right-[20%] w-2 h-2 bg-white/20 rounded-full animate-float"></div>
          <div className="absolute top-[35%] right-[70%] w-3 h-3 bg-white/15 rounded-full animate-float-slow"></div>
          <div className="absolute top-[65%] right-[40%] w-1.5 h-1.5 bg-white/25 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-[25%] right-[85%] w-2.5 h-2.5 bg-accent-400/20 rounded-full animate-float-slow" style={{ animationDelay: '3s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10 w-full">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 glass px-5 py-2.5 rounded-full text-sm mb-8 text-white/90 animate-fade-in-up">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400"></span>
              </span>
              متوفرون الآن لخدمتكم
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] mb-8 animate-fade-in-up stagger-1" style={{ opacity: 0 }}>
              <span className="text-white">اطبع تصميمك على</span>
              <span className="block mt-2 bg-gradient-to-r from-accent-300 via-pink-300 to-amber-300 bg-clip-text text-transparent">
                تيشرتك المفضل
              </span>
            </h1>
            <p className="text-lg md:text-xl text-white/60 mb-10 leading-relaxed max-w-lg animate-fade-in-up stagger-2" style={{ opacity: 0 }}>
              نوفر لك أفضل خدمة طباعة تيشرتات في الجزائر. اختر تصميمك، نطبعه بجودة عالية ونوصله لباب بيتك.
            </p>
            <div className="flex flex-wrap gap-4 animate-fade-in-up stagger-3" style={{ opacity: 0 }}>
              <Link
                to="/products"
                className="group inline-flex items-center gap-2 bg-white text-primary-700 px-8 py-4 rounded-2xl font-bold hover:bg-white/95 transition-all shadow-2xl shadow-white/10 hover:shadow-white/20 hover:-translate-y-1"
              >
                تصفح المنتجات
                <FiArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/track-order"
                className="inline-flex items-center gap-2 glass text-white px-8 py-4 rounded-2xl font-bold hover:bg-white/20 transition-all"
              >
                تتبع طلبك
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#f8fafc] to-transparent"></div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {features.map((feature, i) => (
            <div key={i} className="card-hover bg-white rounded-3xl p-6 shadow-premium opacity-0 animate-fade-in-up" style={{ animationDelay: `${0.1 * (i + 1)}s` }}>
              <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg`}>
                {feature.icon}
              </div>
              <h3 className="font-bold text-dark-800 text-sm md:text-base mb-1">{feature.title}</h3>
              <p className="text-dark-400 text-xs md:text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 bg-primary-50 text-primary-600 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            ✨ تشكيلة مميزة
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-dark-900 mb-4">منتجاتنا المميزة</h2>
          <p className="text-dark-400 text-lg max-w-md mx-auto">اكتشف أحدث تصاميمنا واختر ما يناسب ذوقك</p>
        </div>

        {loading ? (
          <LoadingSpinner text="جاري تحميل المنتجات..." />
        ) : featuredProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-7xl mb-4 animate-float">👕</div>
            <p className="text-dark-400 text-lg">لا توجد منتجات حاليا</p>
            <p className="text-dark-300 text-sm mt-2">سيتم إضافة المنتجات قريبا</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product, i) => (
              <Link
                key={product.id}
                to={`/products/${product.id}`}
                className="group bg-white rounded-3xl overflow-hidden shadow-premium card-hover opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${0.1 * (i + 1)}s` }}
              >
                <div className="aspect-square bg-gradient-to-br from-dark-50 to-dark-100 overflow-hidden relative">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-dark-300">
                      <div className="text-6xl group-hover:scale-110 transition-transform duration-500">👕</div>
                    </div>
                  )}
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                    <span className="text-white text-sm font-medium">عرض التفاصيل</span>
                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
                      <FiArrowUpRight size={16} />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-dark-800 text-lg group-hover:text-primary-600 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-dark-400 text-sm mt-1.5 line-clamp-2 leading-relaxed">{product.description}</p>
                    </div>
                  </div>
                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-xl font-extrabold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                      {formatPrice(product.basePrice)}
                    </span>
                    <span className="text-xs bg-dark-50 text-dark-500 px-4 py-1.5 rounded-full font-medium">
                      {product.category}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {featuredProducts.length > 0 && (
          <div className="text-center mt-14">
            <Link
              to="/products"
              className="group inline-flex items-center gap-3 bg-dark-900 text-white px-10 py-4 rounded-2xl font-bold hover:bg-dark-800 transition-all shadow-2xl shadow-dark-900/20 hover:-translate-y-1"
            >
              عرض كل المنتجات
              <FiArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            </Link>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-primary-900 to-dark-900"></div>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-[20%] w-64 h-64 bg-primary-500/10 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute bottom-10 right-[30%] w-80 h-80 bg-accent-500/10 rounded-full blur-3xl animate-blob" style={{ animationDelay: '3s' }}></div>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-24 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
            عندك تصميم خاص؟
          </h2>
          <p className="text-white/50 text-lg mb-10 max-w-md mx-auto">
            ارفع تصميمك واطبعه على التيشرت بالطريقة اللي تحبها
          </p>
          <label className="group inline-flex items-center gap-3 bg-gradient-to-r from-primary-500 via-accent-500 to-primary-500 animate-gradient-shift text-white px-10 py-4 rounded-2xl font-bold hover:opacity-90 transition-all shadow-2xl shadow-primary-500/20 hover:-translate-y-1 cursor-pointer">
            ابدأ الآن — ارفع تصميمك
            <FiArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <input ref={uploadRef} type="file" accept="image/*" onChange={handleDesignUpload} className="hidden" />
          </label>
        </div>
      </section>
    </div>
  );
}
