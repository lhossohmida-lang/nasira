import { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { orderStatuses, getStatusInfo, formatDate, formatPrice } from '../../utils/constants';
import toast from 'react-hot-toast';
import { FiSearch, FiTrash2, FiEdit, FiEye, FiDownload, FiX } from 'react-icons/fi';
import jsPDF from 'jspdf';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus, updatedAt: serverTimestamp() });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      toast.success('تم تحديث حالة الطلب');
    } catch (e) { console.error(e); toast.error('حدث خطأ'); }
  };

  const handleDelete = async (orderId) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطلب؟')) return;
    try {
      await deleteDoc(doc(db, 'orders', orderId));
      setOrders(prev => prev.filter(o => o.id !== orderId));
      toast.success('تم حذف الطلب');
    } catch (e) { console.error(e); toast.error('حدث خطأ'); }
  };

  const generateInvoicePDF = (order) => {
    const d = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    d.setFont('helvetica');
    d.setFontSize(20);
    d.text('Nasira Tiba3a - Invoice', 105, 20, { align: 'center' });
    d.setFontSize(12);
    d.text(`Order: ${order.orderNumber}`, 20, 40);
    d.text(`Customer: ${order.customerName}`, 20, 50);
    d.text(`Phone: ${order.phone}`, 20, 60);
    d.text(`Address: ${order.wilaya}, ${order.commune}, ${order.address}`, 20, 70);
    d.text(`Date: ${formatDate(order.createdAt)}`, 20, 80);
    let y = 100;
    d.setFontSize(10);
    d.text('Product', 20, y); d.text('Qty', 100, y); d.text('Price', 130, y); d.text('Total', 160, y);
    y += 5; d.line(20, y, 190, y); y += 10;
    (order.items || []).forEach(item => {
      d.text(item.productName || '-', 20, y);
      d.text(String(item.quantity), 100, y);
      d.text(String(item.price) + ' DZD', 130, y);
      d.text(String(item.price * item.quantity) + ' DZD', 160, y);
      y += 8;
    });
    y += 5; d.line(20, y, 190, y); y += 10;
    d.setFontSize(12);
    d.text(`Total: ${order.totalPrice} DZD`, 160, y, { align: 'right' });
    y += 8; d.text(`Delivery: ${order.deliveryCost || 0} DZD`, 160, y, { align: 'right' });
    y += 8; d.text(`Net Profit: ${order.netProfit || 0} DZD`, 160, y, { align: 'right' });
    d.save(`invoice_${order.orderNumber}.pdf`);
    toast.success('تم تحميل الفاتورة');
  };

  const filtered = orders.filter(o => {
    const matchSearch = !search ||
      o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      o.phone?.includes(search);
    const matchStatus = !statusFilter || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getDesignEntries = (order) => {
    const entries = Object.entries(order.customDesigns || {})
      .map(([sideKey, design]) => ({
        key: sideKey,
        label: design.sideLabel || (sideKey === 'front' ? 'أمام' : 'خلف'),
        original: design.designImageUrl || design.designImageDataUrl || '',
        preview: design.customizedTshirtUrl || design.customizedTshirtDataUrl || '',
        scale: design.scale,
        rotation: design.rotation,
      }))
      .filter((entry) => entry.original || entry.preview);

    if (entries.length > 0) return entries;

    if (order.designImageUrl || order.customizedTshirtUrl) {
      return [{
        key: 'legacy',
        label: order.designSide === 'back' ? 'خلف' : 'أمام',
        original: order.designImageUrl || '',
        preview: order.customizedTshirtUrl || '',
        scale: null,
        rotation: null,
      }];
    }

    return [];
  };

  const selectedDesignEntries = selectedOrder ? getDesignEntries(selectedOrder) : [];

  if (loading) return <LoadingSpinner text="جاري التحميل..." />;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
          <input type="text" placeholder="بحث بالاسم، الهاتف أو رقم الطلب..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pr-10 pl-4 py-3 bg-white border border-dark-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-white border border-dark-200 rounded-xl text-sm focus:outline-none appearance-none">
          <option value="">كل الحالات</option>
          {orderStatuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-dark-50">
            <tr>
              <th className="px-4 py-3 text-right font-semibold text-dark-600">رقم الطلب</th>
              <th className="px-4 py-3 text-right font-semibold text-dark-600">الزبون</th>
              <th className="px-4 py-3 text-right font-semibold text-dark-600">الهاتف</th>
              <th className="px-4 py-3 text-right font-semibold text-dark-600">المبلغ</th>
              <th className="px-4 py-3 text-right font-semibold text-dark-600">الربح</th>
              <th className="px-4 py-3 text-right font-semibold text-dark-600">الحالة</th>
              <th className="px-4 py-3 text-right font-semibold text-dark-600">التاريخ</th>
              <th className="px-4 py-3 text-right font-semibold text-dark-600">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-100">
            {filtered.map(order => (
              <tr key={order.id} className="hover:bg-dark-50/50 transition-colors">
                <td className="px-4 py-3 font-mono font-medium text-primary-600">{order.orderNumber}</td>
                <td className="px-4 py-3">{order.customerName}</td>
                <td className="px-4 py-3 font-mono text-dark-500">{order.phone}</td>
                <td className="px-4 py-3 font-semibold">{formatPrice(order.totalPrice)}</td>
                <td className="px-4 py-3 font-semibold text-success-600">{formatPrice(order.netProfit || 0)}</td>
                <td className="px-4 py-3">
                  <select value={order.status} onChange={e => handleStatusChange(order.id, e.target.value)}
                    className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer ${getStatusInfo(order.status).color}`}>
                    {orderStatuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3 text-dark-500 text-xs">{formatDate(order.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => setSelectedOrder(order)} className="p-1.5 rounded-lg hover:bg-primary-50 text-dark-400 hover:text-primary-600" title="عرض">
                      <FiEye size={16} />
                    </button>
                    <button onClick={() => generateInvoicePDF(order)} className="p-1.5 rounded-lg hover:bg-primary-50 text-dark-400 hover:text-primary-600" title="فاتورة">
                      <FiDownload size={16} />
                    </button>
                    <button onClick={() => handleDelete(order.id)} className="p-1.5 rounded-lg hover:bg-danger-50 text-dark-400 hover:text-danger-600" title="حذف">
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center text-dark-400 py-8">لا توجد طلبات</p>}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">تفاصيل الطلب {selectedOrder.orderNumber}</h3>
              <button onClick={() => setSelectedOrder(null)} className="p-1 rounded-lg hover:bg-dark-100"><FiX size={20} /></button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-dark-400">الزبون:</span> <span className="font-medium">{selectedOrder.customerName}</span></div>
                <div><span className="text-dark-400">الهاتف:</span> <span className="font-medium">{selectedOrder.phone}</span></div>
                <div><span className="text-dark-400">الولاية:</span> <span className="font-medium">{selectedOrder.wilaya}</span></div>
                <div><span className="text-dark-400">البلدية:</span> <span className="font-medium">{selectedOrder.commune}</span></div>
                <div className="col-span-2"><span className="text-dark-400">العنوان:</span> <span className="font-medium">{selectedOrder.address}</span></div>
              </div>
              {selectedOrder.note && <div className="bg-dark-50 rounded-xl p-3"><span className="text-dark-400">ملاحظة:</span> {selectedOrder.note}</div>}
              <div className="rounded-2xl border border-primary-100 bg-primary-50/40 p-4">
                <p className="text-primary-700 mb-3 font-bold">صورة الزبون والتصميم على التيشرت</p>
                {selectedDesignEntries.length > 0 ? (
                  <div className="space-y-5">
                    {selectedDesignEntries.map((design) => (
                      <div key={design.key} className="rounded-2xl border border-dark-100 bg-white p-3 shadow-sm">
                        <div className="mb-3 flex items-center justify-between">
                          <span className="font-bold text-primary-700">{design.label}</span>
                          {design.scale !== null && (
                            <span className="text-[11px] text-dark-400">
                              الحجم {Math.round((design.scale || 0) * 100)}% · الدوران {design.rotation || 0}°
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-dark-500 text-xs mb-2 font-semibold">الصورة التي اختارها الزبون</p>
                            {design.original ? (
                              <img src={design.original} alt={`Design ${design.key}`} className="w-full rounded-xl border border-dark-100 bg-white object-contain max-h-80" />
                            ) : (
                              <div className="h-48 rounded-xl border border-dashed border-dark-200 bg-dark-50 flex items-center justify-center text-dark-400">لا توجد صورة أصلية</div>
                            )}
                          </div>
                          <div>
                            <p className="text-dark-500 text-xs mb-2 font-semibold">التصميم كما يظهر على التيشرت</p>
                            {design.preview ? (
                              <img src={design.preview} alt={`Preview ${design.key}`} className="w-full rounded-xl border border-dark-100 bg-white object-contain max-h-80" />
                            ) : (
                              <div className="h-48 rounded-xl border border-dashed border-dark-200 bg-dark-50 flex items-center justify-center text-dark-400">لا توجد معاينة</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-dark-200 bg-white p-6 text-center text-dark-400">
                    لا توجد صور محفوظة لهذا الطلب.
                  </div>
                )}
              </div>
              {false && selectedOrder.customDesigns && Object.keys(selectedOrder.customDesigns).length > 0 && (
                <div>
                  <p className="text-dark-400 mb-2 font-medium">تصميم الزبون حسب الوجه:</p>
                  <div className="space-y-4">
                    {Object.entries(selectedOrder.customDesigns).map(([sideKey, design]) => (
                      <div key={sideKey} className="rounded-2xl border border-dark-100 bg-dark-50/60 p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="font-bold text-primary-700">{design.sideLabel || (sideKey === 'front' ? 'أمام' : 'خلف')}</span>
                          <span className="text-[11px] text-dark-400">
                            الحجم {Math.round((design.scale || 0) * 100)}% · الدوران {design.rotation || 0}°
                          </span>
                        </div>
                        <div className={`grid gap-3 ${(design.designImageUrl || design.designImageDataUrl) && (design.customizedTshirtUrl || design.customizedTshirtDataUrl) ? 'grid-cols-2' : 'grid-cols-1'}`}>
                          {(design.designImageUrl || design.designImageDataUrl) && (
                            <div>
                              <p className="text-dark-400 text-xs mb-1">الصورة التي اختارها الزبون</p>
                              <img src={design.designImageUrl || design.designImageDataUrl} alt={`Design ${sideKey}`} className="w-full rounded-xl border border-dark-100 bg-white" />
                            </div>
                          )}
                          {(design.customizedTshirtUrl || design.customizedTshirtDataUrl) && (
                            <div>
                              <p className="text-dark-400 text-xs mb-1">الشكل النهائي كما صممه</p>
                              <img src={design.customizedTshirtUrl || design.customizedTshirtDataUrl} alt={`Preview ${sideKey}`} className="w-full rounded-xl border border-dark-100 bg-white" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {false && !selectedOrder.customDesigns && (selectedOrder.designImageUrl || selectedOrder.customizedTshirtUrl) && (
                <div>
                  <p className="text-dark-400 mb-2 font-medium">الصور:</p>
                  <div className={`grid gap-3 ${selectedOrder.designImageUrl && selectedOrder.customizedTshirtUrl ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {selectedOrder.designImageUrl && (
                      <div>
                        <p className="text-dark-400 text-xs mb-1">التصميم الأصلي</p>
                        <img src={selectedOrder.designImageUrl} alt="Design" className="w-full rounded-xl border border-dark-100" />
                      </div>
                    )}
                    {selectedOrder.customizedTshirtUrl && (
                      <div>
                        <p className="text-dark-400 text-xs mb-1">معاينة التيشيرت</p>
                        <img src={selectedOrder.customizedTshirtUrl} alt="Preview" className="w-full rounded-xl border border-dark-100" />
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="border-t border-dark-200 pt-3">
                <h4 className="font-semibold mb-2">المنتجات</h4>
                {(selectedOrder.items || []).map((item, i) => (
                  <div key={i} className="flex justify-between py-1 border-b border-dark-100">
                    <span>{item.productName} ({item.size}, {item.color}) × {item.quantity}</span>
                    <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-dark-200 pt-3 space-y-1">
                <div className="flex justify-between"><span>سعر البيع:</span><span className="font-bold">{formatPrice(selectedOrder.totalPrice)}</span></div>
                <div className="flex justify-between"><span>التكلفة:</span><span>{formatPrice(selectedOrder.totalCost || 0)}</span></div>
                <div className="flex justify-between"><span>التوصيل:</span><span>{formatPrice(selectedOrder.deliveryCost || 0)}</span></div>
                <div className="flex justify-between text-success-600 font-bold"><span>الربح الصافي:</span><span>{formatPrice(selectedOrder.netProfit || 0)}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
