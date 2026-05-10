import { useRef, useEffect, useState } from 'react';
import { FiX, FiDownload, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import html2pdf from 'html2pdf.js';

const formatInvoiceDate = (timestamp) => {
  const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp || Date.now());
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  const h = String(date.getHours() % 12 || 12).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
  return { date: `${d}/${m}/${y}`, time: `${h}:${min} ${ampm}` };
};

const fmtPrice = (v) => {
  const n = Number(v) || 0;
  return n.toFixed(2) + ' د.ج';
};

function SingleInvoice({ order, settings }) {
  const { date, time } = formatInvoiceDate(order.createdAt);
  const items = order.items || [];

  return (
    <div style={{ fontFamily: 'Arial, Tahoma, sans-serif', direction: 'rtl', backgroundColor: '#fff', width: '100%' }}>
      {/* HEADER */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        color: '#fff', padding: '28px 32px', display: 'flex',
        justifyContent: 'space-between', alignItems: 'flex-start',
      }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '6px', color: '#fff' }}>فاتورة</div>
          <div style={{ fontSize: '12px', color: '#ccc', marginBottom: '4px' }}>
            رقم الفاتورة: <span style={{ color: '#fff', fontWeight: 'bold', fontFamily: 'monospace' }}>{order.orderNumber}</span>
          </div>
          <div style={{ fontSize: '12px', color: '#ccc', marginBottom: '4px' }}>
            تاريخ الفاتورة: <span style={{ color: '#fff', fontWeight: 'bold' }}>{date}</span>
          </div>
          <div style={{ fontSize: '12px', color: '#ccc' }}>
            وقت الفاتورة: <span style={{ color: '#fff', fontWeight: 'bold' }}>{time}</span>
          </div>
        </div>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ fontSize: '11px', marginBottom: '4px', color: '#aaa' }}>👕</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>{settings.businessName}</div>
          <div style={{ fontSize: '13px', color: '#ccc' }}>للطباعة على الملابس</div>
          <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>الأناقة تبدأ من هنا</div>
        </div>
        <div style={{ textAlign: 'left', fontSize: '11px', color: '#ccc', lineHeight: '1.9' }}>
          {settings.address && <div>📍 {settings.address}</div>}
          {settings.phone && <div>📞 {settings.phone}</div>}
          {settings.facebookPage && <div>🌐 {settings.facebookPage}</div>}
          {settings.instagramPage && <div>📷 {settings.instagramPage}</div>}
        </div>
      </div>

      {/* ORDER & CUSTOMER */}
      <div style={{ padding: '24px 32px 0', display: 'flex', gap: '24px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#1a1a1a', borderBottom: '2px solid #1a1a1a', paddingBottom: '6px', marginBottom: '14px', display: 'inline-block' }}>تفاصيل الطلب</div>
          <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
            <tbody>
              <tr><td style={{ padding: '5px 0', color: '#666', fontWeight: 'bold', width: '40%' }}>رقم الطلب:</td><td style={{ padding: '5px 0', fontWeight: 'bold', fontFamily: 'monospace' }}>{order.orderNumber}</td></tr>
              <tr><td style={{ padding: '5px 0', color: '#666', fontWeight: 'bold' }}>طريقة الدفع:</td><td style={{ padding: '5px 0' }}>الدفع عند الاستلام</td></tr>
              <tr><td style={{ padding: '5px 0', color: '#666', fontWeight: 'bold' }}>الولاية:</td><td style={{ padding: '5px 0' }}>{order.wilaya || '-'}</td></tr>
            </tbody>
          </table>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#1a1a1a', borderBottom: '2px solid #1a1a1a', paddingBottom: '6px', marginBottom: '14px', display: 'inline-block' }}>بيانات الزبون</div>
          <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
            <tbody>
              <tr><td style={{ padding: '5px 0', color: '#666', fontWeight: 'bold', width: '40%' }}>اسم الزبون:</td><td style={{ padding: '5px 0' }}>{order.customerName}</td></tr>
              <tr><td style={{ padding: '5px 0', color: '#666', fontWeight: 'bold' }}>رقم الهاتف:</td><td style={{ padding: '5px 0', fontFamily: 'monospace' }}>{order.phone}</td></tr>
              <tr><td style={{ padding: '5px 0', color: '#666', fontWeight: 'bold' }}>العنوان:</td><td style={{ padding: '5px 0' }}>{order.commune || ''}{order.commune && order.address ? '، ' : ''}{order.address || '-'}</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* PRODUCTS TABLE */}
      <div style={{ padding: '20px 32px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ backgroundColor: '#1a1a1a', color: '#fff' }}>
              <th style={{ padding: '12px 10px', textAlign: 'center', fontWeight: 'bold', width: '40px' }}>م</th>
              <th style={{ padding: '12px 10px', textAlign: 'right', fontWeight: 'bold' }}>الصنف</th>
              <th style={{ padding: '12px 10px', textAlign: 'center', fontWeight: 'bold', width: '70px' }}>المقاس</th>
              <th style={{ padding: '12px 10px', textAlign: 'center', fontWeight: 'bold', width: '70px' }}>اللون</th>
              <th style={{ padding: '12px 10px', textAlign: 'center', fontWeight: 'bold', width: '60px' }}>الكمية</th>
              <th style={{ padding: '12px 10px', textAlign: 'center', fontWeight: 'bold', width: '100px' }}>سعر الوحدة</th>
              <th style={{ padding: '12px 10px', textAlign: 'center', fontWeight: 'bold', width: '100px' }}>الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => {
              const lineTotal = (item.price || 0) * (item.quantity || 1);
              return (
                <tr key={i} style={{ borderBottom: '1px solid #e5e5e5' }}>
                  <td style={{ padding: '14px 10px', textAlign: 'center', fontWeight: 'bold', color: '#333' }}>{i + 1}</td>
                  <td style={{ padding: '14px 10px', textAlign: 'right' }}>
                    <div style={{ fontWeight: 'bold', color: '#1a1a1a', marginBottom: '2px' }}>{item.productName || 'تيشرت'}</div>
                  </td>
                  <td style={{ padding: '14px 10px', textAlign: 'center', fontWeight: 'bold' }}>{item.size || '-'}</td>
                  <td style={{ padding: '14px 10px', textAlign: 'center' }}>{item.color || '-'}</td>
                  <td style={{ padding: '14px 10px', textAlign: 'center', fontWeight: 'bold' }}>{item.quantity || 1}</td>
                  <td style={{ padding: '14px 10px', textAlign: 'center' }}>{fmtPrice(item.price)}</td>
                  <td style={{ padding: '14px 10px', textAlign: 'center', fontWeight: 'bold' }}>{fmtPrice(lineTotal)}</td>
                </tr>
              );
            })}
            {items.length === 0 && (
              <tr><td colSpan={7} style={{ padding: '20px', textAlign: 'center', color: '#999' }}>لا توجد منتجات</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* TOTALS */}
      <div style={{ padding: '0 32px 20px', display: 'flex', justifyContent: 'flex-start' }}>
        <table style={{ borderCollapse: 'collapse', fontSize: '13px', minWidth: '320px', border: '1px solid #e5e5e5' }}>
          <tbody>
            <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
              <td style={{ padding: '12px 20px', fontWeight: 'bold', color: '#333', backgroundColor: '#fafafa' }}>المجموع الفرعي:</td>
              <td style={{ padding: '12px 20px', textAlign: 'left', fontWeight: 'bold', minWidth: '120px' }}>{fmtPrice(order.totalPrice)}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
              <td style={{ padding: '12px 20px', fontWeight: 'bold', color: '#333', backgroundColor: '#fafafa' }}>تكلفة التوصيل:</td>
              <td style={{ padding: '12px 20px', textAlign: 'left', fontWeight: 'bold' }}>{fmtPrice(order.deliveryCost || 0)}</td>
            </tr>
            <tr>
              <td style={{ padding: '14px 20px', fontWeight: 'bold', color: '#fff', backgroundColor: '#1a1a1a', fontSize: '14px' }}>إجمالي الفاتورة:</td>
              <td style={{ padding: '14px 20px', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#1a1a1a', color: '#fff', fontSize: '14px' }}>
                {fmtPrice((order.totalPrice || 0) + (order.deliveryCost || 0))}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* THANK YOU */}
      <div style={{ textAlign: 'center', padding: '24px 32px 16px', borderTop: '1px solid #eee' }}>
        <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '6px' }}>شكراً لثقتك بنا</div>
        <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>نتمنى لك تجربة تسوق ممتعة</div>
        <div style={{ fontSize: '16px', color: '#f59e0b' }}>★ ★ ★</div>
      </div>

      {/* FOOTER */}
      <div style={{
        backgroundColor: '#f5f5f5', padding: '16px 32px', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center', fontSize: '11px',
        color: '#666', borderTop: '1px solid #e5e5e5',
      }}>
        <div style={{ textAlign: 'right', lineHeight: '1.8' }}>
          <div style={{ fontWeight: 'bold', color: '#333', marginBottom: '2px' }}>سياسة الاستبدال والاسترجاع:</div>
          <div>يمكنك الاستبدال أو الاسترجاع خلال 7 أيام من تاريخ الشراء</div>
          <div>بشرط أن يكون المنتج غير مستخدم وبحالته الأصلية مع الفاتورة</div>
        </div>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontWeight: 'bold', color: '#333', marginBottom: '4px' }}>تابعنا على وسائل التواصل</div>
          <div style={{ fontSize: '18px', letterSpacing: '8px' }}>📷 ✖ 📱</div>
        </div>
      </div>
    </div>
  );
}

export default function InvoiceModal({ order, orders, onClose }) {
  const invoiceRef = useRef(null);
  const allInvoicesRef = useRef(null);
  const [settings, setSettings] = useState({ businessName: 'Nasira Tiba3a', phone: '', address: '', facebookPage: '', instagramPage: '' });
  const [downloading, setDownloading] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);

  const allOrders = orders || (order ? [order] : []);
  const isBulk = allOrders.length > 1;
  const currentOrder = allOrders[currentIdx];

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'general'));
        if (snap.exists()) setSettings(prev => ({ ...prev, ...snap.data() }));
      } catch (e) { console.error(e); }
    })();
  }, []);

  if (allOrders.length === 0) return null;

  const handleDownloadCurrent = async () => {
    setDownloading(true);
    try {
      const el = invoiceRef.current;
      await html2pdf().set({
        margin: 0,
        filename: `فاتورة_${currentOrder.orderNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      }).from(el).save();
    } catch (e) { console.error(e); }
    finally { setDownloading(false); }
  };

  const handleDownloadAll = async () => {
    setDownloading(true);
    try {
      const el = allInvoicesRef.current;
      el.style.position = 'fixed';
      el.style.left = '0';
      el.style.top = '0';
      el.style.zIndex = '9999';
      el.style.overflow = 'visible';
      el.style.opacity = '0';
      el.style.pointerEvents = 'none';

      await new Promise(r => setTimeout(r, 300));

      await html2pdf().set({
        margin: 0,
        filename: `فواتير_${allOrders.length}_طلبات.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css'], before: '.invoice-page-break' },
      }).from(el).save();

      el.style.position = 'absolute';
      el.style.left = '-9999px';
      el.style.opacity = '1';
      el.style.zIndex = 'auto';
    } catch (e) { console.error(e); }
    finally { setDownloading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="my-8 w-full max-w-[800px]" onClick={e => e.stopPropagation()}>
        {/* Action buttons */}
        <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={handleDownloadCurrent} disabled={downloading}
              className="flex items-center gap-2 px-5 py-2.5 bg-dark-800 text-white rounded-xl hover:bg-dark-900 transition-colors font-bold text-sm disabled:opacity-50">
              <FiDownload size={18} />
              {downloading ? 'جاري التحميل...' : 'تحميل هذه الفاتورة'}
            </button>
            {isBulk && (
              <button onClick={handleDownloadAll} disabled={downloading}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-bold text-sm disabled:opacity-50">
                <FiDownload size={18} />
                {downloading ? 'جاري التحميل...' : `تحميل الكل (${allOrders.length} فواتير)`}
              </button>
            )}
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/90 hover:bg-white text-dark-600 shadow"><FiX size={20} /></button>
        </div>

        {/* Bulk navigation */}
        {isBulk && (
          <div className="flex items-center justify-center gap-3 mb-3 bg-white/90 backdrop-blur rounded-xl py-2.5 px-4">
            <button onClick={() => setCurrentIdx(i => Math.max(0, i - 1))} disabled={currentIdx === 0}
              className="p-1.5 rounded-lg hover:bg-dark-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <FiChevronRight size={18} />
            </button>
            <span className="font-bold text-sm text-dark-700">
              الفاتورة {currentIdx + 1} من {allOrders.length}
            </span>
            <button onClick={() => setCurrentIdx(i => Math.min(allOrders.length - 1, i + 1))} disabled={currentIdx === allOrders.length - 1}
              className="p-1.5 rounded-lg hover:bg-dark-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <FiChevronLeft size={18} />
            </button>
            <span className="text-xs text-dark-400 font-semibold">— {currentOrder.orderNumber} — {currentOrder.customerName}</span>
          </div>
        )}

        {/* Visible: current invoice preview */}
        <div ref={invoiceRef}>
          <SingleInvoice order={currentOrder} settings={settings} />
        </div>

        {/* Hidden: all invoices for bulk PDF (rendered in DOM so html2pdf can capture) */}
        {isBulk && (
          <div ref={allInvoicesRef} style={{ position: 'absolute', left: '-9999px', top: 0, width: '800px' }}>
            {allOrders.map((o, i) => (
              <div key={o.id} className={i > 0 ? 'invoice-page-break' : ''}>
                <SingleInvoice order={o} settings={settings} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
