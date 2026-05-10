import { useEffect, useState, useMemo } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, orderBy, query, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '../../firebase';
import { orderStatuses, getStatusInfo, formatDate, formatPrice } from '../../utils/constants';
import toast from 'react-hot-toast';
import {
  FiSearch, FiTrash2, FiEye, FiDownload, FiX, FiPhone,
  FiUser, FiCopy, FiPrinter, FiCheck, FiPackage, FiTruck,
  FiRefreshCw, FiChevronLeft, FiChevronRight, FiMoreVertical,
  FiExternalLink, FiTag, FiCalendar, FiDollarSign, FiCheckCircle,
  FiClock, FiShoppingBag
} from 'react-icons/fi';
import LoadingSpinner from '../../components/LoadingSpinner';
import InvoiceModal from '../../components/InvoiceModal';

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [invoiceOrders, setInvoiceOrders] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [bulkStatus, setBulkStatus] = useState('');

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
      setSelectedIds(prev => { const n = new Set(prev); n.delete(orderId); return n; });
      toast.success('تم حذف الطلب');
    } catch (e) { console.error(e); toast.error('حدث خطأ'); }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`هل أنت متأكد من حذف ${selectedIds.size} طلب؟`)) return;
    try {
      const batch = writeBatch(db);
      selectedIds.forEach(id => batch.delete(doc(db, 'orders', id)));
      await batch.commit();
      setOrders(prev => prev.filter(o => !selectedIds.has(o.id)));
      setSelectedIds(new Set());
      toast.success(`تم حذف ${selectedIds.size} طلب`);
    } catch (e) { console.error(e); toast.error('حدث خطأ أثناء الحذف'); }
  };

  const handleBulkStatusChange = async (newStatus) => {
    if (selectedIds.size === 0) return;
    try {
      const batch = writeBatch(db);
      selectedIds.forEach(id => batch.update(doc(db, 'orders', id), { status: newStatus, updatedAt: serverTimestamp() }));
      await batch.commit();
      setOrders(prev => prev.map(o => selectedIds.has(o.id) ? { ...o, status: newStatus } : o));
      const statusLabel = orderStatuses.find(s => s.value === newStatus)?.label || newStatus;
      toast.success(`تم تحديث ${selectedIds.size} طلب إلى "${statusLabel}"`);
      setSelectedIds(new Set());
    } catch (e) { console.error(e); toast.error('حدث خطأ'); }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('تم النسخ');
  };

  const filtered = useMemo(() => orders.filter(o => {
    const matchSearch = !search ||
      o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      o.phone?.includes(search);
    const matchStatus = !statusFilter || o.status === statusFilter;
    return matchSearch && matchStatus;
  }), [orders, search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  useEffect(() => { setCurrentPage(1); }, [search, statusFilter, perPage]);

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginated.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginated.map(o => o.id)));
    }
  };

  const stats = useMemo(() => ({
    total: orders.length,
    newOrders: orders.filter(o => o.status === 'new').length,
    completed: orders.filter(o => o.status === 'delivered').length,
    revenue: orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0),
  }), [orders]);

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
      return [{ key: 'legacy', label: order.designSide === 'back' ? 'خلف' : 'أمام', original: order.designImageUrl || '', preview: order.customizedTshirtUrl || '', scale: null, rotation: null }];
    }
    return [];
  };

  const selectedDesignEntries = selectedOrder ? getDesignEntries(selectedOrder) : [];

  const getItemSummary = (order) => {
    const items = order.items || [];
    if (items.length === 0) return 'طلب مخصص';
    const first = items[0];
    return first.productName || 'تيشرت';
  };

  if (loading) return <LoadingSpinner text="جاري التحميل..." />;

  return (
    <div className="space-y-6">
      {/* ===== HEADER ===== */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-dark-900">الطلبات</h1>
          <p className="text-dark-400 text-sm mt-1">إدارة طلبات متجر تي شيرتات</p>
        </div>
        <a href="/" target="_blank" className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors text-sm font-bold">
          <FiExternalLink size={16} />
          زيارة المتجر
        </a>
      </div>

      {/* ===== STATS CARDS ===== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-dark-100 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
            <FiShoppingBag className="text-primary-600" size={22} />
          </div>
          <div>
            <p className="text-dark-400 text-xs font-semibold">إجمالي الطلبات</p>
            <p className="text-2xl font-black text-dark-900">{stats.total}</p>
            <p className="text-[11px] text-dark-400">كل الفترات</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-dark-100 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
            <FiClock className="text-orange-500" size={22} />
          </div>
          <div>
            <p className="text-dark-400 text-xs font-semibold">الطلبات الجديدة</p>
            <p className="text-2xl font-black text-dark-900">{stats.newOrders}</p>
            <p className="text-[11px] text-dark-400">في انتظار المعالجة</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-dark-100 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center">
            <FiCheckCircle className="text-violet-600" size={22} />
          </div>
          <div>
            <p className="text-dark-400 text-xs font-semibold">الطلبات المكتملة</p>
            <p className="text-2xl font-black text-dark-900">{stats.completed}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-dark-100 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
            <FiDollarSign className="text-emerald-600" size={22} />
          </div>
          <div>
            <p className="text-dark-400 text-xs font-semibold">إجمالي الإيرادات</p>
            <p className="text-xl font-black text-dark-900">{formatPrice(stats.revenue)}</p>
          </div>
        </div>
      </div>

      {/* ===== SEARCH & FILTERS ===== */}
      <div className="bg-white rounded-2xl border border-dark-100 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-300" size={18} />
            <input type="text" placeholder="ابحث برقم الطلب، اسم الزبون، أو الهاتف..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pr-11 pl-4 py-3 bg-dark-50 border border-dark-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-300 font-medium" />
          </div>
          <button onClick={() => { setSearch(''); setStatusFilter(''); }} className="flex items-center gap-2 px-4 py-3 border border-dark-200 rounded-xl text-sm text-dark-500 hover:bg-dark-50 transition-colors font-semibold">
            <FiRefreshCw size={15} />
            إعادة تعيين
          </button>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-dark-50 border border-dark-200 rounded-xl text-sm">
            <FiTag size={15} className="text-dark-400" />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-transparent focus:outline-none font-semibold text-dark-600 cursor-pointer">
              <option value="">كل الحالات</option>
              {orderStatuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ===== BULK ACTIONS BAR ===== */}
      {selectedIds.size > 0 && (
        <div className="bg-primary-50 border border-primary-200 rounded-2xl p-4 flex flex-wrap items-center gap-3 animate-in slide-in-from-top">
          <span className="text-primary-700 font-bold text-sm">تم تحديد {selectedIds.size} طلب</span>
          <div className="h-5 w-px bg-primary-200" />
          <button onClick={() => handleBulkStatusChange('printing')}
            className="flex items-center gap-1.5 px-3 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-xs font-bold hover:bg-yellow-200 transition-colors">
            <FiPrinter size={14} />
            قيد الطباعة
          </button>
          <button onClick={() => handleBulkStatusChange('shipped')}
            className="flex items-center gap-1.5 px-3 py-2 bg-sky-100 text-sky-800 rounded-lg text-xs font-bold hover:bg-sky-200 transition-colors">
            <FiTruck size={14} />
            تم الشحن
          </button>
          <button onClick={() => handleBulkStatusChange('delivered')}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold hover:bg-emerald-200 transition-colors">
            <FiCheck size={14} />
            تم التسليم
          </button>
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-primary-200 rounded-lg">
            <select value={bulkStatus} onChange={e => { if (e.target.value) { handleBulkStatusChange(e.target.value); setBulkStatus(''); } }}
              className="text-xs font-bold bg-transparent focus:outline-none cursor-pointer text-dark-600">
              <option value="">حالة أخرى...</option>
              {orderStatuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div className="h-5 w-px bg-primary-200" />
          <button onClick={() => { const bulk = orders.filter(o => selectedIds.has(o.id)); setInvoiceOrders(bulk); }}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-100 text-indigo-800 rounded-lg text-xs font-bold hover:bg-indigo-200 transition-colors">
            <FiDownload size={14} />
            طباعة الفواتير ({selectedIds.size})
          </button>
          <div className="h-5 w-px bg-primary-200" />
          <button onClick={handleBulkDelete}
            className="flex items-center gap-1.5 px-3 py-2 bg-red-100 text-red-700 rounded-lg text-xs font-bold hover:bg-red-200 transition-colors">
            <FiTrash2 size={14} />
            حذف المحدد
          </button>
          <button onClick={() => setSelectedIds(new Set())} className="mr-auto text-xs text-primary-600 hover:text-primary-800 font-bold">
            إلغاء التحديد
          </button>
        </div>
      )}

      {/* ===== TABLE ===== */}
      <div className="bg-white rounded-2xl border border-dark-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-100">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black text-dark-900">قائمة الطلبات</h2>
            <span className="px-2.5 py-1 bg-primary-50 text-primary-700 rounded-lg text-xs font-bold">{filtered.length} طلب</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: '900px' }}>
            <thead>
              <tr className="border-b border-dark-100 bg-dark-50/60">
                <th className="px-4 py-4 text-center w-12">
                  <input type="checkbox" checked={paginated.length > 0 && selectedIds.size === paginated.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-dark-300 text-primary-600 focus:ring-primary-500 cursor-pointer accent-primary-600" />
                </th>
                <th className="px-4 py-4 text-right font-bold text-dark-500 text-xs">رقم الطلب</th>
                <th className="px-4 py-4 text-right font-bold text-dark-500 text-xs">الزبون</th>
                <th className="px-4 py-4 text-right font-bold text-dark-500 text-xs">الهاتف</th>
                <th className="px-4 py-4 text-right font-bold text-dark-500 text-xs">المبلغ</th>
                <th className="px-4 py-4 text-right font-bold text-dark-500 text-xs">الربح</th>
                <th className="px-4 py-4 text-right font-bold text-dark-500 text-xs">الحالة</th>
                <th className="px-4 py-4 text-right font-bold text-dark-500 text-xs">التاريخ</th>
                <th className="px-4 py-4 text-center font-bold text-dark-500 text-xs">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(order => {
                const isSelected = selectedIds.has(order.id);
                return (
                  <tr key={order.id} className={`border-b border-dark-50 hover:bg-primary-50/30 transition-colors ${isSelected ? 'bg-primary-50/50' : ''}`}>
                    <td className="px-4 py-5 text-center">
                      <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(order.id)}
                        className="w-4 h-4 rounded border-dark-300 text-primary-600 focus:ring-primary-500 cursor-pointer accent-primary-600" />
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-primary-600 text-[13px]">#{order.orderNumber}</span>
                        <button onClick={() => copyToClipboard(order.orderNumber)} className="text-dark-300 hover:text-primary-500 transition-colors">
                          <FiCopy size={13} />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-dark-100 flex items-center justify-center flex-shrink-0">
                          <FiUser size={16} className="text-dark-400" />
                        </div>
                        <div>
                          <p className="font-bold text-dark-900 text-[13px]">{order.customerName}</p>
                          <p className="text-[11px] text-dark-400 mt-0.5">{getItemSummary(order)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-2">
                        <a href={`tel:${order.phone}`} className="w-7 h-7 rounded-full bg-primary-50 flex items-center justify-center hover:bg-primary-100 transition-colors">
                          <FiPhone size={13} className="text-primary-600" />
                        </a>
                        <span className="font-semibold text-dark-700 text-[13px] font-mono">{order.phone}</span>
                      </div>
                    </td>
                    <td className="px-4 py-5">
                      <p className="font-bold text-dark-900 text-[13px]">{formatPrice(order.totalPrice)}</p>
                      <p className="text-[11px] text-dark-400 mt-0.5">الدفع عند الاستلام</p>
                    </td>
                    <td className="px-4 py-5">
                      <p className="font-bold text-emerald-600 text-[13px]">{formatPrice(order.netProfit || 0)}</p>
                    </td>
                    <td className="px-4 py-5">
                      <select value={order.status} onChange={e => handleStatusChange(order.id, e.target.value)}
                        className={`text-xs px-3 py-1.5 rounded-full font-bold border-0 cursor-pointer ${getStatusInfo(order.status).color}`}>
                        {orderStatuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-5">
                      <p className="text-dark-600 text-xs font-semibold">{formatDate(order.createdAt)}</p>
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex items-center justify-center gap-0.5">
                        <button onClick={() => setSelectedOrder(order)} className="p-2 rounded-lg hover:bg-primary-50 text-dark-400 hover:text-primary-600 transition-colors" title="عرض التفاصيل">
                          <FiEye size={16} />
                        </button>
                        <button onClick={() => setInvoiceOrder(order)} className="p-2 rounded-lg hover:bg-primary-50 text-dark-400 hover:text-primary-600 transition-colors" title="الفاتورة">
                          <FiPrinter size={16} />
                        </button>
                        <button onClick={() => handleDelete(order.id)} className="p-2 rounded-lg hover:bg-red-50 text-dark-400 hover:text-red-600 transition-colors" title="حذف">
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-center text-dark-400 py-12 font-semibold">لا توجد طلبات</p>}
        </div>

        {/* PAGINATION */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-dark-100">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg border border-dark-200 hover:bg-dark-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs font-bold text-dark-600">
              السابق
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let page;
                if (totalPages <= 5) { page = i + 1; }
                else if (currentPage <= 3) { page = i + 1; }
                else if (currentPage >= totalPages - 2) { page = totalPages - 4 + i; }
                else { page = currentPage - 2 + i; }
                return (
                  <button key={page} onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 rounded-lg text-sm font-bold transition-colors ${currentPage === page ? 'bg-primary-600 text-white' : 'border border-dark-200 text-dark-600 hover:bg-dark-50'}`}>
                    {page}
                  </button>
                );
              })}
              <span className="text-xs text-dark-500 font-bold mr-2">{currentPage} من {totalPages}</span>
            </div>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg border border-dark-200 hover:bg-dark-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs font-bold text-dark-600">
              التالي
            </button>
          </div>
        )}
      </div>

      {/* ===== INVOICE MODAL ===== */}
      {invoiceOrder && <InvoiceModal order={invoiceOrder} onClose={() => setInvoiceOrder(null)} />}
      {invoiceOrders && invoiceOrders.length > 0 && <InvoiceModal orders={invoiceOrders} onClose={() => setInvoiceOrders(null)} />}

      {/* ===== ORDER DETAIL MODAL ===== */}
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
