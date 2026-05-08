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
    { icon: <FiStar size={24} />, title: 'جودة عالية', desc: 'طباعة بأحدث التقنيات وأفضل الخامات' },
    { icon: <FiTruck size={24} />, title: 'توصيل سريع', desc: 'نوصل لكل ولايات الجزائر' },
    { icon: <FiShield size={24} />, title: 'ضمان الجودة', desc: 'نضمن لك جودة الطباعة والمنتج' },
    { icon: <FiClock size={24} />, title: 'تنفيذ سريع', desc: 'نجهز طلبك في أسرع وقت' },
  ];

  return (
    <div className="min-h-screen" dir="rtl">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-accent-700 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent-400 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full text-sm mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              متوفرون الآن لخدمتكم
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              اطبع تصميمك على
              <span className="block bg-gradient-to-r from-accent-300 to-yellow-300 bg-clip-text text-transparent">
                تيشرتك المفضل
              </span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8 leading-relaxed">
              نوفر لك أفضل خدمة طباعة تيشرتات في الجزائر. اختر تصميمك، نطبعه بجودة عالية ونوصله لباب بيتك.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-white text-primary-700 px-8 py-3.5 rounded-xl font-semibold hover:bg-white/90 transition-all shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-0.5"
              >
                تصفح المنتجات
                <FiArrowLeft size={18} />
              </Link>
              <Link
                to="/track-order"
                className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-white/25 transition-all border border-white/20"
              >
                تتبع طلبك
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#f8f9fa] to-transparent"></div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((feature, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-lg shadow-black/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 mb-3">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-dark-800 text-sm md:text-base">{feature.title}</h3>
              <p className="text-dark-500 text-xs md:text-sm mt-1">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-dark-900 mb-3">منتجاتنا المميزة</h2>
          <p className="text-dark-500 text-lg">اكتشف أحدث تصاميمنا واختر ما يناسبك</p>
        </div>

        {loading ? (
          <LoadingSpinner text="جاري تحميل المنتجات..." />
        ) : featuredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-dark-500 text-lg">لا توجد منتجات حاليا</p>
            <p className="text-dark-400 text-sm mt-2">سيتم إضافة المنتجات قريبا</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map(product => (
              <Link
                key={product.id}
                to={`/products/${product.id}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="aspect-square bg-dark-100 overflow-hidden">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-dark-400">
                      <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-dark-800 group-hover:text-primary-600 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-dark-500 text-sm mt-1 line-clamp-2">{product.description}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-lg font-bold text-primary-600">{formatPrice(product.basePrice)}</span>
                    <span className="text-xs bg-primary-50 text-primary-600 px-3 py-1 rounded-full font-medium">
                      {product.category}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {featuredProducts.length > 0 && (
          <div className="text-center mt-10">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20 hover:-translate-y-0.5"
            >
              عرض كل المنتجات
              <FiArrowLeft size={18} />
            </Link>
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-dark-800 to-dark-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">عندك تصميم خاص؟</h2>
          <p className="text-dark-400 text-lg mb-8">ارفع تصميمك واطبعه على التيشرت بالطريقة اللي تحبها</p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white px-8 py-3.5 rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg hover:-translate-y-0.5"
          >
            ابدأ الآن
            <FiArrowLeft size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
