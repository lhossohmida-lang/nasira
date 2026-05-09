import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { formatPrice } from '../../utils/constants';
import { FiShoppingBag, FiDollarSign, FiTrendingUp, FiAlertTriangle, FiPackage, FiArrowUp } from 'react-icons/fi';
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

        const todaySales  = todayOrders.reduce((s, o) => s + (o.totalPrice || 0), 0);
        const monthSales  = monthOrders.reduce((s, o) => s + (o.totalPrice || 0), 0);
        const todayProfit = todayOrders.reduce((s, o) => s + (o.netProfit || 0), 0);
        const monthProfit = monthOrders.reduce((s, o) => s + (o.netProfit || 0), 0);

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

        const productCounts = {};
        orders.forEach(o => {
          (o.items || []).forEach(i => {
            productCounts[i.productName] = (productCounts[i.productName] || 0) + i.quantity;
          });
        });
        const top = Object.entries(productCounts).map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count).slice(0, 5);
        setTopProducts(top);

        setStats({ totalOrders: orders.length, todayOrders: todayOrders.length, todaySales, monthSales, todayProfit, monthProfit });
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner text="جاري تحميل البيانات..." />;

  const statCards = [
    { label: 'طلبات اليوم',   value: stats?.todayOrders || 0,          icon: <FiShoppingBag size={20} />, gradient: 'linear-gradient(135deg,#0284c7,#38bdf8)', shadow: 'rgba(14,165,233,0.35)' },
    { label: 'إجمالي الطلبات', value: stats?.totalOrders || 0,          icon: <FiPackage size={20} />,     gradient: 'linear-gradient(135deg,#e84393,#ff5fa0)', shadow: 'rgba(232,67,147,0.35)' },
    { label: 'مبيعات اليوم',  value: formatPrice(stats?.todaySales || 0),   icon: <FiDollarSign size={20} />, gradient: 'linear-gradient(135deg,#00b894,#00cec9)', shadow: 'rgba(0,184,148,0.35)' },
    { label: 'مبيعات الشهر',  value: formatPrice(stats?.monthSales || 0),   icon: <FiDollarSign size={20} />, gradient: 'linear-gradient(135deg,#fdcb6e,#e17055)', shadow: 'rgba(253,203,110,0.4)' },
    { label: 'ربح اليوم',     value: formatPrice(stats?.todayProfit || 0),  icon: <FiTrendingUp size={20} />, gradient: 'linear-gradient(135deg,#0984e3,#74b9ff)', shadow: 'rgba(9,132,227,0.35)' },
    { label: 'ربح الشهر',     value: formatPrice(stats?.monthProfit || 0),  icon: <FiArrowUp size={20} />,    gradient: 'linear-gradient(135deg,#7dd3fc,#0284c7)', shadow: 'rgba(162,155,254,0.4)' },
  ];

  const PIE_COLORS = ['#0284c7', '#e84393', '#00b894', '#fdcb6e', '#0984e3'];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      return (
        <div style={{ background: '#fff', border: '1px solid rgba(197,204,224,0.5)', borderRadius: 12, padding: '10px 16px', boxShadow: '0 4px 20px rgba(13,19,38,0.1)', fontSize: 13 }}>
          <p style={{ color: '#6272a0', marginBottom: 4 }}>{payload[0].name || payload[0].payload.name}</p>
          <p style={{ fontWeight: 700, color: '#0284c7' }}>{payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
        {statCards.map((card, i) => (
          <div key={i} style={{
            background: '#fff', borderRadius: 20, padding: '20px 18px',
            border: '1px solid rgba(197,204,224,0.35)',
            boxShadow: '0 2px 12px rgba(13,19,38,0.04)',
            display: 'flex', flexDirection: 'column', gap: 12,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14,
              background: card.gradient,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', boxShadow: `0 4px 14px ${card.shadow}`,
            }}>{card.icon}</div>
            <div>
              <p style={{ fontSize: 11, color: '#8896b0', fontWeight: 600, marginBottom: 4 }}>{card.label}</p>
              <p style={{ fontSize: 18, fontWeight: 900, color: '#0d1326' }}>{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
        {/* Bar chart */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '24px', border: '1px solid rgba(197,204,224,0.35)', boxShadow: '0 2px 12px rgba(13,19,38,0.04)' }}>
          <h3 style={{ fontWeight: 800, color: '#0d1326', marginBottom: 6, fontSize: 16 }}>الأكثر طلباً</h3>
          <p style={{ color: '#8896b0', fontSize: 12, marginBottom: 20 }}>أعلى 5 منتجات مبيعاً</p>
          {topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topProducts} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(197,204,224,0.4)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#8896b0' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#8896b0' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[8,8,0,0]} fill="url(#barGrad)" />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0284c7" />
                    <stop offset="100%" stopColor="#38bdf8" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : <p style={{ color: '#8896b0', textAlign: 'center', padding: '40px 0', fontSize: 14 }}>لا توجد بيانات</p>}
        </div>

        {/* Pie chart */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '24px', border: '1px solid rgba(197,204,224,0.35)', boxShadow: '0 2px 12px rgba(13,19,38,0.04)' }}>
          <h3 style={{ fontWeight: 800, color: '#0d1326', marginBottom: 6, fontSize: 16 }}>توزيع المبيعات</h3>
          <p style={{ color: '#8896b0', fontSize: 12, marginBottom: 20 }}>حصة كل منتج من المبيعات</p>
          {topProducts.length > 0 ? (
            <div>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={topProducts} dataKey="count" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4}>
                    {topProducts.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8, justifyContent: 'center' }}>
                {topProducts.map((p, i) => (
                  <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#6272a0' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: PIE_COLORS[i % PIE_COLORS.length], display: 'inline-block' }} />
                    {p.name}
                  </span>
                ))}
              </div>
            </div>
          ) : <p style={{ color: '#8896b0', textAlign: 'center', padding: '40px 0', fontSize: 14 }}>لا توجد بيانات</p>}
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 20, padding: '24px', border: '1.5px solid rgba(253,203,110,0.5)', boxShadow: '0 2px 12px rgba(13,19,38,0.04)' }}>
          <h3 style={{ fontWeight: 800, color: '#0d1326', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8, fontSize: 16 }}>
            <span style={{ width: 36, height: 36, borderRadius: 10, background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e17055' }}>
              <FiAlertTriangle size={17} />
            </span>
            تنبيهات المخزون المنخفض
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 12 }}>
            {lowStockProducts.map((p, i) => (
              <div key={i} style={{ background: '#fffbeb', borderRadius: 14, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(253,203,110,0.3)' }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#1a2340', marginBottom: 2 }}>{p.name}</p>
                  <p style={{ fontSize: 11, color: '#8896b0' }}>{p.size} / {p.color}</p>
                </div>
                <span style={{ fontSize: 18, fontWeight: 900, color: p.qty === 0 ? '#e74c3c' : '#e17055' }}>{p.qty}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
