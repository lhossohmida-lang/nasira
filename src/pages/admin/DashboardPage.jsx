import { useEffect, useState } from 'react';
import { collection, query, getDocs, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { formatPrice } from '../../utils/constants';
import { FiShoppingBag, FiDollarSign, FiTrendingUp, FiAlertTriangle, FiPackage } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const ordersSnap = await getDocs(collection(db, 'orders'));
        const productsSnap = await getDocs(collection(db, 'products'));
        const orders = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const products = productsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const todayOrders = orders.filter(o => {
          const d = o.createdAt?.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
          return d >= todayStart;
        });
        const monthOrders = orders.filter(o => {
          const d = o.createdAt?.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
          return d >= monthStart;
        });

        const todaySales = todayOrders.reduce((s, o) => s + (o.totalPrice || 0), 0);
        const monthSales = monthOrders.reduce((s, o) => s + (o.totalPrice || 0), 0);
        const todayProfit = todayOrders.reduce((s, o) => s + (o.netProfit || 0), 0);
        const monthProfit = monthOrders.reduce((s, o) => s + (o.netProfit || 0), 0);

        // Low stock
        const lowStock = [];
        products.forEach(p => {
          if (!p.stock) return;
          Object.entries(p.stock).forEach(([size, colors]) => {
            Object.entries(colors).forEach(([color, qty]) => {
              if (qty < 5) lowStock.push({ name: p.name, size, color, qty });
            });
          });
        });
        setLowStockProducts(lowStock.slice(0, 10));

        // Top products
        const productCounts = {};
        orders.forEach(o => {
          (o.items || []).forEach(i => {
            productCounts[i.productName] = (productCounts[i.productName] || 0) + i.quantity;
          });
        });
        const top = Object.entries(productCounts).map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count).slice(0, 5);
        setTopProducts(top);

        setStats({
          totalOrders: orders.length,
          todayOrders: todayOrders.length,
          todaySales, monthSales, todayProfit, monthProfit,
        });
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner text="جاري تحميل البيانات..." />;

  const statCards = [
    { label: 'طلبات اليوم', value: stats?.todayOrders || 0, icon: <FiShoppingBag />, color: 'from-blue-500 to-blue-600' },
    { label: 'إجمالي الطلبات', value: stats?.totalOrders || 0, icon: <FiPackage />, color: 'from-purple-500 to-purple-600' },
    { label: 'مبيعات اليوم', value: formatPrice(stats?.todaySales || 0), icon: <FiDollarSign />, color: 'from-emerald-500 to-emerald-600' },
    { label: 'مبيعات الشهر', value: formatPrice(stats?.monthSales || 0), icon: <FiDollarSign />, color: 'from-orange-500 to-orange-600' },
    { label: 'ربح اليوم', value: formatPrice(stats?.todayProfit || 0), icon: <FiTrendingUp />, color: 'from-green-500 to-green-600' },
    { label: 'ربح الشهر', value: formatPrice(stats?.monthProfit || 0), icon: <FiTrendingUp />, color: 'from-indigo-500 to-indigo-600' },
  ];

  const COLORS = ['#5c7cfa', '#f06595', '#40c057', '#fab005', '#7950f2'];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white mb-3`}>
              {card.icon}
            </div>
            <p className="text-xs text-dark-500 mb-1">{card.label}</p>
            <p className="text-lg font-bold text-dark-900">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-dark-800 mb-4">المنتجات الأكثر طلبا</h3>
          {topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topProducts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#5c7cfa" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-dark-400 text-sm text-center py-8">لا توجد بيانات</p>}
        </div>

        {/* Top Products Pie */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-dark-800 mb-4">توزيع المبيعات</h3>
          {topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={topProducts} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name }) => name}>
                  {topProducts.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-dark-400 text-sm text-center py-8">لا توجد بيانات</p>}
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border-r-4 border-warning-500">
          <h3 className="font-semibold text-dark-800 mb-4 flex items-center gap-2">
            <FiAlertTriangle className="text-warning-500" /> تنبيهات المخزون المنخفض
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {lowStockProducts.map((p, i) => (
              <div key={i} className="bg-warning-50 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-800">{p.name}</p>
                  <p className="text-xs text-dark-500">{p.size} / {p.color}</p>
                </div>
                <span className={`text-sm font-bold ${p.qty === 0 ? 'text-danger-600' : 'text-warning-600'}`}>{p.qty}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
