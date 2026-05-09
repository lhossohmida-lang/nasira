import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useCart } from '../contexts/CartContext';
import { formatPrice, printTypes } from '../utils/constants';
import toast from 'react-hot-toast';
import { FiShoppingCart, FiMinus, FiPlus } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';
import TshirtCustomizer from '../components/TshirtCustomizer';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedPrintType, setSelectedPrintType] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [designPreview, setDesignPreview] = useState(null);
  const [compositePreview, setCompositePreview] = useState(null);
  const [note, setNote] = useState('');

  useEffect(() => {
    async function fetchProduct() {
      try {
        const snap = await getDoc(doc(db, 'products', id));
        if (snap.exists()) {
          const p = { id: snap.id, ...snap.data() };
          setProduct(p);
          if (p.sizes?.length) setSelectedSize(p.sizes[0]);
          if (p.colors?.length) setSelectedColor(p.colors[0]);
          setSelectedPrintType(printTypes[0]);
        }
      } catch (e) { console.error(e); } finally { setLoading(false); }
    }
    fetchProduct();
  }, [id]);

  const getStock = () => {
    if (!product?.stock || !selectedSize || !selectedColor) return 0;
    return product.stock?.[selectedSize]?.[selectedColor] ?? 0;
  };

  const handleDesignUpdate = useCallback((design, composite) => {
    setDesignPreview(design);
    setCompositePreview(composite);
  }, []);

  const handleAddToCart = () => {
    if (!selectedSize) { toast.error('اختر المقاس'); return; }
    if (!selectedColor) { toast.error('اختر اللون'); return; }
    const stock = getStock();
    if (stock <= 0) { toast.error('هذا المنتج غير متوفر بهذا المقاس واللون'); return; }
    if (quantity > stock) { toast.error(`الكمية المتوفرة فقط ${stock}`); return; }

    addToCart({
      productId: product.id,
      productName: product.name,
      imageUrl: product.imageUrl || '',
      price: product.basePrice,
      size: selectedSize,
      color: selectedColor,
      printType: selectedPrintType,
      quantity,
      designFile: null,
      designPreview: designPreview || '',
      compositePreview: compositePreview || '',
      note,
      tshirtCost: product.tshirtCost || 0,
      printingCost: product.printingCost || 0,
      packagingCost: product.packagingCost || 0,
    });
    toast.success('تمت الإضافة إلى السلة');
  };

  if (loading) return <LoadingSpinner text="جاري التحميل..." />;
  if (!product) return (
    <div className="text-center py-20" dir="rtl">
      <h2 className="text-2xl font-bold">المنتج غير موجود</h2>
    </div>
  );

  const stock = getStock();

  return (
    <div className="min-h-screen py-8" dir="rtl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Left: Interactive T-shirt Customizer */}
          <TshirtCustomizer
            tshirtImageUrl={product.imageUrl}
            onUpdate={handleDesignUpdate}
          />

          {/* Right: Product Details & Options */}
          <div className="space-y-6">
            <div>
              <span className="text-sm bg-primary-50 text-primary-600 px-3 py-1 rounded-full font-medium">
                {product.category}
              </span>
              <h1 className="text-3xl font-bold text-dark-900 mt-3">{product.name}</h1>
              <p className="text-dark-500 mt-2">{product.description}</p>
              <p className="text-3xl font-bold text-primary-600 mt-4">{formatPrice(product.basePrice)}</p>
            </div>

            {/* Size */}
            <div>
              <label className="block text-sm font-semibold text-dark-700 mb-2">المقاس</label>
              <div className="flex flex-wrap gap-2">
                {(product.sizes || []).map(size => (
                  <button key={size} onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${selectedSize === size ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-dark-200 text-dark-600 hover:border-dark-300'}`}>
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-semibold text-dark-700 mb-2">اللون</label>
              <div className="flex flex-wrap gap-2">
                {(product.colors || []).map(color => (
                  <button key={color} onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${selectedColor === color ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-dark-200 text-dark-600 hover:border-dark-300'}`}>
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Print Type */}
            <div>
              <label className="block text-sm font-semibold text-dark-700 mb-2">نوع الطباعة</label>
              <select value={selectedPrintType} onChange={e => setSelectedPrintType(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-dark-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500">
                {printTypes.map(pt => <option key={pt} value={pt}>{pt}</option>)}
              </select>
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-semibold text-dark-700 mb-2">ملاحظة (اختياري)</label>
              <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
                className="w-full px-4 py-3 bg-white border border-dark-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-none"
                placeholder="أضف ملاحظة خاصة بالطلب..." />
            </div>

            {/* Quantity & Stock */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-xl bg-dark-100 flex items-center justify-center hover:bg-dark-200 transition-colors">
                  <FiMinus />
                </button>
                <span className="text-lg font-semibold w-8 text-center">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                  className="w-10 h-10 rounded-xl bg-dark-100 flex items-center justify-center hover:bg-dark-200 transition-colors">
                  <FiPlus />
                </button>
              </div>
              <span className={`text-sm font-medium px-3 py-1 rounded-full ${stock > 5 ? 'bg-success-50 text-success-600' : stock > 0 ? 'bg-warning-50 text-warning-600' : 'bg-danger-50 text-danger-600'}`}>
                {stock > 0 ? `متوفر: ${stock}` : 'غير متوفر'}
              </span>
            </div>

            {/* Add to Cart */}
            <button onClick={handleAddToCart} disabled={stock <= 0}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 rounded-xl font-semibold text-lg hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg shadow-primary-600/20 disabled:opacity-50 disabled:cursor-not-allowed">
              <FiShoppingCart size={20} />
              أضف إلى السلة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
