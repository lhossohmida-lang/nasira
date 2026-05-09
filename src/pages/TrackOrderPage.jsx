import { useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { getStatusInfo, formatDate, formatPrice } from '../utils/constants';
import toast from 'react-hot-toast';
import { FiSearch, FiPackage, FiClock } from 'react-icons/fi';

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!orderNumber.trim()) { toast.error('أدخل رقم الطلب'); return; }
    setLoading(true);
    setSearched(true);
    try {
      const q = query(collection(db, 'orders'), where('orderNumber', '==', orderNumber.trim()));
      const snap = await getDocs(q);
      if (!snap.empty) {
        setOrder({ id: snap.docs[0].id, ...snap.docs[0].data() });
      } else {
        setOrder(null);
        toast.error('لم يتم العثور على الطلب');
      }
    } catch (e) { console.error(e); toast.error('حدث خطأ'); }
    finally { setLoading(false); }
  };

  const statusSteps = ['new', 'confirmed', 'printing', 'ready', 'shipped', 'delivered'];
  const currentStepIndex = order ? statusSteps.indexOf(order.status) : -1;

  return (
    <div style={{ minHeight: '100vh', direction: 'rtl', background: '#f8f9fc' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(145deg, #075985, #0284c7)', padding: '48px 20px 64px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div className="animate-blob" style={{ position: 'absolute', top: '-10%', right: '5%', width: 260, height: 260, background: 'rgba(255,255,255,0.06)', borderRadius: '60%', filter: 'blur(40px)' }} />
        </div>
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 10 }}>
          <div style={{ width: 64, height: 64, background: 'rgba(255,255,255,0.15)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', backdropFilter: 'blur(10px)' }}>
            <FiPackage size={28} color="#fff" />
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 900, color: '#fff', marginBottom: 8 }}>تتبع طلبك</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16 }}>أدخل رقم الطلب لمعرفة حالته الحالية</p>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 32, background: 'linear-gradient(to top, #f8f9fc, transparent)' }} />
      </div>

      <div style={{ maxWidth: 640, margin: '-24px auto 0', padding: '0 20px 60px', position: 'relative', zIndex: 10 }}>

        {/* Search Form */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
          <input type="text" value={orderNumber} onChange={e => setOrderNumber(e.target.value)}
            placeholder="مثال: SD-260508-1234" dir="ltr"
            style={{
              flex: 1, padding: '13px 16px', background: '#fff',
              border: '1.5px solid rgba(197,204,224,0.6)', borderRadius: 14,
              fontSize: 14, fontFamily: 'inherit', outline: 'none', textAlign: 'center',
              fontWeight: 600, color: '#1a2340',
              boxShadow: '0 2px 12px rgba(13,19,38,0.05)',
            }}
            onFocus={e => { e.target.style.borderColor = '#0284c7'; e.target.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.1)'; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(197,204,224,0.6)'; e.target.style.boxShadow = '0 2px 12px rgba(13,19,38,0.05)'; }}
          />
          <button type="submit" disabled={loading} style={{
            padding: '13px 24px', background: loading ? '#7dd3fc' : 'linear-gradient(135deg,#0284c7,#38bdf8)',
            color: '#fff', borderRadius: 14, fontWeight: 800, fontSize: 14, border: 'none',
            cursor: loading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: 8,
            fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(14,165,233,0.35)',
            whiteSpace: 'nowrap',
          }}>
            {loading ? (
              <div className="animate-spin" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} />
            ) : <FiSearch size={16} />}
            {loading ? 'بحث...' : 'بحث'}
          </button>
        </form>

        {/* Order Result */}
        {order && (
          <div className="animate-scale-in" style={{ background: '#fff', borderRadius: 20, padding: '28px', border: '1px solid rgba(197,204,224,0.4)', boxShadow: '0 4px 24px rgba(13,19,38,0.07)' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <p style={{ fontSize: 12, color: '#8896b0', fontWeight: 600, marginBottom: 4 }}>رقم الطلب</p>
                <p style={{ fontWeight: 800, fontSize: 18, color: '#1a2340', fontFamily: 'monospace' }}>{order.orderNumber}</p>
              </div>
              <span style={{
                padding: '7px 16px', borderRadius: 100, fontSize: 13, fontWeight: 700,
                background: '#e0f2fe', color: '#0284c7',
              }}>
                {getStatusInfo(order.status).label}
              </span>
            </div>

            {/* Progress Bar */}
            {order.status !== 'cancelled' && (
              <div style={{ marginBottom: 28 }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  {/* Track line */}
                  <div style={{ position: 'absolute', top: 16, right: '8%', left: '8%', height: 3, background: '#f1f3f9', borderRadius: 100 }}>
                    <div style={{ height: '100%', background: 'linear-gradient(90deg, #38bdf8, #0284c7)', borderRadius: 100, transition: 'width 0.6s ease', width: `${Math.max(0, (currentStepIndex / (statusSteps.length - 1)) * 100)}%` }} />
                  </div>
                  {statusSteps.map((step, i) => {
                    const info = getStatusInfo(step);
                    const isActive = i <= currentStepIndex;
                    return (
                      <div key={step} style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 800, marginBottom: 8,
                          background: isActive ? 'linear-gradient(135deg,#0284c7,#38bdf8)' : '#f1f3f9',
                          color: isActive ? '#fff' : '#c5cce0',
                          boxShadow: isActive ? '0 3px 12px rgba(14,165,233,0.35)' : 'none',
                          transition: 'all 0.3s ease',
                        }}>{i + 1}</div>
                        <span style={{ fontSize: 10, fontWeight: 600, color: isActive ? '#0284c7' : '#c5cce0', textAlign: 'center', lineHeight: 1.2 }}>
                          {info.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Items */}
            <div style={{ borderTop: '1px solid #f1f3f9', paddingTop: 20, marginBottom: 16 }}>
              <h3 style={{ fontWeight: 800, color: '#1a2340', marginBottom: 14, fontSize: 15 }}>المنتجات</h3>
              {order.items?.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f8f9fc', fontSize: 14 }}>
                  <span style={{ color: '#475280' }}>{item.productName} ({item.size}, {item.color}) × {item.quantity}</span>
                  <span style={{ fontWeight: 700, color: '#1a2340' }}>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, marginTop: 14, fontSize: 17 }}>
                <span style={{ color: '#1a2340' }}>المجموع</span>
                <span style={{ background: 'linear-gradient(135deg,#0284c7,#38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  {formatPrice(order.totalPrice)}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#8896b0', fontSize: 12, fontWeight: 500 }}>
              <FiClock size={13} /> تاريخ الطلب: {formatDate(order.createdAt)}
            </div>
          </div>
        )}

        {searched && !order && !loading && (
          <div style={{ textAlign: 'center', padding: '60px 0' }} className="animate-fade-in">
            <div style={{ fontSize: 56, marginBottom: 16 }} className="animate-float">📦</div>
            <p style={{ color: '#8896b0', fontSize: 16, fontWeight: 600 }}>لم يتم العثور على طلب بهذا الرقم</p>
            <p style={{ color: '#c5cce0', fontSize: 13, marginTop: 6 }}>تأكد من صحة رقم الطلب وحاول مجددًا</p>
          </div>
        )}
      </div>
    </div>
  );
}
