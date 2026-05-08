import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase';
import { formatPrice, formatDate } from '../../utils/constants';
import { FiSearch } from 'react-icons/fi';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetch() {
      try {
        const q = query(collection(db, 'customers'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        setCustomers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) { console.error(e); } finally { setLoading(false); }
    }
    fetch();
  }, []);

  const filtered = customers.filter(c =>
    !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search)
  );

  if (loading) return <LoadingSpinner text="جاري التحميل..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="text-xl font-bold text-dark-900">الزبائن ({customers.length})</h2>
        <div className="relative w-full sm:w-80">
          <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
          <input type="text" placeholder="بحث بالاسم أو الهاتف..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pr-10 pl-4 py-3 bg-white border border-dark-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-dark-50">
            <tr>
              <th className="px-4 py-3 text-right font-semibold text-dark-600">الاسم</th>
              <th className="px-4 py-3 text-right font-semibold text-dark-600">الهاتف</th>
              <th className="px-4 py-3 text-right font-semibold text-dark-600">الولاية</th>
              <th className="px-4 py-3 text-right font-semibold text-dark-600">عدد الطلبات</th>
              <th className="px-4 py-3 text-right font-semibold text-dark-600">إجمالي المشتريات</th>
              <th className="px-4 py-3 text-right font-semibold text-dark-600">التسجيل</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-100">
            {filtered.map(c => (
              <tr key={c.id} className="hover:bg-dark-50/50">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 font-mono text-dark-500">{c.phone}</td>
                <td className="px-4 py-3 text-dark-500">{c.wilaya}</td>
                <td className="px-4 py-3"><span className="bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full text-xs font-medium">{c.totalOrders || 0}</span></td>
                <td className="px-4 py-3 font-semibold">{formatPrice(c.totalSpent || 0)}</td>
                <td className="px-4 py-3 text-dark-400 text-xs">{formatDate(c.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center text-dark-400 py-8">لا يوجد زبائن</p>}
      </div>
    </div>
  );
}
