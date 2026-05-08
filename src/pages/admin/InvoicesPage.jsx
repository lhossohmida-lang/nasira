import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { formatPrice, formatDate } from '../../utils/constants';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';
import { FiDownload, FiFileText } from 'react-icons/fi';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const [invSnap, ordSnap] = await Promise.all([
          getDocs(query(collection(db, 'invoices'), orderBy('createdAt', 'desc'))),
          getDocs(collection(db, 'orders'))
        ]);
        setInvoices(invSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setOrders(ordSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) { console.error(e); } finally { setLoading(false); }
    }
    fetch();
  }, []);

  const generateInvoice = async (order) => {
    try {
      const invoiceData = {
        orderId: order.id, orderNumber: order.orderNumber, customerName: order.customerName,
        totalPrice: order.totalPrice, netProfit: order.netProfit || 0, createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, 'invoices'), invoiceData);

      const d = new jsPDF();
      d.setFontSize(20);
      d.text('Nasira Tiba3a - Invoice', 105, 20, { align: 'center' });
      d.setFontSize(12);
      d.text(`Order: ${order.orderNumber}`, 20, 40);
      d.text(`Customer: ${order.customerName}`, 20, 50);
      d.text(`Phone: ${order.phone}`, 20, 60);
      d.text(`Total: ${order.totalPrice} DZD`, 20, 80);
      d.text(`Profit: ${order.netProfit || 0} DZD`, 20, 90);
      d.save(`invoice_${order.orderNumber}.pdf`);
      toast.success('تم إنشاء وتحميل الفاتورة');

      // Refresh
      const snap = await getDocs(query(collection(db, 'invoices'), orderBy('createdAt', 'desc')));
      setInvoices(snap.docs.map(dd => ({ id: dd.id, ...dd.data() })));
    } catch (e) { console.error(e); toast.error('حدث خطأ'); }
  };

  if (loading) return <LoadingSpinner text="جاري التحميل..." />;

  const ordersWithoutInvoice = orders.filter(o => !invoices.find(inv => inv.orderId === o.id));

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-dark-900">الفواتير</h2>

      {ordersWithoutInvoice.length > 0 && (
        <div className="bg-primary-50 rounded-2xl p-4">
          <h3 className="font-semibold text-primary-800 mb-3 flex items-center gap-2"><FiFileText /> طلبات بدون فاتورة</h3>
          <div className="space-y-2">
            {ordersWithoutInvoice.slice(0, 5).map(o => (
              <div key={o.id} className="flex items-center justify-between bg-white rounded-xl p-3">
                <div>
                  <span className="font-mono font-medium text-sm">{o.orderNumber}</span>
                  <span className="text-dark-400 text-sm mr-3">{o.customerName}</span>
                </div>
                <button onClick={() => generateInvoice(o)} className="flex items-center gap-1 bg-primary-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-primary-700">
                  <FiDownload size={14} /> إنشاء فاتورة
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-dark-50">
            <tr>
              <th className="px-4 py-3 text-right font-semibold text-dark-600">رقم الطلب</th>
              <th className="px-4 py-3 text-right font-semibold text-dark-600">الزبون</th>
              <th className="px-4 py-3 text-right font-semibold text-dark-600">المبلغ</th>
              <th className="px-4 py-3 text-right font-semibold text-dark-600">الربح</th>
              <th className="px-4 py-3 text-right font-semibold text-dark-600">التاريخ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-100">
            {invoices.map(inv => (
              <tr key={inv.id} className="hover:bg-dark-50/50">
                <td className="px-4 py-3 font-mono font-medium text-primary-600">{inv.orderNumber}</td>
                <td className="px-4 py-3">{inv.customerName}</td>
                <td className="px-4 py-3 font-semibold">{formatPrice(inv.totalPrice)}</td>
                <td className="px-4 py-3 text-success-600 font-semibold">{formatPrice(inv.netProfit)}</td>
                <td className="px-4 py-3 text-dark-400 text-xs">{formatDate(inv.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {invoices.length === 0 && <p className="text-center text-dark-400 py-8">لا توجد فواتير</p>}
      </div>
    </div>
  );
}
